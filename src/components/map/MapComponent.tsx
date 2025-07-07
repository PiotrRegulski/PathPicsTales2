"use client";

import ScreenLock from "@/components/map/ScreenLock";
import { useEffect, useState, useRef, useCallback } from "react";
import MapView from "./MapView";
import ControlPanel from "./ControlPanel";
import StatsPanel from "./StatsPanel";
import GpsError from "./GpsError";
import { getDistanceFromLatLonInMeters } from "./Utilis";
import PhotoInput from "./camera/PhotoInput";
import PhotoList from "./camera/PhotoList";
import TrackAutoSaver from "./TrackAutoSaver";
import { openDB } from "idb";
import KalmanFilter from "kalmanjs";
import TrackNameModal from "./TrackNameModal";
import type { Photo, UserPosition } from "@/components/map/types";
import ScreenLockButton from "./ScreenLockButton";
import { SummaryModal } from "./SummaryModal";

type MapComponentProps = {
  resume?: boolean;
};

const MIN_DISTANCE = 5;    // minimalna odległość w metrach
const MIN_SPEED = 3;       // minimalna prędkość w km/h
const MAX_ACCURACY = 15;   // maksymalna akceptowalna dokładność GPS

export default function MapComponent({ resume = false }: MapComponentProps) {
  // --- Stany podstawowe ---
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [track, setTrack] = useState<UserPosition[]>([]);
  const [speed, setSpeed] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedTime, setPausedTime] = useState<number>(0);
  const [travelTime, setTravelTime] = useState<number>(0);
  const [autoCenter, setAutoCenter] = useState<boolean>(true);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [showTrackNameModal, setShowTrackNameModal] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [screenLocked, setScreenLocked] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // --- Stany dla elapsedTime podczas ruchu ---
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [elapsedStart, setElapsedStart] = useState<number | null>(null);
  const [pausedElapsed, setPausedElapsed] = useState<number>(0);

  // --- Kalman filter dla lat/lon ---
  const KALMAN_PARAMS = { R: 0.01, Q: 3 };
  const latFilter = useRef(new KalmanFilter(KALMAN_PARAMS));
  const lonFilter = useRef(new KalmanFilter(KALMAN_PARAMS));

  const [trackName, setTrackName] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);

  // --- Stany utraty sygnału GPS ---
  const [lostSignal, setLostSignal] = useState(false);
  const lastPointBeforeLoss = useRef<UserPosition | null>(null);
  const firstPointAfterRecovery = useRef<UserPosition | null>(null);

  // --- Ładowanie trasy z IndexedDB przy wznowieniu ---
  useEffect(() => {
    async function loadOngoingTrack() {
      if (!resume) {
        setIsLoaded(true);
        return;
      }
      try {
        const db = await openDB("TravelDB", 2, {
          upgrade(db) {
            if (!db.objectStoreNames.contains("tempTracks")) {
              db.createObjectStore("tempTracks", { keyPath: "id" });
            }
            if (!db.objectStoreNames.contains("tracks")) {
              const store = db.createObjectStore("tracks", { keyPath: "id" });
              store.createIndex("by-date", "date");
            }
          },
        });
        const ongoing = await db.get("tempTracks", "ongoing");
        if (ongoing) {
          setTrack(ongoing.track || []);
          setPhotos(ongoing.photos || []);
          setDistance(ongoing.distance || 0);
          setElapsedTime(ongoing.elapsedTime || 0);
          setTrackName(ongoing.trackName || "");
          setPausedTime(ongoing.travelTime || 0);
          setStartTime(Date.now());
          setIsTracking(true);
        }
      } catch (error) {
        console.error("Błąd ładowania trasy:", error);
      } finally {
        setIsLoaded(true);
      }
    }
    loadOngoingTrack();
  }, [resume]);

  // --- Sterowanie modalem nazwy trasy ---
  useEffect(() => {
    if (!isLoaded) return;
    setShowTrackNameModal(!trackName && !resume);
  }, [isLoaded, resume, trackName]);

  // --- Inicjalne ustawienie pozycji użytkownika ---
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGpsError("Geolokalizacja nie jest dostępna");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      (err) => setGpsError(err.message),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  // --- Aktualizacja travelTime (co 1s) ---
  useEffect(() => {
    if (!isTracking || startTime === null) return;
    const timer = setInterval(() => {
      setTravelTime(pausedTime + Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [isTracking, startTime, pausedTime]);

  // --- Pomoc: pobierz dokładną pozycję GPS ---
  const getAccuratePosition = useCallback(
    (maxAttempts = 10): Promise<GeolocationPosition> => {
      let attempts = 0;
      return new Promise((resolve, reject) => {
        if (!("geolocation" in navigator)) {
          reject(new Error("Geolokalizacja nie jest dostępna"));
          return;
        }
        const tryPos = () => {
          navigator.geolocation.getCurrentPosition(
            (p) => {
              if (p.coords.accuracy <= MAX_ACCURACY) {
                resolve(p);
              } else if (++attempts < maxAttempts) {
                setTimeout(tryPos, 1000);
              } else {
                reject(
                  new Error(
                    `Brak dokładnej pozycji GPS (${Math.round(
                      p.coords.accuracy
                    )} m)`
                  )
                );
              }
            },
            reject,
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
          );
        };
        tryPos();
      });
    },
    []
  );

  // --- Fetch map matching przez API ---
  const fetchMatchedRoute = useCallback(
    async (pts: UserPosition[]): Promise<UserPosition[]> => {
      if (pts.length < 2) return pts;
      try {
        const res = await fetch("/api/map-matching", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ points: pts }),
        });
        if (!res.ok) return pts;
        const data = await res.json();
        const coords = data.matchings?.[0]?.geometry?.coordinates;
        if (!coords) return pts;
        return coords.map((c: [number, number]) => ({
          lat: c[1],
          lon: c[0],
        }));
      } catch {
        return pts;
      }
    },
    []
  );

  // --- WatchPosition z throttling (co 2s) oraz obsługa utraty sygnału ---
  useEffect(() => {
    if (!isTracking) return;
    let lastTimestamp = 0;
    const onPosition = async (pos: GeolocationPosition) => {
      const now = Date.now();
      if (now - lastTimestamp < 2000) return; // throttle 2s
      lastTimestamp = now;

      // Sprawdź dokładność
      if (pos.coords.accuracy > MAX_ACCURACY) {
        if (!lostSignal) {
          setLostSignal(true);
          lastPointBeforeLoss.current = userPosition;
        }
        return;
      }
      if (lostSignal) {
        setLostSignal(false);
        const recPos: UserPosition = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };
        firstPointAfterRecovery.current = recPos;
        if (lastPointBeforeLoss.current) {
          const seg = [lastPointBeforeLoss.current, recPos];
          const matched = await fetchMatchedRoute(seg);
          setTrack((t) => [...t.slice(0, -1), ...matched]);
        }
      }

      // Filtrowanie Kalmanem
      const filtered: UserPosition = {
        lat: latFilter.current.filter(pos.coords.latitude),
        lon: lonFilter.current.filter(pos.coords.longitude),
      };

      // Oblicz prędkość
      const newSpeed = pos.coords.speed != null
        ? pos.coords.speed * 3.6
        : 0;
      setSpeed(newSpeed);

      // Aktualizuj trasę i dystans jeśli spełnione warunki
      if (newSpeed >= MIN_SPEED && userPosition) {
        const d = getDistanceFromLatLonInMeters(
          userPosition.lat,
          userPosition.lon,
          filtered.lat,
          filtered.lon
        );
        if (d >= MIN_DISTANCE) {
          setDistance((prev) => prev + d);
          setTrack((t) => [...t, filtered]);
          setUserPosition(filtered);
        }
      }
    };

    const watchId = navigator.geolocation.watchPosition(
      onPosition,
      (err) => setGpsError(err.message),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [isTracking, userPosition, lostSignal, fetchMatchedRoute]);

  // --- Map matching całej trasy tylko przy dodaniu nowych punktów ---
  useEffect(() => {
    if (!isTracking || track.length < 2) return;
    // dopasuj tylko ostatni segment
    const lastTwo = track.slice(-2);
    fetchMatchedRoute(lastTwo).then((matched) => {
      setTrack((t) => [...t.slice(0, -2), ...matched]);
    });
  }, [track, isTracking, fetchMatchedRoute]);

  // --- Elapsed time liczone tylko podczas ruchu ---
  useEffect(() => {
    if (!isTracking) return;
    if (speed >= MIN_SPEED) {
      if (!elapsedStart) setElapsedStart(Date.now());
    } else if (elapsedStart) {
      setPausedElapsed(
        (prev) => prev + Math.floor((Date.now() - elapsedStart) / 1000)
      );
      setElapsedStart(null);
    }
  }, [speed, isTracking, elapsedStart]);

  useEffect(() => {
    if (!elapsedStart) return;
    const iv = setInterval(() => {
      setElapsedTime(
        pausedElapsed + Math.floor((Date.now() - elapsedStart) / 1000)
      );
    }, 1000);
    return () => clearInterval(iv);
  }, [elapsedStart, pausedElapsed]);

  // --- Obsługa Start/Pauza ---
  const handleStartPause = async () => {
    if (isTracking) {
      setIsTracking(false);
      setSpeed(0);
      if (startTime) setPausedTime((p) => p + Math.floor((Date.now() - startTime) / 1000));
      if (elapsedStart) {
        setPausedElapsed((p) => p + Math.floor((Date.now() - elapsedStart) / 1000));
        setElapsedStart(null);
      }
    } else {
      setGpsError(null);
      try {
        const pos = await getAccuratePosition();
        const filtered: UserPosition = {
          lat: latFilter.current.filter(pos.coords.latitude),
          lon: lonFilter.current.filter(pos.coords.longitude),
        };
        setUserPosition(filtered);
        setTrack((t) => (t.length ? t : [filtered]));
        setIsTracking(true);
        setStartTime(Date.now());
      } catch (e: unknown) {
        if (e instanceof Error) {
          setGpsError(e.message);
        } else {
          setGpsError("Błąd GPS");
        }
      }
    }
  };

  // --- Reset ---
  const handleReset = () => {
    setIsTracking(false);
    setTrack([]);
    setDistance(0);
    setSpeed(0);
    setTravelTime(0);
    setStartTime(null);
    setPausedTime(0);
    setElapsedTime(0);
    setElapsedStart(null);
    setPausedElapsed(0);
    setGpsError(null);
    setLostSignal(false);
    lastPointBeforeLoss.current = null;
    firstPointAfterRecovery.current = null;
    // reset filtrów Kalman
    latFilter.current = new KalmanFilter(KALMAN_PARAMS);
    lonFilter.current = new KalmanFilter(KALMAN_PARAMS);
  };

  // --- Dodawanie i edycja zdjęć ---
  const handleAddPhoto = (photo: Photo) => setPhotos((p) => [...p, photo]);
  const handleEditPhotoDescription = (id: string, desc: string) =>
    setPhotos((p) => p.map((ph) => ph.id === id ? { ...ph, description: desc } : ph));

  // --- Render ---
  return (
    <div className="flex flex-col items-center">
      <SummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        onResetPhotos={() => setPhotos([])}
        onSave={() => setShowSummaryModal(false)}
        trackName={trackName}
        travelTime={travelTime}
        photos={photos}
        onEditDescriptions={() => setShowSummaryModal(false)}
        track={track}
        elapsedTime={elapsedTime}
        distance={distance}
      />

      <TrackNameModal
        isOpen={showTrackNameModal}
        trackName={trackName}
        setTrackName={setTrackName}
        onStart={handleStartPause}
      />

      <TrackAutoSaver
        track={track}
        photos={photos}
        distance={distance}
        travelTime={travelTime}
        elapsedTime={elapsedTime}
        trackName={trackName}
        isTracking={isTracking}
      />

      {userPosition ? (
        <>
          <h2 className="text-black font-semibold text-xl">
            Trasa: {trackName}
          </h2>
          <MapView
            userPosition={userPosition}
            track={track}
            autoCenter={autoCenter}
            photos={photos}
          />
          <ControlPanel
            isTracking={isTracking}
            onStartPause={handleStartPause}
            onReset={handleReset}
            autoCenter={autoCenter}
            setAutoCenter={setAutoCenter}
            track={track}
            distance={distance}
            travelTime={travelTime}
            elapsedTime={elapsedTime}
            trackName={trackName}
          />
          <GpsError error={gpsError} />
          <StatsPanel
            speed={speed}
            distance={distance}
            travelTime={travelTime}
            elapsedTime={elapsedTime}
          />
          <PhotoInput
            isTracking={isTracking}
            userPosition={userPosition}
            onAddPhoto={handleAddPhoto}
          />
          <PhotoList
            photos={photos}
            onEditDescription={handleEditPhotoDescription}
          />
          <button
            className="bg-green-600 text-white px-4 py-2 rounded mt-4"
            onClick={() => {
              if (isTracking) handleStartPause();
              setShowSummaryModal(true);
            }}
          >
            Podsumowanie trasy
          </button>
        </>
      ) : (
        <p className="text-center">⏳ Pobieranie Twojej lokalizacji...</p>
      )}

      <ScreenLockButton
        onLock={() => {
          window.scrollTo({ top: 0, behavior: "auto" });
          setTimeout(() => setScreenLocked(true), 400);
        }}
      />
      <ScreenLock active={screenLocked} onUnlock={() => setScreenLocked(false)} />
    </div>
  );
}

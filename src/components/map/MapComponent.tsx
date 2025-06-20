"use client";
import useWakeLock from "@/components/map/useWakeLock";
import ScreenLock from "@/components/map/ScreenLock";
import { useEffect, useState, useRef } from "react";
import MapView from "./MapView";
import ControlPanel from "./ControlPanel";
import StatsPanel from "./StatsPanel";
import GpsError from "./GpsError";
import { getDistanceFromLatLonInMeters } from "./Utilis";
import PhotoInput from "./camera/PhotoInput";
import SaveTrackButton from "./camera/SaveTrackButton";
import PhotoList from "./camera/PhotoList";
import TrackAutoSaver from "./TrackAutoSaver";
import { openDB } from "idb";
import KalmanFilter from "kalmanjs";
import TrackNameModal from "./TrackNameModal";
import type { Photo } from "@/components/map/types";
import ScreenLockButton from "./ScreenLockButton";

type UserPosition = {
  lat: number;
  lon: number;
};

type MapComponentProps = {
  resume?: boolean;
};

const MIN_DISTANCE = 5; // minimalna odległość w metrach
const MIN_SPEED = 3; // minimalna prędkość w km/h do liczenia elapsedTime
const MAX_ACCURACY = 15; // maksymalna akceptowalna dokładność GPS w metrach

const MapComponent = ({ resume = false }: MapComponentProps) => {
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

  // Stany dla elapsedTime liczonego tylko podczas ruchu
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [elapsedStart, setElapsedStart] = useState<number | null>(null);
  const [pausedElapsed, setPausedElapsed] = useState<number>(0);

  // Kalman filter for smoothing GPS data
  const latFilter = useRef(new KalmanFilter());
  const lonFilter = useRef(new KalmanFilter());

  const [trackName, setTrackName] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);

  // Stan oczekiwania na dokładną pozycję GPS
  const [isWaitingForAccuratePosition, setIsWaitingForAccuratePosition] =
    useState(false);

  // Funkcja pobierająca pozycję GPS o wysokiej dokładności
  const getAccuratePosition = (
    maxAttempts = 5
  ): Promise<GeolocationPosition> => {
    let attempts = 0;
    return new Promise((resolve, reject) => {
      const tryGetPosition = () => {
        if (!("geolocation" in navigator)) {
          reject(new Error("Geolokalizacja nie jest dostępna"));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (position.coords.accuracy <= MAX_ACCURACY) {
              resolve(position);
            } else {
              attempts++;
              if (attempts < maxAttempts) {
                setTimeout(tryGetPosition, 1000);
              } else {
                reject(
                  new Error(
                    `Nie udało się uzyskać dokładnej pozycji GPS (dokładność: ${Math.round(
                      position.coords.accuracy
                    )} m)`
                  )
                );
              }
            }
          },
          (error: GeolocationPositionError) => reject(error),
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      };
      tryGetPosition();
    });
  };

  // Ładowanie trwającej trasy z IndexedDB, jeśli wznawiamy (resume)
  useEffect(() => {
    async function loadOngoingTrack() {
      if (resume) {
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
          setIsTracking(true);
          setPausedTime(ongoing.travelTime || 0);
          setStartTime(Date.now());
        }
      }
      setIsLoaded(true);
    }
    loadOngoingTrack();
  }, [resume]);

  // Obsługa modalnego okna do ustawienia nazwy trasy
  useEffect(() => {
    if (isLoaded) {
      if (resume && trackName) {
        setShowTrackNameModal(false);
      } else if (!resume && !trackName) {
        setShowTrackNameModal(true);
      }
    }
  }, [isLoaded, resume, trackName]);

  // Rozpoczęcie śledzenia po ustawieniu nazwy trasy (z oczekiwaniem na dokładną pozycję)
  const handleStartTracking = async () => {
    setShowTrackNameModal(false);
    setIsWaitingForAccuratePosition(true);
    setGpsError(null);

    try {
      const position = await getAccuratePosition();
      const filteredLat = latFilter.current.filter(position.coords.latitude);
      const filteredLon = lonFilter.current.filter(position.coords.longitude);
      const newPosition = { lat: filteredLat, lon: filteredLon };
      setUserPosition(newPosition);

      setIsTracking(true);
      setStartTime(Date.now());
      setTrack([newPosition]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setGpsError(error.message);
      } else if (typeof error === "object" && error && "message" in error) {
        setGpsError(String((error as { message: string }).message));
      } else {
        setGpsError("Nieznany błąd GPS");
      }
    } finally {
      setIsWaitingForAccuratePosition(false);
    }
  };

  // Pobranie początkowej pozycji (do wyświetlenia mapy, nie do śledzenia!)
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error: GeolocationPositionError) => {
          setGpsError(error.message);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  // Aktualizacja travelTime (całkowity czas trwania śledzenia)
  useEffect(() => {
    if (!isTracking || !startTime) return;
    const interval = setInterval(() => {
      setTravelTime(pausedTime + Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isTracking, startTime, pausedTime]);

  // Obsługa śledzenia pozycji podczas aktywnego tracking'u
  useEffect(() => {
    if (!isTracking) return;
    let watchId: number;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setGpsError(null);
          if (position.coords.accuracy <= MAX_ACCURACY) {
            const filteredLat = latFilter.current.filter(
              position.coords.latitude
            );
            const filteredLon = lonFilter.current.filter(
              position.coords.longitude
            );
            const newPosition = {
              lat: filteredLat,
              lon: filteredLon,
            };
            const newSpeed =
              position.coords.speed != null ? position.coords.speed * 3.6 : 0; // m/s -> km/h

            if (newSpeed >= MIN_SPEED) {
              setUserPosition((prevPosition) => {
                if (!prevPosition) return newPosition;
                const dist = getDistanceFromLatLonInMeters(
                  prevPosition.lat,
                  prevPosition.lon,
                  newPosition.lat,
                  newPosition.lon
                );
                if (dist < MIN_DISTANCE) {
                  return prevPosition;
                }
                return newPosition;
              });

              if (!startTime) {
                setStartTime(Date.now());
              }

              setSpeed(newSpeed);

              setTrack((prevTrack) => {
                if (prevTrack.length === 0) {
                  return [newPosition];
                }
                const lastPosition = prevTrack[prevTrack.length - 1];
                const dist = getDistanceFromLatLonInMeters(
                  lastPosition.lat,
                  lastPosition.lon,
                  newPosition.lat,
                  newPosition.lon
                );
                if (dist >= MIN_DISTANCE) {
                  setDistance((prevDistance) => prevDistance + dist);
                  return [...prevTrack, newPosition];
                }
                return prevTrack;
              });
            } else {
              setSpeed(0);
            }
          } else {
            setGpsError(
              `Pomijam pozycję o niskiej dokładności: ${Math.round(
                position.coords.accuracy
              )} m`
            );
          }
        },
        (error: GeolocationPositionError) => {
          setGpsError(error.message);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
    return () => {
      if (watchId && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isTracking, startTime]);

  // Zarządzanie elapsedTime - liczy tylko podczas ruchu z prędkością >= MIN_SPEED
  useEffect(() => {
    if (!isTracking) return;

    if (speed >= MIN_SPEED) {
      if (!elapsedStart) {
        setElapsedStart(Date.now());
      }
    } else {
      if (elapsedStart) {
        setPausedElapsed(
          (prev) => prev + Math.floor((Date.now() - elapsedStart) / 1000)
        );
        setElapsedStart(null);
      }
    }
  }, [speed, isTracking, elapsedStart]);

  // Aktualizacja elapsedTime co sekundę, tylko jeśli elapsedStart jest ustawione
  useEffect(() => {
    if (!elapsedStart) return;

    const interval = setInterval(() => {
      setElapsedTime(
        pausedElapsed + Math.floor((Date.now() - elapsedStart) / 1000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [elapsedStart, pausedElapsed]);

  // Dodaj obsługę dodawania zdjęć:
  const handleAddPhoto = (imageDataUrl: string, description: string) => {
    if (!userPosition) return;
    const newPhoto: Photo = {
      id: crypto.randomUUID(),
      imageDataUrl,
      description,
      position: userPosition,
      timestamp: Date.now(),
    };
    setPhotos((prev) => [...prev, newPhoto]);
  };
  useWakeLock(isTracking);
  // Obsługa start/pauza śledzenia z oczekiwaniem na dokładną pozycję przy wznowieniu
  const handleStartPause = async () => {
    if (isTracking) {
      setIsTracking(false);
      setSpeed(0);

      if (startTime) {
        setPausedTime(
          (prev) => prev + Math.floor((Date.now() - startTime) / 1000)
        );
        setStartTime(null);
      }

      if (elapsedStart) {
        setPausedElapsed(
          (prev) => prev + Math.floor((Date.now() - elapsedStart) / 1000)
        );
        setElapsedStart(null);
      }
    } else {
      setIsWaitingForAccuratePosition(true);
      setGpsError(null);

      try {
        const position = await getAccuratePosition();
        const filteredLat = latFilter.current.filter(position.coords.latitude);
        const filteredLon = lonFilter.current.filter(position.coords.longitude);
        const newPosition = { lat: filteredLat, lon: filteredLon };
        setUserPosition(newPosition);

        setIsTracking(true);
        setStartTime(Date.now());

        if (track.length === 0) {
          setTrack([newPosition]);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          setGpsError(error.message);
        } else if (typeof error === "object" && error && "message" in error) {
          setGpsError(String((error as { message: string }).message));
        } else {
          setGpsError("Nieznany błąd GPS");
        }
      } finally {
        setIsWaitingForAccuratePosition(false);
      }
    }
  };

  // Reset wszystkich danych
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
  };

  return (
    <div className="flex flex-col items-center p-4">
      <TrackNameModal
        isOpen={showTrackNameModal}
        trackName={trackName}
        setTrackName={setTrackName}
        onStart={handleStartTracking}
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
      {/* Komunikat o oczekiwaniu na dokładną pozycję */}
      {isWaitingForAccuratePosition && (
        <p className="text-center text-blue-600">
          Czekam na dokładną pozycję GPS...
        </p>
      )}
      <ScreenLock
        active={screenLocked}
        onUnlock={() => setScreenLocked(false)}
      />
      {userPosition ? (
        <>
          <h2 className="text-black font-semibold text-xl">{trackName}</h2>
          <MapView
            userPosition={userPosition}
            track={track}
            autoCenter={autoCenter}
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
          <PhotoList photos={photos} />
          <SaveTrackButton
            trackName={trackName}
            track={track}
            distance={distance}
            travelTime={travelTime}
            elapsedTime={elapsedTime}
            photos={photos}
            onReset={() => {
              setPhotos([]);
            }}
          />
          <GpsError error={gpsError} />
        </>
      ) : (
        <p className="text-center">⏳ Pobieranie Twojej lokalizacji...</p>
      )}
      {/* Przycisk do blokowania ekranu */}
      <ScreenLockButton
        onLock={() => {
          window.scrollTo({ top: 0, behavior: "smooth" }); // Dodaj to
          setTimeout(()=>setScreenLocked(true), 400); // Opóźnienie dla lepszego UX
        }}
      />
      {/* Komponent blokady ekranu */}
      <ScreenLock
        active={screenLocked}
        onUnlock={() => setScreenLocked(false)}
      />
    </div>
  );
};

export default MapComponent;

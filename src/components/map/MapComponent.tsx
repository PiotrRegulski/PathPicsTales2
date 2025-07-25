"use client";

import useWakeLock from "@/components/map/useWakeLock";
import ScreenLock from "@/components/map/ScreenLock";
import { useEffect, useState, useRef, useCallback } from "react";
import MapView from "./MapView";
import ControlPanel from "./ControlPanel";
import StatsPanel from "./StatsPanel";
import GpsError from "./GpsError";
import {
  calculateSpeed,
  getDistanceFromLatLonInMeters,
  updateSpeed,
} from "./Utilis";
import PhotoInput from "./camera/PhotoInput";
// import SaveTrackButton from "./camera/SaveTrackButton";
import PhotoList from "./camera/PhotoList";
import TrackAutoSaver from "./TrackAutoSaver";
import { openDB } from "idb";
import KalmanFilter from "kalmanjs";
import TrackNameModal from "./TrackNameModal";
import type { Photo, UserPosition } from "@/components/map/types";
import ScreenLockButton from "./ScreenLockButton";
import { SummaryModal } from "./SummaryModal";
import GpsAccuracyDisplay from "./GpsAccuracyDisplay";
import StatusBar from "./StatusBar";

type MapComponentProps = {
  resume?: boolean;
};

const MIN_DISTANCE = 7; // minimalna odległość w metrach
const MIN_SPEED = 4; // minimalna prędkość w km/h do liczenia elapsedTime
const MAX_ACCURACY = 30; // maksymalna akceptowalna dokładność GPS w metrach
const MAX_REALISTIC_SPEED = 50; // maksymalna realistyczna prędkość w km/h (np. dla pieszych)
const MapComponent = ({ resume = false }: MapComponentProps) => {
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

  // --- Stany dla elapsedTime liczonego tylko podczas ruchu ---
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [elapsedStart, setElapsedStart] = useState<number | null>(null);
  const [pausedElapsed, setPausedElapsed] = useState<number>(0);

  // --- Kalman filter for smoothing GPS data ---
  const KALMAN_PARAMS = { R: 0.01, Q: 1 };
  const latFilter = useRef(new KalmanFilter(KALMAN_PARAMS));
  const lonFilter = useRef(new KalmanFilter(KALMAN_PARAMS));

  const [trackName, setTrackName] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);

  const [isWaitingForAccuratePosition, setIsWaitingForAccuratePosition] =
    useState(false);
  const previousPositionRef = useRef<UserPosition | null>(null);
  const previousTimestampRef = useRef<number | null>(null);
  const lastValidSpeedRef = useRef<number>(0); // przechowuje ostatnią dobrą prędkość
  // --- Nowe stany do wykrywania utraty i odzyskania sygnału GPS ---
  // Flaga informująca, czy obecnie utracono sygnał GPS (np. dokładność ponad MAX_ACCURACY)
  const [lostSignal, setLostSignal] = useState(false);

  // Referencja do ostatniego punktu z dokładnym sygnałem GPS przed utratą sygnału
  const lastPointBeforeLoss = useRef<UserPosition | null>(null);

  // Referencja do pierwszego punktu z dokładnym sygnałem GPS po odzyskaniu sygnału
  const firstPointAfterRecovery = useRef<UserPosition | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);

  // Stan informujący, czy obecnie trwa proces map matchingu (map matching)
  // Przyjmuje wartość true w trakcie wykonywania map matchingu, false poza tym czasem

  // Stan określający, czy jakość sygnału GPS jest wystarczająco dobra
  // true oznacza dobry, stabilny sygnał (np. zgodny z wymaganym progiem dokładności)
  // false oznacza słaby lub utracony sygnał GPS
  const [isGpsSignalGood, setIsGpsSignalGood] = useState(true);
  const [noUpdatePosition, setNoUpdatePosition] = useState(false);
  // --- Efekt do ładowania trasy z IndexedDB przy wznowieniu ---
  // Funkcja ładowania trasy z IndexedDB, owinięta w useCallback
  const loadOngoingTrack = useCallback(async () => {
    if (!resume) return;
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
        setIsTracking(true);
        setPausedTime(ongoing.travelTime || 0);
        setStartTime(Date.now());
      }
    } catch (error) {
      console.error("Błąd podczas ładowania trasy z IndexedDB:", error);
    }
    setIsLoaded(true);
  }, [resume]);

  // Autoładowanie przy starcie komponentu
  useEffect(() => {
    loadOngoingTrack();
  }, [loadOngoingTrack]);

  // Autoładowanie po powrocie do widoczności strony
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadOngoingTrack();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadOngoingTrack]);

  // --- Funkcja do wywołania map matchingu OSRM przez Twój API route ---
  async function fetchMatchedRoute(
    points: UserPosition[]
  ): Promise<UserPosition[]> {
    if (points.length === 0) return [];

    try {
      const response = await fetch("/api/map-matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points }),
      });

      if (!response.ok) {
        console.error("Map matching API error:", response.statusText);
        return points; // fallback do surowych punktów
      }

      const data = await response.json();

      if (!data.matchings || data.matchings.length === 0) {
        return points;
      }

      // OSRM zwraca geometry.coordinates jako [lon, lat]
      const matchedCoords = data.matchings[0].geometry.coordinates;
      return matchedCoords.map((c: [number, number]) => ({
        lat: c[1],
        lon: c[0],
      }));
    } catch (error) {
      console.error("Map matching fetch error:", error);
      return points;
    }
  }

  // ---funkcja pobierająca dokładną pozycję GPS przy pauzie---
  const getAccuratePosition = (
    maxAttempts = 10
  ): Promise<GeolocationPosition> => {
    let attempts = 0;
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        reject(new Error("Geolokalizacja nie jest dostępna"));
        return;
      }
      const tryGetPosition = () => {
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

  // --- Obsługa modalnego okna nazwy trasy ---
  useEffect(() => {
    if (isLoaded) {
      if (resume && trackName) {
        setShowTrackNameModal(false);
      } else if (!resume && !trackName) {
        setShowTrackNameModal(true);
      }
    }
  }, [isLoaded, resume, trackName]);

  // --- Obsługa startu śledzenia ---
  const handleStartTracking = async () => {
    setShowTrackNameModal(false);
    setIsWaitingForAccuratePosition(true);
    setGpsError(null);

    try {
      if (!("geolocation" in navigator)) {
        throw new Error("Geolokalizacja nie jest dostępna");
      }

      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        }
      );

      const filteredLat = latFilter.current.filter(position.coords.latitude);
      const filteredLon = lonFilter.current.filter(position.coords.longitude);
      const newPosition = { lat: filteredLat, lon: filteredLon };
      setUserPosition(newPosition);

      if (position.coords.accuracy > MAX_ACCURACY) {
        setGpsError(
          `Uwaga: start z niską dokładnością GPS (${Math.round(
            position.coords.accuracy
          )} m)`
        );
      } else {
        setGpsError(null);
      }

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

  // --- Pobranie początkowej pozycji do wyświetlenia mapy ---
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

  // --- Aktualizacja travelTime ---
  useEffect(() => {
    if (!isTracking || !startTime) return;
    const interval = setInterval(() => {
      setTravelTime(pausedTime + Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isTracking, startTime, pausedTime]);

  // --- Śledzenie pozycji GPS z obsługą utraty i odzyskania sygnału ---

  useEffect(() => {
    if (!isTracking) return;
    let watchId: number | undefined;

    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          // Obsługa dokładności
          setIsGpsSignalGood(position.coords.accuracy <= MAX_ACCURACY);
          setGpsAccuracy(position.coords.accuracy);
          if (position.coords.accuracy > MAX_ACCURACY) {
            if (!lostSignal) {
              setLostSignal(true);
              lastPointBeforeLoss.current = userPosition;
            }
            return;
          }

          // Po odzyskaniu sygnału
          if (lostSignal) {
            setLostSignal(false);
            const newPositionRaw = {
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            };
            firstPointAfterRecovery.current = newPositionRaw;

            if (
              lastPointBeforeLoss.current &&
              firstPointAfterRecovery.current
            ) {
              const segment = [
                lastPointBeforeLoss.current,
                firstPointAfterRecovery.current,
              ];
              const matchedSegment = await fetchMatchedRoute(segment);
              setTrack((prev) => {
                const newTrack = [...prev];
                newTrack.pop();
                return [...newTrack, ...matchedSegment];
              });
            }
          }

          // Detekcja outlierów (skok pozycji powyżej 30m)
          const rawLat = position.coords.latitude;
          const rawLon = position.coords.longitude;
          let isJump = false;

          if (previousPositionRef.current) {
            const distRaw = getDistanceFromLatLonInMeters(
              previousPositionRef.current.lat,
              previousPositionRef.current.lon,
              rawLat,
              rawLon
            );
            isJump = distRaw > 30;
          }

          if (isJump) {
            console.log(
              "Odrzucono outlier GPS (skok ponad 30m):",
              rawLat,
              rawLon
            );
            return;
          }

          // Filtrowanie Kalmanem
          const filteredLat = latFilter.current.filter(rawLat);
          const filteredLon = lonFilter.current.filter(rawLon);
          const newPosition = { lat: filteredLat, lon: filteredLon };
          const timestamp = Date.now();

          // Obliczanie prędkości
          const rawSpeed = position.coords.speed; // m/s lub null
          let newSpeed = 0;

          if (rawSpeed !== null && rawSpeed >= 0) {
            newSpeed = rawSpeed * 3.6; // konwersja na km/h
            if (newSpeed > MAX_REALISTIC_SPEED) {
              newSpeed = 0;
            }
          } else if (
            previousPositionRef.current &&
            previousTimestampRef.current
          ) {
            const dist = getDistanceFromLatLonInMeters(
              previousPositionRef.current.lat,
              previousPositionRef.current.lon,
              newPosition.lat,
              newPosition.lon
            );
            const timeDelta = (timestamp - previousTimestampRef.current) / 1000;

            if (timeDelta > 0) {
              newSpeed = calculateSpeed(dist, timeDelta);
            }
          }

          // Jeśli prędkość jest większa od zera, zapisujemy jako ostatnio ważną
          if (newSpeed > 0) {
            lastValidSpeedRef.current = newSpeed;
            updateSpeed(newSpeed, setSpeed);
          } else {
            // W przeciwnym wypadku wyświetlamy ostatnią ważną prędkość (nie zerujemy)
            updateSpeed(lastValidSpeedRef.current, setSpeed);
          }

          // Aktualizacja referencji poprzedniej pozycji i czasu
          previousPositionRef.current = newPosition;
          previousTimestampRef.current = timestamp;

          // Aktualizacja pozycji i trasy tylko jeśli prędkość >= MIN_SPEED i odległość >= MIN_DISTANCE
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
            // Przy prędkości poniżej progu nie aktualizujemy pozycji i trasy
            // Jeśli chcesz, możesz tu ustawić speed na lastValidSpeedRef lub 0 — zależy od UX
            setSpeed(lastValidSpeedRef.current);
            setNoUpdatePosition(true);
          }
        },
        (error) => {
          setGpsError(error.message);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    return () => {
      if (watchId !== undefined && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isTracking, startTime, lostSignal, userPosition]);

  // --- Aktualizacja elapsedTime (liczonego tylko podczas ruchu) ---
  useEffect(() => {
    if (!isTracking) {
      // Gdy śledzenie jest wyłączone, resetuj stany
      setElapsedStart(null);
      setPausedElapsed(0);
      return;
    }

    if (speed > 3) {
      // Jeśli prędkość wyższa niż 3 i timer nie działa, startuj pomiar czasu
      if (!elapsedStart) {
        setElapsedStart(Date.now());
      }
    } else if (speed === 0) {
      // Jeśli prędkość jest zero, zatrzymaj timer (pauza)
      if (elapsedStart) {
        setPausedElapsed(
          (prev) => prev + Math.floor((Date.now() - elapsedStart) / 1000)
        );
        setElapsedStart(null);
      }
    }
    // Prędkości w zakresie 0 < speed <= 3 nie zatrzymują i nie uruchamiają timera - timer działa tak jak wcześniej
  }, [speed, isTracking, elapsedStart]);

  useEffect(() => {
    if (!elapsedStart) return;

    const interval = setInterval(() => {
      setElapsedTime(
        pausedElapsed + Math.floor((Date.now() - elapsedStart) / 1000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [elapsedStart, pausedElapsed]);

  // --- Map matching co 10 sekund na całej trasie ---
  //  useEffect(() => {
  //   if (!isTracking || track.length < 5) return;

  //   const performMapMatching = async () => {
  //     if (isMatchingRef.current) return; // Nie zaczynaj jeśli trwa inne wywołanie
  //     isMatchingRef.current = true;
  //     setIsMapMatchingActive(true);  // informujemy że map matching działa
  //     try {
  //       const matched = await fetchMatchedRoute(track);
  //       setTrack((prevTrack) => matched.length ? matched : prevTrack);
  //     } finally {
  //       isMatchingRef.current = false;
  //       setIsMapMatchingActive(false);  // zakończono map matching
  //     }
  //   };

  //   performMapMatching(); // Raz od razu
  //   const interval = setInterval(performMapMatching, 10000);

  //   return () => clearInterval(interval);
  // }, [isTracking, track]);



  // --- Dodawanie zdjęć ---
  const handleAddPhoto = (photo: Photo) => {
    setPhotos((prev) => [...prev, photo]);
  };

  useWakeLock(isTracking);
  const addTestPoint = () => {
    const last = track[track.length - 1] || { lat: 52.2296, lon: 21.0122 };
    const nextPoint = {
      lat: last.lat + 0.0005,
      lon: last.lon + 0.0005,
    };
    const dist = getDistanceFromLatLonInMeters(
      last.lat,
      last.lon,
      nextPoint.lat,
      nextPoint.lon
    );
    setTrack([...track, nextPoint]);
    setUserPosition(nextPoint);
    setDistance((prevDistance) => prevDistance + dist); // aktualizujemy dystans sumaryczny
  };
  // --- Obsługa start/pauza śledzenia ---
  const handleStartPause = async () => {
    if (isTracking) {
      setIsTracking(false);
      setSpeed(0);
latFilter.current = new KalmanFilter(KALMAN_PARAMS);
    lonFilter.current = new KalmanFilter(KALMAN_PARAMS
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

  // --- Reset wszystkich danych ---
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

    // RESET FILTRÓW KALMANA:
    latFilter.current = new KalmanFilter(KALMAN_PARAMS);
    lonFilter.current = new KalmanFilter(KALMAN_PARAMS);

    // zresetować rejestry previousPositionRef)
    previousPositionRef.current = null;
    previousTimestampRef.current = null;
  };

  // --- Edycja opisu zdjęcia ---
  const handleEditPhotoDescription = (
    photoId: string,
    newDescription: string
  ) => {
    setPhotos((prev) =>
      prev.map((photo) =>
        photo.id === photoId ? { ...photo, description: newDescription } : photo
      )
    );
  };

  return (
    <div className="flex flex-col items-center">
      <SummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        onResetPhotos={() => setPhotos([])}
        onSave={() => {
          setShowSummaryModal(false);
        }}
        trackName={trackName}
        travelTime={travelTime}
        photos={photos}
        onEditDescriptions={() => {
          setShowSummaryModal(false);
        }}
        track={track}
        elapsedTime={elapsedTime}
        distance={distance}
      />

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
          <h2 className="text-black font-semibold text-xl">
            Album: {trackName}
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
          <GpsAccuracyDisplay accuracy={gpsAccuracy} />
          {noUpdatePosition && <p>Nie aktualizuje trasy</p>}

          <StatusBar
            isGpsSignalGood={isGpsSignalGood}
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
          <PhotoList
            photos={photos}
            onEditDescription={handleEditPhotoDescription}
          />
          <button
            onClick={addTestPoint}
            className="my-2 px-4 py-2 bg-green-500 text-white rounded"
          >
            Dodaj punkt testowy
          </button>
          <button
            onClick={loadOngoingTrack}
            className="px-4 py-2 bg-blue-600 text-white rounded mt-2"
            type="button"
          >
            Wczytaj trasę ręcznie
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded mt-4"
            onClick={async () => {
              if (isTracking) {
                await handleStartPause(); // zatrzymaj tracking, jeśli trwa
              }
              setShowSummaryModal(true);
            }}
          >
            Podsumowanie trasy
          </button>
          {/* <SaveTrackButton
            trackName={trackName}
            track={track}
            distance={distance}
            travelTime={travelTime}
            elapsedTime={elapsedTime}
            photos={photos}
            onReset={() => {
              setPhotos([]);
            }}
          /> */}
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
      <div className=" flex mt-4 w-full justify-center items-center">
        <div className="w-full text-center">
          {" "}
          <small className="text-gray-500 text-xs">
            Aplikacja korzysta z geolokalizacji. Upewnij się, że masz włączone
            usługi lokalizacji.
          </small>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;

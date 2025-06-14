"use client";
import { useEffect, useState } from "react";
import MapView from "./MapView";
import ControlPanel from "./ControlPanel";
import StatsPanel from "./StatsPanel";
import GpsError from "./GpsError";
import { getDistanceFromLatLonInMeters } from "./Utilis";
import SetTrackName from "./SetTrackName";
import PhotoInput from "./camera/PhotoInput";
import SaveTrackButton from "./camera/SaveTrackButton";
import PhotoList from "./camera/PhotoList";
import TrackAutoSaver from "./TrackAutoSaver";
import { openDB } from "idb";
import KalmanFilter from "kalmanjs";
import { useRef } from "react";

type UserPosition = {
  lat: number;
  lon: number;
};
type Photo = {
  id: string;
  imageDataUrl: string;
  description: string;
  position: UserPosition;
  timestamp: number;
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

  // Stany dla elapsedTime liczonego tylko podczas ruchu
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [elapsedStart, setElapsedStart] = useState<number | null>(null);
  const [pausedElapsed, setPausedElapsed] = useState<number>(0);
  //Kalman filter for smoothing GPS data

  const latFilter = useRef(new KalmanFilter());
  const lonFilter = useRef(new KalmanFilter());

  const [trackName, setTrackName] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);

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
          setPausedTime(ongoing.travelTime || 0); // sumuj poprzedni czas
          setStartTime(Date.now()); // nowy start od wznowienia
          // NIE ustawiaj travelTime bezpośrednio!
        }
      }
    }
    loadOngoingTrack();
  }, [resume]);

  // Pobranie początkowej pozycji
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          setGpsError(error.message);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);
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
            // Użyj filtra Kalmana!
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
        (error) => {
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

  // Aktualizacja travelTime (całkowity czas trwania śledzenia)
  useEffect(() => {
    if (!isTracking || !startTime) return;
    const interval = setInterval(() => {
      setTravelTime(pausedTime + Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isTracking, startTime, pausedTime]);

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

  // Obsługa start/pauza śledzenia
  const handleStartPause = () => {
    if (isTracking) {
      // Pauzujemy śledzenie
      setIsTracking(false);
      setSpeed(0);

      // Sumujemy czas od ostatniego wznowienia do pauzy
      if (startTime) {
        setPausedTime(
          (prev) => prev + Math.floor((Date.now() - startTime) / 1000)
        );
        setStartTime(null);
      }

      // Pauzujemy licznik czasu w ruchu
      if (elapsedStart) {
        setPausedElapsed(
          (prev) => prev + Math.floor((Date.now() - elapsedStart) / 1000)
        );
        setElapsedStart(null);
      }
    } else {
      // Wznawiamy śledzenie
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
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
            setUserPosition(newPosition);

            setIsTracking(true);

            // startTime ustawiamy zawsze na nowy moment wznowienia
            setStartTime(Date.now());

            // Dodaj pierwszy punkt do trasy tylko jeśli trasa jest pusta (nowa trasa)
            if (track.length === 0) {
              setTrack([newPosition]);
            }
          },
          (error) => {
            setGpsError(error.message);
            setIsTracking(true);
            setStartTime(Date.now());
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      } else {
        setIsTracking(true);
        setStartTime(Date.now());
        if (track.length === 0 && userPosition) {
          setTrack([userPosition]);
        }
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
          <SetTrackName
            trackName={trackName}
            setTrackName={setTrackName}
            disabled={isTracking}
          />
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
              // resetuj wszystko, w tym zdjęcia
              setPhotos([]);
              // inne resety jak w handleReset
            }}
          />
          <GpsError error={gpsError} />
        </>
      ) : (
        <p className="text-center">⏳ Pobieranie Twojej lokalizacji...</p>
      )}
    </div>
  );
};

export default MapComponent;

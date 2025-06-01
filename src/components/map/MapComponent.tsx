"use client";
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import MapUpdater from "./MapUpdater";
import TrackExporter from "./TrackExporter";

// Typ pozycji użytkownika
type UserPosition = {
  lat: number;
  lon: number;
};

const markerIcon: L.Icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MIN_DISTANCE = 5;
const MIN_SPEED = 3;
const MAX_ACCURACY = 25;

function getDistanceFromLatLonInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

const MapComponent = () => {
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

  // Początkowa pozycja - tylko raz na starcie
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

  // Aktualizacja pozycji, trasy i statystyk tylko po kliknięciu Start i przy odpowiedniej prędkości
  useEffect(() => {
    if (!isTracking) return;

    let watchId: number;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setGpsError(null);

          if (position.coords.accuracy <= MAX_ACCURACY) {
            const newPosition = {
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            };

            const newSpeed =
              position.coords.speed != null ? position.coords.speed * 3.6 : 0;

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

  // Aktualizacja czasu podróży tylko gdy isTracking i startTime
  useEffect(() => {
    if (!isTracking || !startTime) return;

    const interval = setInterval(() => {
      setTravelTime(pausedTime + Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isTracking, startTime, pausedTime]);

  const handleStartPause = () => {
    if (isTracking) {
      setIsTracking(false);
      setSpeed(0);
      if (startTime) {
        setPausedTime(
          (prev) => prev + Math.floor((Date.now() - startTime) / 1000)
        );
        setStartTime(null);
      }
    } else {
      setIsTracking(true);
      setTrack([]);
      setDistance(0);
      setSpeed(0);
      setTravelTime(0);
      setPausedTime(0);
      setStartTime(null);
    }
  };

  const handleReset = () => {
    setIsTracking(false);
    setTrack([]);
    setDistance(0);
    setSpeed(0);
    setTravelTime(0);
    setStartTime(null);
    setPausedTime(0);
    setGpsError(null);
  };

  return (
    <div>
      {userPosition ? (
        <>
          <MapContainer
            center={[userPosition.lat, userPosition.lon]}
            zoom={18}
            className="h-[25rem] w-screen rounded-lg shadow-lg border-2 border-lime-950 mx-4"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            <Marker
              position={[userPosition.lat, userPosition.lon]}
              icon={markerIcon}
            >
              <Popup>📍 Twoja aktualna lokalizacja</Popup>
            </Marker>

            {track.length > 1 && (
              <Polyline
                positions={track.map((pos) => [pos.lat, pos.lon])}
                color="blue"
              />
            )}

            <MapUpdater
              position={[userPosition.lat, userPosition.lon]}
              autoCenter={autoCenter}
            />
          </MapContainer>

          {/* Panel sterowania */}
          <div className="flex justify-center gap-4 my-4 flex-wrap">
            <button
              onClick={handleStartPause}
              className={`px-4 py-2 rounded text-white ${
                isTracking
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {isTracking ? "Pauza" : "Start"}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-500 rounded text-white hover:bg-red-600"
            >
              Reset
            </button>
            <button
              onClick={() => setAutoCenter((prev) => !prev)}
              className="px-4 py-2 bg-blue-500 rounded text-white hover:bg-blue-600"
            >
              {autoCenter ? "Wyłącz śledzenie mapy" : "Włącz śledzenie mapy"}
            </button>
              <TrackExporter track={track} distance={distance} travelTime={travelTime} />

          </div>

          {/* Panel informacji */}
          <div className="grid grid-cols-2 gap-4 m-2 p-4 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
            <div className="flex flex-col items-center bg-lime-100 p-4 rounded-lg shadow-sm w-48">
              <p className="text-lg font-semibold text-lime-800">🚗 Prędkość</p>
              <p className="text-2xl font-bold text-lime-900">
                {speed.toFixed(2)} km/h
              </p>
            </div>
            <div className="flex flex-col items-center bg-blue-100 p-4 rounded-lg shadow-sm w-48">
              <p className="text-lg font-semibold text-blue-800">
                🛣️ Odległość
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {(distance / 1000).toFixed(2)} km
              </p>
            </div>
            <div className="flex flex-col items-center bg-yellow-100 p-2 rounded-lg shadow-sm w-48 col-span-2 sm:col-span-1">
              <p className="text-lg font-semibold text-yellow-800">
                ⏱️ Czas podróży
              </p>
              <p className="text-2xl font-bold text-yellow-900">
                {formatTime(travelTime)}
              </p>
            </div>
          </div>

          {/* Komunikat o błędzie GPS */}
          {gpsError && (
            <p className="text-center text-red-600 font-semibold">{gpsError}</p>
          )}
        </>
      ) : (
        <p className="text-center">⏳ Pobieranie Twojej lokalizacji...</p>
      )}
    </div>
  );
};

export default MapComponent;

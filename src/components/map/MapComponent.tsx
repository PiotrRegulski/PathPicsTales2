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

// 🔹 Definiowanie typu dla pozycji użytkownika
type UserPosition = {
  lat: number;
  lon: number;
};

// 🔹 Ikona markera Leaflet
const markerIcon: L.Icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// 🔹 Minimalna odległość w metrach, poniżej której ignorujemy zmianę pozycji
const MIN_DISTANCE = 15;
// 🔹 Minimalna prędkość w km/h do aktualizacji trasy i prędkości
const MIN_SPEED = 3;
// 🔹 Maksymalna dopuszczalna dokładność GPS w metrach
const MAX_ACCURACY = 25;

// 🔹 Funkcja do obliczania odległości między dwoma punktami GPS (Haversine formula)
function getDistanceFromLatLonInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371000; // promień Ziemi w metrach
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

// 🔹 Formatowanie czasu w mm:ss
function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

const MapComponent = () => {
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [track, setTrack] = useState<UserPosition[]>([]);
  const [speed, setSpeed] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0); // w metrach
  const [startTime, setStartTime] = useState<number | null>(null);
  const [travelTime, setTravelTime] = useState<number>(0); // w sekundach

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          if (position.coords.accuracy <= MAX_ACCURACY) {
            const newPosition = {
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            };

            setUserPosition((prevPosition) => {
              if (prevPosition) {
                const distance = getDistanceFromLatLonInMeters(
                  prevPosition.lat,
                  prevPosition.lon,
                  newPosition.lat,
                  newPosition.lon
                );
                if (distance < MIN_DISTANCE) {
                  // Zmiana pozycji zbyt mała, ignoruj
                  return prevPosition;
                }
              }
              return newPosition;
            });

            const newSpeed =
              position.coords.speed != null ? position.coords.speed * 3.6 : 0;

            if (newSpeed >= MIN_SPEED) {
              if (!startTime) {
                setStartTime(Date.now());
              }
              setSpeed(newSpeed);

              setTrack((prevTrack) => {
                const lastPosition = prevTrack[prevTrack.length - 1];
                if (!lastPosition) {
                  return [newPosition];
                }
                const distance = getDistanceFromLatLonInMeters(
                  lastPosition.lat,
                  lastPosition.lon,
                  newPosition.lat,
                  newPosition.lon
                );
                if (distance >= MIN_DISTANCE) {
                  setDistance((prevDistance) => prevDistance + distance);
                  return [...prevTrack, newPosition];
                }
                return prevTrack;
              });
            } else {
              setSpeed(0);
            }
          } else {
            console.warn(
              `Pomijam pozycję o niskiej dokładności: ${position.coords.accuracy} m`
            );
          }
        },
        (error) => console.error("❌ Błąd GPS:", error.message),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [startTime]);

  // Aktualizacja czasu podróży co sekundę
  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      setTravelTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

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
            <MapUpdater position={[userPosition.lat, userPosition.lon]} />
          </MapContainer>
          <div className="flex flex-col lg:flex-row justify-around items-center gap-4 m-4 p-4 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
            <div className="flex flex-col items-center bg-lime-100 p-4 rounded-lg shadow-sm w-40">
              <p className="text-lg font-semibold text-lime-800">🚗 Prędkość</p>
              <p className="text-2xl font-bold text-lime-900">
                {speed.toFixed(2)} km/h
              </p>
            </div>
            <div className="flex flex-col items-center bg-blue-100 p-4 rounded-lg shadow-sm w-40">
              <p className="text-lg font-semibold text-blue-800">
                🛣️ Odległość
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {(distance / 1000).toFixed(2)} km
              </p>
            </div>
            <div className="flex flex-col items-center bg-yellow-100 p-4 rounded-lg shadow-sm w-40">
              <p className="text-lg font-semibold text-yellow-800">
                ⏱️ Czas podróży
              </p>
              <p className="text-2xl font-bold text-yellow-900">
                {formatTime(travelTime)}
              </p>
            </div>
          </div>
        </>
      ) : (
        <p className="text-center">⏳ Pobieranie Twojej lokalizacji...</p>
      )}
    </div>
  );
};

export default MapComponent;

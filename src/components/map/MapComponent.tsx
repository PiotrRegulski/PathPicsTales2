"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

const MapComponent = () => {
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [track, setTrack] = useState<UserPosition[]>([]);
  const [speed, setSpeed] = useState<number>(0); // 🔹 Prędkość użytkownika

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position: GeolocationPosition) => {
          const newPosition = { lat: position.coords.latitude, lon: position.coords.longitude };

          // 🔹 Aktualizacja pozycji użytkownika
          setUserPosition(newPosition);

          // 🔹 Aktualizacja prędkości w km/h (m/s * 3.6)
          setSpeed(position.coords.speed ? position.coords.speed * 3.6 : 0);

          // 🔹 Sprawdzenie, czy nowa pozycja różni się istotnie od poprzedniej
          setTrack((prevTrack) => {
            const lastPosition = prevTrack[prevTrack.length - 1];
            if (!lastPosition || (Math.abs(lastPosition.lat - newPosition.lat) > 0.00005 && Math.abs(lastPosition.lon - newPosition.lon) > 0.00005)) {
              return [...prevTrack, newPosition];
            }
            return prevTrack;
          });
        },
        (error: GeolocationPositionError) => console.error("❌ Błąd GPS:", error.message),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  return (
    <div>
      {userPosition ? (
        <>
          <p className="text-center font-bold text-xl">🚗 Prędkość: {speed.toFixed(2)} km/h</p>
          <MapContainer center={[userPosition.lat, userPosition.lon]} zoom={18} className="h-[25rem] w-screen rounded-lg shadow-lg border-2 border-lime-950 mx-4">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />

            {/* 🔹 Marker użytkownika */}
            <Marker position={[userPosition.lat, userPosition.lon]} icon={markerIcon}>
              <Popup>📍 Twoja aktualna lokalizacja</Popup>
            </Marker>

            {/* 🔹 Rysowanie trasy */}
            {track.length > 1 && <Polyline positions={track.map((pos) => [pos.lat, pos.lon])} color="blue" />}
          </MapContainer>
        </>
      ) : (
        <p className="text-center">⏳ Pobieranie Twojej lokalizacji...</p>
      )}
    </div>
  );
};

export default MapComponent;

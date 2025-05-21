"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 🔹 Definiowanie typu dla pozycji użytkownika
type UserPosition = {
  lat: number;
  lon: number;
};

// 🔹 Definiowanie ikony markera Leaflet
const markerIcon: L.Icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapComponent: React.FC<UserPosition> = () => {
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          setUserPosition({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error: GeolocationPositionError) => console.error("❌ Błąd GPS:", error.message),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  return (
    <div>
      {userPosition ? (
    
        <MapContainer center={[userPosition.lat, userPosition.lon]} zoom={13} className="h-[25rem] w-screen  rounded-lg shadow-lg border-2 border-lime-950 mx-4">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
          <Marker position={[userPosition.lat, userPosition.lon]} icon={markerIcon}>
            <Popup>📍 Twoja aktualna lokalizacja</Popup>
          </Marker>
        </MapContainer>
      ) : (
        <p className="text-center">⏳ Pobieranie Twojej lokalizacji...</p>
      )}
    </div>
  );
};

export default MapComponent;

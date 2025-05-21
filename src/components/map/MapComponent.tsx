"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapComponent({ lat, lon }: { lat: number; lon: number }) {
  return (
    <MapContainer center={[lat, lon]} zoom={13} className="h-[15rem] w-[300px] mx-auto rounded-lg shadow-lg">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      <Marker position={[lat, lon]} icon={markerIcon}>
        <Popup>📍 Twoja aktualna lokalizacja</Popup>
      </Marker>
    </MapContainer>
  );
}

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import MapUpdater from "./MapUpdater";

const markerIcon: L.Icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type UserPosition = { lat: number; lon: number; };

interface MapViewProps {
  userPosition: UserPosition;
  track: UserPosition[];
  autoCenter: boolean;
}

export default function MapView({ userPosition, track, autoCenter }: MapViewProps) {
  return (
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
  );
}

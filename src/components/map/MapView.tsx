import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import { Photo } from "@/components/map/types";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import MapUpdater from "./MapUpdater";
import PhotoBlobToImage from "./camera/PhotoBlobToImage";

const markerIcon: L.Icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [15, 31],
  iconAnchor: [7, 31],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const photoIcon = new L.Icon({
  iconUrl: "/img/photoIcon.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});
type UserPosition = { lat: number; lon: number };

interface MapViewProps {
  userPosition: UserPosition;
  track: UserPosition[];
  autoCenter: boolean;
  photos?: Photo[];
}
//  * Pomocnicza funkcja do obliczania odległości w metrach między dwoma punktami GPS
//  * (współrzędne w stopniach dziesiętnych)
//  */
function getDistanceFromLatLonInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
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
  const d = R * c;
  return d;
}

/**
 * Funkcja grupująca zdjęcia, które znajdują się blisko siebie (w zadanym promieniu)
 * Zwraca tablicę grup, gdzie każda grupa ma pozycję i listę zdjęć
 */
function groupPhotosByProximity(
  photos: Photo[],
  radiusMeters = 10
): Array<{ position: UserPosition; photos: Photo[] }> {
  const groups: Array<{ position: UserPosition; photos: Photo[] }> = [];

  photos.forEach((photo) => {
    // Szukamy grupy, do której zdjęcie może należeć (odległość <= radiusMeters)
    const group = groups.find((g) => {
      const dist = getDistanceFromLatLonInMeters(
        g.position.lat,
        g.position.lon,
        photo.position.lat,
        photo.position.lon
      );
      return dist <= radiusMeters;
    });

    if (group) {
      // Jeśli grupa istnieje, dodajemy zdjęcie do niej
      group.photos.push(photo);

      // Opcjonalnie: aktualizujemy pozycję grupy jako średnią pozycji zdjęć
      const latSum = group.photos.reduce((sum, p) => sum + p.position.lat, 0);
      const lonSum = group.photos.reduce((sum, p) => sum + p.position.lon, 0);
      group.position = {
        lat: latSum / group.photos.length,
        lon: lonSum / group.photos.length,
      };
    } else {
      // Jeśli brak pasującej grupy, tworzymy nową z tym zdjęciem
      groups.push({ position: photo.position, photos: [photo] });
    }
  });

  return groups;
}
export default function MapView({
  userPosition,
  track,
  autoCenter,
  photos,
}: MapViewProps) {
  const groupedPhotos = photos ? groupPhotosByProximity(photos) : [];
  return (
    <MapContainer
      center={[userPosition.lat, userPosition.lon]}
      zoom={18}
      className="container mx-auto h-[25rem] w-screen rounded-lg shadow-lg border-2 border-lime-950"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {/* Marker aktualnej pozycji użytkownika */}
      <Marker position={[userPosition.lat, userPosition.lon]} icon={markerIcon}>
        <Popup>📍 Twoja aktualna lokalizacja</Popup>
      </Marker>

      {/* Linia trasy */}
      {track.length > 1 && (
        <Polyline
          positions={track.map((pos) => [pos.lat, pos.lon])}
          color="blue"
        />
      )}
     
         {/* Markery grup zdjęć */}
      {groupedPhotos.map((group) => (
        <Marker
          key={`${group.position.lat.toFixed(6)}_${group.position.lon.toFixed(6)}`}
          position={[group.position.lat, group.position.lon]}
          icon={photoIcon}
        >
          <Popup>
            {/* Jeśli tylko jedno zdjęcie w grupie, pokazujemy dużą miniaturę */}
           {group.photos.length === 1 ? (
  <PhotoBlobToImage
    blob={group.photos[0].blob}
    alt={group.photos[0].description || "Zdjęcie"}
    width={150}
    height={100}
    className="rounded"
  />
) : (
  <div className="flex flex-wrap gap-1 max-w-[300px]">
    {group.photos.map((photo) => (
      <div
        key={photo.id}
        className="w-[60px] h-[60px] cursor-pointer rounded overflow-hidden"
      >
        <PhotoBlobToImage
          blob={photo.blob}
          alt={photo.description || "Zdjęcie"}
          width={60}
          height={60}
          className="object-cover"
        />
      </div>
    ))}
  </div>
)}

          </Popup>
        </Marker>
      ))}
      {/* Aktualizacja pozycji użytkownika */}

      <MapUpdater
        position={[userPosition.lat, userPosition.lon]}
        autoCenter={autoCenter}
      />
    </MapContainer>
  );
}

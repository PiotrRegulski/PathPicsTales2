import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  
} from "react-leaflet";
import { Photo } from "@/components/map/types";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
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

// Pomocnicza funkcja do obliczania odległości w metrach między dwoma punktami GPS
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
  return R * c;
}

// Funkcja grupująca zdjęcia blisko siebie
function groupPhotosByProximity(
  photos: Photo[],
  radiusMeters = 10
): Array<{ position: UserPosition; photos: Photo[] }> {
  const groups: Array<{ position: UserPosition; photos: Photo[] }> = [];

  photos.forEach((photo) => {
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
      group.photos.push(photo);
      // Aktualizacja pozycji grupy jako średnia pozycji zdjęć
      const latSum = group.photos.reduce((sum, p) => sum + p.position.lat, 0);
      const lonSum = group.photos.reduce((sum, p) => sum + p.position.lon, 0);
      group.position = {
        lat: latSum / group.photos.length,
        lon: lonSum / group.photos.length,
      };
    } else {
      groups.push({ position: photo.position, photos: [photo] });
    }
  });

  return groups;
}

// Funkcja filtrująca punkty trasy, aby usuwać odległe/skokowe punkty
function filterTrackPoints(track: UserPosition[], maxDistanceMeters = 1000) {
  if (track.length === 0) return [];

  const filtered = [track[0]];
  for (let i = 1; i < track.length; i++) {
    const dist = getDistanceFromLatLonInMeters(
      filtered[filtered.length - 1].lat,
      filtered[filtered.length - 1].lon,
      track[i].lat,
      track[i].lon
    );
    if (dist <= maxDistanceMeters) {
      filtered.push(track[i]);
    } else {
      console.warn(`Punkt pominięty, zbyt duża odległość: ${dist} m`);
    }
  }
  return filtered;
}
// Funkcja diagnostyczna do sprawdzania poprawności trasy
function diagnoseTrack(track: UserPosition[], filteredTrack: UserPosition[]): string | null {
  if (!track || track.length === 0) return "Brak punktów trasy (track jest pusty)";
  if (filteredTrack.length === 0) return "Wszystkie punkty zostały odrzucone przez filtrację (skok powyżej 1000 m)";
  if (filteredTrack.length === 1) return "Tylko jeden punkt po filtracji (Polyline wymaga min. 2)";
  return null; // wszystko ok
}
export default function MapView({
  userPosition,
  track,
  autoCenter,
  photos,
}: MapViewProps) {
  const groupedPhotos = photos ? groupPhotosByProximity(photos) : [];
  const filteredTrack = filterTrackPoints(track);
  const diagnose = diagnoseTrack(track, filteredTrack);

 

  return (
    <>
      <MapContainer
        center={[userPosition.lat, userPosition.lon]}
        zoom={16}
        className="container mx-auto h-[25rem] w-screen rounded-lg shadow-lg border-2 border-lime-950"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <Marker position={[userPosition.lat, userPosition.lon]} icon={markerIcon}>
          <Popup>📍 Twoja aktualna lokalizacja</Popup>
        </Marker>

        
        {groupedPhotos.map((group) => (
          <Marker
            key={`${group.position.lat.toFixed(6)}_${group.position.lon.toFixed(
              6
            )}`}
            position={[group.position.lat, group.position.lon]}
            icon={photoIcon}
          >
            <Popup>
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

        <MapUpdater position={[userPosition.lat, userPosition.lon]} autoCenter={autoCenter} />
      </MapContainer>

      {/* Diagnostyka problemów z trasą */}
      {diagnose && (
        <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded my-2 text-sm">
          Uwaga: {diagnose}
        </div>
      )}
    </>
  );
}

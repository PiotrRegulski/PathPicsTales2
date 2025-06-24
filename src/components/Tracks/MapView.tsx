import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PhotoBlobImage from  "@/components/map/camera/PhotoBlobToImage"; // Dostosuj ścieżkę importu do swojego projektu
import MapBoundsAdjuster from "./MapBoundsAdjuster"; // Dostosuj ścieżkę importu do swojego projektu
import { Photo } from "./types";
type UserPosition = {
  lat: number;
  lon: number;
};


type MapViewProps = {
  track: UserPosition[];
  photoMarkers: Photo[];
  selectedPhotoId?: string | null;
  onPhotoMarkerClick?: (photo: Photo) => void;
};

const MapView: React.FC<MapViewProps> = ({
  track,
  photoMarkers,
  selectedPhotoId,
  onPhotoMarkerClick,
}) => {

  if (
    !track ||
    track.length === 0 ||
    typeof track[0].lat !== "number" ||
    typeof track[0].lon !== "number"
  ) {
    return <p>Brak poprawnych danych trasy do wyświetlenia na mapie.</p>;
  }

  const icon = new L.Icon({
    iconUrl: "/img/photoIcon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <MapContainer
      center={[52.2297, 21.0122]} // domyślne centrum, np. Warszawa
      zoom={6} // domyślny, szeroki zoom
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapBoundsAdjuster markers={photoMarkers} />
      {photoMarkers.map((photo) => {
        if (
          !photo.position ||
          typeof photo.position.lat !== "number" ||
          typeof photo.position.lon !== "number"
        ) {
          return null;
        }
        return (
          <Marker
            key={photo.id}
            position={[photo.position.lat, photo.position.lon]}
            icon={icon}
            eventHandlers={{
              click: () => onPhotoMarkerClick && onPhotoMarkerClick(photo),
            }}
          >
            {selectedPhotoId === photo.id && (
              <Popup>
                <div>
                  <PhotoBlobImage
                              blob={photo.blob}
                              alt="Zdjęcie z trasy"
                              width={200}
                              height={200}
                              className="rounded"
                            />
                  <p>{photo.description}</p>
                  <small>
                    Pozycja: {photo.position.lat.toFixed(5)}, {photo.position.lon.toFixed(5)}
                  </small>
                </div>
              </Popup>
            )}
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapView;

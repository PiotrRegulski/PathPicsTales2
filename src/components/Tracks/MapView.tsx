import React from "react";
import {
  MapContainer,
  TileLayer,
  
  Marker,
  Popup,
  
} from "react-leaflet";
import L from "leaflet";
import Image from "next/image";
import MapBoundsAdjuster from "./MapBoundsAdjuster"; // Adjust the import path as necessary

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
   center={[52.2297, 21.0122]} // domyślne centrum (Warszawa)
  zoom={6} // domyślny, szeroki zoom
  style={{ height: "100%", width: "100%" }}
>
  <TileLayer
    attribution="&copy; OpenStreetMap contributors"
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />
  <MapBoundsAdjuster markers={photoMarkers} />
  {/* Usuwamy Polyline */}
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
              <Image
                src={photo.imageDataUrl}
                alt={photo.description}
                width={100}
                height={100}
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

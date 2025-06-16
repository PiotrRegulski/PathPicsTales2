"use client";
import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Image from "next/image";

import type { Photo } from "@/components/Tracks/types";
import type { MapViewProps } from "@/components/Tracks/types";

const FlyToPhoto = ({ photo }: { photo: Photo | null }) => {
  const map = useMap();

  useEffect(() => {
    if (
      photo &&
      typeof photo.lat === "number" &&
      typeof photo.lng === "number"
    ) {
      map.flyTo([photo.lat, photo.lng], 15, { duration: 1.5 });
    }
  }, [photo, map]);

  return null;
};

const MapView: React.FC<MapViewProps> = ({
  track,
  photoMarkers,
  selectedPhotoId,
  onPhotoMarkerClick,
}) => {
  // Sprawdzenie, czy track istnieje i ma poprawne współrzędne
  if (
    !track ||
    track.length === 0 ||
    !Array.isArray(track[0]) ||
    track[0].length !== 2 ||
    typeof track[0][0] !== "number" ||
    typeof track[0][1] !== "number"
  ) {
    return <p>Brak poprawnych danych trasy do wyświetlenia na mapie.</p>;
  }

  const selectedPhoto =
    photoMarkers.find((p) => p.id === selectedPhotoId) || null;

  const icon = new L.Icon({
    iconUrl: "/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <MapContainer
      center={track[0]}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={track} color="blue" />
      {photoMarkers.map((photo) => {
        // Sprawdzenie poprawności współrzędnych zdjęcia
        if (
          typeof photo.lat !== "number" ||
          typeof photo.lng !== "number"
        ) {
          return null;
        }
        return (
          <Marker
            key={photo.id}
            position={[photo.lat, photo.lng]}
            icon={icon}
            eventHandlers={{
              click: () =>
                onPhotoMarkerClick && onPhotoMarkerClick(photo),
            }}
          >
            {selectedPhotoId === photo.id && (
              <Popup>
                <div>
                  <Image
                    src={photo.thumbnailUrl}
                    alt={photo.description}
                    width={100}
                    height={100}
                  />
                  <p>{photo.description}</p>
                </div>
              </Popup>
            )}
          </Marker>
        );
      })}
      <FlyToPhoto photo={selectedPhoto} />
    </MapContainer>
  );
};

export default MapView;

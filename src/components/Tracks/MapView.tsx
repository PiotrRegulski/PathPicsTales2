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
import type{ MapViewProps } from "@/components/Tracks/types";

const FlyToPhoto = ({ photo }: { photo: Photo | null }) => {
  const map = useMap();

  useEffect(() => {
    if (photo) {
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
      {photoMarkers.map((photo) => (
        <Marker
          key={photo.id}
          position={[photo.lat, photo.lng]}
          icon={icon}
          eventHandlers={{
            click: () => onPhotoMarkerClick && onPhotoMarkerClick(photo),
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
      ))}
      <FlyToPhoto photo={selectedPhoto} />
    </MapContainer>
  );
};

export default MapView;

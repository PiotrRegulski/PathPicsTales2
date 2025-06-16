"use client";

import { useEffect, useState } from "react";
import { openDB } from "idb";
import dynamic from "next/dynamic";
import PhotoList from "@/components/Tracks/PhotoList";
import type { Track} from "@/components/Tracks/types";
import type { Photo } from "@/components/map/types";

// Dynamiczny import mapy (SSR off)
const MapView = dynamic(() => import("@/components/Tracks/MapView"), {
  ssr: false,
  loading: () => <p>Ładowanie mapy...</p>,
});

type Props = {
  id: string;
};

export default function TrackDetailsClient({ id }: Props) {
  const [track, setTrack] = useState<Track | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    if (!id) return;

    (async () => {
      const db = await openDB("TravelDB", 2);
      const t = await db.get("tracks", id);
      setTrack(t);
    })();
  }, [id]);

  if (!track || !track.photos) {
    return <p>Ładowanie...</p>;
  }

  // Przekazujemy track jako tablicę obiektów {lat, lon}
  // oraz zdjęcia z pozycją w polu position
  return (
    <div>
      <MapView
        // przekazujemy track bez zmian, MapView musi obsłużyć [{lat, lon}]
        track={track.track}
        // przekazujemy zdjęcia bez zmian, MapView musi obsłużyć photo.position
        photoMarkers={track.photos}
        selectedPhotoId={selectedPhoto ? selectedPhoto.id : null}
        onPhotoMarkerClick={(photo) => setSelectedPhoto(photo)}
      />
      <PhotoList
        photos={track.photos}
        onPhotoClick={(photo) => setSelectedPhoto(photo)}
      />
    </div>
  );
}

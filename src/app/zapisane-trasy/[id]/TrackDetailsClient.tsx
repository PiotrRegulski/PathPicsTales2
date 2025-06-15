"use client";

import { useEffect, useState } from "react";
import { openDB } from "idb";
import dynamic from "next/dynamic";
import PhotoList from "@/components/Tracks/PhotoList";
import type { Track, Photo } from "@/components/Tracks/types";

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

  return (
    <div>
      <MapView
        track={track.track}
        photoMarkers={track.photos}
        selectedPhotoId={selectedPhoto ? selectedPhoto.id : null}
        onPhotoMarkerClick={(photo) => setSelectedPhoto(photo)}
      />
      <PhotoList
        photos={track.photos}
        onPhotoClick={(photo) => setSelectedPhoto(photo)}
      />
      {/* Możesz dodać komponent Statystyki */}
    </div>
  );
}

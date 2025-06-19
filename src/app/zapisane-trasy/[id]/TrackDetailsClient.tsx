'use client';

import { useEffect, useState } from "react";
import { openDB } from "idb";
import dynamic from "next/dynamic";
import PhotoList from "@/components/Tracks/PhotoList";
import type { Track } from "@/components/Tracks/types";
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
      // Rzutowanie na Track, bo IndexedDB zwraca any
      const t = (await db.get("tracks", id)) as Track | undefined;
      setTrack(t ?? null);
    })();
  }, [id]);

  // Sprawdzamy, czy track i jego pola są poprawne
  if (
    !track ||
    !Array.isArray(track.photos) ||
    !Array.isArray(track.track)
  ) {
    return <p>Ładowanie...</p>;
  }

  return (
    <div className="flex flex-col w-full justify-center items-center mx-auto h-screen">
      <div className="w-full max-w-2xl mx-auto border rounded-lg shadow mb-4 overflow-hidden">
        <MapView
          track={track.track}
          photoMarkers={track.photos}
          selectedPhotoId={selectedPhoto ? selectedPhoto.id : null}
          onPhotoMarkerClick={(photo) => setSelectedPhoto(photo)}
        />
      </div>
      <PhotoList
        photos={track.photos}
        onPhotoClick={(photo) => setSelectedPhoto(photo)}
      />
    </div>
  );
}

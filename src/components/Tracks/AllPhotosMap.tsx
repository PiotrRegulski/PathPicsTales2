"use client";
import { useEffect, useState } from "react";
import { openDB } from "idb";
import dynamic from "next/dynamic";
import type { Photo } from "@/components/map/types";
const MapView = dynamic(() => import("@/components/Tracks/MapView"), {
  ssr: false,
  loading: () => <p>Ładowanie mapy...</p>
});

export default function AllPhotosMap() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    (async () => {
      const db = await openDB("TravelDB", 2);
     const allTracks: { photos?: Photo[] }[] = await db.getAll("tracks");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allPhotos = (allTracks as any[])
        .flatMap((track) =>
          Array.isArray(track?.photos) ? track.photos : []
        )
        .filter((p): p is Photo => !!p && !!p.position);
      setPhotos(allPhotos);
    })();
  }, []);

  if (!Array.isArray(photos)) return <p>Ładowanie...</p>;

  return (
    <div className="flex flex-col w-full justify-center items-center mx-auto">
      <h2 className="text-xl font-bold mb-4">Wszystkie zdjęcia na mapie</h2>
      <div className="w-full max-w-2xl mx-auto border rounded-lg shadow mb-4 overflow-hidden">
        <MapView
          track={[]} // lub pominąć, jeśli nie wymagane
          photoMarkers={photos}
          selectedPhotoId={selectedPhoto ? selectedPhoto.id : null}
          onPhotoMarkerClick={setSelectedPhoto}
        />
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { openDB } from "idb";
import dynamic from "next/dynamic";
import PhotoList from "@/components/Tracks/PhotoList";

const MapView = dynamic(() => import("@/components/Tracks/MapView"), {
  ssr: false,
  loading: () => <p>Ładowanie mapy...</p>,
});

import type { Track, Photo } from "@/components/Tracks/types";

export default function SavedTrackDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [track, setTrack] = useState<Track | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    if (!id || Array.isArray(id)) return;

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
      {/* Tutaj możesz dodać komponent Statystyki */}
    </div>
  );
}

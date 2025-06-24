"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { openDB } from "idb";
import dynamic from "next/dynamic";
import type { Track } from "@/components/Tracks/types";
import type { Photo } from "@/components/map/types";
import TravelBlogArticle from "@/components/Tracks/TravelBlogArticle";
import ShareTrackButton from "@/components/Tracks/ShareTrackButton";
// import TravelBlogArticle from "@/components/Tracks/TravelBlogArticle";

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
  if (!track || !Array.isArray(track.photos) || !Array.isArray(track.track)) {
    return <p>Ładowanie...</p>;
  }

  return (
    <div className="flex flex-col w-full justify-center items-center mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Opowieść z trasy: {track.trackName}
      </h1>
      <div className="w-full max-w-2xl mx-auto border rounded-lg shadow mb-4 overflow-hidden">
        <MapView
          track={track.track}
          photoMarkers={track.photos}
          selectedPhotoId={selectedPhoto ? selectedPhoto.id : null}
          onPhotoMarkerClick={(photo) => setSelectedPhoto(photo)}
        />
      </div>

      <TravelBlogArticle
        trackName={track.trackName}
        travelTime={track.travelTime}
        distance={track.distance}
        photos={track.photos}
      />
      <ShareTrackButton
        track={{
          ...track,
          photos: track.photos ?? [],
        }}
        onSuccess={() => alert("Trasa została udostępniona!")}
        // Możesz tu dodać przekierowanie do /trasy-uzytkownikow, jeśli chcesz
      />
      <Link href={"/zapisane-trasy"} className="text-xl text-blue-950 my-2 ">Powrót do listy tras</Link>
    </div>
  );
}

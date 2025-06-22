"use client";
import { useEffect, useState } from "react";
import type { Track } from "@/components/Tracks/types";
import TravelBlogArticle from "@/components/Tracks/TravelBlogArticle";

export default function PublicTracksPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public-tracks")
      .then(res => res.json())
      .then(data => setTracks(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Ładowanie tras społeczności...</p>;

  if (!tracks.length) return <p>Brak udostępnionych tras.</p>;

  return (
    <div className="max-w-3xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Trasy użytkowników</h1>
      {tracks.map(track => (
        <div key={track.id} className="mb-10 border-b pb-6">
          <TravelBlogArticle
            trackName={track.trackName}
            travelTime={track.travelTime}
            distance={track.distance}
            photos={track.photos}
          />
        </div>
      ))}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import type { Photo, Track, UserPosition } from "@/components/Tracks/types";
import PublicTravelBlog from "@/components/Tracks/PublicTravelBlog";
type ApiTrack = {
  id: string;
  track_name: string;
  travelTime: number;
  distance: number;
  elapsedTime: number;
  track: UserPosition[];
  photos: Photo[];
};

export default function PublicTracksPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch("/api/public-tracks")
    .then(res => res.json())
    .then((data: ApiTrack[]) => {
      const mapped: Track[] = data.map((track) => ({
        id: track.id,
        trackName: track.track_name,
        travelTime: track.travelTime,
        distance: track.distance,
        elapsedTime: track.elapsedTime,
        track: track.track,
        photos: track.photos,
      }));
      setTracks(mapped);
    })
    .finally(() => setLoading(false));
}, []);


  if (loading) return <p>Ładowanie tras społeczności...</p>;

  if (!tracks.length) return <p>Brak udostępnionych tras.</p>;

  return (
    <div className="max-w-3xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Trasy użytkowników</h1>
      {tracks.map(track => (
        <div key={track.id} className="mb-10 border-b pb-6">
          <PublicTravelBlog
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

"use client";
import { useEffect, useState } from "react";
import { openDB } from "idb";
import Link from "next/link";

type UserPosition = {
  lat: number;
  lon: number;
};

type Photo = {
  id: string;
  imageDataUrl: string;
  description: string;
  position: UserPosition;
  timestamp: number;
};

type Track = {
  id: string;
  trackName: string;
  date: string;
  track: UserPosition[];
  distance: number;
  travelTime: number;
  elapsedTime: number;
  photos: Photo[];
};

export default function ZapisaneTrasy()  {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTracks = async () => {
      const db = await openDB("TravelDB", 2);
      const allTracks = await db.getAll("tracks");
      setTracks(allTracks as Track[]);
      setLoading(false);
    };
    loadTracks();
  }, []);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Zapisane trasy</h1>
      {loading && <p>⏳ Ładowanie...</p>}
      {!loading && tracks.length === 0 && <p>Brak zapisanych tras.</p>}
      <ul className="space-y-4">
        {tracks.map((track) => (
          <li key={track.id} className="border rounded p-4 shadow bg-white">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{track.trackName || "Bez nazwy"}</div>
                <div className="text-sm text-gray-500">{new Date(track.date).toLocaleString()}</div>
                <div className="text-sm mt-1">
                  Dystans: <b>{(track.distance / 1000).toFixed(2)} km</b> | Czas podróży: <b>{Math.floor(track.travelTime/60)} min</b>
                </div>
                <div className="text-sm">
                  Zdjęcia: <b>{track.photos.length}</b>
                </div>
              </div>
             
              <Link href={`/zapisane-trasy/${track.id}`}>Szczegóły</Link>
            </div>
          </li>
        ))}
      </ul>
      <Link href="/" className="inline-block mt-6 text-blue-600 hover:underline">
        ← Powrót do strony głównej
      </Link>
    </div>
  );
}
  
  


"use client";
import React from "react";
import { openDB } from "idb";
import type { UserPosition } from "@/components/map/types";

type Photo = {
  id: string;
  imageDataUrl: string;
  description: string;
  position: UserPosition;
  timestamp: number;
};

type SaveTrackButtonProps = {
  trackName: string;
  track: UserPosition[];
  distance: number;
  travelTime: number;
  elapsedTime: number;
  photos: Photo[];
  onReset: () => void;
};

export default function SaveTrackButton({
  trackName,
  track,
  distance,
  travelTime,
  elapsedTime,
  photos,
  onReset,
}: SaveTrackButtonProps) {
  const saveTrackToDB = async () => {
    if (!trackName.trim()) {
      alert("Podaj nazwę trasy przed zapisem.");
      return;
    }
    if (track.length === 0) {
      alert("Brak danych trasy do zapisania.");
      return;
    }

    const db = await openDB("TravelDB", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("tracks")) {
          const store = db.createObjectStore("tracks", { keyPath: "id" });
          store.createIndex("by-date", "date");
        }
      },
    });

    const trackData = {
      id: crypto.randomUUID(),
      trackName,
      date: new Date().toISOString(),
      track,
      distance,
      travelTime,
      elapsedTime,
      photos,
    };

    await db.put("tracks", trackData);
    alert("Trasa i zdjęcia zostały zapisane.");
    onReset();
  };

  return (
    <button
      onClick={saveTrackToDB}
      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      disabled={track.length === 0 || !trackName.trim()}
    >
      Zapisz trasę
    </button>
  );
}

"use client";
import { useEffect } from "react";
import { openDB } from "idb";

import type { TrackAutoSaver } from "@/components/map/types";

export default function TrackAutoSaver({
  track,
  photos,
  distance,
  travelTime,
  elapsedTime,
  trackName,
  isTracking,
}: TrackAutoSaver) {
  // 1. Zapisuj stan na bieżąco po każdej zmianie track i innych danych
  useEffect(() => {
    const saveTrack = async () => {
      if ((isTracking || track.length > 0) && track.length > 0) {
        const db = await openDB("TravelDB", 1);
        await db.put("tempTracks", {
          id: "ongoing",
          track,
          photos,
          distance,
          travelTime,
          elapsedTime,
          trackName,
          timestamp: Date.now(),
        });
      }
    };
    saveTrack();
  }, [track, photos, distance, travelTime, elapsedTime, trackName, isTracking]);

  // 2. Obsługa beforeunload tylko do pokazania komunikatu ostrzegawczego
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if ((isTracking || track.length > 0) && track.length > 0 && travelTime > 0) {
        e.preventDefault();
        e.returnValue = ""; // Standardowy komunikat ostrzegawczy
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [track, isTracking,travelTime]);

  return null;
}

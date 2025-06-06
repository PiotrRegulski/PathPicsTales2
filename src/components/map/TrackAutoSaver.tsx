"use client";
import { useEffect,useState } from "react";
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
  const [message, setMessage] = useState("");

  useEffect(() => {
    const saveTrack = async () => {
      if ((isTracking || track.length > 0) && track.length > 0 && travelTime > 0) {
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
        setMessage("TrackAutoSaver: zapisano trasę");
        console.log("TrackAutoSaver: zapisano trasę");
      } else {
        setMessage("TrackAutoSaver: brak danych do zapisu");
        console.log("TrackAutoSaver: brak danych do zapisu");
      }
    };
    saveTrack();
  }, [track, photos, distance, travelTime, elapsedTime, trackName, isTracking]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        backgroundColor: "#eee",
        padding: "8px",
        textAlign: "center",
        fontSize: "14px",
        zIndex: 9999,
      }}
    >
      {message}
    </div>
  );
}
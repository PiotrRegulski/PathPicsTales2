"use client";
import { useEffect, useState } from "react";
import { openDB } from "idb";

import type { TrackAutoSaver } from "@/components/map/types";

// Funkcja pomocnicza do otwierania bazy z migracją
async function getDB() {
  return openDB("TravelDB", 2, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("tempTracks")) {
        db.createObjectStore("tempTracks", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("tracks")) {
        const store = db.createObjectStore("tracks", { keyPath: "id" });
        store.createIndex("by-date", "date");
      }
    },
  });
}

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

  // Inicjalizacja bazy danych przy montowaniu komponentu
  useEffect(() => {
    getDB();
  }, []);

  // Zapis danych trasy do IndexedDB w czasie rzeczywistym
  useEffect(() => {
    const saveTrack = async () => {
      if (isTracking || travelTime > 0) {
        const db = await getDB();
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
        setMessage("Dane są zapisywane");
        console.log("TrackAutoSaver: zapisano trasę");
      } else {
        setMessage("");
      }
    };
    saveTrack();
  }, [track, photos, distance, travelTime, elapsedTime, trackName, isTracking]);

  // Ostrzeżenie przed zamknięciem lub odświeżeniem strony podczas śledzenia
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isTracking || travelTime > 0) {
        e.preventDefault();
        e.returnValue = ""; // Wywołuje domyślne ostrzeżenie przeglądarki
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isTracking, travelTime]);

  // Komunikat pojawia się tylko, gdy message nie jest pusty
  return message ? (
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
  ) : null;
}

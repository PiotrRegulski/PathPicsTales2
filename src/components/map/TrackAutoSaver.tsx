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
        try {
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
          setMessage("✅");
          console.log("TrackAutoSaver: zapisano trasę");
        } catch (error) {
          console.error("Błąd zapisu trasy do IndexedDB:", error);
          setMessage("Błąd zapisu danych");
        }
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
      className="
      fixed top-4 left-4 transform -translate-x-1/2
      bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg"
    >
      {message}
    </div>
  ) : null;
}

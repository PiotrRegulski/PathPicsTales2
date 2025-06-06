"use client";
import { useEffect, useState } from "react";
import { openDB } from "idb";
import Link from "next/link";

export default function ContinueTrackButton() {
  const [hasOngoing, setHasOngoing] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkOngoing() {
      try {
        const db = await openDB("TravelDB", 1);
        const ongoing = await db.get("tempTracks", "ongoing");
        setHasOngoing(!!ongoing);
      } catch (error) {
        console.error("Błąd podczas sprawdzania przerwanej trasy:", error);
        setHasOngoing(false);
      }
    }
    checkOngoing();
  }, []);

  if (hasOngoing === null) return null; // czekamy na wynik

  return (
    <Link href={hasOngoing ? "/trasa?resume=true" : "#"} legacyBehavior>
      <button
        disabled={!hasOngoing}
        className={`px-6 py-3 text-xl rounded-lg transition duration-300 ${
          hasOngoing
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-400 text-gray-700 cursor-not-allowed"
        }`}
      >
        Kontynuuj trasę
      </button>
    </Link>
  );
}

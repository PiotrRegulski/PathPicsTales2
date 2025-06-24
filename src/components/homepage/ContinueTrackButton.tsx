"use client";
import { useEffect, useState } from "react";

import Link from "next/link";
import { getDB } from "../map/Utilis";

export default function ContinueTrackButton() {
  const [hasOngoing, setHasOngoing] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkOngoing() {
      try {
        const db = await getDB();
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
    <Link href={hasOngoing ? "/trasa?resume=true" : "#"} >
      <button
        disabled={!hasOngoing}
        className={`px-6 py-3 text-xl rounded-lg transition duration-300  w-48 ${
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

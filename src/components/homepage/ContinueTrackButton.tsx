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

  if (hasOngoing === null) return null;
  if (!hasOngoing) return null;

  return (
    <Link href="/trasa?resume=true">
      <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300">
        Kontynuuj trasę
      </button>
    </Link>
  );
}

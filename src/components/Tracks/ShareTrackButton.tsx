"use client"
import React, { useState } from "react";
import type { Track } from "@/components/Tracks/types";

type ShareTrackButtonProps = {
  track: Track;
  onSuccess?: () => void;
};

export default function ShareTrackButton({ track, onSuccess }: ShareTrackButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/public-tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(track),
    
      });
      if (res.ok) {
        if (onSuccess) {
          onSuccess();
        }
      } else {
        console.log("Wysyłam trasę:", track);
        alert("Błąd podczas udostępniania trasy.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="bg-green-600 text-white px-4 py-2 rounded mt-4"
      onClick={handleShare}
      disabled={loading}
    >
      {loading ? "Udostępniam..." : "Udostępnij trasę"}
    </button>
  );
}

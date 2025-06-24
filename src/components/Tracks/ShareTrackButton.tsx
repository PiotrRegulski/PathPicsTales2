"use client";
import React, { useState } from "react";
import type { Track, Photo } from "@/components/Tracks/types";

// Funkcja pomocnicza uploadująca jedno zdjęcie do Vercel Blob
async function uploadPhotoToBlob(photo: Photo): Promise<string> {
  const formData = new FormData();
  formData.append("file", photo.blob, `${photo.id}.jpg`);
  // Twój endpoint do uploadu zdjęcia
  const res = await fetch("/api/upload-photo", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Błąd uploadu zdjęcia");
  const { url } = await res.json();
  return url;
}

type ShareTrackButtonProps = {
  track: Track;
  onSuccess?: () => void;
};

export default function ShareTrackButton({ track, onSuccess }: ShareTrackButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      // 1. Najpierw upload zdjęć do Vercel Blob
      const photosWithUrls = await Promise.all(
        track.photos.map(async (photo) => {
          // Jeśli zdjęcie już ma url (np. z poprzedniego uploadu), pomiń upload
          if ("url" in photo && photo.url) return photo;
          const url = await uploadPhotoToBlob(photo);
          return {
            ...photo,
            url,
           
          };
        })
      );

      // 2. Przygotuj track bez blobów, tylko z urlami
      const trackToSend = {
        ...track,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        photos: photosWithUrls.map(({ blob, ...rest }) => rest),
      };

      // 3. Wyślij trasę do API
      const res = await fetch("/api/public-tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trackToSend),
      });

      if (res.ok) {
        if (onSuccess) onSuccess();
      } else {
        alert("Błąd podczas udostępniania trasy.");
      }
    } catch (e) {
      alert("Błąd podczas uploadu zdjęć lub trasy.");
      console.error(e);
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

"use client";
import React, { useState } from "react";
import type { Track, Photo } from "@/components/Tracks/types";
import imageCompression from "browser-image-compression";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Funkcja kompresująca Blob i zwracająca File
async function compressImage(blob: Blob, fileName: string): Promise<File> {
  const options = {
    maxSizeMB: 5,           // maksymalny rozmiar po kompresji
    maxWidthOrHeight: 1920, // maksymalna szerokość lub wysokość
    useWebWorker: true, // użycie Web Worker do kompresji
    initialQuality: 0.9, // początkowa jakość kompresji
  };
  // Convert Blob to File before compression
  const file = new File([blob], fileName, { type: blob.type, lastModified: Date.now() });
  const compressedBlob = await imageCompression(file, options);

  // Konwersja Blob na File (dodanie nazwy i lastModified)
  const compressedFile = new File([compressedBlob], fileName, {
    type: compressedBlob.type,
    lastModified: Date.now(),
  });

  return compressedFile;
}

// Funkcja uploadująca jedno zdjęcie do Vercel Blob
async function uploadPhotoToBlob(photo: Photo): Promise<string> {
  const formData = new FormData();
  formData.append("file", photo.blob, `${photo.id}.jpg`);
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
      const photosToUpload: Photo[] = [];

      for (const photo of track.photos) {
        if (photo.blob.size > MAX_FILE_SIZE) {
          const confirmCompress = window.confirm(
            `Zdjęcie o ID ${photo.id} jest za duże (${(photo.blob.size / 1024 / 1024).toFixed(2)} MB).\n` +
            `Czy chcesz je skompresować przed wysłaniem? Kliknij OK, aby skompresować, lub Anuluj, aby przerwać upload.`
          );
          if (!confirmCompress) {
            alert("Upload przerwany przez użytkownika.");
            setLoading(false);
            return;
          }

          // Kompresja i konwersja Blob -> File
          const compressedFile = await compressImage(photo.blob, `${photo.id}.jpg`);
          photosToUpload.push({ ...photo, blob: compressedFile });
        } else {
          photosToUpload.push(photo);
        }
      }

      // Upload zdjęć (oryginalnych lub skompresowanych)
      const photosWithUrls = await Promise.all(
        photosToUpload.map(async (photo) => {
          if ("url" in photo && photo.url) return photo;
          const url = await uploadPhotoToBlob(photo);
          return {
            ...photo,
            url,
          };
        })
      );

      // Przygotuj track bez blobów, tylko z urlami
      const trackToSend = {
        ...track,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        photos: photosWithUrls.map(({ blob, ...rest }) => rest),
      };

      console.log("Track to send:", trackToSend);

      // Wyślij trasę do API
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

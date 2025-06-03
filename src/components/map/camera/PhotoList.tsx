"use client";
import React from "react";
import Image from "next/image";
type Photo = {
  id: string;
  imageDataUrl: string;
  description: string;
  timestamp: number;
};

type PhotoListProps = {
  photos: Photo[];
};

export default function PhotoList({ photos }: PhotoListProps) {
  if (photos.length === 0) return null;

  return (
    <div className="photo-list mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
      {photos.map(({ id, imageDataUrl, description, timestamp }) => (
        <div key={id} className="border rounded p-2 shadow">
          <Image
            src={imageDataUrl}
            alt="Zdjęcie z trasy"
            width={300} // ustaw odpowiednią szerokość
            height={200} // ustaw odpowiednią wysokość lub proporcje
            className="rounded"
            unoptimized={true} // jeśli src to data URL lub zewnętrzny URL bez konfiguracji next.config.js
          />
          <p className="mt-2 text-sm">{description || "Brak opisu"}</p>
          <small className="text-gray-500">
            {new Date(timestamp).toLocaleString()}
          </small>
        </div>
      ))}
    </div>
  );
}

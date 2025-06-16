"use client";
import React from "react";
import Image from "next/image";
import type { Photo } from "@/components/map/types";

type PhotoListProps = {
  photos: Photo[];
};

export default function PhotoList({ photos }: PhotoListProps) {
  if (photos.length === 0) return null;

  return (
    <div className="photo-list mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
      {photos.map(({ id, imageDataUrl, description, timestamp,position }) => (
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
            {position && (
            <small className="text-gray-400 block">
              Pozycja: {position.lat.toFixed(5)}, {position.lon.toFixed(5)}
            </small>
          )}
        </div>
      ))}
    </div>
  );
}

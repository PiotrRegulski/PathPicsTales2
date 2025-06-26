"use client";
import Image from "next/image";
import React from "react";

type Photo = {
  id: string;
  url?: string; // URL z Vercel Blob
  description?: string;
  timestamp?: number;
  position?: { lat: number; lon: number };
};

type PhotoImageProps = {
  photo: Photo;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
};

export default function PhotoImage({
  photo,
  alt = "Zdjęcie z trasy",
  width = 600,
  height = 400,
  className = "",
}: PhotoImageProps) {
  if (photo.url) {
    return (
      <Image
        src={photo.url}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={{ objectFit: "cover" }}
        loading="lazy"
        unoptimized // <- WAŻNE dla zewnętrznych URL-i (np. Vercel Blob)
      />
    );
  }
  // Jeśli nie ma url, pokaż placeholder
  return (
    <div className="bg-gray-200 w-full h-full flex items-center justify-center text-gray-500">
      brak zdjęcia (brak url)
    </div>
  );
}

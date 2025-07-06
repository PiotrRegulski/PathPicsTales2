import Image from "next/image";
import React, { useMemo } from "react";

type Photo = {
  id: string;
  url?: string;
  blob?: Blob;
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
  // Tworzymy URL z blob tylko jeśli photo.url nie istnieje
  const objectUrl = useMemo(() => {
    if (!photo.url && photo.blob) {
      return URL.createObjectURL(photo.blob);
    }
    return null;
  }, [photo.url, photo.blob]);

  // Zwolnij URL obiektu po odmontowaniu komponentu
  React.useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  if (photo.url || objectUrl) {
    return (
      <Image
        src={photo.url || objectUrl!}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={{ objectFit: "cover" }}
        loading="lazy"
        unoptimized
      />
    );
  }

  // Jeśli brak url i blob, pokaż placeholder
  return (
    <div className="bg-gray-200 w-full h-full flex items-center justify-center text-gray-500">
      brak zdjęcia (brak url i blob)
    </div>
  );
}

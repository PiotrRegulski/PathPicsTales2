"use Client"
import { useEffect, useState } from "react";
import Image from "next/image";

type PhotoBlobImageProps = {
  blob: Blob;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
};

export default function PhotoBlobToImage({
  blob,
  alt = "Zdjęcie z trasy",
  width = 400,
  height = 400,
  className = "",
}: PhotoBlobImageProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    setObjectUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [blob]);

  if (!objectUrl) return null;

  return (
    <Image
      src={objectUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      unoptimized={true} // ważne dla tymczasowych URL!
    />
  );
}

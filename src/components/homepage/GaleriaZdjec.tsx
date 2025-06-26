"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface ImageData {
  url: string;
  name: string;
}

export default function GaleriaZdjec() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function pobierzZdjecia() {
      try {
        const res = await fetch("/api/photos"); // UWAGA: poprawny endpoint!
        if (res.ok) {
          const data: ImageData[] = await res.json();
          setImages(data);
        } else {
          setError("Błąd pobierania zdjęć (status " + res.status + ")");
        }
      } catch (e) {
        setError("Błąd sieci: " + (e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    pobierzZdjecia();
  }, []);

  if (loading) return <div>Ładowanie zdjęć...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (images.length === 0) return <div>Brak zdjęć do wyświetlenia.</div>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
      {images.map((img) =>
        img.url ? (
          <Image
            key={img.name}
            src={img.url}
            alt={img.name}
            width={300}
            height={200}
            style={{ objectFit: "cover", width: "100%", height: "auto" }}
          />
        ) : null
      )}
    </div>
  );
}

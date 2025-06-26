"use client";
import Image from "next/image";
import type { Photo } from "@/components/map/types";

type TravelBlogArticleProps = {
  trackName: string;
  travelTime: number;
  distance: number;
  photos: Photo[];
};

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h > 0 ? `${h}h ` : ""}${m}min`;
};

export default function TravelBlogArticle({
  trackName,
  travelTime,
  distance,
  photos,
}: TravelBlogArticleProps) {
  // Filtruj tylko zdjęcia z URL (Vercel Blob)
  const photosWithUrl = photos.filter((p) => !!p.url);

  if (!photosWithUrl.length) {
    return (
      <div className="flex justify-center items-center w-full">
        <article className="mx-auto my-8 px-4 max-w-2xl">
          <h1 className="text-3xl font-bold mb-4 text-black">{trackName}</h1>
          <p className="mb-6 text-lg">
            Tę trasę pokonałeś w czasie <b>{formatTime(travelTime)}</b> na dystansie <b>{(distance / 1000).toFixed(2)} km</b>.
          </p>
          <p>Brak zdjęć z tej trasy. Dodaj zdjęcia, by stworzyć opowieść!</p>
        </article>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center w-full">
      <article className="mx-auto my-8 px-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-4 text-black">{trackName}</h1>
        <p className="mb-6 text-lg">
          Wyruszyłeś w trasę o długości <b>{(distance / 1000).toFixed(2)} km</b>, która zajęła Ci <b>{formatTime(travelTime)}</b>.
          Oto najciekawsze momenty uchwycone na zdjęciach:
        </p>
        {photosWithUrl.map((photo, idx) => (
          <section key={photo.id} className="my-10">
            <div className="relative w-full max-w-2xl mx-auto aspect-video rounded-lg overflow-hidden shadow-md">
              <Image
                src={photo.url!}
                alt={photo.description || `Zdjęcie z trasy #${idx + 1}`}
                width={600}
                height={400}
                className="rounded object-cover w-full h-full"
                style={{ objectFit: "cover" }}
                loading="lazy"
                unoptimized // jeśli nie masz domeny blobów w next.config.js
              />
            </div>
            <p className="mt-4 text-lg leading-relaxed">
              <span className="font-semibold">Moment #{idx + 1}:</span>{" "}
              {photo.description && photo.description.trim() !== ""
                ? photo.description
                : "To zdjęcie nie ma opisu, ale na pewno kryje się za nim ciekawa historia!"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {photo.timestamp
                ? new Date(photo.timestamp).toLocaleString()
                : "brak daty"}{" "}
              | Pozycja:{" "}
              {photo.position
                ? `${photo.position.lat.toFixed(5)}, ${photo.position.lon.toFixed(5)}`
                : "brak pozycji"}
            </p>
          </section>
        ))}
        <p className="font-semibold mt-8">
          W sumie zrobiłeś {photosWithUrl.length} zdjęć. Dzięki nim możesz wracać do tej przygody kiedy tylko chcesz!
        </p>
      </article>
    </div>
  );
}

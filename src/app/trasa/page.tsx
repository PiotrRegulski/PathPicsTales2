"use client";

import dynamic from "next/dynamic";
import React from "react";

const MapComponent = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
  loading: () => <p>Ładowanie mapy...</p>,
});

type MapPageProps = {
  searchParams?: URLSearchParams;
};

export default function MapPage({ searchParams }: MapPageProps) {
  // Pobieramy parametr 'resume' z URL
  const resumeParam = searchParams?.get("resume");
  const resume = resumeParam === "true";

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-2xl font-bold mb-4">PathPicsTales</h1>
      <MapComponent resume={resume} />
    </div>
  );
}

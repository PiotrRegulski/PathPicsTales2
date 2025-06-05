"use client";

import dynamic from "next/dynamic";
import React from "react";

// Typ propsów dla MapComponent
type MapComponentProps = {
  resume?: boolean;
};

// Dynamiczny import MapComponent, wyłączamy SSR
const MapComponent = dynamic(
  () => import("@/components/map/MapComponent"),
  { ssr: false, loading: () => <p>Ładowanie mapy...</p> }
);

// Typ dla searchParams zgodny z Next.js App Router
type SearchParams = Record<string, string | string[] | undefined>;

type MapPageProps = {
  searchParams: SearchParams;
};

export default function MapPage({ searchParams }: MapPageProps) {
  const resumeParam = searchParams.resume;

  // Konwersja parametru resume na boolean
  const resume =
    typeof resumeParam === "string"
      ? resumeParam === "true"
      : Array.isArray(resumeParam)
      ? resumeParam.includes("true")
      : false;

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-2xl font-bold mb-4">PathPicsTales</h1>
      <MapComponent resume={resume} />
    </div>
  );
}

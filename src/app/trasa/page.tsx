"use client";

import dynamic from "next/dynamic";

// Dynamiczny import bez generyków i bez typów propsów tutaj
const MapComponent = dynamic(
  () => import("@/components/map/MapComponent"),
  { ssr: false }
);

// Typowanie searchParams zgodne z Next.js
type SearchParams = Record<string, string | string[] | undefined>;

type MapPageProps = {
  searchParams: SearchParams;
};

export default function MapPage({ searchParams }: MapPageProps) {
  const resumeParam = searchParams.resume;

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

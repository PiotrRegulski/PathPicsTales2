"use client";

import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
  loading: () => <p>Ładowanie mapy...</p>,
});

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

type MapPageProps = {
  searchParams?: SearchParams;
};

export default function MapPage({ searchParams }: MapPageProps) {
  const resumeParam = searchParams?.resume;

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

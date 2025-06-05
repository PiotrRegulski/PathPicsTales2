"use client";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/map/MapComponent"), { ssr: false });

export default function MapPage({ searchParams }: { searchParams: { resume?: string } }) {
  const resume = searchParams?.resume === "true";
  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-2xl font-bold">PathPicsTales</h1>
      <MapComponent resume={resume} />
    </div>
  );
}

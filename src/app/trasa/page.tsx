"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
  loading: () => <p>Ładowanie mapy...</p>,
});

export default function MapPage() {
  const [resume, setResume] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setResume(params.get("resume") === "true");
  }, []);

  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold py-1">PathPicsTales</h1>
      <MapComponent resume={resume} />
    </div>
  );
}

"use client";

import { useMap } from "react-leaflet";
import { Photo } from "@/components/Tracks/types"; // Adjust the import path as necessary
import { useEffect } from "react";
type MapBoundsAdjusterProps = {
  markers: Photo[];
};
const MapBoundsAdjuster: React.FC<MapBoundsAdjusterProps> = ({ markers }) => {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) return;
   const bounds: [number, number][] = markers.map(m => [m.position.lat, m.position.lon]);
  map.fitBounds(bounds);
  }, [markers, map]);

  return null;
};
export default MapBoundsAdjuster;
"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface MapUpdaterProps {
  position: [number, number];
}

const MapUpdater = ({ position }: MapUpdaterProps) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position);
    }
  }, [position, map]);

  return null;
};

export default MapUpdater;

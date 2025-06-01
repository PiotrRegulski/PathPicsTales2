"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface MapUpdaterProps {
  position: [number, number];
  autoCenter: boolean;
}

const MapUpdater = ({ position, autoCenter }: MapUpdaterProps) => {
  const map = useMap();

  useEffect(() => {
    if (autoCenter) {
      map.setView(position);
    }
  }, [position, autoCenter, map]);

  return null;
};

export default MapUpdater;

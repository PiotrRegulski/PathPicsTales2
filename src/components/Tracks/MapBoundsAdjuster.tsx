"use client";
import { useMap } from "react-leaflet";
import { useEffect } from "react";
import type { Photo } from "@/components/Tracks/types";

type MapBoundsAdjusterProps = {
  markers: Photo[];
  defaultZoom?: number;
};

const MapBoundsAdjuster: React.FC<MapBoundsAdjusterProps> = ({ markers, defaultZoom = 13 }) => {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) return;

    if (markers.length === 1) {
      // Jeden marker – ustaw widok na ten punkt
      map.setView([markers[0].position.lat, markers[0].position.lon], defaultZoom);
    } else {
      // Dwa lub więcej markerów – dopasuj widok do wszystkich
      const bounds: [number, number][] = markers.map(m => [m.position.lat, m.position.lon]);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [markers, map, defaultZoom]);

  return null;
};

export default MapBoundsAdjuster;

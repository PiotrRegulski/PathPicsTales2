'use client';

import { useMap } from "react-leaflet";
import { useEffect } from "react";
import type { Photo } from "@/components/Tracks/types"; // Dostosuj ścieżkę importu do swojego projektu

type MapBoundsAdjusterProps = {
  markers: Photo[];
  singleZoom?: number;
};

const MapBoundsAdjuster: React.FC<MapBoundsAdjusterProps> = ({
  markers,
  singleZoom = 13,
}) => {
  const map = useMap();

  useEffect(() => {
    if (!markers || markers.length === 0) return;

    if (markers.length === 1) {
      map.setView(
        [markers[0].position.lat, markers[0].position.lon],
        singleZoom
      );
    } else {
      const bounds: [number, number][] = markers.map((m) => [
        m.position.lat,
        m.position.lon,
      ]);
      map.fitBounds(bounds, { padding: [40, 40] }); // padding poprawia widoczność markerów przy krawędziach
    }
  }, [markers, map, singleZoom]);

  return null;
};

export default MapBoundsAdjuster;

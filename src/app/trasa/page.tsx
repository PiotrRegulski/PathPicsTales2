import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/map/MapComponent"), { ssr: false });

export default function MapPage() {
  const defaultPosition = { lat: 51.9194, lon: 19.1451 };

  return (
    <div className="flex flex-col items-center w-full h-screen">
      <h1 className="text-2xl font-bold">📍 Mapa</h1>
      <MapComponent lat={defaultPosition.lat} lon={defaultPosition.lon} />
    </div>
  );
}

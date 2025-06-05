"use client";
import dynamic from "next/dynamic";

// Jeśli używasz TypeScript, zadeklaruj typ propsów MapComponent
type MapComponentProps = {
  resume?: boolean;
};

const MapComponent = dynamic<MapComponentProps>(
  () => import("@/components/map/MapComponent"),
  { ssr: false }
);

// UWAGA: W App Routerze Next.js 14+ (i 15) możesz jawnie zadeklarować propsy strony:
export default function MapPage(props: { searchParams: { resume?: string } }) {
  const resume = props.searchParams?.resume === "true";
  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-2xl font-bold">PathPicsTales</h1>
      <MapComponent resume={resume} />
    </div>
  );
}

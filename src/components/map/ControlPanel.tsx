import TrackExporter from "./TrackExporter";

interface ControlPanelProps {
  isTracking: boolean;
  onStartPause: () => void;
  onReset: () => void;
  autoCenter: boolean;
  setAutoCenter: (val: boolean) => void;
  track: { lat: number; lon: number }[];
  distance: number;
  travelTime: number;
}

export default function ControlPanel({
  isTracking,
  onStartPause,
  onReset,
  autoCenter,
  setAutoCenter,
  track,
  distance,
  travelTime,
}: ControlPanelProps) {
  return (
    <div className="flex justify-center gap-4 my-4 flex-wrap">
      <button
        onClick={onStartPause}
        className={`px-4 py-2 rounded text-white ${
          isTracking
            ? "bg-yellow-500 hover:bg-yellow-600"
            : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {isTracking ? "Pauza" : "Start"}
      </button>
      <button
        onClick={onReset}
        className="px-4 py-2 bg-red-500 rounded text-white hover:bg-red-600"
      >
        Reset
      </button>
      <button
        onClick={() => setAutoCenter(!autoCenter)}
        className="px-4 py-2 bg-blue-500 rounded text-white hover:bg-blue-600"
      >
        {autoCenter ? "Wyłącz śledzenie mapy" : "Włącz śledzenie mapy"}
      </button>
      <TrackExporter track={track} distance={distance} travelTime={travelTime} />
    </div>
  );
}

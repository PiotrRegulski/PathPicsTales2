

interface ControlPanelProps {
  isTracking: boolean;
  onStartPause: () => void;
  onReset: () => void;
  autoCenter: boolean;
  setAutoCenter: (val: boolean) => void;
  track: { lat: number; lon: number }[];
  distance: number;
  travelTime: number;
  elapsedTime: number;
    trackName: string;
}

export default function ControlPanel({
  isTracking,
  onStartPause,
  onReset,
  autoCenter,
  setAutoCenter,
  trackName
}: ControlPanelProps) {
  return (
    <div className="flex justify-center gap-3 my-4 flex-wrap">
      <button
        onClick={onStartPause}
        disabled={!trackName.trim()}
        className={`px-4 py-2 rounded text-white ${
          isTracking
            ? "bg-yellow-500 hover:bg-yellow-600"
            : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {isTracking ? "Pauza" : "Start"}
      </button>
      <button
        onClick={() => {
          if (
            window.confirm(
              "Czy na pewno chcesz zresetować trasę? Wszystkie dane zostaną utracone."
            )
          ) {
            onReset();
          }
        }}
        className="px-4 py-2 bg-red-500 rounded text-white hover:bg-red-600"
      >
        Reset
      </button>
      <button
        onClick={() => setAutoCenter(!autoCenter)}
        className="px-4 py-2 bg-blue-500 rounded text-white hover:bg-blue-600"
      >
        {autoCenter ? "Wyłącz centrowanie" : "Włącz centrowanie"}
      </button>
    
    </div>
  );
}

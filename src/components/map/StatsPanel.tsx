import { formatTime } from "@/components/map/Utilis";

interface StatsPanelProps {
  speed: number;
  distance: number;
  travelTime: number;
  elapsedTime:number;
}

export default function StatsPanel({ speed, distance, travelTime, elapsedTime }: StatsPanelProps) {
  return (
    <div className="grid grid-cols-2  justify-items-center gap-4 bg-white/70 rounded-lg shadow-md max-w-4xl mx-auto py-2 px-2 ">
      <div className="flex flex-col items-center justify-center bg-lime-100 p-4  shadow-sm w-36 rounded-full">
        <p className="text-lg font-semibold text-lime-800">🚗 Prędkość</p>
        <p className="text-xl font-bold text-lime-900">
          {speed.toFixed(0)} km/h
        </p>
      </div>
      <div className="flex flex-col items-center justify-center bg-blue-100 p-4  shadow-sm w-36 rounded-full">
        <p className="text-lg font-semibold text-blue-800">🛣️ Odległość</p>
        <p className="text-xl font-bold text-blue-900">
          {(distance / 1000).toFixed(1)} km
        </p>
      </div>
      <div className="flex flex-col items-center bg-yellow-100 p-2 rounded-lg shadow-sm w-40  ">
        <p className="text-lg font-semibold text-yellow-800">⏱️Czas podróży </p>
        <p className="text-xl font-bold text-yellow-900">
          {formatTime(travelTime)}
        </p>
      </div>
       <div className="flex flex-col items-center bg-yellow-100 p-2 rounded-lg shadow-sm w-40 ">
        <p className="text-lg font-semibold text-yellow-800">⏱️Czas w ruchu </p>
       <p className="text-xl font-bold text-gray-900">{formatTime(elapsedTime)}</p>
      </div>
    </div>
  );
}
 
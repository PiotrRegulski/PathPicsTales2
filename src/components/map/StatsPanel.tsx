import { formatTime } from "@/components/map/Utilis";

interface StatsPanelProps {
  speed: number;
  distance: number;
  travelTime: number;
  elapsedTime:number;
}

export default function StatsPanel({ speed, distance, travelTime, elapsedTime }: StatsPanelProps) {
  return (
    <div className="grid grid-cols-2 gap-4 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <div className="flex flex-col items-center bg-lime-100 p-4 rounded-lg shadow-sm w-48">
        <p className="text-lg font-semibold text-lime-800">🚗 Prędkość</p>
        <p className="text-2xl font-bold text-lime-900">
          {speed.toFixed(2)} km/h
        </p>
      </div>
      <div className="flex flex-col items-center bg-blue-100 p-4 rounded-lg shadow-sm w-48">
        <p className="text-lg font-semibold text-blue-800">🛣️ Odległość</p>
        <p className="text-2xl font-bold text-blue-900">
          {(distance / 1000).toFixed(2)} km
        </p>
      </div>
      <div className="flex flex-col items-center bg-yellow-100 p-2 rounded-lg shadow-sm w-48  ">
        <p className="text-lg font-semibold text-yellow-800">⏱️Czas podróży </p>
        <p className="text-2xl font-bold text-yellow-900">
          {formatTime(travelTime)}
        </p>
      </div>
       <div className="flex flex-col items-center bg-yellow-100 p-2 rounded-lg shadow-sm w-48 ">
        <p className="text-lg font-semibold text-yellow-800">⏱️Czas w ruchu </p>
       <p className="text-2xl font-bold text-gray-900">{formatTime(elapsedTime)}</p>
      </div>
    </div>
  );
}
 
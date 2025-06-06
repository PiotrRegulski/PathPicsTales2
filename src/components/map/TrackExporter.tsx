// TrackExporter.tsx zapisywanie trasy do pliku CSV

type UserPosition = {
  lat: number;
  lon: number;
};

type TrackExporterProps = {
  track: UserPosition[];
  distance: number;
  travelTime: number;
  elapsedTime: number;
  trackName: string;
};

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

const TrackExporter = ({ track, distance, travelTime,elapsedTime,trackName }: TrackExporterProps) => {
  const exportTrackToCSV = () => {
    const header = "lat,lon\n";
    const trackRows = track.map(p => `${p.lat},${p.lon}`).join("\n");
    const summary = `\n\nNazwa Trasy:,${trackName}\n\nDystans (km):,${(distance / 1000).toFixed(2)}\nCzas:,${formatTime(travelTime)}\nCzas podróży:,${formatTime(elapsedTime)}`;
    const csv = header + trackRows + summary;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${trackName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={exportTrackToCSV}
      className="px-4 py-2 bg-gray-500 rounded text-white hover:bg-gray-600"
      disabled={track.length === 0}
      title="Zapisz trasę do pliku CSV"
    >
      Zapisz trasę
    </button>
  );
};

export default TrackExporter;

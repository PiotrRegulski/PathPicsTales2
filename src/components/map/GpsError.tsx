interface GpsErrorProps {
  error: string | null;
}

export default function GpsError({ error }: GpsErrorProps) {
  if (!error) return null;
  return (
    <p className="text-center text-red-600 font-semibold">{error}</p>
  );
}

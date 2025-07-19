import React from "react";

type GpsAccuracyDisplayProps = {
  accuracy: number | null;
};

const GpsAccuracyDisplay: React.FC<GpsAccuracyDisplayProps> = ({ accuracy }) => {
  if (accuracy === null) return null;

  return (
    <div className="text-sm text-gray-600">
      Dokładność GPS: {Math.round(accuracy)} m
    </div>
  );
};

export default GpsAccuracyDisplay;

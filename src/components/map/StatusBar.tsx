import React from "react";

type StatusBarProps = {
  isGpsSignalGood: boolean;
  isMapMatchingActive: boolean;
};

const StatusBar: React.FC<StatusBarProps> = ({
  isGpsSignalGood,
  isMapMatchingActive,
}) => {
  return (
    <div className="status-bar p-2 bg-gray-100 rounded-md flex gap-4 text-sm font-medium my-2">
      <span>
        Sygnał GPS:{" "}
        {isGpsSignalGood ? (
          <span className="text-green-600">dobry ✅</span>
        ) : (
          <span className="text-red-600">słaby ⚠️</span>
        )}
      </span>
      <span>
        Map matching:{" "}
        {isMapMatchingActive ? (
          <span className="text-blue-600">działa 🔄</span>
        ) : (
          <span className="text-gray-500">bez aktywności</span>
        )}
      </span>
    </div>
  );
};

export default StatusBar;

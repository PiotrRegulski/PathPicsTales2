import React from "react";

type TrackNameModalProps = {
  isOpen: boolean;
  trackName: string;
  setTrackName: (name: string) => void;
  onStart: () => void;
};

const TrackNameModal: React.FC<TrackNameModalProps> = ({
  isOpen,
  trackName,
  setTrackName,
  onStart,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/25 bg-opacity-40 w-full ">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md relative w-11/12">
        <label
          htmlFor="trackNameInput"
          className="block text-lg font-semibold text-gray-700 mb-2 text-center"
        >
          Podaj nazwę trasy, a następnie kliknij <span className="text-blue-600 font-bold">Start</span>
        </label>
        <input
          id="trackNameInput"
          type="text"
          value={trackName}
          onChange={e => setTrackName(e.target.value)}
          placeholder="Np. Poranny spacer po parku"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400 text-base"
          autoComplete="off"
          maxLength={64}
        />
        <button
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          onClick={onStart}
          disabled={!trackName.trim()}
        >
          Start
        </button>
      </div>
    </div>
  );
};


export default TrackNameModal;

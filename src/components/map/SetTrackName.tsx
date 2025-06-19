"use client";
import React from "react";

type SetTrackNameProps = {
  trackName: string;
  setTrackName: (name: string) => void;
  disabled?: boolean;
};

const SetTrackName = ({
  trackName,
  setTrackName,
  disabled,
}: SetTrackNameProps) => (
  <div className="w-full max-w-md mx-auto mb-6">
    <label
      htmlFor="trackNameInput"
      className="block text-lg font-semibold text-gray-700 mb-2 text-center"
    >
      Nazwij swoją trasę i kliknij <span className="text-blue-600 font-bold">Start</span>, aby rozpocząć śledzenie
    </label>
    <input
      id="trackNameInput"
      type="text"
      value={trackName}
      onChange={e => setTrackName(e.target.value)}
      placeholder="Np. Poranny spacer po parku"
      className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400 text-base text-center"
      disabled={disabled}
      autoComplete="off"
      maxLength={64}
    />
  </div>
);

export default SetTrackName;

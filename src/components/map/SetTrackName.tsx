// TrackNameInput.tsx
import React from "react";

type SetTrackNameProps = {
  trackName: string;
  setTrackName: (name: string) => void;
  disabled?: boolean;
};

const SetTrackName = ({ trackName, setTrackName, disabled }: SetTrackNameProps) => (
  <input
    type="text"
    value={trackName}
    onChange={e => setTrackName(e.target.value)}
    placeholder="Nazwa trasy"
    className="px-2 py-1 rounded border mx-2"
    disabled={disabled}
  />
);

export default SetTrackName;

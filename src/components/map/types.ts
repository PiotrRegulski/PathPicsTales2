// types.ts
export type UserPosition = {
  lat: number;
  lon: number;
};

export type Photo = {
  id: string;
  imageDataUrl: string;
  description: string;
  position: UserPosition;
  timestamp: number;
};

export type TrackAutoSaver = {
  track: UserPosition[];
  photos: Photo[];
  distance: number;
  travelTime: number;
  elapsedTime: number;
  trackName: string;
  isTracking: boolean;
};

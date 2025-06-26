// types.ts
export type UserPosition = {
  lat: number;
  lon: number;
};

export type Photo = {
  url?: string; // URL z Vercel Blob
  id: string;
  blob: Blob;
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

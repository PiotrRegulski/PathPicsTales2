"use client";
import { useEffect, useState } from "react";
import MapView from "./MapView";
import ControlPanel from "./ControlPanel";
import StatsPanel from "./StatsPanel";
import GpsError from "./GpsError";
import { getDistanceFromLatLonInMeters } from "./Utilis";

type UserPosition = {
  lat: number;
  lon: number;
};

const MIN_DISTANCE = 5;
const MIN_SPEED = 3;
const MAX_ACCURACY = 25;

const MapComponent = () => {
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [track, setTrack] = useState<UserPosition[]>([]);
  const [speed, setSpeed] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedTime, setPausedTime] = useState<number>(0);
  const [travelTime, setTravelTime] = useState<number>(0);
  const [autoCenter, setAutoCenter] = useState<boolean>(true);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0); // nowy czas od startu
  const [elapsedStart, setElapsedStart] = useState<number | null>(null); // znacznik czasu początku
  const [pausedElapsed, setPausedElapsed] = useState<number>(0);
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          setGpsError(error.message);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  useEffect(() => {
    if (!isTracking) return;
    let watchId: number;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setGpsError(null);
          if (position.coords.accuracy <= MAX_ACCURACY) {
            const newPosition = {
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            };
            const newSpeed =
              position.coords.speed != null ? position.coords.speed * 3.6 : 0;
            if (newSpeed >= MIN_SPEED) {
              setUserPosition((prevPosition) => {
                if (!prevPosition) return newPosition;
                const dist = getDistanceFromLatLonInMeters(
                  prevPosition.lat,
                  prevPosition.lon,
                  newPosition.lat,
                  newPosition.lon
                );
                if (dist < MIN_DISTANCE) {
                  return prevPosition;
                }
                return newPosition;
              });
              if (!startTime) {
                setStartTime(Date.now());
              }
              setSpeed(newSpeed);
              setTrack((prevTrack) => {
                if (prevTrack.length === 0) {
                  return [newPosition];
                }
                const lastPosition = prevTrack[prevTrack.length - 1];
                const dist = getDistanceFromLatLonInMeters(
                  lastPosition.lat,
                  lastPosition.lon,
                  newPosition.lat,
                  newPosition.lon
                );
                if (dist >= MIN_DISTANCE) {
                  setDistance((prevDistance) => prevDistance + dist);
                  return [...prevTrack, newPosition];
                }
                return prevTrack;
              });
            } else {
              setSpeed(0);
            }
          } else {
            setGpsError(
              `Pomijam pozycję o niskiej dokładności: ${Math.round(
                position.coords.accuracy
              )} m`
            );
          }
        },
        (error) => {
          setGpsError(error.message);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
    return () => {
      if (watchId && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isTracking, startTime]);
  useEffect(() => {
    if (!isTracking || !elapsedStart) return;

    const interval = setInterval(() => {
      setElapsedTime(
        pausedElapsed + Math.floor((Date.now() - elapsedStart) / 1000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isTracking, elapsedStart, pausedElapsed]);

  useEffect(() => {
    if (!isTracking || !startTime) return;
    const interval = setInterval(() => {
      setTravelTime(pausedTime + Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isTracking, startTime, pausedTime]);

 const handleStartPause = () => {
  if (isTracking) {
    setIsTracking(false);
    setSpeed(0);
    if (startTime) {
      setPausedTime(
        (prev) => prev + Math.floor((Date.now() - startTime) / 1000)
      );
      setStartTime(null);
    }
  } else {
    setIsTracking(true);
    if (!startTime) setStartTime(Date.now());
  }
};

  const handleReset = () => {
    setIsTracking(false);
    setTrack([]);
    setDistance(0);
    setSpeed(0);
    setTravelTime(0);
    setStartTime(null);
    setPausedTime(0);
    setElapsedTime(0);
    setElapsedStart(null);
    setPausedElapsed(0);
    setGpsError(null);
  };

  return (
    <div>
      {userPosition ? (
        <>
          <MapView
            userPosition={userPosition}
            track={track}
            autoCenter={autoCenter}
          />
          <ControlPanel
            isTracking={isTracking}
            onStartPause={handleStartPause}
            onReset={handleReset}
            autoCenter={autoCenter}
            setAutoCenter={setAutoCenter}
            track={track}
            distance={distance}
            travelTime={travelTime}
          />
          <StatsPanel
            speed={speed}
            distance={distance}
            travelTime={travelTime}
            elapsedTime={elapsedTime}
          />
          <GpsError error={gpsError} />
        </>
      ) : (
        <p className="text-center">⏳ Pobieranie Twojej lokalizacji...</p>
      )}
    </div>
  );
};

export default MapComponent;

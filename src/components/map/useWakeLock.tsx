import { useEffect, useRef } from "react";

const useWakeLock = (active: boolean) => {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Funkcja do zwolnienia wake locka
    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        } catch (error) {
          // Możesz obsłużyć błędy jeśli chcesz
          console.error("Failed to release wake lock:", error);
        }
      }
    };

    if ("wakeLock" in navigator && active) {
      navigator.wakeLock.request("screen").then((sentinel) => {
        if (isMounted) {
          wakeLockRef.current = sentinel;

          // Można podsłuchiwać event release (np. gdy device wyłącza lock)
          sentinel.addEventListener("release", () => {
            wakeLockRef.current = null;
            console.log("Wake Lock was released");
          });
        }
      }).catch((err) => {
        console.error("Wake Lock request failed:", err);
      });
    } else {
      // Jeśli active jest false, zwolnij lock jeśli jest
      releaseWakeLock();
    }

    return () => {
      isMounted = false;
      releaseWakeLock();
    };
  }, [active]);
};

export default useWakeLock;

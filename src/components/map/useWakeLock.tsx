import { useEffect, useRef } from "react";

const useWakeLock = (active: boolean) => {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    let isMounted = true;
    if ("wakeLock" in navigator && active) {
      navigator.wakeLock.request("screen").then((sentinel) => {
        if (isMounted) {
          wakeLockRef.current = sentinel;
        }
      });
    }
    return () => {
      isMounted = false;
      wakeLockRef.current?.release();
      wakeLockRef.current = null;
    };
  }, [active]);
};

export default useWakeLock;

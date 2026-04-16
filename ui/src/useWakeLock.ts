import { useEffect } from "react";

export function useWakeLock() {
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    async function requestWakeLock() {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
      } catch (e) {
        console.warn('Wake lock failed:', e);
      }
    }

    requestWakeLock();

    document.addEventListener('visibilitychange', requestWakeLock);

    return () => {
      wakeLock?.release();
      document.removeEventListener('visibilitychange', requestWakeLock);
    };
  }, []);
}
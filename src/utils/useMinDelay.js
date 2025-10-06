import { useEffect, useRef, useState } from "react";

// Ensures a loading indicator remains visible for at least minDurationMs
export default function useMinDelay(isActive, minDurationMs = 1000) {
  const [shouldShow, setShouldShow] = useState(isActive);
  const startTimeRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      // Loading started
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      startTimeRef.current = Date.now();
      setShouldShow(true);
      return;
    }

    // Loading ended; enforce minimum visible duration
    const startedAt = startTimeRef.current || Date.now();
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, minDurationMs - elapsed);
    if (remaining === 0) {
      setShouldShow(false);
    } else {
      timeoutRef.current = setTimeout(() => {
        setShouldShow(false);
        timeoutRef.current = null;
      }, remaining);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isActive, minDurationMs]);

  return shouldShow;
}



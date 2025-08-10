import React, { useEffect, useMemo, useRef, useState } from "react";
import Lottie from "lottie-react";

function LottieLoader({
  message,
  width = 160,
  height = 160,
  centered = true,
  minHeight,
  desiredDurationSec = 1.4,
  className = "",
  style = {},
  loop = true,
  fadeMs = 240,
}) {
  const [animationData, setAnimationData] = useState(null);
  const [speed, setSpeed] = useState(1);
  const lottieRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const path = `${process.env.PUBLIC_URL || ''}/assets/loaders/scms_loader.json`;
    fetch(path)
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        setAnimationData(json);
        // Compute original duration and speed multiplier to achieve desiredDurationSec
        const framesStart = Number(json.ip ?? 0);
        const framesEnd = Number(json.op ?? 0);
        const frameRate = Number(json.fr ?? 30);
        const originalDurationSec = frameRate > 0 ? (framesEnd - framesStart) / frameRate : 2;
        const computedSpeedRaw = originalDurationSec > 0 && desiredDurationSec > 0
          ? originalDurationSec / desiredDurationSec
          : 1;
        // Clamp to avoid zero speed
        const computedSpeed = Math.max(0.05, Math.min(4, computedSpeedRaw));
        setSpeed(computedSpeed);
      })
      .catch(() => {
        // Leave animationData null to avoid rendering errors
      });
    return () => {
      isMounted = false;
    };
  }, [desiredDurationSec]);

  // Apply speed to the player when available
  useEffect(() => {
    if (lottieRef.current && typeof lottieRef.current.setSpeed === 'function') {
      try {
        lottieRef.current.setSpeed(speed);
      } catch (_) {}
    }
  }, [speed, animationData]);

  const containerStyle = useMemo(() => {
    const base = centered
      ? { display: "flex", alignItems: "center", justifyContent: "center" }
      : {};
    return {
      padding: 12,
      ...(minHeight ? { minHeight } : {}),
      ...base,
      ...style,
      opacity: mounted ? 1 : 0,
      transition: `opacity ${fadeMs}ms ease-in-out`,
    };
  }, [centered, minHeight, style, mounted, fadeMs]);

  return (
    <div className={`d-flex flex-column align-items-center justify-content-center ${className}`} style={containerStyle}>
      {animationData && (
        <Lottie
          animationData={animationData}
          loop={loop}
          style={{ width, height }}
          lottieRef={lottieRef}
          rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
        />
      )}
      {message ? (
        <div className="mt-3 text-muted" style={{ textAlign: "center" }}>
          {message}
        </div>
      ) : null}
    </div>
  );
}

export default LottieLoader;



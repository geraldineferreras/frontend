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
    console.log('Loading Lottie animation from public directory');
    
    // Try multiple approaches to load the animation
    const loadAnimation = async () => {
      try {
        // Method 1: Try fetching from public directory
        const response = await fetch('/assets/loaders/scms_loader_lottie.json');
        if (response.ok) {
          const json = await response.json();
          console.log('Lottie animation loaded successfully from fetch');
          if (isMounted) {
            setAnimationData(json);
            // Compute original duration and speed multiplier to achieve desiredDurationSec
            const framesStart = Number(json.ip ?? 0);
            const framesEnd = Number(json.op ?? 0);
            const frameRate = Number(json.fr ?? 30);
            const originalDurationSec = frameRate > 0 ? (framesEnd - framesStart) / frameRate : 2;
            const computedSpeedRaw = originalDurationSec > 0 && desiredDurationSec > 0
              ? originalDurationSec / desiredDurationSec
              : 1;
            const computedSpeed = Math.max(0.05, Math.min(4, computedSpeedRaw));
            setSpeed(computedSpeed);
          }
          return;
        }
      } catch (error) {
        console.log('Fetch method failed, trying import method');
      }
      
      try {
        // Method 2: Try dynamic import
        const animationModule = await import('../assets/scms_loader_lottie.json');
        const json = animationModule.default;
        console.log('Lottie animation loaded successfully from dynamic import');
        if (isMounted) {
          setAnimationData(json);
          const framesStart = Number(json.ip ?? 0);
          const framesEnd = Number(json.op ?? 0);
          const frameRate = Number(json.fr ?? 30);
          const originalDurationSec = frameRate > 0 ? (framesEnd - framesStart) / frameRate : 2;
          const computedSpeedRaw = originalDurationSec > 0 && desiredDurationSec > 0
            ? originalDurationSec / desiredDurationSec
            : 1;
          const computedSpeed = Math.max(0.05, Math.min(4, computedSpeedRaw));
          setSpeed(computedSpeed);
        }
      } catch (error) {
        console.error('All loading methods failed:', error);
      }
    };
    
    loadAnimation();
    
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
      {animationData ? (
        <Lottie
          animationData={animationData}
          loop={loop}
          style={{ width, height }}
          lottieRef={lottieRef}
          rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
        />
      ) : (
        <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Fallback: Try GIF version first, then spinner */}
          <img 
            src="/assets/loaders/scms_loader.gif" 
            alt="Loading animation"
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain',
              display: 'block'
            }}
            onError={(e) => {
              // If GIF fails to load, show spinner
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #5e72e4',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            display: 'none'
          }}></div>
        </div>
      )}
      {message ? (
        <div className="mt-3 text-muted" style={{ textAlign: "center" }}>
          {message}
        </div>
      ) : null}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default LottieLoader;



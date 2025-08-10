import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import useMinDelay from "utils/useMinDelay";
import LottieLoader from "components/LottieLoader";

function GlobalRouteLoader({ minVisibleMs = 1600, fadeMs = 240 }) {
  const location = useLocation();
  const [active, setActive] = useState(true);
  const shouldShow = useMinDelay(active, minVisibleMs);

  // Trigger loader on every route change (including initial mount)
  useEffect(() => {
    setActive(true);
    // Immediately mark as done; useMinDelay will keep it visible for minVisibleMs
    const t = setTimeout(() => setActive(false), 0);
    return () => clearTimeout(t);
  }, [location.pathname, location.search, location.hash]);

  // Expose a flag on the body for smooth content fade-in
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-route-loading', shouldShow ? 'true' : 'false');
    }
  }, [shouldShow]);

  // Inline global CSS to fade page content when loader is active
  const globalStyle = useMemo(() => `
    body[data-route-loading="true"] .main-content { opacity: 0; }
    body[data-route-loading="false"] .main-content { opacity: 1; transition: opacity ${fadeMs}ms ease-in-out; }
  `, [fadeMs]);

  return (
    <>
      <style>{globalStyle}</style>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "#ffffff",
          zIndex: 20000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: shouldShow ? 1 : 0,
          transition: `opacity ${fadeMs}ms ease-in-out`,
          pointerEvents: shouldShow ? 'auto' : 'none',
        }}
        aria-label="Loading overlay"
      >
        <div className="global-loader-overlay">
          <LottieLoader message="Loading..." width={170} height={170} centered desiredDurationSec={1.4} />
        </div>
      </div>
    </>
  );
}

export default GlobalRouteLoader;



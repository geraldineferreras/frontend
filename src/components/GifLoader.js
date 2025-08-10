import React from "react";

function GifLoader({
  message,
  width = 120,
  height = 120,
  className = "",
  style = {},
  centered = true,
  minHeight,
}) {
  const src = `${process.env.PUBLIC_URL || ''}/assets/loaders/scms_loader.gif`;
  const containerStyle = centered
    ? { display: "flex", alignItems: "center", justifyContent: "center" }
    : {};

  return (
    <div
      className={`d-flex flex-column align-items-center justify-content-center ${className}`}
      style={{ padding: 12, ...(minHeight ? { minHeight } : {}), ...containerStyle, ...style }}
    >
      <img
        src={src}
        alt="Loading"
        width={width}
        height={height}
        style={{ display: "block" }}
      />
      {message ? (
        <div className="mt-3 text-muted" style={{ textAlign: "center" }}>
          {message}
        </div>
      ) : null}
    </div>
  );
}

export default GifLoader;



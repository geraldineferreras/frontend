import React from "react";
import { Routes, Route } from "react-router-dom";
import routes from "routes.js";

const VideoConference = () => {
  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/video-conference") {
        return (
          <Route
            path=":sessionId"
            element={prop.component}
            key={key}
          />
        );
      } else {
        return null;
      }
    });
  };

  return (
    <div className="video-conference-layout" style={{ 
      height: "100vh", 
      width: "100vw", 
      overflow: "hidden",
      backgroundColor: "#1a1a1a"
    }}>
      <Routes>
        {getRoutes(routes)}
      </Routes>
    </div>
  );
};

export default VideoConference; 
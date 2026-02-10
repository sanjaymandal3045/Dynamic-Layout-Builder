import React from "react";

/**
 * FullContainerLoader - Fills 100% of the parent container
 * Design: Transparent Glassmorphism
 */
const SplashScreen = ({ tip = "Initializing application..." }) => {
  return (
    <div style={overlayStyle}>
      <div style={contentWrapper}>
        {/* The Animated Ring */}
        <div style={loaderBox}>
          <div style={trackStyle} />
          <div style={orbitStyle} />
          <div style={glowStyle} />
        </div>

        {/* Text and Progress */}
        <div style={textStack}>
          <span style={labelStyle}>{tip}</span>
          <div style={progressTrack}>
            <div style={progressFill} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
        @keyframes fillUp {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

// --- Styles ---

const overlayStyle = {
  // Key for filling parent container
  position: "absolute", 
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  
  // Layout
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  
  // Transparency & Blur
  backgroundColor: "rgba(255, 255, 255, 0.4)", // Ultra-light transparent
  backdropFilter: "blur(8px)", // Stronger blur for "depth"
  WebkitBackdropFilter: "blur(8px)",
  zIndex: 999,
  borderRadius: "inherit", // Matches parent's border-radius if applicable
};

const contentWrapper = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "24px",
};

const loaderBox = {
  position: "relative",
  width: "50px",
  height: "50px",
};

const trackStyle = {
  position: "absolute",
  inset: 0,
  border: "3px solid rgba(13, 148, 136, 0.1)",
  borderRadius: "50%",
};

const orbitStyle = {
  position: "absolute",
  inset: 0,
  border: "3px solid transparent",
  borderTop: "3px solid #0d9488",
  borderRadius: "50%",
  animation: "rotate 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite",
};

const glowStyle = {
  position: "absolute",
  inset: "-5px",
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(13, 148, 136, 0.1) 0%, transparent 70%)",
  animation: "shimmer 2s infinite ease-in-out",
};

const textStack = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "10px",
};

const labelStyle = {
  color: "#0d9488",
  fontSize: "13px",
  fontWeight: "600",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const progressTrack = {
  width: "80px",
  height: "2px",
  backgroundColor: "rgba(13, 148, 136, 0.1)",
  borderRadius: "2px",
  overflow: "hidden",
};

const progressFill = {
  height: "100%",
  backgroundColor: "#0d9488",
  animation: "fillUp 1s ease-in-out forwards",
};

export default SplashScreen;
const ErrorScreen = ({
  title = "Failed to Load",
  message = "Could not fetch the screen configuration. Please try again.",
  onRetry = null,
}) => {
  return (
    <div style={overlayStyle}>
      <div style={contentWrapper}>
        {/* Error Icon */}
        <div style={iconBox}>
          <div style={iconTrack} />
          <div style={iconInner}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              style={svgStyle}
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="12" cy="16" r="0.5" fill="currentColor" strokeWidth="2.5" />
            </svg>
          </div>
          <div style={glowStyle} />
        </div>

        {/* Text */}
        <div style={textStack}>
          <span style={titleStyle}>{title}</span>
          <span style={messageStyle}>{message}</span>

          {onRetry && (
            <button style={retryBtnStyle} className="error-retry-btn" onClick={onRetry}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                style={{ width: 13, height: 13 }}
              >
                <path
                  d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M3 3v5h5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Retry
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmerError {
          0%  { opacity: 0.2; }
          50% { opacity: 0.7; }
          100%{ opacity: 0.2; }
        }
        @keyframes pulseRing {
          0%   { transform: scale(1);   opacity: 0.6; }
          50%  { transform: scale(1.06);opacity: 1;   }
          100% { transform: scale(1);   opacity: 0.6; }
        }
        .error-retry-btn:hover {
          background: rgba(220, 38, 38, 0.18) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2) !important;
        }
        .error-retry-btn:active {
          transform: translateY(0px);
        }
      `}</style>
    </div>
  );
};

// --- Styles ---

const overlayStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",

  display: "flex",
  justifyContent: "center",
  alignItems: "center",

  backgroundColor: "rgba(255, 255, 255, 0.45)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  zIndex: 999,
  borderRadius: "inherit",
};

const contentWrapper = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "20px",
};

const iconBox = {
  position: "relative",
  width: "56px",
  height: "56px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const iconTrack = {
  position: "absolute",
  inset: 0,
  border: "2.5px solid rgba(220, 38, 38, 0.15)",
  borderRadius: "50%",
  animation: "pulseRing 2.2s ease-in-out infinite",
};

const iconInner = {
  position: "relative",
  zIndex: 1,
  color: "#dc2626",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const svgStyle = {
  width: "28px",
  height: "28px",
  color: "#dc2626",
};

const glowStyle = {
  position: "absolute",
  inset: "-6px",
  borderRadius: "50%",
  background:
    "radial-gradient(circle, rgba(220, 38, 38, 0.12) 0%, transparent 70%)",
  animation: "shimmerError 2.5s infinite ease-in-out",
};

const textStack = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px",
  maxWidth: "280px",
  textAlign: "center",
};

const titleStyle = {
  color: "#dc2626",
  fontSize: "14px",
  fontWeight: "700",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const messageStyle = {
  color: "#64748b",
  fontSize: "12px",
  fontWeight: "500",
  lineHeight: "1.6",
};

const retryBtnStyle = {
  marginTop: "6px",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 18px",
  fontSize: "12px",
  fontWeight: "600",
  color: "#dc2626",
  background: "rgba(220, 38, 38, 0.08)",
  border: "1.5px solid rgba(220, 38, 38, 0.3)",
  borderRadius: "20px",
  cursor: "pointer",
  letterSpacing: "0.04em",
  transition: "all 0.2s ease",
  outline: "none",
};

export default ErrorScreen;

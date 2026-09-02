import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#141524",
          borderRadius: 8,
          position: "relative",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="jixuNeonOg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF007A" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#7928CA" />
            </linearGradient>
          </defs>

          {/* Outer Dashed Ring */}
          <circle
            cx="60"
            cy="60"
            r="42"
            fill="none"
            stroke="url(#jixuNeonOg)"
            strokeWidth="6"
            strokeDasharray="20 12 35 12"
          />

          {/* Inner Static Ring */}
          <circle
            cx="60"
            cy="60"
            r="32"
            fill="none"
            stroke="#7928CA"
            strokeWidth="3"
            opacity="0.7"
          />

          {/* Pulsing Play Prism */}
          <polygon
            points="50,38 50,82 84,60"
            fill="url(#jixuNeonOg)"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}

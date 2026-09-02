import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function BrandLogo({ size = 44, className = "", showText = true }: LogoProps) {
  if (!showText) {
    // Icon-Only Variant (Square Avatar, Modal Headers, App Icons)
    return (
      <div
        className={`group relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="40 40 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full filter drop-shadow-[0_0_14px_rgba(255,0,122,0.4)] transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="jixuNeonGradSquare" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF007A" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#7928CA" />
            </linearGradient>
          </defs>

          {/* Dark Glass Frame */}
          <rect x="42" y="42" width="116" height="116" rx="28" fill="#141524" />

          {/* Ambient Glow */}
          <circle cx="100" cy="100" r="45" fill="url(#jixuNeonGradSquare)" opacity="0.25" />

          {/* Outer Spinning Dashed Ring */}
          <circle
            cx="100"
            cy="100"
            r="42"
            fill="none"
            stroke="url(#jixuNeonGradSquare)"
            strokeWidth="5"
            strokeDasharray="20 10 35 10"
            className="origin-[100px_100px] animate-[spin_8s_linear_infinite]"
          />

          {/* Inner Static Ring */}
          <circle
            cx="100"
            cy="100"
            r="32"
            fill="none"
            stroke="#7928CA"
            strokeWidth="3"
            opacity="0.7"
          />

          {/* Pulsing Play Prism */}
          <polygon
            points="89,76 89,124 126,100"
            fill="url(#jixuNeonGradSquare)"
            className="origin-[100px_100px] animate-[pulse_2.2s_ease-in-out_infinite]"
          />
        </svg>
      </div>
    );
  }

  // Full Horizontal Vector Logo (Navbar, Footers, Headers)
  // Large high-visibility horizontal vector format (~3.8:1 ratio)
  const width = Math.round(size * 3.8);
  const height = size;

  return (
    <div
      className={`group relative inline-flex items-center select-none ${className}`}
      style={{ height: height, width: width }}
    >
      <svg
        viewBox="40 42 505 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full filter drop-shadow-[0_0_18px_rgba(255,0,122,0.25)] transition-transform duration-300 group-hover:scale-[1.02]"
      >
        <defs>
          <linearGradient id="jixuNeonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF007A" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#7928CA" />
          </linearGradient>
        </defs>

        <style>
          {`
            @keyframes logoSpin {
              100% { transform: rotate(360deg); }
            }
            @keyframes logoPulse {
              0%, 100% { transform: scale(1); filter: drop-shadow(0 0 3px #FF007A); }
              50% { transform: scale(1.08); filter: drop-shadow(0 0 16px #FF007A); }
            }
            @keyframes logoLineDraw {
              0% { stroke-dashoffset: 400; }
              100% { stroke-dashoffset: 0; }
            }
            .jixu-spin {
              transform-origin: 92px 96px;
              animation: logoSpin 8s linear infinite;
            }
            .jixu-pulse {
              transform-origin: 92px 96px;
              animation: logoPulse 2.2s ease-in-out infinite;
            }
            .jixu-underline {
              stroke-dasharray: 400;
              stroke-dashoffset: 400;
              animation: logoLineDraw 1.4s ease-out 0.2s forwards;
            }
            .jixu-brand-title {
              font-family: var(--font-space, 'Space Grotesk'), 'Arial Black', Impact, sans-serif;
              font-size: 84px;
              font-weight: 900;
              letter-spacing: 0.02em;
            }
            .jixu-brand-sub {
              font-family: var(--font-jetbrains, 'JetBrains Mono'), 'Arial', sans-serif;
              font-size: 21.5px;
              font-weight: 900;
              letter-spacing: 7px;
              fill: #FF007A;
            }
          `}
        </style>

        {/* Animated Icon Group (Play Button / Lens) */}
        <g>
          {/* Ambient Glow */}
          <circle cx="92" cy="96" r="45" fill="url(#jixuNeonGrad)" opacity="0.25" />

          {/* Outer spinning dashed ring */}
          <circle
            className="jixu-spin"
            cx="92"
            cy="96"
            r="46"
            fill="none"
            stroke="url(#jixuNeonGrad)"
            strokeWidth="5"
            strokeDasharray="22 12 40 12"
          />

          {/* Inner static ring */}
          <circle
            cx="92"
            cy="96"
            r="34"
            fill="none"
            stroke="#7928CA"
            strokeWidth="2.5"
            opacity="0.65"
          />

          {/* Pulsing play icon */}
          <polygon
            className="jixu-pulse"
            points="81,72 81,120 118,96"
            fill="url(#jixuNeonGrad)"
          />
        </g>

        {/* Typography */}
        {/* Main "JIXU" Text (Theme-Aware fill) */}
        <text
          x="165"
          y="110"
          className="jixu-brand-title fill-[var(--fg)] drop-shadow-sm"
        >
          JIXU
        </text>

        {/* Subtitle "ENTERTAINMENTS" with maximum clarity */}
        <text
          x="167"
          y="142"
          className="jixu-brand-sub"
        >
          ENTERTAINMENTS
        </text>

        {/* Decorative Animated Underline */}
        <path
          className="jixu-underline"
          d="M 167 153 L 535 153"
          stroke="url(#jixuNeonGrad)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

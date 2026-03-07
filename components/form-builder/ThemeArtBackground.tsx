"use client";

import React from "react";

/**
 * Theme accent colors derived from the gallery palette.
 * Each gallery theme ID maps to accent1, accent2, accent3 used in SVG artwork.
 */
const THEME_ACCENTS: Record<
  string,
  { accent1: string; accent2: string; accent3: string; bg: string }
> = {
  barceloneta: {
    accent1: "#E8A838",
    accent2: "#C89B6B",
    accent3: "#F5E6D0",
    bg: "#D4B483",
  },
  default: {
    accent1: "#5B8DEF",
    accent2: "#1A4FD0",
    accent3: "#8FB4FF",
    bg: "#2B65F8",
  },
  "plain-blue": {
    accent1: "#80CBC4",
    accent2: "#00897B",
    accent3: "#B2DFDB",
    bg: "#E0F7FA",
  },
  "plain-dark": {
    accent1: "#2D2D4A",
    accent2: "#404060",
    accent3: "#16213E",
    bg: "#1A1A2E",
  },
  "coral-reef": {
    accent1: "#FF9A9A",
    accent2: "#FFB8B8",
    accent3: "#FF6B6B",
    bg: "#FFF0ED",
  },
  forest: {
    accent1: "#95D5B2",
    accent2: "#52B788",
    accent3: "#D8F3DC",
    bg: "#F0FFF4",
  },
  midnight: {
    accent1: "#1E293B",
    accent2: "#334155",
    accent3: "#6366F1",
    bg: "#0F172A",
  },
  sunrise: {
    accent1: "#FCD34D",
    accent2: "#FB923C",
    accent3: "#FEF3C7",
    bg: "#FFFBEB",
  },
  lavender: {
    accent1: "#C4B5FD",
    accent2: "#A78BFA",
    accent3: "#DDD6FE",
    bg: "#F5F3FF",
  },
  ocean: {
    accent1: "#075985",
    accent2: "#0284C7",
    accent3: "#38BDF8",
    bg: "#0C4A6E",
  },
  slate: {
    accent1: "#CBD5E1",
    accent2: "#94A3B8",
    accent3: "#E2E8F0",
    bg: "#F1F5F9",
  },
  "warm-sand": {
    accent1: "#D4A574",
    accent2: "#E8C9A0",
    accent3: "#F5E6D0",
    bg: "#FDF6EC",
  },
  "green-gradient": {
    accent1: "#2E9B7A",
    accent2: "#58C9A5",
    accent3: "#D0F0E4",
    bg: "#3BA88C",
  },
  "dark-waves": {
    accent1: "#222222",
    accent2: "#333333",
    accent3: "#444444",
    bg: "#111111",
  },
  "blue-spirograph": {
    accent1: "#2D1A99",
    accent2: "#E8A882",
    accent3: "#4B30CC",
    bg: "#1A1066",
  },
  "beige-notebook": {
    accent1: "#C4B89A",
    accent2: "#A89878",
    accent3: "#E8E0D0",
    bg: "#D5CCBA",
  },
  "coral-shapes": {
    accent1: "#F0A88C",
    accent2: "#D6CD8C",
    accent3: "#F5E5DD",
    bg: "#EEDFDA",
  },
  "green-geometry": {
    accent1: "#2EB86A",
    accent2: "#3DD17C",
    accent3: "#27A85E",
    bg: "#E8E8E8",
  },
  "peach-bloom": {
    accent1: "#F0A898",
    accent2: "#F5B8A8",
    accent3: "#F8D0C8",
    bg: "#F0C8BC",
  },
  workspace: {
    accent1: "#C8A880",
    accent2: "#A8907A",
    accent3: "#D5CDC4",
    bg: "#E8E0D6",
  },
  spotlight: {
    accent1: "#1A1A1A",
    accent2: "#D4A840",
    accent3: "#2A2A2A",
    bg: "#0A0A0A",
  },
  "golden-curves": {
    accent1: "#E8A830",
    accent2: "#DDD0B0",
    accent3: "#F0E8D8",
    bg: "#F5EDE0",
  },
};

/**
 * SVG artwork renderers for each gallery theme.
 * These create unique organic shapes (blobs, waves, geometric patterns)
 * that give each theme its distinctive visual identity.
 */
function renderThemeArt(themeId: string): React.ReactNode | null {
  const colors = THEME_ACCENTS[themeId];
  if (!colors) return null;

  const { accent1, accent2, accent3, bg } = colors;

  switch (themeId) {
    case "barceloneta":
      return (
        <svg
          viewBox="0 0 1200 800"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <rect width="1200" height="800" fill={bg} />
          <ellipse
            cx="900"
            cy="-50"
            rx="600"
            ry="450"
            fill={accent1}
            opacity="0.8"
          />
          <path
            d="M0 500 Q300 300 600 450 T1200 350 V800 H0Z"
            fill={accent3}
            opacity="0.6"
          />
          <path
            d="M0 600 Q350 420 700 540 T1200 460 V800 H0Z"
            fill={accent2}
            opacity="0.5"
          />
        </svg>
      );
    case "default":
      return (
        <svg
          viewBox="0 0 1200 800"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <rect width="1200" height="800" fill={bg} />
          <circle cx="180" cy="600" r="360" fill={accent1} opacity="0.4" />
          <circle cx="1020" cy="200" r="300" fill={accent3} opacity="0.3" />
          <path
            d="M0 650 Q600 400 1200 650 V800 H0Z"
            fill={accent2}
            opacity="0.3"
          />
        </svg>
      );
    case "plain-blue":
      return (
        <svg
          viewBox="0 0 1200 800"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <rect width="1200" height="800" fill={bg} />
          <path
            d="M0 400 C240 200 360 520 600 340 S960 460 1200 280 V800 H0Z"
            fill={accent3}
            opacity="0.5"
          />
          <path
            d="M0 530 C300 400 480 650 780 470 S1080 590 1200 500 V800 H0Z"
            fill={accent1}
            opacity="0.4"
          />
          <circle cx="960" cy="160" r="120" fill={accent2} opacity="0.2" />
        </svg>
      );
    case "plain-dark":
      return (
        <svg
          viewBox="0 0 1200 800"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <rect width="1200" height="800" fill={bg} />
          <rect
            x="60"
            y="130"
            width="240"
            height="240"
            rx="20"
            fill={accent1}
            opacity="0.5"
            transform="rotate(15 180 250)"
          />
          <rect
            x="840"
            y="390"
            width="300"
            height="300"
            rx="20"
            fill={accent2}
            opacity="0.4"
            transform="rotate(-10 990 540)"
          />
          <polygon
            points="600,100 690,280 510,280"
            fill={accent3}
            opacity="0.3"
          />
          <line
            x1="180"
            y1="650"
            x2="1080"
            y2="650"
            stroke={accent2}
            strokeWidth="2"
            opacity="0.3"
          />
        </svg>
      );
    case "coral-reef":
      return (
        <svg
          viewBox="0 0 1200 800"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <rect width="1200" height="800" fill={bg} />
          <ellipse
            cx="300"
            cy="720"
            rx="480"
            ry="300"
            fill={accent1}
            opacity="0.4"
          />
          <ellipse
            cx="1020"
            cy="660"
            rx="360"
            ry="240"
            fill={accent2}
            opacity="0.3"
          />
          <circle cx="900" cy="130" r="150" fill={accent3} opacity="0.2" />
          <circle cx="180" cy="200" r="90" fill={accent1} opacity="0.15" />
        </svg>
      );
    case "forest":
      return (
        <svg
          viewBox="0 0 1200 800"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <rect width="1200" height="800" fill={bg} />
          <path
            d="M0 580 Q180 400 360 520 T720 430 T1200 550 V800 H0Z"
            fill={accent1}
            opacity="0.5"
          />
          <path
            d="M0 660 Q300 530 600 620 T1200 590 V800 H0Z"
            fill={accent2}
            opacity="0.4"
          />
          <ellipse
            cx="960"
            cy="200"
            rx="180"
            ry="150"
            fill={accent3}
            opacity="0.3"
          />
          <circle cx="240" cy="260" r="72" fill={accent1} opacity="0.2" />
        </svg>
      );
    case "midnight":
      return (
        <svg
          viewBox="0 0 1200 800"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <rect width="1200" height="800" fill={bg} />
          <circle cx="240" cy="200" r="12" fill="#FFF" opacity="0.5" />
          <circle cx="540" cy="100" r="9" fill="#FFF" opacity="0.4" />
          <circle cx="900" cy="160" r="15" fill="#FFF" opacity="0.6" />
          <circle cx="1080" cy="330" r="6" fill="#FFF" opacity="0.3" />
          <circle cx="360" cy="460" r="9" fill="#FFF" opacity="0.4" />
          <circle cx="720" cy="360" r="12" fill="#FFF" opacity="0.5" />
          <path
            d="M0 580 Q300 460 600 550 T1200 490 V800 H0Z"
            fill={accent1}
            opacity="0.5"
          />
          <path
            d="M0 680 Q480 560 960 650 T1200 620 V800 H0Z"
            fill={accent2}
            opacity="0.3"
          />
          <circle cx="1020" cy="130" r="90" fill={accent3} opacity="0.15" />
        </svg>
      );
    case "sunrise":
      return (
        <svg
          viewBox="0 0 1200 800"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <rect width="1200" height="800" fill={bg} />
          <circle cx="600" cy="720" r="360" fill={accent1} opacity="0.3" />
          <path
            d="M0 460 Q300 280 600 400 T1200 310 V800 H0Z"
            fill={accent3}
            opacity="0.4"
          />
          <path
            d="M0 580 Q420 430 840 520 T1200 470 V800 H0Z"
            fill={accent2}
            opacity="0.35"
          />
          <circle cx="960" cy="130" r="108" fill={accent1} opacity="0.25" />
        </svg>
      );
    case "lavender":
      return (
        <svg
          viewBox="0 0 1200 800"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <rect width="1200" height="800" fill={bg} />
          <ellipse
            cx="180"
            cy="660"
            rx="420"
            ry="300"
            fill={accent3}
            opacity="0.4"
          />
          <ellipse
            cx="1080"
            cy="590"
            rx="300"
            ry="270"
            fill={accent1}
            opacity="0.3"
          />
          <circle cx="840" cy="160" r="180" fill={accent2} opacity="0.15" />
          <circle cx="300" cy="200" r="108" fill={accent1} opacity="0.12" />
        </svg>
      );
    case "ocean":
      return (
        <svg
          viewBox="0 0 1200 800"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <rect width="1200" height="800" fill={bg} />
          <path
            d="M0 340 Q150 240 300 340 T600 310 T900 360 T1200 280 V800 H0Z"
            fill={accent1}
            opacity="0.5"
          />
          <path
            d="M0 460 Q180 370 360 460 T720 420 T1080 475 T1200 400 V800 H0Z"
            fill={accent2}
            opacity="0.4"
          />
          <path
            d="M0 590 Q240 520 480 590 T960 540 T1200 575 V800 H0Z"
            fill={accent3}
            opacity="0.25"
          />
        </svg>
      );
    case "slate":
      return (
        <svg
          viewBox="0 0 1200 800"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <rect width="1200" height="800" fill={bg} />
          <rect
            x="120"
            y="200"
            width="960"
            height="2"
            fill={accent2}
            opacity="0.2"
          />
          <rect
            x="120"
            y="360"
            width="960"
            height="2"
            fill={accent2}
            opacity="0.15"
          />
          <rect
            x="120"
            y="520"
            width="960"
            height="2"
            fill={accent2}
            opacity="0.1"
          />
          <circle cx="960" cy="200" r="150" fill={accent1} opacity="0.25" />
          <circle cx="240" cy="520" r="120" fill={accent3} opacity="0.2" />
        </svg>
      );
    case "warm-sand":
      return (
        <svg
          viewBox="0 0 1200 800"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <rect width="1200" height="800" fill={bg} />
          <ellipse
            cx="1020"
            cy="-30"
            rx="540"
            ry="360"
            fill={accent1}
            opacity="0.6"
          />
          <path
            d="M0 490 Q240 340 480 460 T960 370 T1200 430 V800 H0Z"
            fill={accent3}
            opacity="0.5"
          />
          <path
            d="M0 620 Q360 500 720 590 T1200 530 V800 H0Z"
            fill={accent2}
            opacity="0.4"
          />
        </svg>
      );
    case "green-gradient":
      return (
        <svg
          viewBox="0 0 1200 800"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="gg2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2E8B57" />
              <stop offset="50%" stopColor="#3CBBA0" />
              <stop offset="100%" stopColor="#B0F0E0" />
            </linearGradient>
          </defs>
          <rect width="1200" height="800" fill="url(#gg2)" />
        </svg>
      );
    case "dark-waves":
      return (
        <svg
          viewBox="0 0 1200 800"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <rect width="1200" height="800" fill="#111" />
          <path
            d="M0 160 Q300 120 600 180 T1200 130"
            stroke="#333"
            strokeWidth="12"
            fill="none"
            opacity="0.5"
          />
          <path
            d="M0 260 Q300 220 600 280 T1200 230"
            stroke="#333"
            strokeWidth="12"
            fill="none"
            opacity="0.5"
          />
          <path
            d="M0 360 Q360 300 720 380 T1200 330"
            stroke="#2A2A2A"
            strokeWidth="16"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M0 460 Q420 400 840 480 T1200 430"
            stroke="#333"
            strokeWidth="12"
            fill="none"
            opacity="0.5"
          />
          <path
            d="M0 560 Q300 520 600 580 T1200 530"
            stroke="#2A2A2A"
            strokeWidth="12"
            fill="none"
            opacity="0.5"
          />
          <path
            d="M0 660 Q360 610 720 680 T1200 630"
            stroke="#333"
            strokeWidth="12"
            fill="none"
            opacity="0.4"
          />
        </svg>
      );
    case "blue-spirograph":
      return (
        <svg
          viewBox="0 0 1200 800"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <rect width="1200" height="800" fill="#1A1066" />
          <circle
            cx="900"
            cy="230"
            r="180"
            stroke="#E8A882"
            strokeWidth="3"
            fill="none"
            opacity="0.5"
          />
          <circle
            cx="930"
            cy="250"
            r="140"
            stroke="#E8A882"
            strokeWidth="3"
            fill="none"
            opacity="0.4"
          />
          <circle
            cx="870"
            cy="200"
            r="220"
            stroke="#E8A882"
            strokeWidth="2.5"
            fill="none"
            opacity="0.3"
          />
          <ellipse
            cx="880"
            cy="220"
            rx="110"
            ry="170"
            stroke="#E8A882"
            strokeWidth="2.5"
            fill="none"
            opacity="0.4"
          />
          <circle
            cx="300"
            cy="630"
            r="120"
            stroke="#E8A882"
            strokeWidth="3"
            fill="none"
            opacity="0.5"
          />
          <circle
            cx="330"
            cy="610"
            r="80"
            stroke="#E8A882"
            strokeWidth="2.5"
            fill="none"
            opacity="0.4"
          />
          <circle
            cx="270"
            cy="660"
            r="50"
            stroke="#E8A882"
            strokeWidth="3"
            fill="none"
            opacity="0.5"
          />
        </svg>
      );
    case "beige-notebook":
      return (
        <svg
          viewBox="0 0 1200 800"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <rect width="1200" height="800" fill="#D5CCBA" />
          <rect
            x="780"
            y="200"
            width="330"
            height="460"
            rx="12"
            fill="#C4A86A"
            opacity="0.5"
          />
          <line
            x1="810"
            y1="280"
            x2="1080"
            y2="280"
            stroke="#B89858"
            strokeWidth="2"
            opacity="0.5"
          />
          <line
            x1="810"
            y1="340"
            x2="1080"
            y2="340"
            stroke="#B89858"
            strokeWidth="2"
            opacity="0.5"
          />
          <line
            x1="810"
            y1="400"
            x2="1080"
            y2="400"
            stroke="#B89858"
            strokeWidth="2"
            opacity="0.5"
          />
          <line
            x1="810"
            y1="460"
            x2="1080"
            y2="460"
            stroke="#B89858"
            strokeWidth="2"
            opacity="0.5"
          />
          <line
            x1="810"
            y1="520"
            x2="1080"
            y2="520"
            stroke="#B89858"
            strokeWidth="2"
            opacity="0.5"
          />
          <line
            x1="180"
            y1="60"
            x2="280"
            y2="230"
            stroke="#AA8844"
            strokeWidth="10"
          />
          <rect
            x="270"
            y="50"
            width="30"
            height="30"
            rx="6"
            fill="#EEE"
            opacity="0.7"
          />
        </svg>
      );
    case "coral-shapes":
      return (
        <svg
          viewBox="0 0 1200 800"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <rect width="1200" height="800" fill="#EEDFDA" />
          <path
            d="M-120 800 Q0 0 600 200 Q1200 400 1320 800Z"
            fill="#F0A88C"
            opacity="0.85"
          />
          <rect
            x="600"
            y="460"
            width="540"
            height="330"
            rx="130"
            fill="#D6CD8C"
            opacity="0.7"
          />
        </svg>
      );
    case "green-geometry":
      return (
        <svg
          viewBox="0 0 1200 800"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <rect width="1200" height="800" fill="#E8E8E8" />
          <polygon
            points="240,60 720,30 780,530 180,600"
            fill="#2EB86A"
            opacity="0.9"
          />
          <polygon
            points="420,130 1020,100 990,660 510,630"
            fill="#3DD17C"
            opacity="0.85"
          />
        </svg>
      );
    case "peach-bloom":
      return (
        <svg
          viewBox="0 0 1200 800"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <rect width="1200" height="800" fill="#F0C8BC" />
          <circle cx="720" cy="360" r="330" fill="#F0A898" opacity="0.8" />
        </svg>
      );
    case "workspace":
      return (
        <svg
          viewBox="0 0 1200 800"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <rect width="1200" height="800" fill="#E8E2D8" />
          <rect
            x="0"
            y="500"
            width="1200"
            height="300"
            fill="#C8A880"
            opacity="0.6"
          />
          <rect
            x="360"
            y="400"
            width="300"
            height="200"
            rx="12"
            fill="#999"
            opacity="0.4"
          />
          <line
            x1="360"
            y1="430"
            x2="660"
            y2="380"
            stroke="#888"
            strokeWidth="3"
          />
          <ellipse
            cx="300"
            cy="560"
            rx="72"
            ry="48"
            fill="#888"
            opacity="0.3"
          />
        </svg>
      );
    case "spotlight":
      return (
        <svg
          viewBox="0 0 1200 800"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <rect width="1200" height="800" fill="#0A0A0A" />
          <defs>
            <radialGradient id="sp2" cx="0.7" cy="0.5" r="0.4">
              <stop offset="0%" stopColor="#D4A840" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1200" height="800" fill="url(#sp2)" />
          <line
            x1="780"
            y1="630"
            x2="780"
            y2="300"
            stroke="#222"
            strokeWidth="24"
          />
          <circle cx="780" cy="280" r="18" fill="#D4A840" opacity="0.5" />
        </svg>
      );
    case "golden-curves":
      return (
        <svg
          viewBox="0 0 1200 800"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <rect width="1200" height="800" fill="#F5EDE0" />
          <path
            d="M0 0 L1200 0 L1200 230 Q900 130 600 360 Q300 600 0 800 Z"
            fill="#E8A830"
            opacity="0.8"
          />
          <path
            d="M0 330 Q480 130 960 400 Q1200 530 1200 800 L0 800 Z"
            fill="#DDD0B0"
            opacity="0.6"
          />
        </svg>
      );
    default:
      return null;
  }
}

interface ThemeArtBackgroundProps {
  themeId?: string;
  backgroundColor?: string;
  className?: string;
}

/**
 * Renders the artistic SVG background for a gallery theme.
 * Falls back to a solid background color if no theme art is found.
 * Use this component as an absolute-positioned background layer.
 */
export function ThemeArtBackground({
  themeId,
  backgroundColor,
  className = "",
}: ThemeArtBackgroundProps) {
  const art = themeId ? renderThemeArt(themeId) : null;

  if (art) {
    return (
      <div
        className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      >
        {art}
      </div>
    );
  }

  // Fallback: plain background color
  if (backgroundColor) {
    return (
      <div
        className={`absolute inset-0 pointer-events-none ${className}`}
        style={{ backgroundColor }}
      />
    );
  }

  return null;
}

"use client";

import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  CheckIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";

interface ThemePreset {
  id: string;
  name: string;
  question: string;
  answer: string;
  button: string;
  buttonText: string;
  bg: string;
  font: string;
  radius: number;
  accent1: string;
  accent2: string;
  accent3: string;
  backgroundImage?: string;
}

const THEME_GALLERY: ThemePreset[] = [
  {
    id: "barceloneta",
    name: "Barceloneta",
    question: "#262627",
    answer: "#262627",
    button: "#262627",
    buttonText: "#FFFFFF",
    bg: "#D4B483",
    font: "Inter, sans-serif",
    radius: 8,
    accent1: "#E8A838",
    accent2: "#C89B6B",
    accent3: "#F5E6D0",
  },
  {
    id: "default",
    name: "Default Theme",
    question: "#FFFFFF",
    answer: "#FFFFFF",
    button: "#0B45C8",
    buttonText: "#FFFFFF",
    bg: "#2B65F8",
    font: "Inter, sans-serif",
    radius: 8,
    accent1: "#5B8DEF",
    accent2: "#1A4FD0",
    accent3: "#8FB4FF",
  },
  {
    id: "plain-blue",
    name: "Plain Blue",
    question: "#003C50",
    answer: "#003C50",
    button: "#00897B",
    buttonText: "#FFFFFF",
    bg: "#E0F7FA",
    font: "'DM Sans', sans-serif",
    radius: 8,
    accent1: "#80CBC4",
    accent2: "#00897B",
    accent3: "#B2DFDB",
  },
  {
    id: "plain-dark",
    name: "Plain Dark",
    question: "#FFFFFF",
    answer: "#CCCCCC",
    button: "#404040",
    buttonText: "#FFFFFF",
    bg: "#1A1A2E",
    font: "'Space Grotesk', sans-serif",
    radius: 4,
    accent1: "#2D2D4A",
    accent2: "#404060",
    accent3: "#16213E",
  },
  {
    id: "coral-reef",
    name: "Coral Reef",
    question: "#2D2D2D",
    answer: "#555555",
    button: "#FF6B6B",
    buttonText: "#FFFFFF",
    bg: "#FFF0ED",
    font: "'Poppins', sans-serif",
    radius: 12,
    accent1: "#FF9A9A",
    accent2: "#FFB8B8",
    accent3: "#FF6B6B",
  },
  {
    id: "forest",
    name: "Forest",
    question: "#1B4332",
    answer: "#2D6A4F",
    button: "#40916C",
    buttonText: "#FFFFFF",
    bg: "#F0FFF4",
    font: "'Plus Jakarta Sans', sans-serif",
    radius: 8,
    accent1: "#95D5B2",
    accent2: "#52B788",
    accent3: "#D8F3DC",
  },
  {
    id: "midnight",
    name: "Midnight",
    question: "#E2E8F0",
    answer: "#94A3B8",
    button: "#818CF8",
    buttonText: "#FFFFFF",
    bg: "#0F172A",
    font: "'Outfit', sans-serif",
    radius: 999,
    accent1: "#1E293B",
    accent2: "#334155",
    accent3: "#6366F1",
  },
  {
    id: "sunrise",
    name: "Sunrise",
    question: "#1C1917",
    answer: "#44403C",
    button: "#F97316",
    buttonText: "#FFFFFF",
    bg: "#FFFBEB",
    font: "'DM Sans', sans-serif",
    radius: 12,
    accent1: "#FCD34D",
    accent2: "#FB923C",
    accent3: "#FEF3C7",
  },
  {
    id: "lavender",
    name: "Lavender",
    question: "#2E1065",
    answer: "#4C1D95",
    button: "#7C3AED",
    buttonText: "#FFFFFF",
    bg: "#F5F3FF",
    font: "'Poppins', sans-serif",
    radius: 16,
    accent1: "#C4B5FD",
    accent2: "#A78BFA",
    accent3: "#DDD6FE",
  },
  {
    id: "ocean",
    name: "Ocean",
    question: "#FFFFFF",
    answer: "#CBD5E1",
    button: "#0EA5E9",
    buttonText: "#FFFFFF",
    bg: "#0C4A6E",
    font: "'Inter, sans-serif'",
    radius: 8,
    accent1: "#075985",
    accent2: "#0284C7",
    accent3: "#38BDF8",
  },
  {
    id: "slate",
    name: "Slate",
    question: "#1E293B",
    answer: "#475569",
    button: "#334155",
    buttonText: "#FFFFFF",
    bg: "#F1F5F9",
    font: "system-ui, sans-serif",
    radius: 4,
    accent1: "#CBD5E1",
    accent2: "#94A3B8",
    accent3: "#E2E8F0",
  },
  {
    id: "warm-sand",
    name: "Warm Sand",
    question: "#3D2C24",
    answer: "#6B4F3F",
    button: "#C2825A",
    buttonText: "#FFFFFF",
    bg: "#FDF6EC",
    font: "Georgia, serif",
    radius: 8,
    accent1: "#D4A574",
    accent2: "#E8C9A0",
    accent3: "#F5E6D0",
  },
  {
    id: "green-gradient",
    name: "Green Gradient",
    question: "#FFFFFF",
    answer: "#E0F7F0",
    button: "#2CA77A",
    buttonText: "#FFFFFF",
    bg: "#3BA88C",
    font: "'Plus Jakarta Sans', sans-serif",
    radius: 12,
    accent1: "#2E9B7A",
    accent2: "#58C9A5",
    accent3: "#D0F0E4",
    backgroundImage: "/images/themes/green-gradient.png",
  },
  {
    id: "dark-waves",
    name: "Dark Waves",
    question: "#FFFFFF",
    answer: "#AAAAAA",
    button: "#555555",
    buttonText: "#FFFFFF",
    bg: "#111111",
    font: "'Space Grotesk', sans-serif",
    radius: 4,
    accent1: "#222222",
    accent2: "#333333",
    accent3: "#444444",
    backgroundImage: "/images/themes/dark-waves.png",
  },
  {
    id: "blue-spirograph",
    name: "Blue Spirograph",
    question: "#FFFFFF",
    answer: "#E8C8B0",
    button: "#E8A882",
    buttonText: "#1A1066",
    bg: "#1A1066",
    font: "'DM Sans', sans-serif",
    radius: 8,
    accent1: "#2D1A99",
    accent2: "#E8A882",
    accent3: "#4B30CC",
    backgroundImage: "/images/themes/blue-spirograph.png",
  },
  {
    id: "beige-notebook",
    name: "Beige Notebook",
    question: "#3D3427",
    answer: "#6B5F4F",
    button: "#8B7355",
    buttonText: "#FFFFFF",
    bg: "#D5CCBA",
    font: "Georgia, serif",
    radius: 8,
    accent1: "#C4B89A",
    accent2: "#A89878",
    accent3: "#E8E0D0",
    backgroundImage: "/images/themes/beige-notebook.png",
  },
  {
    id: "coral-shapes",
    name: "Coral Shapes",
    question: "#5A3A30",
    answer: "#8B6B50",
    button: "#E89880",
    buttonText: "#FFFFFF",
    bg: "#EEDFDA",
    font: "'Poppins', sans-serif",
    radius: 16,
    accent1: "#F0A88C",
    accent2: "#D6CD8C",
    accent3: "#F5E5DD",
    backgroundImage: "/images/themes/coral-shapes.png",
  },
  {
    id: "green-geometry",
    name: "Green Geometry",
    question: "#1B4D30",
    answer: "#2D6A4F",
    button: "#1FAB5C",
    buttonText: "#FFFFFF",
    bg: "#E8E8E8",
    font: "'Plus Jakarta Sans', sans-serif",
    radius: 8,
    accent1: "#2EB86A",
    accent2: "#3DD17C",
    accent3: "#27A85E",
    backgroundImage: "/images/themes/green-geometry.png",
  },
  {
    id: "peach-bloom",
    name: "Peach Bloom",
    question: "#5A2A20",
    answer: "#804030",
    button: "#E88C78",
    buttonText: "#FFFFFF",
    bg: "#F0C8BC",
    font: "'DM Sans', sans-serif",
    radius: 999,
    accent1: "#F0A898",
    accent2: "#F5B8A8",
    accent3: "#F8D0C8",
    backgroundImage: "/images/themes/peach-bloom.png",
  },
  {
    id: "workspace",
    name: "Workspace",
    question: "#2C2C2C",
    answer: "#555555",
    button: "#8B6F50",
    buttonText: "#FFFFFF",
    bg: "#E8E0D6",
    font: "'Inter', sans-serif",
    radius: 8,
    accent1: "#C8A880",
    accent2: "#A8907A",
    accent3: "#D5CDC4",
    backgroundImage: "/images/themes/workspace.png",
  },
  {
    id: "spotlight",
    name: "Spotlight",
    question: "#FFFFFF",
    answer: "#AAAAAA",
    button: "#D4A840",
    buttonText: "#000000",
    bg: "#0A0A0A",
    font: "'Outfit', sans-serif",
    radius: 4,
    accent1: "#1A1A1A",
    accent2: "#D4A840",
    accent3: "#2A2A2A",
    backgroundImage: "/images/themes/spotlight.png",
  },
  {
    id: "golden-curves",
    name: "Golden Curves",
    question: "#5A4020",
    answer: "#7A6040",
    button: "#E8A830",
    buttonText: "#FFFFFF",
    bg: "#F5EDE0",
    font: "'Poppins', sans-serif",
    radius: 12,
    accent1: "#E8A830",
    accent2: "#DDD0B0",
    accent3: "#F0E8D8",
    backgroundImage: "/images/themes/golden-curves.png",
  },
];

const GALLERY_SVG_ART: Record<string, (t: ThemePreset) => React.ReactNode> = {
  barceloneta: (t) => (
    <svg
      viewBox="0 0 200 120"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <rect width="200" height="120" fill={t.bg} />
      <ellipse
        cx="160"
        cy="0"
        rx="100"
        ry="70"
        fill={t.accent1}
        opacity="0.8"
      />
      <path
        d="M0 80 Q50 40 100 70 T200 50 V120 H0Z"
        fill={t.accent3}
        opacity="0.6"
      />
      <path
        d="M0 95 Q60 65 120 85 T200 70 V120 H0Z"
        fill={t.accent2}
        opacity="0.5"
      />
    </svg>
  ),
  default: (t) => (
    <svg
      viewBox="0 0 200 120"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <rect width="200" height="120" fill={t.bg} />
      <circle cx="30" cy="90" r="60" fill={t.accent1} opacity="0.4" />
      <circle cx="170" cy="30" r="50" fill={t.accent3} opacity="0.3" />
      <path
        d="M0 100 Q100 60 200 100 V120 H0Z"
        fill={t.accent2}
        opacity="0.3"
      />
    </svg>
  ),
  "plain-blue": (t) => (
    <svg
      viewBox="0 0 200 120"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <rect width="200" height="120" fill={t.bg} />
      <path
        d="M0 60 C40 30 60 80 100 50 S160 70 200 40 V120 H0Z"
        fill={t.accent3}
        opacity="0.5"
      />
      <path
        d="M0 80 C50 60 80 100 130 70 S180 90 200 75 V120 H0Z"
        fill={t.accent1}
        opacity="0.4"
      />
      <circle cx="160" cy="25" r="20" fill={t.accent2} opacity="0.2" />
    </svg>
  ),
  "plain-dark": (t) => (
    <svg
      viewBox="0 0 200 120"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <rect width="200" height="120" fill={t.bg} />
      <rect
        x="10"
        y="20"
        width="40"
        height="40"
        rx="4"
        fill={t.accent1}
        opacity="0.5"
        transform="rotate(15 30 40)"
      />
      <rect
        x="140"
        y="60"
        width="50"
        height="50"
        rx="4"
        fill={t.accent2}
        opacity="0.4"
        transform="rotate(-10 165 85)"
      />
      <polygon points="100,15 115,45 85,45" fill={t.accent3} opacity="0.3" />
      <line
        x1="30"
        y1="100"
        x2="180"
        y2="100"
        stroke={t.accent2}
        strokeWidth="0.5"
        opacity="0.3"
      />
    </svg>
  ),
  "coral-reef": (t) => (
    <svg
      viewBox="0 0 200 120"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <rect width="200" height="120" fill={t.bg} />
      <ellipse
        cx="50"
        cy="110"
        rx="80"
        ry="50"
        fill={t.accent1}
        opacity="0.4"
      />
      <ellipse
        cx="170"
        cy="100"
        rx="60"
        ry="40"
        fill={t.accent2}
        opacity="0.3"
      />
      <circle cx="150" cy="20" r="25" fill={t.accent3} opacity="0.2" />
      <circle cx="30" cy="30" r="15" fill={t.accent1} opacity="0.15" />
    </svg>
  ),
  forest: (t) => (
    <svg
      viewBox="0 0 200 120"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <rect width="200" height="120" fill={t.bg} />
      <path
        d="M0 90 Q30 60 60 80 T120 65 T200 85 V120 H0Z"
        fill={t.accent1}
        opacity="0.5"
      />
      <path
        d="M0 100 Q50 80 100 95 T200 90 V120 H0Z"
        fill={t.accent2}
        opacity="0.4"
      />
      <ellipse
        cx="160"
        cy="30"
        rx="30"
        ry="25"
        fill={t.accent3}
        opacity="0.3"
      />
      <circle cx="40" cy="40" r="12" fill={t.accent1} opacity="0.2" />
    </svg>
  ),
  midnight: (t) => (
    <svg
      viewBox="0 0 200 120"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <rect width="200" height="120" fill={t.bg} />
      <circle cx="40" cy="30" r="2" fill="#FFF" opacity="0.5" />
      <circle cx="90" cy="15" r="1.5" fill="#FFF" opacity="0.4" />
      <circle cx="150" cy="25" r="2.5" fill="#FFF" opacity="0.6" />
      <circle cx="180" cy="50" r="1" fill="#FFF" opacity="0.3" />
      <circle cx="60" cy="70" r="1.5" fill="#FFF" opacity="0.4" />
      <circle cx="120" cy="55" r="2" fill="#FFF" opacity="0.5" />
      <path
        d="M0 90 Q50 70 100 85 T200 75 V120 H0Z"
        fill={t.accent1}
        opacity="0.5"
      />
      <path
        d="M0 105 Q80 85 160 100 T200 95 V120 H0Z"
        fill={t.accent2}
        opacity="0.3"
      />
      <circle cx="170" cy="20" r="15" fill={t.accent3} opacity="0.15" />
    </svg>
  ),
  sunrise: (t) => (
    <svg
      viewBox="0 0 200 120"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <rect width="200" height="120" fill={t.bg} />
      <circle cx="100" cy="110" r="60" fill={t.accent1} opacity="0.3" />
      <path
        d="M0 70 Q50 40 100 60 T200 45 V120 H0Z"
        fill={t.accent3}
        opacity="0.4"
      />
      <path
        d="M0 90 Q70 65 140 80 T200 72 V120 H0Z"
        fill={t.accent2}
        opacity="0.35"
      />
      <circle cx="160" cy="20" r="18" fill={t.accent1} opacity="0.25" />
    </svg>
  ),
  lavender: (t) => (
    <svg
      viewBox="0 0 200 120"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <rect width="200" height="120" fill={t.bg} />
      <ellipse
        cx="30"
        cy="100"
        rx="70"
        ry="50"
        fill={t.accent3}
        opacity="0.4"
      />
      <ellipse
        cx="180"
        cy="90"
        rx="50"
        ry="45"
        fill={t.accent1}
        opacity="0.3"
      />
      <circle cx="140" cy="25" r="30" fill={t.accent2} opacity="0.15" />
      <circle cx="50" cy="30" r="18" fill={t.accent1} opacity="0.12" />
    </svg>
  ),
  ocean: (t) => (
    <svg
      viewBox="0 0 200 120"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <rect width="200" height="120" fill={t.bg} />
      <path
        d="M0 50 Q25 35 50 50 T100 45 T150 55 T200 40 V120 H0Z"
        fill={t.accent1}
        opacity="0.5"
      />
      <path
        d="M0 70 Q30 55 60 70 T120 62 T180 72 T200 60 V120 H0Z"
        fill={t.accent2}
        opacity="0.4"
      />
      <path
        d="M0 90 Q40 78 80 90 T160 82 T200 88 V120 H0Z"
        fill={t.accent3}
        opacity="0.25"
      />
    </svg>
  ),
  slate: (t) => (
    <svg
      viewBox="0 0 200 120"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <rect width="200" height="120" fill={t.bg} />
      <rect
        x="20"
        y="30"
        width="160"
        height="0.5"
        fill={t.accent2}
        opacity="0.2"
      />
      <rect
        x="20"
        y="55"
        width="160"
        height="0.5"
        fill={t.accent2}
        opacity="0.15"
      />
      <rect
        x="20"
        y="80"
        width="160"
        height="0.5"
        fill={t.accent2}
        opacity="0.1"
      />
      <circle cx="160" cy="30" r="25" fill={t.accent1} opacity="0.25" />
      <circle cx="40" cy="80" r="20" fill={t.accent3} opacity="0.2" />
    </svg>
  ),
  "warm-sand": (t) => (
    <svg
      viewBox="0 0 200 120"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <rect width="200" height="120" fill={t.bg} />
      <ellipse cx="170" cy="0" rx="90" ry="60" fill={t.accent1} opacity="0.6" />
      <path
        d="M0 75 Q40 50 80 70 T160 55 T200 65 V120 H0Z"
        fill={t.accent3}
        opacity="0.5"
      />
      <path
        d="M0 95 Q60 75 120 90 T200 80 V120 H0Z"
        fill={t.accent2}
        opacity="0.4"
      />
    </svg>
  ),
  // Image-backed SVG art
  "green-gradient": (t) => (
    <svg
      viewBox="0 0 200 120"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="gg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2E8B57" />
          <stop offset="50%" stopColor="#3CBBA0" />
          <stop offset="100%" stopColor="#B0F0E0" />
        </linearGradient>
      </defs>
      <rect width="200" height="120" fill="url(#gg1)" />
    </svg>
  ),
  "dark-waves": (t) => (
    <svg
      viewBox="0 0 200 120"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <rect width="200" height="120" fill="#111" />
      <path
        d="M0 25 Q50 18 100 28 T200 20"
        stroke="#333"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M0 40 Q50 33 100 43 T200 35"
        stroke="#333"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M0 55 Q60 45 120 58 T200 50"
        stroke="#2A2A2A"
        strokeWidth="2.5"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M0 70 Q70 60 140 73 T200 65"
        stroke="#333"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M0 85 Q50 78 100 88 T200 80"
        stroke="#2A2A2A"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M0 100 Q60 92 120 103 T200 95"
        stroke="#333"
        strokeWidth="2"
        fill="none"
        opacity="0.4"
      />
    </svg>
  ),
  "blue-spirograph": (t) => (
    <svg
      viewBox="0 0 200 120"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <rect width="200" height="120" fill="#1A1066" />
      <circle
        cx="150"
        cy="35"
        r="28"
        stroke="#E8A882"
        strokeWidth="0.5"
        fill="none"
        opacity="0.5"
      />
      <circle
        cx="155"
        cy="38"
        r="22"
        stroke="#E8A882"
        strokeWidth="0.5"
        fill="none"
        opacity="0.4"
      />
      <circle
        cx="145"
        cy="30"
        r="34"
        stroke="#E8A882"
        strokeWidth="0.4"
        fill="none"
        opacity="0.3"
      />
      <ellipse
        cx="148"
        cy="33"
        rx="18"
        ry="26"
        stroke="#E8A882"
        strokeWidth="0.4"
        fill="none"
        opacity="0.4"
      />
      <circle
        cx="50"
        cy="95"
        r="18"
        stroke="#E8A882"
        strokeWidth="0.5"
        fill="none"
        opacity="0.5"
      />
      <circle
        cx="55"
        cy="92"
        r="12"
        stroke="#E8A882"
        strokeWidth="0.4"
        fill="none"
        opacity="0.4"
      />
      <circle
        cx="45"
        cy="100"
        r="8"
        stroke="#E8A882"
        strokeWidth="0.5"
        fill="none"
        opacity="0.5"
      />
    </svg>
  ),
  "beige-notebook": (t) => (
    <svg
      viewBox="0 0 200 120"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <rect width="200" height="120" fill="#D5CCBA" />
      <rect
        x="130"
        y="30"
        width="55"
        height="70"
        rx="2"
        fill="#C4A86A"
        opacity="0.5"
      />
      <line
        x1="135"
        y1="42"
        x2="180"
        y2="42"
        stroke="#B89858"
        strokeWidth="0.3"
        opacity="0.5"
      />
      <line
        x1="135"
        y1="52"
        x2="180"
        y2="52"
        stroke="#B89858"
        strokeWidth="0.3"
        opacity="0.5"
      />
      <line
        x1="135"
        y1="62"
        x2="180"
        y2="62"
        stroke="#B89858"
        strokeWidth="0.3"
        opacity="0.5"
      />
      <line
        x1="135"
        y1="72"
        x2="180"
        y2="72"
        stroke="#B89858"
        strokeWidth="0.3"
        opacity="0.5"
      />
      <line
        x1="135"
        y1="82"
        x2="180"
        y2="82"
        stroke="#B89858"
        strokeWidth="0.3"
        opacity="0.5"
      />
      <line
        x1="30"
        y1="10"
        x2="48"
        y2="35"
        stroke="#AA8844"
        strokeWidth="1.5"
      />
      <rect
        x="46"
        y="8"
        width="5"
        height="5"
        rx="1"
        fill="#EEE"
        opacity="0.7"
      />
    </svg>
  ),
  "coral-shapes": (t) => (
    <svg
      viewBox="0 0 200 120"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <rect width="200" height="120" fill="#EEDFDA" />
      <path
        d="M-20 120 Q0 0 100 30 Q200 60 220 120Z"
        fill="#F0A88C"
        opacity="0.85"
      />
      <rect
        x="100"
        y="70"
        width="90"
        height="50"
        rx="20"
        fill="#D6CD8C"
        opacity="0.7"
      />
    </svg>
  ),
  "green-geometry": (t) => (
    <svg
      viewBox="0 0 200 120"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <rect width="200" height="120" fill="#E8E8E8" />
      <polygon points="40,10 120,5 130,80 30,90" fill="#2EB86A" opacity="0.9" />
      <polygon
        points="70,20 170,15 165,100 85,95"
        fill="#3DD17C"
        opacity="0.85"
      />
    </svg>
  ),
  "peach-bloom": (t) => (
    <svg
      viewBox="0 0 200 120"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <rect width="200" height="120" fill="#F0C8BC" />
      <circle cx="120" cy="55" r="55" fill="#F0A898" opacity="0.8" />
    </svg>
  ),
  workspace: (t) => (
    <svg
      viewBox="0 0 200 120"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <rect width="200" height="120" fill="#E8E2D8" />
      <rect x="0" y="75" width="200" height="45" fill="#C8A880" opacity="0.6" />
      <rect
        x="60"
        y="60"
        width="50"
        height="30"
        rx="2"
        fill="#999"
        opacity="0.4"
      />
      <line x1="60" y1="65" x2="110" y2="58" stroke="#888" strokeWidth="0.5" />
      <ellipse cx="50" cy="85" rx="12" ry="8" fill="#888" opacity="0.3" />
    </svg>
  ),
  spotlight: (t) => (
    <svg
      viewBox="0 0 200 120"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <rect width="200" height="120" fill="#0A0A0A" />
      <defs>
        <radialGradient id="sp1" cx="0.7" cy="0.5" r="0.4">
          <stop offset="0%" stopColor="#D4A840" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="120" fill="url(#sp1)" />
      <line x1="130" y1="95" x2="130" y2="45" stroke="#222" strokeWidth="4" />
      <circle cx="130" cy="42" r="3" fill="#D4A840" opacity="0.5" />
    </svg>
  ),
  "golden-curves": (t) => (
    <svg
      viewBox="0 0 200 120"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <rect width="200" height="120" fill="#F5EDE0" />
      <path
        d="M0 0 L200 0 L200 35 Q150 20 100 55 Q50 90 0 120 Z"
        fill="#E8A830"
        opacity="0.8"
      />
      <path
        d="M0 50 Q80 20 160 60 Q200 80 200 120 L0 120 Z"
        fill="#DDD0B0"
        opacity="0.6"
      />
    </svg>
  ),
};

interface DesignSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentForm: any;
  updateForm: (updates: any) => void;
  addNotification: (notification: any) => void;
}

export function DesignSidePanel({
  isOpen,
  onClose,
  currentForm,
  updateForm,
  addNotification,
}: DesignSidePanelProps) {
  const [designTab, setDesignTab] = useState<
    "custom" | "gallery" | "templates"
  >("gallery");
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [applyingTemplate, setApplyingTemplate] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && designTab === "templates" && templates.length === 0) {
      const fetchTemplates = async () => {
        try {
          setLoadingTemplates(true);
          const response = await fetch("/api/templates");
          const data = await response.json();
          if (data.success) {
            setTemplates(data.data);
          }
        } catch (error) {
          console.error("Error fetching templates:", error);
        } finally {
          setLoadingTemplates(false);
        }
      };
      fetchTemplates();
    }
  }, [isOpen, designTab, templates.length]);

  if (!isOpen) return null;

  const handleApplyTemplate = async (template: any) => {
    if (!currentForm || applyingTemplate) return;

    if (currentForm.fields && currentForm.fields.length > 0) {
      const confirmed = window.confirm(
        "Applying a template will replace all current questions and design settings. Are you sure you want to continue?",
      );
      if (!confirmed) return;
    }

    try {
      setApplyingTemplate(template.id);

      updateForm({
        ...currentForm,
        fields: template.templateData.fields || [],
        theme: template.templateData.theme || currentForm.theme,
      });

      addNotification({
        type: "success",
        title: "Template Applied",
        message: `Successfully applied "${template.name}"`,
        duration: 3000,
      });

      setDesignTab("gallery");
    } catch (error) {
      console.error("Error applying template:", error);
      addNotification({
        type: "error",
        title: "Error",
        message: "Failed to apply template",
        duration: 3000,
      });
    } finally {
      setApplyingTemplate(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-screen w-[380px] max-w-[90vw] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200">
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-800">Design</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="flex gap-0 border-b border-gray-100 -mb-[1px]">
            <button
              onClick={() => setDesignTab("gallery")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${designTab === "gallery" ? "border-[hsl(250,86%,66%)] text-[hsl(250,86%,66%)]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
            >
              Gallery
            </button>
            <button
              onClick={() => setDesignTab("custom")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${designTab === "custom" ? "border-[hsl(250,86%,66%)] text-[hsl(250,86%,66%)]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
            >
              My theme
            </button>
            <button
              onClick={() => setDesignTab("templates")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${designTab === "templates" ? "border-[hsl(250,86%,66%)] text-[hsl(250,86%,66%)]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
            >
              Templates
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto sidebar-scroll p-4 min-h-0">
          {designTab === "gallery" ? (
            <div className="grid grid-cols-2 gap-3">
              {THEME_GALLERY.map((t) => {
                const isActive =
                  currentForm?.theme?.primary_color === t.button &&
                  currentForm?.theme?.background_color === t.bg;
                const artRenderer = GALLERY_SVG_ART[t.id];
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      updateForm({
                        theme: {
                          ...currentForm?.theme,
                          primary_color: t.button,
                          background_color: t.bg,
                          text_color: t.question,
                          font_family: t.font,
                          border_radius: t.radius,
                          button_text_color: t.buttonText,
                          answer_color: t.answer,
                          gallery_theme_id: t.id,
                        },
                        brandKit: {
                          ...(currentForm as any)?.brandKit,
                          backgroundImageUrl: t.backgroundImage || "",
                        },
                      });
                    }}
                    className={`group relative rounded-xl overflow-hidden border-2 transition-all hover:shadow-lg ${isActive ? "border-[hsl(250,86%,66%)] shadow-lg ring-2 ring-[hsl(250,86%,66%)]/20" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <div className="relative w-full h-[90px] overflow-hidden">
                      {artRenderer ? (
                        artRenderer(t)
                      ) : (
                        <div
                          className="absolute inset-0"
                          style={{ backgroundColor: t.bg }}
                        />
                      )}
                      {/* Form preview overlay */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center px-3 py-2">
                        <div
                          className="text-[11px] font-semibold leading-tight drop-shadow-sm"
                          style={{ color: t.question, fontFamily: t.font }}
                        >
                          Question text
                        </div>
                        <div
                          className="text-[9px] mt-0.5 drop-shadow-sm"
                          style={{ color: t.answer, fontFamily: t.font }}
                        >
                          Your answer here
                        </div>
                        <div
                          className="mt-2 h-4 px-3 flex items-center justify-center text-[7px] font-bold shadow-sm"
                          style={{
                            backgroundColor: t.button,
                            color: t.buttonText,
                            borderRadius:
                              t.radius > 20
                                ? "999px"
                                : `${Math.min(t.radius, 4)}px`,
                            fontFamily: t.font,
                          }}
                        >
                          OK
                        </div>
                      </div>
                    </div>
                    {/* Theme name footer */}
                    <div className="flex items-center justify-between px-2.5 py-1.5 bg-white border-t border-gray-100">
                      <span className="text-[10px] font-medium text-gray-700 truncate">
                        {t.name}
                      </span>
                      {isActive && (
                        <CheckIcon className="h-3 w-3 text-[hsl(250,86%,66%)]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : designTab === "custom" ? (
            <div className="space-y-5">
              {/* Colors */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Colors
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">
                      Buttons
                    </label>
                    <input
                      type="color"
                      value={currentForm?.theme?.primary_color || "#6C5CE7"}
                      onChange={(e) =>
                        updateForm({
                          theme: {
                            ...currentForm?.theme,
                            primary_color: e.target.value,
                          },
                        })
                      }
                      className="w-full h-8 rounded-lg border border-gray-200 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">
                      Background
                    </label>
                    <input
                      type="color"
                      value={currentForm?.theme?.background_color || "#FFFFFF"}
                      onChange={(e) =>
                        updateForm({
                          theme: {
                            ...currentForm?.theme,
                            background_color: e.target.value,
                          },
                        })
                      }
                      className="w-full h-8 rounded-lg border border-gray-200 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">
                      Text
                    </label>
                    <input
                      type="color"
                      value={currentForm?.theme?.text_color || "#1F2937"}
                      onChange={(e) =>
                        updateForm({
                          theme: {
                            ...currentForm?.theme,
                            text_color: e.target.value,
                          },
                        })
                      }
                      className="w-full h-8 rounded-lg border border-gray-200 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Font */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Font
                </label>
                <select
                  value={currentForm?.theme?.font_family || "Inter, sans-serif"}
                  onChange={(e) =>
                    updateForm({
                      theme: {
                        ...currentForm?.theme,
                        font_family: e.target.value,
                      },
                    })
                  }
                  className="w-full h-9 rounded-lg border border-gray-200 text-sm px-3 bg-white"
                >
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="'DM Sans', sans-serif">DM Sans</option>
                  <option value="'Plus Jakarta Sans', sans-serif">
                    Plus Jakarta Sans
                  </option>
                  <option value="'Space Grotesk', sans-serif">
                    Space Grotesk
                  </option>
                  <option value="'Poppins', sans-serif">Poppins</option>
                  <option value="'Outfit', sans-serif">Outfit</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Merriweather', serif">Merriweather</option>
                  <option value="system-ui, sans-serif">System Default</option>
                </select>
              </div>

              <hr className="border-gray-100" />

              {/* Buttons Corner Radius */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Buttons
                </label>
                <div className="flex gap-2">
                  {[
                    { label: "Sharp", value: 0 },
                    { label: "Medium", value: 8 },
                    { label: "Round", value: 999 },
                  ].map((preset) => {
                    const isActive =
                      currentForm?.theme?.border_radius === preset.value;
                    const btnColor =
                      currentForm?.theme?.primary_color || "#6C5CE7";
                    const btnTextColor =
                      (currentForm?.theme as any)?.button_text_color ||
                      "#FFFFFF";
                    return (
                      <button
                        key={preset.label}
                        onClick={() =>
                          updateForm({
                            theme: {
                              ...currentForm?.theme,
                              border_radius: preset.value,
                            },
                          })
                        }
                        className={`flex-1 py-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${isActive ? "border-[hsl(250,86%,66%)] bg-[hsl(250,86%,66%)]/5" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                      >
                        <div
                          className="h-7 w-16 flex items-center justify-center text-[9px] font-semibold shadow-sm transition-all"
                          style={{
                            backgroundColor: btnColor,
                            color: btnTextColor,
                            borderRadius:
                              preset.value > 20 ? "999px" : `${preset.value}px`,
                          }}
                        >
                          OK
                        </div>
                        <span
                          className={`text-[10px] font-medium ${isActive ? "text-[hsl(250,86%,66%)]" : "text-gray-500"}`}
                        >
                          {preset.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : designTab === "templates" ? (
            <div className="space-y-4">
              <div className="px-1 mb-2 text-xs text-gray-500">
                Applying a template will overwrite your current form questions
                and design settings.
              </div>

              {loadingTemplates ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-[hsl(250,86%,66%)] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-10 text-sm text-gray-500">
                  No templates found.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="group relative rounded-xl border border-gray-200 bg-white overflow-hidden hover:border-[hsl(250,86%,66%)] transition-colors shadow-sm"
                    >
                      {/* Mini Thumbnail */}
                      {template.previewImage || template.thumbnail ? (
                        <div
                          className="w-full h-24 bg-cover bg-center border-b border-gray-100"
                          style={{
                            backgroundImage: `url(${template.previewImage || template.thumbnail})`,
                          }}
                        />
                      ) : (
                        <div className="w-full h-24 bg-blue-50 border-b border-gray-100 flex items-center justify-center">
                          <span className="text-indigo-200 font-semibold">
                            {template.name.charAt(0)}
                          </span>
                        </div>
                      )}

                      <div className="p-3">
                        <h4 className="font-semibold text-sm text-gray-800 line-clamp-1 mb-1">
                          {template.name}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-2 min-h-[32px]">
                          {template.description}
                        </p>

                        <button
                          onClick={() => handleApplyTemplate(template)}
                          disabled={applyingTemplate === template.id}
                          className="mt-3 w-full py-2 px-3 bg-gray-50 hover:bg-[hsl(250,86%,66%)]/10 text-[hsl(250,86%,66%)] text-xs font-semibold rounded-lg transition-colors border border-[hsl(250,86%,66%)]/20 flex items-center justify-center gap-2"
                        >
                          {applyingTemplate === template.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-[hsl(250,86%,66%)] border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <DocumentArrowDownIcon className="w-4 h-4" />
                          )}
                          Apply Template
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

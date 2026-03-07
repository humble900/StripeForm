"use client";

import React, { useState } from "react";
import {
  Bars3Icon,
  EyeIcon,
  DocumentArrowDownIcon,
  PlayIcon,
  Cog6ToothIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  SwatchIcon,
  XMarkIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  PaintBrushIcon,
  PlusIcon,
  ChevronDownIcon,
  CheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useFormBuilder } from "@/components/providers/FormBuilderProvider";
import { useNotifications } from "@/components/providers/NotificationProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { getPublishedFormUrl } from "@/lib/utils/url";

import { UpgradeModal } from "@/components/modals/UpgradeModal";
import { FormLimitMessage } from "@/components/ui/FormLimitMessage";
import { EnhancedPublishButton } from "./EnhancedPublishButton";
import { FormLevelSettings } from "./FormLevelSettings";
import { useZoomTracking } from "@/hooks/useZoomTracking";

// ——— Typeform-captured theme gallery presets ———
// Each theme has a unique SVG art background to make the gallery visually rich.
// The 'svgArt' is a function that takes colors and returns an inline SVG string.
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
  // Accent colors for SVG art (derived from theme palette)
  accent1: string;
  accent2: string;
  accent3: string;
  // Optional background image URL for image-based themes
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
  // ── Image-backed themes ──
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

// Unique SVG artwork generators per theme — organic blobs, waves, geometric patterns
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
  // ── Image-backed SVG art (gallery thumbnail approximations) ──
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
  // ── Batch 2: Image-backed SVG art ──
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

interface FormBuilderToolbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  inspectorOpen: boolean;
  setInspectorOpen: (open: boolean) => void;
}

export function FormBuilderToolbar({
  sidebarOpen,
  setSidebarOpen,
  inspectorOpen,
  setInspectorOpen,
}: FormBuilderToolbarProps) {
  const {
    state,
    dispatch,
    undo,
    redo,
    canUndo,
    canRedo,
    setPreviewMode,
    updateForm,
    saveForm,
    addField,
    selectField,
  } = useFormBuilder();
  const { addNotification } = useNotifications();
  const {
    user,
    isAuthenticated,
    isAnonymous,
    getUserTrackingData,
    checkAnonymousFormLimit,
    checkUserFormLimit,
  } = useAuth();
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  const [designTab, setDesignTab] = useState<
    "custom" | "gallery" | "templates"
  >("gallery");
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  // Template states
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [applyingTemplate, setApplyingTemplate] = useState<string | null>(null);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [formLimitInfo, setFormLimitInfo] = useState<{
    canCreate: boolean;
    currentCount: number;
    limit: number;
  } | null>(null);
  const [showLimitMessage, setShowLimitMessage] = useState(false);
  const [zoomWarning, setZoomWarning] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(100);

  // Browser zoom detection (Typeform pattern from bob-the-builder)
  useZoomTracking((pct, isZoomed) => {
    setZoomPercent(pct);
    setZoomWarning(isZoomed);
  });

  // Load form limit info for both authenticated and anonymous users (unless Pro)
  React.useEffect(() => {
    const loadFormLimitInfo = async () => {
      const shouldCheckLimits =
        isAnonymous || (isAuthenticated && user?.subscription_tier !== "pro");

      if (shouldCheckLimits) {
        try {
          let limitInfo;
          if (isAnonymous) {
            limitInfo = await checkAnonymousFormLimit();
          } else {
            limitInfo = await checkUserFormLimit();
          }

          setFormLimitInfo(limitInfo);
          setShowLimitMessage(limitInfo.currentCount >= limitInfo.limit);
        } catch (error) {
          console.error("Error loading form limit info:", error);
        }
      } else {
        setFormLimitInfo(null);
        setShowLimitMessage(false);
      }
    };

    loadFormLimitInfo();
  }, [
    isAnonymous,
    isAuthenticated,
    user?.subscription_tier,
    checkAnonymousFormLimit,
    checkUserFormLimit,
  ]);

  // Load templates when the templates tab is selected
  React.useEffect(() => {
    if (designTab === "templates" && templates.length === 0) {
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
  }, [designTab, templates.length]);

  const handleApplyTemplate = async (template: any) => {
    if (!state.current_form || applyingTemplate) return;

    // Confirm before overwriting form
    if (state.current_form.fields && state.current_form.fields.length > 0) {
      const confirmed = window.confirm(
        "Applying a template will replace all current questions and design settings. Are you sure you want to continue?",
      );
      if (!confirmed) return;
    }

    try {
      setApplyingTemplate(template.id);

      // Merge template data into current form
      updateForm({
        ...state.current_form,
        fields: template.templateData.fields || [],
        theme: template.templateData.theme || state.current_form.theme,
      });

      addNotification({
        type: "success",
        title: "Template Applied",
        message: `Successfully applied "${template.name}"`,
        duration: 3000,
      });

      setDesignTab("gallery"); // Switch back to gallery view after applying
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

  const handleSave = async () => {
    try {
      await saveForm();
      addNotification({
        type: "success",
        title: "Form Saved",
        message: "Your form has been saved successfully!",
        duration: 3000,
      });
    } catch (error) {
      addNotification({
        type: "error",
        title: "Save Failed",
        message: "Failed to save form. Please try again.",
        duration: 5000,
      });
    }
  };

  const handlePreview = () => {
    setPreviewMode(true);
  };

  const handleThemeEditor = () => {
    setShowThemeEditor(true);
    setInspectorOpen(false);
  };

  const handlePublish = async () => {
    try {
      if (isAuthenticated && user && user.subscription_tier === "pro") {
        await publishForm();
        return;
      }

      const shouldCheckLimits =
        isAnonymous || (isAuthenticated && user?.subscription_tier === "free");

      if (shouldCheckLimits) {
        let limitInfo;
        if (isAnonymous) {
          limitInfo = await checkAnonymousFormLimit();
        } else {
          limitInfo = await checkUserFormLimit();
        }

        setFormLimitInfo(limitInfo);

        if (!limitInfo.canCreate) {
          setShowUpgradeModal(true);
          return;
        }

        await publishForm();
      }
    } catch (error) {
      console.error("Error checking form limits:", error);
      addNotification({
        type: "error",
        title: "Publish Failed",
        message: "Failed to check form limits. Please try again.",
        duration: 5000,
      });
    }
  };

  const publishForm = async () => {
    try {
      const saved = await saveForm();

      if (state.current_form) {
        const formIdForUrl = saved?.id || state.current_form.id;
        updateForm({
          ...state.current_form,
          status: "published",
          isPublished: true,
          publishedUrl: getPublishedFormUrl(
            formIdForUrl,
            state.current_form?.slug,
          ),
          updated_at: new Date().toISOString(),
        });

        try {
          const updateData = {
            ...state.current_form,
            status: "published",
            isPublished: true,
            publishedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          let requestUserId = state.current_form?.user_id;
          if (!requestUserId && isAnonymous) {
            const trackingData = await getUserTrackingData();
            requestUserId = trackingData?.fingerprint;
          }

          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          };

          if (requestUserId) {
            headers["Authorization"] = `Bearer ${requestUserId}`;
            headers["x-fingerprint"] = requestUserId;
          }

          const response = await fetch(`/api/forms/${formIdForUrl}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(updateData),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error("Form update failed:", response.status, errorText);

            if (response.status === 404) {
              throw new Error(
                "Form not found. Please try saving the form first.",
              );
            } else if (response.status === 403) {
              throw new Error(
                "You do not have permission to update this form.",
              );
            } else if (response.status === 405) {
              throw new Error("Invalid update method. Please try again.");
            } else {
              throw new Error(
                `Failed to update form status: ${errorText || "Unknown error"}`,
              );
            }
          }

          const result = await response.json();

          if (result.data?.publishedUrl) {
            updateForm({
              ...state.current_form,
              publishedUrl: result.data.publishedUrl,
            });
          } else {
            const fallbackUrl = getPublishedFormUrl(
              formIdForUrl,
              state.current_form?.slug,
            );
            updateForm({
              ...state.current_form,
              publishedUrl: fallbackUrl,
            });
          }
        } catch (error) {
          console.error("Failed to update form status:", error);
          throw error;
        }
      }

      if (isAnonymous) {
        try {
          const trackingData = await getUserTrackingData();
          await fetch("/api/user/form-limits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fingerprint: trackingData.fingerprint,
              action: "increment",
            }),
          });
        } catch (error) {
          console.warn("Failed to increment anonymous form count:", error);
        }
      }

      localStorage.setItem("form-published", "true");

      addNotification({
        type: "success",
        title: "Form Published",
        message: "Your form is now live and ready to collect responses!",
        duration: 5000,
      });
    } catch (error) {
      console.error("Error publishing form:", error);
      addNotification({
        type: "error",
        title: "Publish Failed",
        message: "Failed to publish form. Please try again.",
        duration: 5000,
      });
    }
  };

  const handleUpgrade = () => {
    if (isAuthenticated) {
      window.location.href = "/pricing";
    } else {
      window.location.href = "/register?redirect=/pricing";
    }
  };

  return (
    <>
      <div className="builder-toolbar z-20 relative">
        <div className="flex items-center justify-between px-4 py-2.5 gap-2">
          {/* Left - Logo + Title + Mode Selector */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-lg font-extrabold gradient-text-brand flex-shrink-0 hidden sm:block">
              SF
            </span>

            <div className="min-w-0 max-w-[180px]">
              <input
                type="text"
                value={state.current_form?.title || ""}
                onChange={(e) => updateForm({ title: e.target.value })}
                className="text-sm font-semibold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-0 w-full placeholder:text-gray-400 truncate"
                placeholder="Untitled Form"
              />
            </div>

            {/* Mode Selector (Typeform-style) */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowModeDropdown(!showModeDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 transition-all border border-gray-200/80 shadow-sm"
              >
                {(state.current_form?.settings?.display_mode ||
                  "single_page") === "progressive" ? (
                  <>
                    <svg
                      className="w-3.5 h-3.5 text-[hsl(250,86%,66%)]"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <rect
                        x="2"
                        y="3"
                        width="12"
                        height="10"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <line
                        x1="5"
                        y1="7"
                        x2="11"
                        y2="7"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <line
                        x1="5"
                        y1="9.5"
                        x2="9"
                        y2="9.5"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        opacity="0.5"
                      />
                    </svg>
                    <span>Focus mode</span>
                  </>
                ) : (state.current_form?.settings?.display_mode ||
                    "single_page") === "grid" ? (
                  <>
                    <svg
                      className="w-3.5 h-3.5 text-emerald-500"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <rect
                        x="1"
                        y="1"
                        width="6"
                        height="6"
                        rx="1.2"
                        stroke="currentColor"
                        strokeWidth="1.3"
                      />
                      <rect
                        x="9"
                        y="1"
                        width="6"
                        height="6"
                        rx="1.2"
                        stroke="currentColor"
                        strokeWidth="1.3"
                      />
                      <rect
                        x="1"
                        y="9"
                        width="6"
                        height="6"
                        rx="1.2"
                        stroke="currentColor"
                        strokeWidth="1.3"
                      />
                      <rect
                        x="9"
                        y="9"
                        width="6"
                        height="6"
                        rx="1.2"
                        stroke="currentColor"
                        strokeWidth="1.3"
                      />
                    </svg>
                    <span>Grid</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3.5 h-3.5 text-gray-500"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <rect
                        x="2"
                        y="1"
                        width="12"
                        height="4"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="1.3"
                      />
                      <rect
                        x="2"
                        y="6.5"
                        width="12"
                        height="4"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="1.3"
                      />
                      <rect
                        x="2"
                        y="12"
                        width="12"
                        height="3"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="1.3"
                      />
                    </svg>
                    <span>Classic</span>
                  </>
                )}
                <ChevronDownIcon className="h-3 w-3 text-gray-400" />
              </button>

              {showModeDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowModeDropdown(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 w-72">
                    <p className="text-[10px] text-gray-400 px-2 py-1 uppercase tracking-wider font-semibold">
                      Form layout
                    </p>
                    {[
                      {
                        value: "progressive",
                        label: "Focus mode",
                        desc: "Show one question at a time with smooth transitions. Best for conversational forms.",
                        icon: (
                          <svg
                            className="w-5 h-5"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <rect
                              x="2"
                              y="4"
                              width="16"
                              height="12"
                              rx="3"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                            <line
                              x1="6"
                              y1="9"
                              x2="14"
                              y2="9"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                            <line
                              x1="6"
                              y1="12"
                              x2="11"
                              y2="12"
                              stroke="currentColor"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                              opacity="0.4"
                            />
                          </svg>
                        ),
                      },
                      {
                        value: "single_page",
                        label: "Classic",
                        desc: "All questions on a single scrollable page. Best for short forms and surveys.",
                        icon: (
                          <svg
                            className="w-5 h-5"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <rect
                              x="3"
                              y="2"
                              width="14"
                              height="5"
                              rx="1.5"
                              stroke="currentColor"
                              strokeWidth="1.3"
                            />
                            <rect
                              x="3"
                              y="8.5"
                              width="14"
                              height="5"
                              rx="1.5"
                              stroke="currentColor"
                              strokeWidth="1.3"
                            />
                            <rect
                              x="3"
                              y="15"
                              width="14"
                              height="3.5"
                              rx="1.5"
                              stroke="currentColor"
                              strokeWidth="1.3"
                            />
                          </svg>
                        ),
                      },
                      {
                        value: "grid",
                        label: "Grid",
                        desc: "Arrange questions in multi-column grid rows. Great for registration forms, checkouts & mini e-stores.",
                        icon: (
                          <svg
                            className="w-5 h-5"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <rect
                              x="2"
                              y="2"
                              width="7"
                              height="7"
                              rx="1.5"
                              stroke="currentColor"
                              strokeWidth="1.3"
                            />
                            <rect
                              x="11"
                              y="2"
                              width="7"
                              height="7"
                              rx="1.5"
                              stroke="currentColor"
                              strokeWidth="1.3"
                            />
                            <rect
                              x="2"
                              y="11"
                              width="7"
                              height="7"
                              rx="1.5"
                              stroke="currentColor"
                              strokeWidth="1.3"
                            />
                            <rect
                              x="11"
                              y="11"
                              width="7"
                              height="7"
                              rx="1.5"
                              stroke="currentColor"
                              strokeWidth="1.3"
                            />
                          </svg>
                        ),
                      },
                    ].map((mode) => {
                      const active =
                        (state.current_form?.settings?.display_mode ||
                          "single_page") === mode.value;
                      return (
                        <button
                          key={mode.value}
                          onClick={() => {
                            if (state.current_form) {
                              updateForm({
                                settings: {
                                  ...state.current_form.settings,
                                  display_mode: mode.value as any,
                                },
                              });
                            }
                            setShowModeDropdown(false);
                          }}
                          className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                            active
                              ? "bg-[hsl(250,86%,66%)]/8 ring-1 ring-[hsl(250,86%,66%)]/20"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div
                            className={`mt-0.5 flex-shrink-0 ${active ? "text-[hsl(250,86%,66%)]" : "text-gray-400"}`}
                          >
                            {mode.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-semibold ${active ? "text-[hsl(250,86%,66%)]" : "text-gray-700"}`}
                              >
                                {mode.label}
                              </span>
                              {active && (
                                <CheckIcon className="h-3.5 w-3.5 text-[hsl(250,86%,66%)]" />
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400 leading-snug mt-0.5">
                              {mode.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* ── Add Question ── */}
            <div className="relative">
              <button
                onClick={() => setShowAddQuestion(!showAddQuestion)}
                className="flex items-center justify-center gap-1.5 md:px-3 md:py-1.5 w-8 h-8 md:w-auto md:h-auto text-white bg-[#6C5CE7] hover:bg-opacity-90 rounded-full md:rounded-lg transition-colors text-xs font-medium border border-[#6C5CE7]/10"
                title="Add Question"
              >
                <PlusIcon
                  className="w-4 h-4 md:w-3.5 md:h-3.5"
                  strokeWidth={2.5}
                />
                <span className="hidden md:inline">Add question</span>
              </button>

              {showAddQuestion && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowAddQuestion(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/80 p-2 z-50 w-64 max-h-[420px] overflow-y-auto sidebar-scroll">
                    {[
                      {
                        cat: "Structure",
                        color: "#00B894",
                        items: [
                          {
                            type: "cover_slide",
                            label: "Welcome Screen",
                            isSpecial: true,
                          },
                          {
                            type: "end_page",
                            label: "Ending Screen",
                            isSpecial: true,
                          },
                        ],
                      },
                      {
                        cat: "Text",
                        color: "#6C5CE7",
                        items: [
                          { type: "short_text", label: "Short Text" },
                          { type: "long_text", label: "Long Text" },
                          { type: "email", label: "Email" },
                          { type: "phone", label: "Phone" },
                          { type: "number", label: "Number" },
                          { type: "url", label: "Website" },
                          { type: "name", label: "Name" },
                        ],
                      },
                      {
                        cat: "Choice",
                        color: "#0984E3",
                        items: [
                          { type: "multiple_choice", label: "Multiple Choice" },
                          { type: "dropdown", label: "Dropdown" },
                          { type: "yes_no", label: "Yes / No" },
                        ],
                      },
                      {
                        cat: "Rating",
                        color: "#FDCB6E",
                        items: [
                          { type: "rating", label: "Rating" },
                          { type: "nps", label: "NPS Score" },
                          { type: "linear_scale", label: "Opinion Scale" },
                          { type: "ranking", label: "Ranking" },
                        ],
                      },
                      {
                        cat: "Date & Time",
                        color: "#E17055",
                        items: [
                          { type: "date", label: "Date" },
                          { type: "time", label: "Time" },
                        ],
                      },
                      {
                        cat: "Media",
                        color: "#00CEC9",
                        items: [
                          { type: "file_upload", label: "File Upload" },
                          { type: "image_upload", label: "Image Upload" },
                          { type: "signature_upload", label: "Signature" },
                        ],
                      },
                      {
                        cat: "Other",
                        color: "#636E72",
                        items: [
                          { type: "payment", label: "Payment" },
                          { type: "address", label: "Address" },
                          { type: "matrix_grid", label: "Matrix" },
                          { type: "contact_info", label: "Contact Info" },
                          { type: "statement", label: "Statement" },
                          { type: "legal", label: "Legal" },
                        ],
                      },
                    ].map((group) => (
                      <div key={group.cat}>
                        <div className="flex items-center gap-1.5 px-2 pt-2.5 pb-1">
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: group.color }}
                          />
                          <p className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">
                            {group.cat}
                          </p>
                        </div>
                        {group.items.map((item) => (
                          <button
                            key={item.type}
                            onClick={() => {
                              const newField = {
                                id: `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                                type: item.type as any,
                                label: item.label,
                                required: false,
                                order:
                                  item.type === "cover_slide"
                                    ? -1
                                    : item.type === "end_page"
                                      ? 999
                                      : undefined,
                                options: [
                                  "multiple_choice",
                                  "dropdown",
                                  "checkbox",
                                  "radio",
                                ].includes(item.type)
                                  ? ["Choice 1", "Choice 2", "Choice 3"]
                                  : undefined,
                                settings: {},
                              };
                              addField(newField as any);
                              selectField(newField as any);
                              setShowAddQuestion(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all group ${
                              "isSpecial" in item && item.isSpecial
                                ? "bg-indigo-50/50 hover:bg-indigo-100/50 border border-indigo-100/50 mt-1 mb-1 shadow-sm"
                                : "hover:bg-[#6C5CE7]/5"
                            }`}
                          >
                            {"isSpecial" in item && item.isSpecial ? (
                              <div className="w-5 h-5 rounded-md bg-white border border-indigo-100 shadow-sm flex items-center justify-center flex-shrink-0">
                                <SparklesIcon className="w-3 h-3 text-indigo-600" />
                              </div>
                            ) : (
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0 opacity-60"
                                style={{ backgroundColor: group.color }}
                              />
                            )}
                            <span
                              className={`text-[12px] font-medium transition-colors ${
                                "isSpecial" in item && item.isSpecial
                                  ? "text-indigo-900 group-hover:text-indigo-700"
                                  : "text-gray-700 group-hover:text-[#6C5CE7]"
                              }`}
                            >
                              {item.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Center - Grouped Icon Actions */}
          <div className="flex items-center gap-1.5 bg-gray-100/60 rounded-full px-1 py-0.5">
            {/* Undo */}
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-1.5 text-gray-500 hover:text-gray-800 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <ArrowUturnLeftIcon className="h-3.5 w-3.5" />
            </button>
            {/* Redo */}
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-1.5 text-gray-500 hover:text-gray-800 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <ArrowUturnRightIcon className="h-3.5 w-3.5" />
            </button>

            <div className="w-px h-4 bg-gray-300/50" />

            {/* Single Device Toggle — shows opposite device */}
            <button
              onClick={() => {
                if (state.current_form) {
                  const currentDevice =
                    state.current_form.settings?.previewDevice || "desktop";
                  updateForm({
                    settings: {
                      ...state.current_form.settings,
                      previewDevice:
                        currentDevice === "mobile" ? "desktop" : "mobile",
                    },
                  });
                }
              }}
              className="p-1.5 text-gray-500 hover:text-[hsl(250,86%,66%)] rounded-full transition-colors"
              title={
                state.current_form?.settings?.previewDevice === "mobile"
                  ? "Switch to desktop"
                  : "Switch to mobile"
              }
            >
              {state.current_form?.settings?.previewDevice === "mobile" ? (
                <ComputerDesktopIcon className="h-3.5 w-3.5" />
              ) : (
                <DevicePhoneMobileIcon className="h-3.5 w-3.5" />
              )}
            </button>

            {/* Zoom Warning (Typeform-style browser zoom detection) */}
            {zoomWarning && (
              <span
                className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-amber-100 text-amber-700 whitespace-nowrap"
                title={`Browser zoom: ${zoomPercent}%`}
              >
                {zoomPercent}%
              </span>
            )}

            <div className="w-px h-4 bg-gray-300/50" />

            {/* Preview (icon only) */}
            <button
              onClick={handlePreview}
              className="p-1.5 text-gray-500 hover:text-[hsl(250,86%,66%)] rounded-full transition-colors"
              title="Preview"
            >
              <EyeIcon className="h-3.5 w-3.5" />
            </button>

            {/* Save (icon only) */}
            <button
              onClick={handleSave}
              disabled={state.is_saving}
              className="p-1.5 text-gray-500 hover:text-[hsl(250,86%,66%)] rounded-full disabled:opacity-30 transition-colors"
              title="Save"
            >
              <DocumentArrowDownIcon className="h-3.5 w-3.5" />
            </button>

            {/* Settings gear (icon only) */}
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-1.5 text-gray-500 hover:text-[hsl(250,86%,66%)] rounded-full transition-colors"
              title="Form Settings"
            >
              <Cog6ToothIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Right - Design + Publish + Status */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            {/* Save status indicator */}
            {state.has_unsaved_changes ? (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                <span className="hidden sm:inline">
                  {state.is_saving ? "Saving..." : "Unsaved"}
                </span>
              </div>
            ) : state.current_form?.updated_at ? (
              <div className="flex items-center gap-1.5 text-xs text-green-500">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <span className="hidden sm:inline">Saved</span>
              </div>
            ) : null}

            {/* Design button */}
            <button
              onClick={handleThemeEditor}
              className="builder-pill builder-pill-ghost hidden sm:inline-flex"
              title="Design"
            >
              <PaintBrushIcon className="h-4 w-4" />
              <span className="hidden lg:inline">Design</span>
            </button>

            {/* Publish */}
            <EnhancedPublishButton
              onPublish={handlePublish}
              isPublished={state.current_form?.isPublished || false}
              publishedUrl={state.current_form?.publishedUrl}
            />
          </div>
        </div>

        {/* Form Description - collapsible */}
        {state.current_form?.description && (
          <div className="px-4 pb-2">
            <textarea
              value={state.current_form?.description || ""}
              onChange={(e) => {
                updateForm({ description: e.target.value });
              }}
              className="text-xs text-gray-500 bg-transparent border-none focus:outline-none focus:ring-0 w-full resize-none placeholder:text-gray-300 max-w-md"
              placeholder="Add a description..."
              rows={1}
            />
          </div>
        )}

        {/* Form Limit Message */}
        {(isAnonymous ||
          (isAuthenticated && user?.subscription_tier !== "pro")) &&
          showLimitMessage &&
          formLimitInfo && (
            <div className="px-4 pb-2">
              <FormLimitMessage
                currentFormCount={formLimitInfo.currentCount}
                formLimit={formLimitInfo.limit}
                onUpgrade={handleUpgrade}
                onDismiss={() => setShowLimitMessage(false)}
                isAuthenticated={isAuthenticated}
              />
            </div>
          )}
      </div>

      {/* Design Side Panel (slides in from right) — rendered OUTSIDE toolbar div to avoid backdrop-filter containment */}
      {showThemeEditor && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowThemeEditor(false)}
          />
          <div className="fixed top-0 right-0 h-screen w-[380px] max-w-[90vw] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-800">
                  Design
                </h3>
                <button
                  onClick={() => setShowThemeEditor(false)}
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

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto sidebar-scroll p-4 min-h-0">
              {designTab === "gallery" ? (
                <div className="grid grid-cols-2 gap-3">
                  {THEME_GALLERY.map((t) => {
                    const isActive =
                      state.current_form?.theme?.primary_color === t.button &&
                      state.current_form?.theme?.background_color === t.bg;
                    const artRenderer = GALLERY_SVG_ART[t.id];
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          if (state.current_form) {
                            updateForm({
                              theme: {
                                ...state.current_form.theme,
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
                                ...(state.current_form as any).brandKit,
                                backgroundImageUrl: t.backgroundImage || "",
                              },
                            } as any);
                          }
                        }}
                        className={`group relative rounded-xl overflow-hidden border-2 transition-all hover:shadow-lg ${isActive ? "border-[hsl(250,86%,66%)] shadow-lg ring-2 ring-[hsl(250,86%,66%)]/20" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        {/* Artistic SVG background */}
                        <div className="relative w-full h-[90px] overflow-hidden">
                          {artRenderer ? (
                            artRenderer(t)
                          ) : (
                            <div
                              className="absolute inset-0"
                              style={{ backgroundColor: t.bg }}
                            />
                          )}
                          {/* Form preview overlay on top of art */}
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
                          value={
                            state.current_form?.theme?.primary_color ||
                            "#6C5CE7"
                          }
                          onChange={(e) => {
                            if (state.current_form)
                              updateForm({
                                theme: {
                                  ...state.current_form.theme,
                                  primary_color: e.target.value,
                                },
                              });
                          }}
                          className="w-full h-8 rounded-lg border border-gray-200 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-1">
                          Background
                        </label>
                        <input
                          type="color"
                          value={
                            state.current_form?.theme?.background_color ||
                            "#FFFFFF"
                          }
                          onChange={(e) => {
                            if (state.current_form)
                              updateForm({
                                theme: {
                                  ...state.current_form.theme,
                                  background_color: e.target.value,
                                },
                              });
                          }}
                          className="w-full h-8 rounded-lg border border-gray-200 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-1">
                          Text
                        </label>
                        <input
                          type="color"
                          value={
                            state.current_form?.theme?.text_color || "#1F2937"
                          }
                          onChange={(e) => {
                            if (state.current_form)
                              updateForm({
                                theme: {
                                  ...state.current_form.theme,
                                  text_color: e.target.value,
                                },
                              });
                          }}
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
                      value={
                        state.current_form?.theme?.font_family ||
                        "Inter, sans-serif"
                      }
                      onChange={(e) => {
                        if (state.current_form)
                          updateForm({
                            theme: {
                              ...state.current_form.theme,
                              font_family: e.target.value,
                            },
                          });
                      }}
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
                      <option value="'Merriweather', serif">
                        Merriweather
                      </option>
                      <option value="system-ui, sans-serif">
                        System Default
                      </option>
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
                          state.current_form?.theme?.border_radius ===
                          preset.value;
                        const btnColor =
                          state.current_form?.theme?.primary_color || "#6C5CE7";
                        const btnTextColor =
                          (state.current_form?.theme as any)
                            ?.button_text_color || "#FFFFFF";
                        return (
                          <button
                            key={preset.label}
                            onClick={() => {
                              if (state.current_form)
                                updateForm({
                                  theme: {
                                    ...state.current_form.theme,
                                    border_radius: preset.value,
                                  },
                                });
                            }}
                            className={`flex-1 py-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${isActive ? "border-[hsl(250,86%,66%)] bg-[hsl(250,86%,66%)]/5" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                          >
                            <div
                              className="h-7 w-16 flex items-center justify-center text-[9px] font-semibold shadow-sm transition-all"
                              style={{
                                backgroundColor: btnColor,
                                color: btnTextColor,
                                borderRadius:
                                  preset.value > 20
                                    ? "999px"
                                    : `${preset.value}px`,
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
                    Applying a template will overwrite your current form
                    questions and design settings.
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
      )}

      {/* Upgrade Modal */}
      {formLimitInfo && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={handleUpgrade}
          currentFormCount={formLimitInfo.currentCount}
          formLimit={formLimitInfo.limit}
          isAuthenticated={isAuthenticated}
        />
      )}
      {/* ====== FORM SETTINGS MODAL ====== */}
      {settingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setSettingsOpen(false)}
          />
          {/* Panel */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-[90vw] max-w-[720px] h-[80vh] max-h-[640px] flex flex-col overflow-hidden animate-fade-in">
            <FormLevelSettings />
            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => setSettingsOpen(false)}
                className="px-4 py-2 text-[13px] text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setSettingsOpen(false)}
                className="px-5 py-2 text-[13px] text-white bg-[#6C5CE7] hover:bg-[#5A4BD1] font-medium rounded-lg shadow-sm transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Inline loading component for smooth page transitions
 * Shows loading indicator without blocking the page
 */

import React from "react";
import { cn } from "@/lib/utils";

interface InlineLoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  variant?: "spinner" | "dots" | "pulse";
  position?: "top" | "center" | "bottom";
}

const InlineLoading: React.FC<InlineLoadingProps> = ({
  size = "md",
  className,
  text,
  variant = "spinner",
  position = "center",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const positionClasses = {
    top: "justify-start",
    center: "justify-center",
    bottom: "justify-end",
  };

  const renderSpinner = () => (
    <div
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent",
        sizeClasses[size],
        "text-blue-600",
      )}
      role="status"
      aria-label="Loading"
    />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-full bg-blue-600 animate-pulse",
            size === "sm" ? "w-1 h-1" : size === "md" ? "w-2 h-2" : "w-3 h-3",
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: "1s",
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div
      className={cn(
        "rounded-full bg-blue-600 animate-pulse",
        sizeClasses[size],
      )}
    />
  );

  const renderLoading = () => {
    switch (variant) {
      case "dots":
        return renderDots();
      case "pulse":
        return renderPulse();
      default:
        return renderSpinner();
    }
  };

  return (
    <div
      className={cn(
        "flex items-center space-x-2",
        positionClasses[position],
        className,
      )}
    >
      {renderLoading()}
      {text && (
        <span className={cn("text-gray-600", textSizeClasses[size])}>
          {text}
        </span>
      )}
    </div>
  );
};

export default InlineLoading;

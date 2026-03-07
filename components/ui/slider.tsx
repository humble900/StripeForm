"use client";

import React from "react";

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  max: number;
  min: number;
  step: number;
  className?: string;
}

const Slider: React.FC<SliderProps> = ({
  value,
  onValueChange,
  max,
  min,
  step,
  className = "",
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange([parseInt(e.target.value)]);
  };

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={handleChange}
      className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${className}`}
      style={{
        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(value[0] / max) * 100}%, #e5e7eb ${(value[0] / max) * 100}%, #e5e7eb 100%)`,
      }}
    />
  );
};

export default Slider;

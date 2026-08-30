"use client";

import Image from "next/image";
import { useState } from "react";

interface WatermarkImageProps {
  src: string;
  alt: string;
  aspectRatio?: "portrait" | "landscape" | "square" | "auto";
  showWatermark?: boolean;
  className?: string;
}

export default function WatermarkImage({
  src,
  alt,
  aspectRatio = "portrait",
  showWatermark = true,
  className = "",
}: WatermarkImageProps) {
  const [loaded, setLoaded] = useState(false);

  const aspectClasses = {
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
    square: "aspect-square",
    auto: "min-h-[300px]",
  };

  return (
    <div
      className={`relative overflow-hidden bg-[#161616]/5 ${aspectClasses[aspectRatio]} ${
        showWatermark ? "artevo-watermark" : ""
      } ${className}`}
    >
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-transform duration-700 hover:scale-105 ${
          loaded ? "opacity-100" : "opacity-90"
        }`}
        onLoad={() => setLoaded(true)}
      />
      {/* Subtle Frame Edge Shader */}
      <div className="absolute inset-0 pointer-events-none ring-1 ring-black/10 shadow-inner" />
    </div>
  );
}

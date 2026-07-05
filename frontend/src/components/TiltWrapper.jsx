"use client";

import { useState, useRef } from "react";

export default function TiltWrapper({ children, className = "" }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();

    // Mouse position relative to the element
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate normalized position (-1 to 1)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Max rotation is 12 degrees
    const rotateX = ((centerY - y) / centerY) * 12;
    const rotateY = ((x - centerX) / centerX) * 12;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const style = {
    transform: isHovered
      ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`
      : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
    transition: isHovered ? "none" : "all 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
    transformStyle: "preserve-3d",
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={`${className}`}
    >
      {children}
    </div>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import { useBook } from "../context/BookContext";

export const CinematicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useBook();
  const [lights, setLights] = useState([
    { x: 20, y: 30, color: "rgba(212, 175, 55, 0.08)", size: "45vw", duration: "25s", delay: "0s" },
    { x: 80, y: 70, color: "rgba(139, 0, 0, 0.05)", size: "55vw", duration: "35s", delay: "-5s" },
    { x: 50, y: 20, color: "rgba(26, 30, 41, 0.3)", size: "65vw", duration: "40s", delay: "-10s" },
    { x: 10, y: 80, color: "rgba(212, 175, 55, 0.05)", size: "35vw", duration: "30s", delay: "-15s" },
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Dynamic resize handler
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle class definition
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      fadeSpeed: number;
      targetOpacity: number;
    }

    const particlesArray: Particle[] = [];
    const count = 45; // Subtle, elegant particle count

    // Initialize particles
    for (let i = 0; i < count; i++) {
      const opacity = Math.random() * 0.4 + 0.1;
      particlesArray.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: -(Math.random() * 0.2 + 0.05), // upward float
        opacity,
        fadeSpeed: Math.random() * 0.005 + 0.002,
        targetOpacity: opacity,
      });
    }

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Set particle drawing color based on theme
      const particleColor = theme === "dark" ? "255, 255, 255" : "7, 7, 8";

      particlesArray.forEach((p) => {
        // Render particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleColor}, ${p.opacity})`;
        ctx.shadowBlur = theme === "dark" ? 4 : 0;
        ctx.shadowColor = `rgba(${particleColor}, 0.5)`;
        ctx.fill();

        // Update positions
        p.x += p.speedX;
        p.y += p.speedY;

        // Soft opacity pulsing
        if (Math.abs(p.opacity - p.targetOpacity) < 0.02) {
          p.targetOpacity = Math.random() * 0.5 + 0.05;
        }
        p.opacity += (p.targetOpacity - p.opacity) * p.fadeSpeed;

        // Reset if goes off-screen
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
          p.opacity = 0;
          p.targetOpacity = Math.random() * 0.4 + 0.1;
        }
        if (p.x < -10 || p.x > width + 10) {
          p.speedX = -p.speedX;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  // Adjust glows for Light Theme
  const lightColors = theme === "light";
  const glowThemeClass = lightColors 
    ? "bg-[#fcfbfa] text-[#070708]" 
    : "bg-[#070708] text-[#fcfbfa]";

  return (
    <div className={`fixed inset-0 w-full h-full -z-20 overflow-hidden transition-colors duration-1000 ${glowThemeClass}`}>
      {/* Cinematic Moving Light Spheres */}
      <div className="absolute inset-0 filter blur-[80px] md:blur-[120px] pointer-events-none opacity-60 md:opacity-85 mix-blend-screen dark:mix-blend-normal">
        {lights.map((light, index) => {
          // Adjust glow color in light theme for softer appearance
          let displayColor = light.color;
          if (lightColors) {
            if (light.color.includes("212, 175, 55")) {
              displayColor = "rgba(212, 175, 55, 0.04)"; // softer gold
            } else if (light.color.includes("139, 0, 0")) {
              displayColor = "rgba(230, 210, 210, 0.2)"; // beige-crimson
            } else {
              displayColor = "rgba(220, 222, 230, 0.4)"; // soft grey
            }
          }

          return (
            <div
              key={index}
              className="absolute rounded-full animate-float"
              style={{
                top: `${light.y}%`,
                left: `${light.x}%`,
                width: light.size,
                height: light.size,
                backgroundColor: displayColor,
                animationDuration: light.duration,
                animationDelay: light.delay,
                transform: "translate(-50%, -50%)",
              }}
            />
          );
        })}
      </div>

      {/* Canvas for Floating Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen opacity-70" />

      {/* Styled Ambient Lighting Overlay */}
      <div 
        className={`absolute inset-0 pointer-events-none mix-blend-overlay ${
          lightColors 
            ? "bg-gradient-to-tr from-stone-100/10 via-transparent to-stone-50/20" 
            : "bg-gradient-to-tr from-black/40 via-transparent to-amber-950/10"
        }`} 
      />
    </div>
  );
};

"use client";

import { useEffect, useRef } from "react";

interface SnowSettings {
  speed: number;
  density: number;
  size: number;
  windStrength: number;
}

interface SnowEffectProps {
  intensity?: "low" | "medium" | "high";
  snowSettings?: SnowSettings;
}

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wind: number;
  oscillationSpeed: number;
  oscillationOffset: number;
}

export default function SnowEffect({
  intensity = "medium",
  snowSettings,
}: SnowEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const snowflakesRef = useRef<Snowflake[]>([]);

  // Default settings if not provided
  const settings = {
    speed: snowSettings?.speed ?? 1.0,
    density: snowSettings?.density ?? 1.0,
    size: snowSettings?.size ?? 1.0,
    windStrength: snowSettings?.windStrength ?? 0.2,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match window
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // Initialize snowflakes
    const initSnowflakes = () => {
      let count = 50; // default for low
      if (intensity === "medium") count = 100;
      if (intensity === "high") count = 200;

      // Apply density multiplier
      count = Math.floor(count * settings.density);

      const snowflakes: Snowflake[] = [];
      for (let i = 0; i < count; i++) {
        snowflakes.push(createSnowflake(canvas.width, canvas.height));
      }
      snowflakesRef.current = snowflakes;
    };

    const createSnowflake = (width: number, height: number): Snowflake => {
      const baseSpeed = 1 + Math.random() * 2;
      const baseSize = 1 + Math.random() * 2;

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: baseSize * settings.size,
        speed: baseSpeed * settings.speed,
        wind: (Math.random() - 0.5) * settings.windStrength,
        oscillationSpeed: 0.02 + Math.random() * 0.02,
        oscillationOffset: Math.random() * Math.PI * 2,
      };
    };

    initSnowflakes();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Gradient for snow (subtle white)
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.beginPath();

      snowflakesRef.current.forEach((flake) => {
        // Update position
        flake.y += flake.speed;
        flake.x += flake.wind + Math.sin(flake.y * 0.01 + flake.oscillationOffset) * 0.5;

        // Wrap around
        if (flake.y > canvas.height) {
          flake.y = -5;
          flake.x = Math.random() * canvas.width;
        }
        if (flake.x > canvas.width) {
          flake.x = 0;
        } else if (flake.x < 0) {
          flake.x = canvas.width;
        }

        // Draw
        ctx.moveTo(flake.x, flake.y);
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      });

      ctx.fill();
      requestRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [intensity, settings.speed, settings.density, settings.size, settings.windStrength]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ pointerEvents: "none" }}
    />
  );
}

"use client";


import { useEffect, useRef } from "react";

interface RedEnvelopeSettings {
  fallSpeed: number;
  rotationSpeed: number;
  windStrength: number;
  sparkleFrequency: number;
  quantity?: number;
  minSize?: number;
  maxSize?: number;
  flipSpeed?: number;
  swaySpeed?: number;
  hue?: number;
}

interface RedEnvelopeEffectProps {
  intensity?: "low" | "medium" | "high";
  redEnvelopeSettings?: RedEnvelopeSettings;
}

interface RedEnvelope {
  x: number;
  y: number;
  rotation: number;
  rotationSpeed: number;
  speed: number;
  wind: number;
  size: number;
  flip: number;
  flipSpeed: number;
  velocityY: number;
  hue: number;
  swayPhase: number;
  swaySpeed: number;
}

interface Sparkle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  life: number;
  decay: number;
}

export default function RedEnvelopeEffect({
  intensity = "medium",
  redEnvelopeSettings,
}: RedEnvelopeEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const envelopesRef = useRef<RedEnvelope[]>([]);
  const sparklesRef = useRef<Sparkle[]>([]);

  const fallSpeed = redEnvelopeSettings?.fallSpeed ?? 0.3;
  const rotationSpeed = redEnvelopeSettings?.rotationSpeed ?? 1.0;
  const windStrength = redEnvelopeSettings?.windStrength ?? 0.3;
  const sparkleFrequency = redEnvelopeSettings?.sparkleFrequency ?? 0.02;
  const quantity = redEnvelopeSettings?.quantity;
  const minSize = redEnvelopeSettings?.minSize ?? 0.8;
  const maxSize = redEnvelopeSettings?.maxSize ?? 1.2;
  const flipSpeed = redEnvelopeSettings?.flipSpeed ?? 1.0;
  const swaySpeed = redEnvelopeSettings?.swaySpeed ?? 1.0;
  const hue = redEnvelopeSettings?.hue ?? 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationFrameId = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let targetCount = quantity;
    if (!targetCount) {
      targetCount = {
        low: 15,
        medium: 25,
        high: 40,
      }[intensity];
    }

    const createEnvelope = (yStart: number = -100): RedEnvelope => {
      const scale = minSize + Math.random() * (maxSize - minSize);

      return {
        x: Math.random() * canvas.width,
        y: yStart,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2 * rotationSpeed,
        speed: Math.random() * 1.5 + 0.5,
        wind: (Math.random() * 0.3 - 0.15) * windStrength,
        size: 40 * scale,
        flip: Math.random() * 2 - 1,
        flipSpeed: (Math.random() - 0.5) * 0.05 * flipSpeed,
        velocityY: (Math.random() * 0.8 + 0.2) * fallSpeed,
        hue: hue + Math.random() * 10,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: (Math.random() * 1 + 0.5) * swaySpeed,
      };
    };

    if (envelopesRef.current.length === 0) {
      envelopesRef.current = Array.from({ length: targetCount! }, () =>
        createEnvelope(Math.random() * canvas.height - canvas.height)
      );
    } else {
      if (envelopesRef.current.length < targetCount!) {
        const needed = targetCount! - envelopesRef.current.length;
        for (let i = 0; i < needed; i++) {
          envelopesRef.current.push(createEnvelope(Math.random() * -500));
        }
      } else if (envelopesRef.current.length > targetCount!) {
        envelopesRef.current = envelopesRef.current.slice(0, targetCount);
      }

      envelopesRef.current.forEach((env) => {
        const dir = Math.sign(env.rotationSpeed) || 1;
        env.rotationSpeed = dir * (Math.random() * 0.5 + 0.5) * rotationSpeed;
        
        const windDir = Math.sign(env.wind) || (Math.random() > 0.5 ? 1 : -1);
        env.wind = windDir * (Math.random() * 0.3) * windStrength;
      });
    }

    sparklesRef.current = [];

    const drawEnvelope = (envelope: RedEnvelope) => {
      ctx.save();
      ctx.translate(envelope.x, envelope.y);
      ctx.rotate((envelope.rotation * Math.PI) / 180);

      const width = envelope.size * Math.abs(envelope.flip);
      const height = envelope.size * 1.4;
      const isFront = envelope.flip > 0;
      const cornerRadius = 4;

      ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(-width / 2, -height / 2, width, height, cornerRadius);
      } else {
        ctx.rect(-width / 2, -height / 2, width, height);
      }
      ctx.clip();

      const gradient = ctx.createLinearGradient(-width / 2, -height / 2, width / 2, height / 2);
      const redHue = 0 + envelope.hue;
      gradient.addColorStop(0, `hsl(${redHue}, 85%, 55%)`);
      gradient.addColorStop(0.5, `hsl(${redHue}, 95%, 45%)`);
      gradient.addColorStop(1, `hsl(${redHue}, 85%, 35%)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(-width / 2, -height / 2, width, height);

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      const goldGradient = ctx.createLinearGradient(-width / 2, -height / 2, width / 2, height / 2);
      goldGradient.addColorStop(0, "#FFD700");
      goldGradient.addColorStop(0.3, "#FFFACD");
      goldGradient.addColorStop(0.6, "#FFD700");
      goldGradient.addColorStop(1, "#B8860B");

      ctx.strokeStyle = goldGradient;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(-width / 2, -height / 2, width, height, cornerRadius);
      } else {
        ctx.rect(-width / 2, -height / 2, width, height);
      }
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 165, 0, 0.7)";
      ctx.lineWidth = 1;
      ctx.strokeRect(-width / 2 + 3, -height / 2 + 3, width - 6, height - 6);

      ctx.fillStyle = "rgba(255, 215, 0, 0.3)";
      const cornerSize = envelope.size * 0.15;
      ctx.fillRect(-width / 2, -height / 2, cornerSize, cornerSize);
      ctx.fillRect(width / 2 - cornerSize, -height / 2, cornerSize, cornerSize);
      ctx.fillRect(-width / 2, height / 2 - cornerSize, cornerSize, cornerSize);
      ctx.fillRect(width / 2 - cornerSize, height / 2 - cornerSize, cornerSize, cornerSize);

      if (isFront && width > envelope.size * 0.3) {
        ctx.save();
        ctx.scale(Math.abs(envelope.flip), 1);
        ctx.shadowColor = "#FFD700";
        ctx.shadowBlur = 10;
        ctx.fillStyle = goldGradient;
        ctx.font = `bold ${envelope.size * 0.6}px "SimSun", serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("福", 0, 0);
        ctx.shadowBlur = 2;
        ctx.shadowColor = "#8B4513";
        ctx.fillText("福", 0, 0);
        ctx.restore();
      }

      ctx.restore();

      if (Math.random() < sparkleFrequency && sparklesRef.current.length < 100) {
        sparklesRef.current.push({
          x: envelope.x + (Math.random() - 0.5) * width,
          y: envelope.y + (Math.random() - 0.5) * height,
          size: Math.random() * 2 + 1,
          opacity: 1,
          life: 1,
          decay: 0.02 + Math.random() * 0.03,
        });
      }
    };

    const drawSparkle = (sparkle: Sparkle) => {
      ctx.save();
      ctx.fillStyle = `rgba(255, 215, 0, ${sparkle.opacity * sparkle.life})`;
      ctx.shadowColor = "#FFD700";
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    let time = 0;
    const animate = () => {
      time += 0.05;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparklesRef.current.forEach((sparkle, index) => {
        drawSparkle(sparkle);
        sparkle.life -= sparkle.decay;
        sparkle.y -= 0.5;
        if (sparkle.life <= 0) {
          sparklesRef.current.splice(index, 1);
        }
      });

      envelopesRef.current.forEach((envelope) => {
        drawEnvelope(envelope);

        envelope.velocityY += 0.005;
        const maxVelocity = 2.0 * fallSpeed;
        envelope.velocityY = Math.min(envelope.velocityY, maxVelocity);

        envelope.y += envelope.velocityY;

        const sway = Math.sin(time * (envelope.swaySpeed || 1) + (envelope.swayPhase || 0));
        envelope.x += envelope.wind + sway * 0.5;

        envelope.rotation += envelope.rotationSpeed;

        envelope.flip += envelope.flipSpeed;
        if (envelope.flip > 1) {
          envelope.flip = 1;
          envelope.flipSpeed = -Math.abs(envelope.flipSpeed);
        } else if (envelope.flip < -1) {
          envelope.flip = -1;
          envelope.flipSpeed = Math.abs(envelope.flipSpeed);
        }

        if (envelope.y > canvas.height + 20) {
             envelope.y = -50;
             envelope.x = Math.random() * canvas.width;
             Object.assign(envelope, createEnvelope(-50));
        }

        if (envelope.x > canvas.width + 50) {
          envelope.x = -50;
        } else if (envelope.x < -50) {
          envelope.x = canvas.width + 50;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [
    intensity,
    fallSpeed,
    rotationSpeed,
    windStrength,
    sparkleFrequency,
    quantity,
    minSize,
    maxSize,
    flipSpeed,
    swaySpeed,
    hue,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ pointerEvents: "none" }}
    />
  );
}

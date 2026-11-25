"use client";

import React, { useEffect, useRef } from "react";

interface OrbitNode {
  label: string;
  color: string;
  ring: number;
  angle: number;
  speed: number;
}

const NODES: OrbitNode[] = [
  { label: "DAZU", color: "#10b981", ring: 0.24, angle: 0.3, speed: 0.14 },
  { label: "BetyChef", color: "#f59e0b", ring: 0.33, angle: 2.1, speed: -0.11 },
  { label: "Egy-V", color: "#d97706", ring: 0.42, angle: 4.0, speed: 0.09 },
  { label: "GTM", color: "#38bdf8", ring: 0.24, angle: 3.4, speed: 0.14 },
  { label: "MBA", color: "#a78bfa", ring: 0.33, angle: 5.2, speed: -0.11 },
  { label: "AI Tools", color: "#d8ff3e", ring: 0.42, angle: 1.0, speed: 0.09 },
  { label: "Brand & UX", color: "#f472b6", ring: 0.5, angle: 2.8, speed: -0.07 },
  { label: "Growth", color: "#34d399", ring: 0.5, angle: 5.9, speed: -0.07 },
];

export function OrbitalHeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dead = false;
    let rafId = 0;
    const start = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const draw = (now: number) => {
      if (dead) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.min(w, h) * 0.92;
      const elapsed = (now - start) / 1000;
      const bloom = reduce ? 1 : Math.min(1, elapsed / 1.15);
      const easeBloom = 1 - Math.pow(1 - bloom, 3);

      const isDark =
        document.documentElement.getAttribute("data-theme") === "dark";
      const ringColor = isDark
        ? "rgba(244, 242, 239, 0.08)"
        : "rgba(20, 20, 20, 0.08)";
      const tickColor = isDark
        ? "rgba(244, 242, 239, 0.14)"
        : "rgba(20, 20, 20, 0.12)";
      const labelBg = isDark
        ? "rgba(16, 18, 23, 0.85)"
        : "rgba(255, 255, 255, 0.85)";
      const labelInk = isDark ? "#f4f2ef" : "#141414";

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Draw subtle orbital rings & radial ticks
      const rings = [0.24, 0.33, 0.42, 0.5];
      rings.forEach((rFrac) => {
        const r = maxR * rFrac * easeBloom;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Radial tick marks on outer ring
      const outerR = maxR * 0.5 * easeBloom;
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2;
        const inner = outerR - (i % 3 === 0 ? 8 : 4);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
        ctx.lineTo(cx + Math.cos(a) * outerR, cy + Math.sin(a) * outerR);
        ctx.strokeStyle = tickColor;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw orbiting pillar nodes + glowing arc trails
      NODES.forEach((node) => {
        const r = maxR * node.ring * easeBloom;
        const a = node.angle + (reduce ? 0 : elapsed * node.speed);
        const trailLen = 0.55 * (node.speed >= 0 ? -1 : 1);

        // Glowing arc trail
        ctx.beginPath();
        ctx.arc(
          cx,
          cy,
          r,
          Math.min(a, a + trailLen),
          Math.max(a, a + trailLen)
        );
        ctx.strokeStyle = node.color;
        ctx.globalAlpha = 0.42 * easeBloom;
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.globalAlpha = 1;

        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;

        // Node pill
        ctx.font = "500 11px ui-monospace, SFMono-Regular, Menlo, monospace";
        const textW = ctx.measureText(node.label).width;
        const padX = 10;
        const pillW = textW + padX * 2 + 8;
        const pillH = 24;

        ctx.save();
        ctx.globalAlpha = 0.88 * easeBloom;
        ctx.fillStyle = labelBg;
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x - pillW / 2, y - pillH / 2, pillW, pillH, 999);
        ctx.fill();
        ctx.stroke();

        // Colored dot
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(x - pillW / 2 + 10, y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = labelInk;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(node.label, x - pillW / 2 + 17, y + 0.5);
        ctx.restore();
      });

      if (!reduce) {
        rafId = requestAnimationFrame(draw);
      }
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      dead = true;
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="ac-orbital-canvas" aria-hidden="true" />;
}

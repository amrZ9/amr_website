"use client";

import React, { useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";

const CROWD_SPRITES = [
  "/footer/bengaluru/crowd-01.webp",
  "/footer/bengaluru/crowd-02.webp",
  "/footer/bengaluru/crowd-03.webp",
  "/footer/bengaluru/crowd-04.webp",
  "/footer/bengaluru/crowd-05.webp",
  "/footer/bengaluru/crowd-06.webp",
  "/footer/bengaluru/crowd-07.webp",
];

interface Walker {
  imgIdx: number;
  x: number;
  speed: number;
  scale: number;
  layer: "back" | "front";
  flip: boolean;
}

interface CrowdSceneProps {
  descId: string;
}

export function CrowdScene({ descId }: CrowdSceneProps) {
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const sceneRef = useRef<HTMLButtonElement>(null);
  const backCanvasRef = useRef<HTMLCanvasElement>(null);
  const frontCanvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const scene = sceneRef.current;
    const backCanvas = backCanvasRef.current;
    const frontCanvas = frontCanvasRef.current;
    if (!scene || !backCanvas || !frontCanvas) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setReady(true);
      return;
    }

    let dead = false;
    let rafId = 0;
    const images: HTMLImageElement[] = [];
    let loaded = 0;

    const walkers: Walker[] = Array.from({ length: 18 }, (_, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      const layer = i % 3 === 0 ? "back" : "front";
      return {
        imgIdx: i % CROWD_SPRITES.length,
        x: (i / 18) * 1400 - 100,
        speed: dir * (35 + (i % 5) * 12),
        scale: layer === "back" ? 0.52 + (i % 3) * 0.04 : 0.62 + (i % 4) * 0.05,
        layer,
        flip: dir < 0,
      };
    });

    const resize = () => {
      const rect = scene.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      [backCanvas, frontCanvas].forEach((c) => {
        c.width = Math.max(1, Math.floor(rect.width * dpr));
        c.height = Math.max(1, Math.floor(rect.height * dpr));
      });
    };

    const ro = new ResizeObserver(resize);
    ro.observe(scene);
    resize();

    let last = 0;
    const draw = (now: number) => {
      if (dead) return;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
      last = now;

      const rect = scene.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = rect.width;
      const h = rect.height;

      const bCtx = backCanvas.getContext("2d");
      const fCtx = frontCanvas.getContext("2d");

      if (bCtx && fCtx && w > 0 && h > 0) {
        bCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        fCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        bCtx.clearRect(0, 0, w, h);
        fCtx.clearRect(0, 0, w, h);

        walkers.forEach((wk) => {
          if (!pausedRef.current) {
            wk.x += wk.speed * dt;
            if (wk.speed > 0 && wk.x > w + 180) wk.x = -180;
            if (wk.speed < 0 && wk.x < -180) wk.x = w + 180;
          }
          const img = images[wk.imgIdx];
          if (!img || !img.complete || !img.naturalWidth) return;
          const targetH = h * wk.scale;
          const targetW = (img.naturalWidth / img.naturalHeight) * targetH;
          const ctx = wk.layer === "back" ? bCtx : fCtx;
          ctx.save();
          ctx.translate(wk.x, h - targetH);
          if (wk.flip) {
            ctx.scale(-1, 1);
            ctx.drawImage(img, -targetW, 0, targetW, targetH);
          } else {
            ctx.drawImage(img, 0, 0, targetW, targetH);
          }
          ctx.restore();
        });
      }

      rafId = requestAnimationFrame(draw);
    };

    CROWD_SPRITES.forEach((src, idx) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loaded++;
        if (loaded === CROWD_SPRITES.length && !dead) {
          setReady(true);
        }
      };
      images[idx] = img;
    });

    rafId = requestAnimationFrame(draw);

    return () => {
      dead = true;
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return (
    <>
      <p id={descId} className="sr-only">
        {profile.footer.crowdDescription}
      </p>
      <button
        ref={sceneRef}
        type="button"
        className="footer-crowd-scene"
        aria-label={`${profile.footer.crowdName} ${
          paused ? "Resume" : "Pause"
        } crowd animation`}
        aria-describedby={descId}
        aria-pressed={paused}
        onClick={() => setPaused((p) => !p)}
        data-ready={String(ready)}
      >
        <span className="footer-crowd-name" aria-hidden="true">
          {profile.footer.crowdName}
        </span>
        <canvas
          ref={backCanvasRef}
          className="footer-crowd-layer footer-crowd-back"
          aria-hidden="true"
        />
        <img
          className="footer-crowd-portrait"
          src={profile.footer.crowdPortrait}
          alt=""
          width={375}
          height={1400}
          loading="eager"
        />
        <canvas
          ref={frontCanvasRef}
          className="footer-crowd-layer footer-crowd-front"
          aria-hidden="true"
        />
      </button>
    </>
  );
}

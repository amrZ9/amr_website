"use client";

import React, { useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";

const WALKER_SPRITES = Array.from(
  { length: 14 },
  (_, i) => `/footer/street/walk-${String(i + 1).padStart(2, "0")}.webp`
);

const FAST_SPRITES = Array.from(
  { length: 3 },
  (_, i) => `/footer/street/fast-${String(i + 1).padStart(2, "0")}.webp`
);

const STILL_SPRITES = Array.from(
  { length: 6 },
  (_, i) => `/footer/street/still-${String(i + 1).padStart(2, "0")}.webp`
);

interface Actor {
  kind: "walk" | "fast";
  imgIdx: number;
  x: number;
  z: number; // 0 = far back, 1 = foreground
  speed: number;
  phase: number;
  bobFreq: number;
  flip: boolean;
}

interface StillProp {
  imgIdx: number;
  xRatio: number; // 0..1 across width
  z: number;
  flip: boolean;
}

interface CrowdSceneProps {
  descId: string;
}

export function CrowdScene({ descId }: CrowdSceneProps) {
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [entered, setEntered] = useState(false);
  const sceneRef = useRef<HTMLButtonElement>(null);
  const backCanvasRef = useRef<HTMLCanvasElement>(null);
  const frontCanvasRef = useRef<HTMLCanvasElement>(null);
  const portraitRef = useRef<HTMLImageElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const pausedRef = useRef(paused);
  const enteredAtRef = useRef<number | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Trigger Amr's entrance when the footer scrolls into view
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setEntered(true);
      enteredAtRef.current = -10000;
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setEntered(true);
          if (enteredAtRef.current === null) {
            enteredAtRef.current = performance.now();
          }
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(scene);
    return () => io.disconnect();
  }, []);

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

    const loadList = (srcs: string[]) =>
      srcs.map((src) => {
        const img = new Image();
        img.src = src;
        return img;
      });

    const walkImgs = loadList(WALKER_SPRITES);
    const fastImgs = loadList(FAST_SPRITES);
    const stillImgs = loadList(STILL_SPRITES);

    let loaded = 0;
    const allImgs = [...walkImgs, ...fastImgs, ...stillImgs];
    allImgs.forEach((img) => {
      img.onload = () => {
        loaded++;
        if (loaded === Math.min(8, allImgs.length) && !dead) {
          setReady(true);
        }
      };
    });

    // Calm ambient Egyptian street vignettes on the far left & right
    const stills: StillProp[] = [
      { imgIdx: 0, xRatio: 0.08, z: 0.38, flip: false }, // Foul cart left
      { imgIdx: 5, xRatio: 0.21, z: 0.24, flip: false }, // Oud player back-left
      { imgIdx: 3, xRatio: 0.89, z: 0.34, flip: true },  // Newspaper reader right
      { imgIdx: 1, xRatio: 0.77, z: 0.22, flip: true },  // Grandma & cat back-right
    ];

    // Uncrowded, natural-depth walkers (7 walkers + 1 occasional fast scooter/jogger)
    const depthSlots = [0.22, 0.35, 0.48, 0.56, 0.64, 0.78, 0.88];
    const actors: Actor[] = depthSlots.map((z, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      const baseSpeed = 24 + z * 34 + (i % 3) * 6;
      return {
        kind: "walk",
        imgIdx: (i * 2) % WALKER_SPRITES.length,
        x: ((i + 0.3) / depthSlots.length) * 1400 - 120,
        z,
        speed: dir * baseSpeed,
        phase: i * 1.7,
        bobFreq: 5.2 + (i % 3) * 0.7,
        flip: dir < 0,
      };
    });

    // 1 fast mover (delivery scooter / jogger) in mid-back
    actors.push({
      kind: "fast",
      imgIdx: 0,
      x: -260,
      z: 0.52,
      speed: 115,
      phase: 0,
      bobFreq: 18,
      flip: false,
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

    const drawSprite = (
      ctx: CanvasRenderingContext2D,
      img: HTMLImageElement,
      x: number,
      groundY: number,
      targetH: number,
      flip: boolean,
      bobY: number,
      tiltRad: number,
      alpha: number
    ) => {
      if (!img || !img.complete || !img.naturalWidth) return;
      const targetW = (img.naturalWidth / img.naturalHeight) * targetH;

      // Soft ground shadow
      ctx.save();
      ctx.globalAlpha = alpha * 0.14;
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.ellipse(
        x + targetW * 0.5,
        groundY - 2,
        targetW * 0.34,
        Math.max(2.5, targetH * 0.025),
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x + targetW * 0.5, groundY - bobY);
      if (tiltRad) ctx.rotate(tiltRad);
      if (flip) ctx.scale(-1, 1);
      ctx.drawImage(img, -targetW * 0.5, -targetH, targetW, targetH);
      ctx.restore();
    };

    let last = 0;
    const draw = (now: number) => {
      if (dead) return;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
      last = now;

      const rect = scene.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = rect.width;
      const h = rect.height;

      // Animate Amr's walk-in from the background & AMR. edge-in reveal
      if (enteredAtRef.current !== null) {
        const elapsed = (now - enteredAtRef.current) / 1000;
        const portraitEl = portraitRef.current;
        const nameEl = nameRef.current;

        // Portrait emerges from 0.9s -> 2.7s
        if (portraitEl) {
          const tRaw = Math.max(0, Math.min(1, (elapsed - 0.9) / 1.8));
          const ease = 1 - Math.pow(1 - tRaw, 3); // cubic ease-out
          const scale = 0.36 + ease * 0.64;
          const riseY = (1 - ease) * -58; // starts higher on horizon
          const walkBob =
            tRaw > 0 && tRaw < 1
              ? -Math.abs(Math.sin(tRaw * Math.PI * 5)) * (1 - tRaw * 0.6) * 7
              : 0;
          const opacity = Math.min(1, tRaw * 2.2);
          const blur = (1 - ease) * 1.8;

          portraitEl.style.opacity = String(opacity);
          portraitEl.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none";
          portraitEl.style.transformOrigin = "bottom center";
          portraitEl.style.transform = `translate(-50%, ${(riseY + walkBob).toFixed(1)}px) scale(${scale.toFixed(3)})`;
        }

        // AMR. text edges in from 1.7s -> 3.1s
        if (nameEl) {
          const nRaw = Math.max(0, Math.min(1, (elapsed - 1.7) / 1.4));
          const nEase = 1 - Math.pow(1 - nRaw, 3);
          const clipBottom = (1 - nEase) * 100;
          nameEl.style.opacity = String(nEase);
          nameEl.style.clipPath = `inset(0 0 ${clipBottom.toFixed(1)}% 0)`;
        }
      }

      const bCtx = backCanvas.getContext("2d");
      const fCtx = frontCanvas.getContext("2d");

      if (bCtx && fCtx && w > 0 && h > 0) {
        bCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        fCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        bCtx.clearRect(0, 0, w, h);
        fCtx.clearRect(0, 0, w, h);

        // Update actors
        actors.forEach((a) => {
          if (!pausedRef.current) {
            a.x += a.speed * dt;
            a.phase += a.bobFreq * dt;
            const margin = a.kind === "fast" ? 360 : 180;
            if (a.speed > 0 && a.x > w + margin) {
              a.x = -margin;
              a.imgIdx =
                (a.imgIdx + 3) %
                (a.kind === "fast" ? FAST_SPRITES.length : WALKER_SPRITES.length);
            } else if (a.speed < 0 && a.x < -margin) {
              a.x = w + margin;
              a.imgIdx =
                (a.imgIdx + 3) %
                (a.kind === "fast" ? FAST_SPRITES.length : WALKER_SPRITES.length);
            }
          }
        });

        // Build depth-sorted render list for back layer (z < 0.72) and front layer (z >= 0.72)
        type DrawItem = {
          z: number;
          run: (ctx: CanvasRenderingContext2D) => void;
        };
        const backItems: DrawItem[] = [];
        const frontItems: DrawItem[] = [];

        // Ground plane: z=0 -> 80% height, z=1 -> 98% height
        const groundForZ = (z: number) => h * (0.78 + z * 0.2);
        const heightForZ = (z: number) => h * (0.28 + z * 0.34);

        // Stationary ambient street life (always in back layer, softly framed on edges)
        stills.forEach((s) => {
          backItems.push({
            z: s.z,
            run: (ctx) => {
              const img = stillImgs[s.imgIdx];
              const targetH = heightForZ(s.z) * 0.95;
              const x = s.xRatio * w - targetH * 0.4;
              drawSprite(
                ctx,
                img,
                x,
                groundForZ(s.z),
                targetH,
                s.flip,
                0,
                0,
                0.78 + s.z * 0.2
              );
            },
          });
        });

        // Moving walkers & fast movers
        actors.forEach((a) => {
          const item: DrawItem = {
            z: a.z,
            run: (ctx) => {
              const img = a.kind === "fast" ? fastImgs[a.imgIdx] : walkImgs[a.imgIdx];
              const targetH = heightForZ(a.z) * (a.kind === "fast" ? 0.92 : 1);
              const bobY =
                a.kind === "fast"
                  ? Math.sin(a.phase) * 1.4
                  : Math.abs(Math.sin(a.phase)) * (2.5 + a.z * 3.5);
              const tilt =
                a.kind === "fast" ? 0 : Math.sin(a.phase) * 0.018;
              const alpha = 0.72 + a.z * 0.28;
              drawSprite(
                ctx,
                img,
                a.x,
                groundForZ(a.z),
                targetH,
                a.flip,
                bobY,
                tilt,
                alpha
              );
            },
          };
          if (a.z < 0.72) backItems.push(item);
          else frontItems.push(item);
        });

        backItems.sort((a, b) => a.z - b.z).forEach((it) => it.run(bCtx));
        frontItems.sort((a, b) => a.z - b.z).forEach((it) => it.run(fCtx));
      }

      rafId = requestAnimationFrame(draw);
    };

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
        data-entered={String(entered)}
      >
        <span
          ref={nameRef}
          className="footer-crowd-name"
          aria-hidden="true"
          style={{ opacity: 0 }}
        >
          {profile.footer.crowdName}
        </span>
        <canvas
          ref={backCanvasRef}
          className="footer-crowd-layer footer-crowd-back"
          aria-hidden="true"
        />
        <img
          ref={portraitRef}
          className="footer-crowd-portrait"
          src={profile.footer.crowdPortrait}
          alt=""
          width={332}
          height={975}
          loading="eager"
          style={{ opacity: 0 }}
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

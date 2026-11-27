"use client";

import React, { useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";
import {
  STREET_NPCS,
  STREET_POIS,
  type NpcDefinition,
} from "@/data/streetWorld";

type NpcState = "walking" | "pausing" | "ambient";

interface LiveNpc {
  def: NpcDefinition;
  imgs: HTMLImageElement[];
  x: number;
  z: number;
  targetX: number;
  targetZ: number;
  vx: number;
  vz: number;
  state: NpcState;
  waitTimer: number;
  phase: number;
  flip: boolean;
  visitedPoi: boolean;
  effectTimer: number;
}

interface Particle {
  kind: "steam" | "music" | "exhaust";
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  glyph?: string;
}

interface CrowdSceneProps {
  descId: string;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

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
    let loadedCount = 0;

    const initialW = Math.max(scene.getBoundingClientRect().width, 1000);

    // Build live NPCs from STREET_NPCS
    const npcs: LiveNpc[] = STREET_NPCS.map((def, idx) => {
      const imgs = def.frames.map((src) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          loadedCount++;
          if (loadedCount === Math.min(6, STREET_NPCS.length) && !dead) {
            setReady(true);
          }
        };
        return img;
      });

      const [minZ, maxZ] = def.zRange;
      if (def.behavior === "ambient") {
        const poi = def.homePoi ? STREET_POIS[def.homePoi] : undefined;
        return {
          def,
          imgs,
          x: (poi ? poi.xRatio : 0.15) * initialW,
          z: poi ? poi.z : minZ,
          targetX: (poi ? poi.xRatio : 0.15) * initialW,
          targetZ: poi ? poi.z : minZ,
          vx: 0,
          vz: 0,
          state: "ambient",
          waitTimer: 0,
          phase: idx * 1.3,
          flip: Boolean(def.defaultFlip),
          visitedPoi: false,
          effectTimer: rand(0.2, 1.2),
        };
      }

      const startZ = rand(minZ, maxZ);
      const startX =
        def.behavior === "cruiser"
          ? -240
          : ((idx + 0.5) / STREET_NPCS.length) * initialW;
      const goRight = idx % 2 === 0;
      const targetX = goRight ? initialW + 160 : -160;

      return {
        def,
        imgs,
        x: startX,
        z: startZ,
        targetX,
        targetZ: rand(minZ, maxZ),
        vx: 0,
        vz: 0,
        state: "walking",
        waitTimer: 0,
        phase: idx * 1.9,
        flip: !goRight,
        visitedPoi: false,
        effectTimer: rand(0.1, 0.4),
      };
    });

    const particles: Particle[] = [];

    const pickNextRoute = (npc: LiveNpc, w: number) => {
      const [minZ, maxZ] = npc.def.zRange;

      // Customers occasionally walk to the Foul Cart, wait there, then leave
      if (
        npc.def.behavior === "customer" &&
        !npc.visitedPoi &&
        npc.def.homePoi &&
        STREET_POIS[npc.def.homePoi]
      ) {
        const poi = STREET_POIS[npc.def.homePoi];
        npc.targetX = poi.xRatio * w + rand(-18, 22);
        npc.targetZ = poi.z + rand(-0.02, 0.03);
        npc.visitedPoi = true;
        npc.state = "walking";
        return;
      }

      // Strollers sometimes pick an in-scene spot to pause & look around
      if (npc.def.behavior === "stroller" && Math.random() < 0.45) {
        // Avoid stopping right in front of Amr's center (0.42..0.58)
        const leftZone = Math.random() < 0.5;
        npc.targetX = leftZone ? rand(w * 0.24, w * 0.39) : rand(w * 0.61, w * 0.78);
        npc.targetZ = rand(minZ, maxZ);
        npc.state = "walking";
        return;
      }

      // Otherwise walk cleanly off the opposite edge and respawn
      const goRight = npc.x < w * 0.5;
      npc.targetX = goRight ? w + 180 : -180;
      npc.targetZ = rand(minZ, maxZ);
      npc.visitedPoi = false;
      npc.state = "walking";
    };

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

    const drawNpc = (
      ctx: CanvasRenderingContext2D,
      npc: LiveNpc,
      groundY: number,
      targetH: number,
      alpha: number
    ) => {
      const speedMag = Math.hypot(npc.vx, npc.vz * 120);
      const isMoving = npc.state === "walking" && speedMag > 4;
      const hasWalkCycle = npc.imgs.length > 1;
      const frameIdx = hasWalkCycle
        ? isMoving
          ? Math.floor(npc.phase * 0.85) % npc.imgs.length
          : 2 // Hold passing/standing pose when paused
        : 0;
      const img = npc.imgs[frameIdx];
      if (!img || !img.complete || !img.naturalWidth) return;

      const targetW = (img.naturalWidth / img.naturalHeight) * targetH;

      // For multi-frame walk cycles, the art already has authentic bounce; no fake puppet bob/tilt
      const bobY =
        isMoving && !hasWalkCycle
          ? npc.def.behavior === "cruiser"
            ? Math.sin(npc.phase * 2.5) * 1.2
            : Math.abs(Math.sin(npc.phase)) * (2.2 + npc.z * 2.8)
          : 0;

      const tilt =
        isMoving && !hasWalkCycle
          ? npc.def.behavior === "cruiser"
            ? 0
            : Math.sin(npc.phase) * 0.022
          : 0;

      // Subtle breathing squash/stretch when idle
      const breathScaleY = !isMoving
        ? 1 + Math.sin(npc.phase * 1.4) * 0.008
        : hasWalkCycle
          ? 1
          : 1 + Math.abs(Math.sin(npc.phase)) * 0.014;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(npc.x, groundY - bobY);
      if (tilt) ctx.rotate(tilt);
      ctx.scale(npc.flip ? -1 : 1, breathScaleY);
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

      const bCtx = backCanvas.getContext("2d");
      const fCtx = frontCanvas.getContext("2d");

      if (bCtx && fCtx && w > 0 && h > 0) {
        bCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        fCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        bCtx.clearRect(0, 0, w, h);
        fCtx.clearRect(0, 0, w, h);

        const groundForZ = (z: number) => h * (0.78 + z * 0.19);
        // Keep NPCs proportionally smaller than Amr so Amr is always the main focus
        const heightForZ = (z: number, scale = 1) =>
          h * (0.26 + z * 0.28) * scale;

        // Update NPCs
        npcs.forEach((npc) => {
          if (npc.def.behavior === "ambient") {
            const poi = npc.def.homePoi ? STREET_POIS[npc.def.homePoi] : undefined;
            if (poi) {
              npc.x = poi.xRatio * w;
              npc.z = poi.z;
            }
            if (!pausedRef.current) {
              npc.phase += dt * 1.6;
              if (npc.def.effect) {
                npc.effectTimer -= dt;
                if (npc.effectTimer <= 0) {
                  const gy = groundForZ(npc.z);
                  const th = heightForZ(npc.z, npc.def.sizeScale ?? 1);
                  if (npc.def.effect === "steam") {
                    particles.push({
                      kind: "steam",
                      x: npc.x + rand(-6, 12),
                      y: gy - th * 0.62,
                      vx: rand(-4, 6),
                      vy: rand(-18, -10),
                      life: 0,
                      maxLife: rand(1.6, 2.4),
                      size: rand(4, 8),
                    });
                    npc.effectTimer = rand(0.45, 0.9);
                  } else if (npc.def.effect === "music") {
                    particles.push({
                      kind: "music",
                      x: npc.x + rand(8, 22),
                      y: gy - th * 0.68,
                      vx: rand(6, 14),
                      vy: rand(-22, -14),
                      life: 0,
                      maxLife: rand(1.8, 2.6),
                      size: rand(11, 15),
                      glyph: Math.random() < 0.5 ? "♪" : "♫",
                    });
                    npc.effectTimer = rand(1.2, 2.4);
                  }
                }
              }
            }
            return;
          }

          if (pausedRef.current) return;

          if (npc.state === "pausing") {
            npc.vx *= 0.85;
            npc.vz *= 0.85;
            npc.phase += dt * 1.5;
            npc.waitTimer -= dt;
            if (npc.waitTimer <= 0) {
              pickNextRoute(npc, w);
            }
            return;
          }

          // Walking / Cruising toward (targetX, targetZ)
          const dx = npc.targetX - npc.x;
          const dz = npc.targetZ - npc.z;
          const dist = Math.hypot(dx, dz * 260);

          if (dist < 14) {
            // Reached off-screen edge? Respawn on opposite side or wait briefly
            if (npc.x < -100 || npc.x > w + 100) {
              const [minZ, maxZ] = npc.def.zRange;
              const fromLeft = Math.random() < 0.5;
              npc.x = fromLeft ? -150 : w + 150;
              npc.z = rand(minZ, maxZ);
              npc.visitedPoi = false;
              npc.state = "pausing";
              npc.waitTimer =
                npc.def.behavior === "cruiser" ? rand(3.0, 6.5) : rand(0.5, 2.2);
              return;
            }
            // Reached in-scene POI (like Foul Cart or stroll pause)
            npc.state = "pausing";
            npc.waitTimer =
              npc.def.behavior === "customer" ? rand(3.0, 5.5) : rand(1.8, 3.8);
            // Face the foul cart if stopping there
            if (npc.def.behavior === "customer") {
              npc.flip = true;
            }
            return;
          }

          // Smooth speed with ease-in/out near target
          const depthSpeedFactor = 0.72 + npc.z * 0.55;
          const desiredSpeed =
            npc.def.speed *
            depthSpeedFactor *
            Math.min(1, Math.max(0.25, dist / 70));
          const dirX = dx / Math.max(1, Math.abs(dx) + Math.abs(dz * 260));
          const dirZ = (dz * 260) / Math.max(1, Math.abs(dx) + Math.abs(dz * 260));

          const targetVx = dirX * desiredSpeed;
          const targetVz = (dirZ * desiredSpeed) / 260;

          npc.vx += (targetVx - npc.vx) * Math.min(1, dt * 6);
          npc.vz += (targetVz - npc.vz) * Math.min(1, dt * 6);

          npc.x += npc.vx * dt;
          npc.z += npc.vz * dt;
          if (Math.abs(npc.vx) > 2) {
            npc.flip = npc.vx < 0;
          }
          npc.phase += dt * (npc.def.behavior === "cruiser" ? 12 : 5.5 + npc.z * 2);

          // Scooter exhaust puffs
          if (npc.def.effect === "exhaust" && npc.x > 0 && npc.x < w) {
            npc.effectTimer -= dt;
            if (npc.effectTimer <= 0) {
              const gy = groundForZ(npc.z);
              particles.push({
                kind: "exhaust",
                x: npc.x + (npc.flip ? 28 : -28),
                y: gy - 14,
                vx: (npc.flip ? 1 : -1) * rand(14, 24),
                vy: rand(-10, -4),
                life: 0,
                maxLife: rand(0.6, 1.0),
                size: rand(3, 6),
              });
              npc.effectTimer = rand(0.14, 0.25);
            }
          }
        });

        // Update & draw particles on back layer
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          if (!pausedRef.current) {
            p.life += dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
          }
          if (p.life >= p.maxLife) {
            particles.splice(i, 1);
            continue;
          }
          const t = p.life / p.maxLife;
          const alpha = Math.sin(t * Math.PI) * (p.kind === "music" ? 0.55 : 0.22);
          bCtx.save();
          bCtx.globalAlpha = alpha;
          if (p.kind === "music" && p.glyph) {
            bCtx.fillStyle = "#141414";
            bCtx.font = `${p.size}px sans-serif`;
            bCtx.fillText(p.glyph, p.x, p.y);
          } else {
            bCtx.fillStyle = "#555";
            bCtx.beginPath();
            bCtx.arc(p.x, p.y, p.size * (0.7 + t * 0.8), 0, Math.PI * 2);
            bCtx.fill();
          }
          bCtx.restore();
        }

        // Depth-sorted rendering: z < 0.65 behind Amr, z >= 0.65 occasionally in front
        const backNpcs = npcs.filter((n) => n.z < 0.65).sort((a, b) => a.z - b.z);
        const frontNpcs = npcs.filter((n) => n.z >= 0.65).sort((a, b) => a.z - b.z);

        backNpcs.forEach((npc) => {
          const gy = groundForZ(npc.z);
          const th = heightForZ(npc.z, npc.def.sizeScale ?? 1);
          drawNpc(bCtx, npc, gy, th, 0.78 + npc.z * 0.22);
        });

        frontNpcs.forEach((npc) => {
          const gy = groundForZ(npc.z);
          const th = heightForZ(npc.z, npc.def.sizeScale ?? 1);
          drawNpc(fCtx, npc, gy, th, 0.9 + npc.z * 0.1);
        });
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
          width={332}
          height={975}
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

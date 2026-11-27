"use client";

import React, { useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";
import {
  STREET_NPCS,
  STREET_POIS,
  type NpcDefinition,
} from "@/data/streetWorld";

type NpcState = "walking" | "pausing" | "chatting" | "ambient";

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
  chatCooldown: number;
  chatPartnerId: string | null;
  phase: number;
  flip: boolean;
  visitedPoi: boolean;
  effectTimer: number;
}

interface Particle {
  kind: "steam" | "music";
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

    const initialW = Math.max(scene.getBoundingClientRect().width, 1200);
    const movers = STREET_NPCS.filter((n) => n.behavior !== "ambient");

    // Build live NPCs scattered across the footer (some on-screen, some staggered off-screen)
    let moverIdx = 0;
    const npcs: LiveNpc[] = STREET_NPCS.map((def, idx) => {
      const imgs = def.frames.map((src) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          loadedCount++;
          if (loadedCount === 12 && !dead) {
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
          chatCooldown: 999,
          chatPartnerId: null,
          phase: idx * 1.3,
          flip: Boolean(def.defaultFlip),
          visitedPoi: false,
          effectTimer: rand(0.2, 1.2),
        };
      }

      // Scatter across a wider staging span so ~9-11 are on-screen at once (never overcrowded)
      const slot = moverIdx++;
      const startX = ((slot + 0.5) / movers.length) * (initialW * 2.8) - initialW * 0.9;
      const startZ = rand(minZ, maxZ);
      const goRight = slot % 2 === 0;
      const targetX = goRight ? initialW + 180 : -180;

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
        chatCooldown: rand(2, 8),
        chatPartnerId: null,
        phase: slot * 1.7,
        flip: !goRight,
        visitedPoi: false,
        effectTimer: rand(0.1, 0.4),
      };
    });

    const particles: Particle[] = [];

    const pickNextRoute = (npc: LiveNpc, w: number) => {
      const [minZ, maxZ] = npc.def.zRange;

      if (
        npc.def.behavior === "customer" &&
        !npc.visitedPoi &&
        npc.def.homePoi &&
        STREET_POIS[npc.def.homePoi]
      ) {
        const poi = STREET_POIS[npc.def.homePoi];
        npc.targetX = poi.xRatio * w + rand(-16, 22);
        npc.targetZ = poi.z + rand(-0.02, 0.03);
        npc.visitedPoi = true;
        npc.state = "walking";
        return;
      }

      if (npc.def.behavior === "stroller" && Math.random() < 0.35) {
        const leftZone = Math.random() < 0.5;
        npc.targetX = leftZone ? rand(w * 0.22, w * 0.39) : rand(w * 0.61, w * 0.80);
        npc.targetZ = rand(minZ, maxZ);
        npc.state = "walking";
        return;
      }

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

    const drawSpeechBubble = (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      t: number
    ) => {
      ctx.save();
      ctx.translate(cx, cy - Math.sin(t * 2.5) * 2);
      // Clean comic pill bubble
      const bw = 30;
      const bh = 16;
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#141414";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 8);
      ctx.fill();
      ctx.stroke();

      // 3 animated typing/chat dots
      for (let d = 0; d < 3; d++) {
        const bounce = Math.sin(t * 5 - d * 0.9) > 0.2 ? -1.4 : 0;
        ctx.fillStyle = "#141414";
        ctx.beginPath();
        ctx.arc(-6 + d * 6, bounce, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

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
          : 1 // Planted standing pose when pausing or chatting
        : 0;
      const img = npc.imgs[frameIdx];
      if (!img || !img.complete || !img.naturalWidth) return;

      const targetW = (img.naturalWidth / img.naturalHeight) * targetH;

      // Subtle conversational nod/breathing when chatting or idle
      const breathScaleY =
        npc.state === "chatting"
          ? 1 + Math.sin(npc.phase * 2.4) * 0.012
          : !isMoving
            ? 1 + Math.sin(npc.phase * 1.4) * 0.008
            : 1;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(npc.x, groundY);
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
        const heightForZ = (z: number, scale = 1) =>
          h * (0.26 + z * 0.28) * scale;

        // 1. Update NPCs
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

          if (npc.chatCooldown > 0) npc.chatCooldown -= dt;

          if (npc.state === "chatting" || npc.state === "pausing") {
            npc.vx *= 0.82;
            npc.vz *= 0.82;
            npc.phase += dt * 1.8;
            npc.waitTimer -= dt;
            if (npc.waitTimer <= 0) {
              if (npc.state === "chatting") {
                npc.chatPartnerId = null;
                npc.chatCooldown = rand(14, 24);
              }
              pickNextRoute(npc, w);
            }
            return;
          }

          // Walking toward (targetX, targetZ)
          const dx = npc.targetX - npc.x;
          const dz = npc.targetZ - npc.z;
          const dist = Math.hypot(dx, dz * 260);

          if (dist < 14) {
            if (npc.x < -100 || npc.x > w + 100) {
              const [minZ, maxZ] = npc.def.zRange;
              const fromLeft = Math.random() < 0.5;
              npc.x = fromLeft ? -160 : w + 160;
              npc.z = rand(minZ, maxZ);
              npc.visitedPoi = false;
              npc.state = "pausing";
              npc.waitTimer = rand(2.5, 7.5);
              return;
            }
            npc.state = "pausing";
            npc.waitTimer =
              npc.def.behavior === "customer" ? rand(2.8, 5.0) : rand(1.5, 3.2);
            if (npc.def.behavior === "customer") npc.flip = true;
            return;
          }

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
          npc.phase += dt * (5.2 + npc.z * 2);
        });

        // 2. Social encounter check: if two social walkers meet, they stop & chat!
        if (!pausedRef.current) {
          for (let i = 0; i < npcs.length; i++) {
            const a = npcs[i];
            if (
              !a.def.social ||
              a.state !== "walking" ||
              a.chatCooldown > 0 ||
              a.x < w * 0.16 ||
              a.x > w * 0.84 ||
              (a.x > w * 0.43 && a.x < w * 0.57) // Keep Amr's center clear
            ) {
              continue;
            }
            for (let j = i + 1; j < npcs.length; j++) {
              const b = npcs[j];
              if (
                !b.def.social ||
                b.state !== "walking" ||
                b.chatCooldown > 0
              ) {
                continue;
              }
              const xDist = Math.abs(a.x - b.x);
              const zDist = Math.abs(a.z - b.z);
              if (xDist > 34 && xDist < 72 && zDist < 0.08) {
                const chatDuration = rand(3.5, 5.5);
                a.state = "chatting";
                b.state = "chatting";
                a.waitTimer = chatDuration;
                b.waitTimer = chatDuration;
                a.chatPartnerId = b.def.id;
                b.chatPartnerId = a.def.id;
                // Face each other!
                a.flip = a.x > b.x;
                b.flip = b.x > a.x;
                break;
              }
            }
          }
        }

        // 3. Update & draw ambient particles
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

        // 4. Depth-sorted rendering
        const backNpcs = npcs.filter((n) => n.z < 0.62).sort((a, b) => a.z - b.z);
        const frontNpcs = npcs.filter((n) => n.z >= 0.62).sort((a, b) => a.z - b.z);

        backNpcs.forEach((npc) => {
          const gy = groundForZ(npc.z);
          const th = heightForZ(npc.z, npc.def.sizeScale ?? 1);
          drawNpc(bCtx, npc, gy, th, 0.82 + npc.z * 0.18);
        });

        frontNpcs.forEach((npc) => {
          const gy = groundForZ(npc.z);
          const th = heightForZ(npc.z, npc.def.sizeScale ?? 1);
          drawNpc(fCtx, npc, gy, th, 0.92 + npc.z * 0.08);
        });

        // 5. Draw speech bubbles above chatting pairs (once per pair)
        const drawnPairs = new Set<string>();
        npcs.forEach((a) => {
          if (a.state !== "chatting" || !a.chatPartnerId) return;
          const pairKey = [a.def.id, a.chatPartnerId].sort().join("|");
          if (drawnPairs.has(pairKey)) return;
          const b = npcs.find((n) => n.def.id === a.chatPartnerId);
          if (!b || b.state !== "chatting") return;
          drawnPairs.add(pairKey);

          const midX = (a.x + b.x) * 0.5;
          const avgZ = (a.z + b.z) * 0.5;
          const gy = groundForZ(avgZ);
          const th = heightForZ(avgZ, 0.94);
          const ctx = avgZ < 0.62 ? bCtx : fCtx;
          drawSpeechBubble(ctx, midX, gy - th - 12, now / 1000);
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

"use client";

import React, { useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";
import {
  STREET_NPCS,
  STREET_POIS,
  type NpcDefinition,
} from "@/data/streetWorld";
import neighborhoodWorld from "@/data/neighborhoodWorld.json";

type NpcState = "walking" | "pausing" | "chatting" | "ambient";

interface EncounterRule {
  targetNpcId: string;
  action:
    | "chat"
    | "walk_together"
    | "avoid_turn_around"
    | "wave_and_pass"
    | "hang_out_at_spot";
  reason: string;
}

interface WorldNpcMeta {
  npcId: string;
  spriteId: string;
  name: string;
  story: string;
  topics: string[];
  connections: string[];
  encounterRules: EncounterRule[];
}

const WORLD_BY_SPRITE = new Map<string, WorldNpcMeta>(
  (neighborhoodWorld.npcs as WorldNpcMeta[]).map((n) => [n.spriteId, n])
);

interface LiveNpc {
  def: NpcDefinition;
  meta?: WorldNpcMeta;
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
  activeLine: string | null;
  reactionGlyph: string | null;
  reactionTimer: number;
  speedBoost: number;
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

    // Pick 1 random animated ambient vignette per POI slot (foulCart, oudCorner, rightBench)
    const ambientSlots = ["foulCart", "oudCorner", "rightBench"];
    const activeAmbientIds = new Set<string>();
    ambientSlots.forEach((slot) => {
      const candidates = STREET_NPCS.filter(
        (n) => n.behavior === "ambient" && n.homePoi === slot
      );
      if (candidates.length > 0) {
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        activeAmbientIds.add(chosen.id);
      }
    });
    const activeDefs = STREET_NPCS.filter(
      (n) => n.behavior !== "ambient" || activeAmbientIds.has(n.id)
    );

    let moverIdx = 0;
    const npcs: LiveNpc[] = activeDefs.map((def, idx) => {
      const meta = WORLD_BY_SPRITE.get(def.id);
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
          meta,
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
          activeLine: null,
          reactionGlyph: null,
          reactionTimer: 0,
          speedBoost: 1,
          phase: idx * 1.3,
          flip: Boolean(def.defaultFlip),
          visitedPoi: false,
          effectTimer: rand(0.2, 1.2),
        };
      }

      const slot = moverIdx++;
      const startX =
        ((slot + 0.5) / movers.length) * (initialW * 2.8) - initialW * 0.9;
      const startZ = rand(minZ, maxZ);
      const goRight = slot % 2 === 0;
      const targetX = goRight ? initialW + 180 : -180;

      return {
        def,
        meta,
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
        activeLine: null,
        reactionGlyph: null,
        reactionTimer: 0,
        speedBoost: 1,
        phase: slot * 1.7,
        flip: !goRight,
        visitedPoi: false,
        effectTimer: rand(0.1, 0.4),
      };
    });

    const particles: Particle[] = [];

    const pickNextRoute = (npc: LiveNpc, w: number) => {
      const [minZ, maxZ] = npc.def.zRange;
      npc.speedBoost = 1;

      // Check if this NPC has a hang_out_at_spot rule pointing to an active ambient spot!
      const hangRule = npc.meta?.encounterRules?.find(
        (r) => r.action === "hang_out_at_spot"
      );
      if (hangRule && !npc.visitedPoi) {
        const spot = npcs.find(
          (n) => n.state === "ambient" && n.meta?.npcId === hangRule.targetNpcId
        );
        if (spot) {
          npc.targetX = spot.x + (spot.x < w * 0.5 ? 44 : -44);
          npc.targetZ = Math.min(0.58, spot.z + 0.04);
          npc.visitedPoi = true;
          npc.state = "walking";
          return;
        }
      }

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

      if (npc.def.behavior === "stroller" && Math.random() < 0.3) {
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
      t: number,
      text: string | null,
      maxWidth: number
    ) => {
      ctx.save();
      const floatY = cy - Math.sin(t * 2.5) * 2;
      if (text) {
        ctx.font = "600 11px 'Space Grotesk', system-ui, sans-serif";
        const shortText = text.length > 52 ? text.slice(0, 49).trim() + "…" : text;
        const padX = 10;
        const metrics = ctx.measureText(shortText);
        const bw = Math.min(maxWidth, metrics.width + padX * 2);
        const bh = 24;
        const clampedX = Math.max(bw / 2 + 8, Math.min(maxWidth - bw / 2 - 8, cx));

        ctx.translate(clampedX, floatY);
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#141414";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#141414";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(shortText, 0, 0.5, bw - padX * 1.5);
      } else {
        ctx.translate(cx, floatY);
        const bw = 30;
        const bh = 16;
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#141414";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 8);
        ctx.fill();
        ctx.stroke();

        for (let d = 0; d < 3; d++) {
          const bounce = Math.sin(t * 5 - d * 0.9) > 0.2 ? -1.4 : 0;
          ctx.fillStyle = "#141414";
          ctx.beginPath();
          ctx.arc(-6 + d * 6, bounce, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
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
        ? npc.state === "ambient"
          ? Math.floor(npc.phase * 1.6) % npc.imgs.length
          : isMoving
            ? Math.floor(npc.phase * 0.85) % npc.imgs.length
            : 1
        : 0;
      const img = npc.imgs[frameIdx];
      if (!img || !img.complete || !img.naturalWidth) return;

      const targetW = (img.naturalWidth / img.naturalHeight) * targetH;
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

      // Quick reaction glyph (! or 👋)
      if (npc.reactionGlyph && npc.reactionTimer > 0) {
        ctx.save();
        ctx.font = "700 14px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "#141414";
        ctx.fillText(npc.reactionGlyph, npc.x, groundY - targetH - 8);
        ctx.restore();
      }
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
          if (npc.reactionTimer > 0 && !pausedRef.current) {
            npc.reactionTimer -= dt;
            if (npc.reactionTimer <= 0) npc.reactionGlyph = null;
          }

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
                npc.activeLine = null;
                npc.chatCooldown = rand(14, 24);
              }
              pickNextRoute(npc, w);
            }
            return;
          }

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
            npc.speedBoost *
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
          npc.phase += dt * (5.2 + npc.z * 2) * npc.speedBoost;
        });

        // 2. Smart Encounter Rules (from neighborhoodWorld.json!)
        if (!pausedRef.current) {
          for (let i = 0; i < npcs.length; i++) {
            const a = npcs[i];
            if (
              a.state !== "walking" ||
              a.chatCooldown > 0 ||
              a.x < w * 0.14 ||
              a.x > w * 0.86 ||
              (a.x > w * 0.43 && a.x < w * 0.57)
            ) {
              continue;
            }
            for (let j = i + 1; j < npcs.length; j++) {
              const b = npcs[j];
              if (b.state !== "walking" || b.chatCooldown > 0) continue;

              const xDist = Math.abs(a.x - b.x);
              const zDist = Math.abs(a.z - b.z);
              if (xDist < 34 || xDist > 80 || zDist > 0.09) continue;

              const ruleAB = a.meta?.encounterRules?.find(
                (r) => r.targetNpcId === b.meta?.npcId
              );
              const ruleBA = b.meta?.encounterRules?.find(
                (r) => r.targetNpcId === a.meta?.npcId
              );
              const rule = ruleAB || ruleBA;

              // Execute specific rule action!
              if (rule?.action === "avoid_turn_around") {
                const avoider = ruleAB ? a : b;
                const other = ruleAB ? b : a;
                avoider.targetX = avoider.x < other.x ? -180 : w + 180;
                avoider.speedBoost = 1.45;
                avoider.reactionGlyph = "!";
                avoider.reactionTimer = 1.4;
                avoider.chatCooldown = 14;
                break;
              }

              if (rule?.action === "wave_and_pass") {
                a.reactionGlyph = "👋";
                b.reactionGlyph = "👋";
                a.reactionTimer = 1.6;
                b.reactionTimer = 1.6;
                a.chatCooldown = 12;
                b.chatCooldown = 12;
                break;
              }

              if (rule?.action === "walk_together") {
                const goRight = a.targetX > a.x;
                const sharedTargetX = goRight ? w + 180 : -180;
                a.targetX = sharedTargetX;
                b.targetX = sharedTargetX;
                b.targetZ = a.z;
                a.chatCooldown = 16;
                b.chatCooldown = 16;
                break;
              }

              // Chat rule or connected/social neighbors
              const isConnected =
                rule?.action === "chat" ||
                (a.meta?.connections?.includes(b.meta?.npcId ?? "") ?? false) ||
                (a.def.social && b.def.social);

              if (isConnected) {
                const chatDuration = rand(3.8, 5.6);
                a.state = "chatting";
                b.state = "chatting";
                a.waitTimer = chatDuration;
                b.waitTimer = chatDuration;
                a.chatPartnerId = b.def.id;
                b.chatPartnerId = a.def.id;
                a.flip = a.x > b.x;
                b.flip = b.x > a.x;
                const topics = a.meta?.topics?.length
                  ? a.meta.topics
                  : b.meta?.topics ?? [];
                a.activeLine = topics.length
                  ? topics[Math.floor(Math.random() * topics.length)]
                  : null;
                break;
              }
            }
          }
        }

        // 3. Ambient particles
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

        // 5. Speech bubbles with real Haret El-Nakheel dialogue!
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
          drawSpeechBubble(ctx, midX, gy - th - 14, now / 1000, a.activeLine || b.activeLine, w);
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

"use client";

import React, { useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";
import {
  STREET_NPCS,
  type NpcDefinition,
} from "@/data/streetWorld";
import neighborhoodWorld from "@/data/neighborhoodWorld.json";

type NpcState = "walking" | "pausing" | "chatting";

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

const HERO_FRAME_COUNT = 105;
const HERO_FPS = 10; // Full-body walk-in, wave, gesture & settle (~10.5s)
const HERO_FRAMES = Array.from(
  { length: HERO_FRAME_COUNT },
  (_, i) => `/footer/hero/frame-${String(i + 1).padStart(3, "0")}.webp`
);

/** 3 clear visual depth lanes — rich and legible while Amr (100% crisp ink) owns center stage */
const LANES = [
  { id: 0, z: 0.15, groundRatio: 0.63, heightRatio: 0.24, speedMult: 0.72, alpha: 0.68 }, // Far back
  { id: 1, z: 0.50, groundRatio: 0.80, heightRatio: 0.34, speedMult: 0.92, alpha: 0.82 }, // Midground
  { id: 2, z: 0.85, groundRatio: 0.96, heightRatio: 0.44, speedMult: 1.08, alpha: 0.92 }, // Foreground
] as const;

interface LiveWalker {
  def: NpcDefinition;
  meta?: WorldNpcMeta;
  imgs: HTMLImageElement[];
  lane: 0 | 1 | 2;
  x: number;
  dir: 1 | -1; // 1 = left->right, -1 = right->left
  vx: number;
  state: NpcState;
  waitTimer: number;
  chatCooldown: number;
  reactionGlyph: string | null;
  reactionTimer: number;
  speedBoost: number;
  phase: number;
  flip: boolean;
}

interface AmbientSlot {
  side: "left" | "right";
  xRatio: number;
  lane: 0 | 1;
  def: NpcDefinition;
  meta?: WorldNpcMeta;
  imgs: HTMLImageElement[];
  timer: number; // 0 -> 12s lifecycle (1s fade-in, 10s hold, 1s fade/slide out)
  phase: number;
  flip: boolean;
}

interface CrowdSceneProps {
  descId: string;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export function CrowdScene({ descId }: CrowdSceneProps) {
  const [ready, setReady] = useState(false);
  const sceneRef = useRef<HTMLButtonElement>(null);
  const backCanvasRef = useRef<HTMLCanvasElement>(null);
  const frontCanvasRef = useRef<HTMLCanvasElement>(null);
  const heroTimeRef = useRef<number>(-1); // -1 = waiting to enter viewport
  const heroImgsRef = useRef<HTMLImageElement[]>([]);
  const lastValidHeroImgRef = useRef<HTMLImageElement | null>(null);

  // Trigger Amr's walk-in entrance when footer scrolls into view
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      heroTimeRef.current = HERO_FRAME_COUNT / HERO_FPS;
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && heroTimeRef.current < 0) {
          heroTimeRef.current = 0;
          io.disconnect();
        }
      },
      { threshold: 0.25 }
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

    // Cache loaded images by spriteId
    const imgCache = new Map<string, HTMLImageElement[]>();
    let loadedFrames = 0;
    const getFrames = (def: NpcDefinition) => {
      const existing = imgCache.get(def.id);
      if (existing) return existing;
      const imgs = def.frames.map((src) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          loadedFrames++;
          if (loadedFrames === 12 && !dead) setReady(true);
        };
        return img;
      });
      imgCache.set(def.id, imgs);
      return imgs;
    };

    const walkerPool = STREET_NPCS.filter((n) => n.behavior !== "ambient");
    const ambientPool = STREET_NPCS.filter((n) => n.behavior === "ambient");

    // Preload hero entrance frames + first batch of street NPCs
    heroImgsRef.current = HERO_FRAMES.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
    walkerPool.slice(0, 10).forEach(getFrames);
    ambientPool.slice(0, 4).forEach(getFrames);

    // Round-robin cursors through all walkers and ambient vignettes
    let nextWalkerIdx = 0;
    let nextAmbientIdx = 0;
    let nextEntryDir: 1 | -1 = 1;

    const initialW = Math.max(scene.getBoundingClientRect().width, 1200);

    const spawnWalkerInLane = (
      lane: 0 | 1 | 2,
      initialX?: number
    ): LiveWalker => {
      const def = walkerPool[nextWalkerIdx % walkerPool.length];
      nextWalkerIdx++;
      const dir = nextEntryDir;
      nextEntryDir = dir === 1 ? -1 : 1;

      const x =
        initialX !== undefined ? initialX : dir === 1 ? -110 : initialW + 110;

      return {
        def,
        meta: WORLD_BY_SPRITE.get(def.id),
        imgs: getFrames(def),
        lane,
        x,
        dir,
        vx: dir * def.speed * LANES[lane].speedMult,
        state: "walking",
        waitTimer: 0,
        chatCooldown: rand(2, 6),
        reactionGlyph: null,
        reactionTimer: 0,
        speedBoost: 1,
        phase: rand(0, 6),
        flip: dir < 0,
      };
    };

    // 18 active walkers distributed cleanly across the 3 depth lanes:
    // Lane 0 (far back): 6 walkers | Lane 1 (mid): 7 walkers | Lane 2 (front): 5 walkers
    const laneAssignments: (0 | 1 | 2)[] = [0, 1, 2, 0, 1, 0, 2, 1, 0, 1, 2, 0, 1, 2, 0, 1, 1, 2];
    const walkers: LiveWalker[] = laneAssignments.map((lane, i) =>
      spawnWalkerInLane(lane, ((i + 0.5) / laneAssignments.length) * initialW)
    );

    // 2 rotating ambient slots (Left & Right) — each holds 10s then slides out & rotates through the ambient pool
    const nextAmbientDef = () => {
      const def = ambientPool[nextAmbientIdx % ambientPool.length];
      nextAmbientIdx++;
      return def;
    };

    const ambientSlots: AmbientSlot[] = [
      (() => {
        const def = nextAmbientDef();
        const meta = WORLD_BY_SPRITE.get(def.id);
        return {
          side: "left",
          xRatio: 0.11,
          lane: 1,
          def,
          meta,
          imgs: getFrames(def),
          timer: 0,
          phase: 0,
          flip: false,
        };
      })(),
      (() => {
        const def = nextAmbientDef();
        const meta = WORLD_BY_SPRITE.get(def.id);
        return {
          side: "right",
          xRatio: 0.89,
          lane: 1,
          def,
          meta,
          imgs: getFrames(def),
          timer: 5.5, // Staggered so left & right swap at different times
          phase: 1.5,
          flip: Boolean(def.defaultFlip),
        };
      })(),
    ];

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
      maxWidth: number,
      tailDir: "left" | "right" = "right"
    ) => {
      if (!text) return;
      ctx.save();
      const floatY = cy - Math.sin(t * 2.5) * 2;
      ctx.font = "700 11px 'Space Grotesk', system-ui, sans-serif";

      // Support explicit \n line breaks or auto-wrap into 2-3 compact comic lines
      const lines: string[] = [];
      const maxLinePx = 138;
      if (text.includes("\n")) {
        lines.push(...text.split("\n").slice(0, 3));
      } else {
        const words = text.split(/\s+/);
        let current = "";
        for (const word of words) {
          const test = current ? `${current} ${word}` : word;
          if (ctx.measureText(test).width > maxLinePx && current) {
            lines.push(current);
            current = word;
            if (lines.length === 2) break;
          } else {
            current = test;
          }
        }
        if (current && lines.length < 3) lines.push(current);
        if (lines.length === 3 && words.join(" ").length > lines.join(" ").length + 3) {
          lines[2] = lines[2].replace(/[.,;!?]*$/, "") + "…";
        }
      }

      const lineH = 14;
      const textW = Math.max(...lines.map((l) => ctx.measureText(l).width), 42);
      const textH = lines.length * lineH;
      const padX = 22;
      const padY = 16;
      const bw = Math.min(maxWidth - 28, textW + padX * 2);
      const bh = textH + padY * 2;
      const clampedX = Math.max(bw * 0.68 + 14, Math.min(maxWidth - bw * 0.68 - 14, cx));
      const isArabic = /[\u0600-\u06FF]/.test(text);

      ctx.translate(clampedX, floatY - bh * 0.25);

      // Plump hand-drawn comic cloud with curved pointer tail
      const rx = bw / 2;
      const ry = bh / 2;
      const lobes = 10;
      const buildCloud = () => {
        ctx.beginPath();
        for (let i = 0; i < lobes; i++) {
          const a0 = (i / lobes) * Math.PI * 2;
          const a1 = ((i + 1) / lobes) * Math.PI * 2;
          const am = (a0 + a1) * 0.5;
          const x0 = Math.cos(a0) * rx;
          const y0 = Math.sin(a0) * ry;
          const x1 = Math.cos(a1) * rx;
          const y1 = Math.sin(a1) * ry;
          const bulge = 1.26 + (i % 2 === 0 ? 0.08 : -0.02);
          const cxp = Math.cos(am) * rx * bulge;
          const cyp = Math.sin(am) * ry * bulge;
          if (i === 0) ctx.moveTo(x0, y0);
          ctx.quadraticCurveTo(cxp, cyp, x1, y1);
        }
        ctx.closePath();
      };

      // Bold comic ink drop-shadow
      ctx.save();
      ctx.translate(3, 3.5);
      buildCloud();
      ctx.fillStyle = "rgba(20,20,20,0.22)";
      ctx.fill();
      ctx.restore();

      // Crisp white cloud + bold 2.1px black comic outline
      buildCloud();
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = "#141414";
      ctx.lineWidth = 2.1;
      ctx.stroke();

      // Curved comic pointer tail at bottom (pointing left or right toward speaker)
      const s = tailDir === "right" ? -1 : 1;
      ctx.beginPath();
      ctx.moveTo(-6 * s, ry - 1);
      ctx.quadraticCurveTo(-8 * s, ry + 11, -15 * s, ry + 13);
      ctx.quadraticCurveTo(-2 * s, ry + 11, 5 * s, ry - 1);
      ctx.closePath();
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-6 * s, ry);
      ctx.quadraticCurveTo(-8 * s, ry + 11, -15 * s, ry + 13);
      ctx.quadraticCurveTo(-2 * s, ry + 11, 5 * s, ry);
      ctx.strokeStyle = "#141414";
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // Draw centered multi-line comic text (native RTL for Arabic lines)
      ctx.fillStyle = "#141414";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.direction = isArabic ? "rtl" : "ltr";
      const startY = -((lines.length - 1) * lineH) / 2;
      lines.forEach((line, idx) => {
        ctx.fillText(line, 0, startY + idx * lineH);
      });
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

        // 1. Update rotating ambient slots (1s enter, 10s hold, 1s exit toward edge)
        const HOLD_TOTAL = 12.0;
        ambientSlots.forEach((slot) => {
          slot.timer += dt;
          slot.phase += dt * 2.4;
          if (slot.timer >= HOLD_TOTAL) {
            const nextDef = nextAmbientDef();
            const nextMeta = WORLD_BY_SPRITE.get(nextDef.id);
            slot.def = nextDef;
            slot.meta = nextMeta;
            slot.imgs = getFrames(nextDef);
            slot.timer = 0;
            slot.phase = 0;
            slot.flip = Boolean(nextDef.defaultFlip);
          }
        });

        // 2. Update walkers (smooth constant stride + Lane-1 ambient clear-zone rule)
        for (let i = 0; i < walkers.length; i++) {
          const wk = walkers[i];

          if (wk.reactionTimer > 0) {
            wk.reactionTimer -= dt;
            if (wk.reactionTimer <= 0) wk.reactionGlyph = null;
          }
          if (wk.chatCooldown > 0) wk.chatCooldown -= dt;

          if (wk.state === "chatting" || wk.state === "pausing") {
            wk.vx *= 0.8;
            wk.phase += dt * 1.6;
            wk.waitTimer -= dt;
            if (wk.waitTimer <= 0) {
              wk.state = "walking";
              wk.chatCooldown = rand(14, 22);
              wk.flip = wk.dir < 0;
            }
            continue;
          }

          const laneCfg = LANES[wk.lane];
          let targetVx = wk.dir * wk.def.speed * laneCfg.speedMult * wk.speedBoost;

          // Rule A (Lane 1 / second lane): Sync with ambient vignettes so nobody crowds the entrance
          if (wk.lane === 1) {
            const leftAmb = ambientSlots[0];
            const rightAmb = ambientSlots[1];
            const leftActive = leftAmb.timer >= 0.8 && leftAmb.timer <= 10.8;
            const rightActive = rightAmb.timer >= 0.8 && rightAmb.timer <= 10.8;

            // If waiting off-screen at an active ambient entrance, hold until the ambient exits/enters
            if (wk.x < -40 && wk.dir === 1 && leftActive) {
              targetVx = 0;
            } else if (wk.x > w + 40 && wk.dir === -1 && rightActive) {
              targetVx = 0;
            } else if (wk.dir === -1 && leftActive && wk.x < w * 0.23 && wk.x > w * 0.14) {
              // Don't walk onto the active left ambient—turn back smoothly
              wk.dir = 1;
              targetVx = wk.def.speed * laneCfg.speedMult;
            } else if (wk.dir === 1 && rightActive && wk.x > w * 0.77 && wk.x < w * 0.86) {
              // Don't walk onto the active right ambient—turn back smoothly
              wk.dir = -1;
              targetVx = -wk.def.speed * laneCfg.speedMult;
            }
          }

          wk.vx += (targetVx - wk.vx) * Math.min(1, dt * 6);
          wk.x += wk.vx * dt;
          wk.flip = wk.dir < 0;
          if (Math.abs(wk.vx) > 3) {
            wk.phase += dt * (4.8 + wk.lane * 0.8) * wk.speedBoost;
          }

          // Exited off-screen? Replace with the next NPC in the 1->32 queue!
          if ((wk.dir === 1 && wk.x > w + 140) || (wk.dir === -1 && wk.x < -140)) {
            const fresh = spawnWalkerInLane(wk.lane);
            fresh.x = fresh.dir === 1 ? -110 : w + 110;
            walkers[i] = fresh;
          }
        }

        // 3. Same-lane encounter rules (max 2 chats, never behind Amr)
        {
          const activeChatters = walkers.filter((n) => n.state === "chatting").length;
          for (let i = 0; i < walkers.length; i++) {
            const a = walkers[i];
            if (
              a.state !== "walking" ||
              a.chatCooldown > 0 ||
              a.x < w * 0.16 ||
              a.x > w * 0.84 ||
              (a.x > w * 0.36 && a.x < w * 0.64)
            ) {
              continue;
            }
            for (let j = i + 1; j < walkers.length; j++) {
              const b = walkers[j];
              if (
                b.state !== "walking" ||
                b.chatCooldown > 0 ||
                a.lane !== b.lane // Only interact with someone in the same depth lane!
              ) {
                continue;
              }
              const xDist = Math.abs(a.x - b.x);
              if (xDist < 36 || xDist > 80) continue;

              const ruleAB = a.meta?.encounterRules?.find(
                (r) => r.targetNpcId === b.meta?.npcId
              );
              const ruleBA = b.meta?.encounterRules?.find(
                (r) => r.targetNpcId === a.meta?.npcId
              );
              const rule = ruleAB || ruleBA;

              if (rule?.action === "avoid_turn_around") {
                const avoider = ruleAB ? a : b;
                avoider.dir = avoider.dir === 1 ? -1 : 1;
                avoider.speedBoost = 1.45;
                avoider.reactionGlyph = "!";
                avoider.reactionTimer = 1.4;
                avoider.chatCooldown = 14;
                break;
              }

              if (rule?.action === "wave_and_pass") {
                a.reactionGlyph = "👋";
                b.reactionGlyph = "👋";
                a.reactionTimer = 1.5;
                b.reactionTimer = 1.5;
                a.chatCooldown = 12;
                b.chatCooldown = 12;
                break;
              }

              if (activeChatters < 4 && (rule?.action === "chat" || (a.def.social && b.def.social))) {
                const dur = rand(3.5, 5.0);
                a.state = "chatting";
                b.state = "chatting";
                a.waitTimer = dur;
                b.waitTimer = dur;
                a.flip = a.x > b.x;
                b.flip = b.x > a.x;
                break;
              }
            }
          }
        }

        // 4. Draw Lane 0 (far back) & Lane 1 (midground) + Ambient Slots on backCanvas
        const drawWalker = (ctx: CanvasRenderingContext2D, wk: LiveWalker) => {
          const laneCfg = LANES[wk.lane];
          const isMoving = wk.state === "walking" && Math.abs(wk.vx) > 4;
          const frameIdx =
            wk.imgs.length > 1
              ? isMoving
                ? Math.floor(wk.phase * 0.85) % wk.imgs.length
                : 0 // Straight-leg grounded standing stance when talking/stopped
              : 0;
          const img = wk.imgs[frameIdx];
          if (!img || !img.complete || !img.naturalWidth) return;

          const targetH = h * laneCfg.heightRatio * (wk.def.sizeScale ?? 1);
          const targetW = (img.naturalWidth / img.naturalHeight) * targetH;
          const groundY = h * laneCfg.groundRatio;

          ctx.save();
          ctx.globalAlpha = laneCfg.alpha;
          ctx.translate(wk.x, groundY);
          if (wk.flip) ctx.scale(-1, 1);
          ctx.drawImage(img, -targetW * 0.5, -targetH, targetW, targetH);
          ctx.restore();

          if (wk.reactionGlyph && wk.reactionTimer > 0) {
            ctx.save();
            ctx.font = "700 14px system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.fillStyle = "#141414";
            ctx.fillText(wk.reactionGlyph, wk.x, groundY - targetH - 8);
            ctx.restore();
          }
        };

        // Far back lane (Lane 0)
        walkers.filter((wk) => wk.lane === 0).forEach((wk) => drawWalker(bCtx, wk));

        // Ambient vignettes (10s hold + smooth slide/fade toward screen edge — silent so Amr owns the dialogue)
        ambientSlots.forEach((slot) => {
          const laneCfg = LANES[slot.lane];
          const frameIdx = Math.floor(slot.phase) % Math.max(1, slot.imgs.length);
          const img = slot.imgs[frameIdx];
          if (!img || !img.complete || !img.naturalWidth) return;

          let alpha = laneCfg.alpha;
          let slideOffset = 0;
          if (slot.timer < 1.0) {
            const t = slot.timer;
            alpha *= t;
            slideOffset = (1 - t) * (slot.side === "left" ? -50 : 50);
          } else if (slot.timer > 11.0) {
            const t = Math.min(1, slot.timer - 11.0);
            alpha *= 1 - t;
            slideOffset = t * (slot.side === "left" ? -60 : 60);
          }

          const targetH = h * laneCfg.heightRatio * (slot.def.sizeScale ?? 1);
          const targetW = (img.naturalWidth / img.naturalHeight) * targetH;
          const groundY = h * laneCfg.groundRatio;
          const x = slot.xRatio * w + slideOffset;

          bCtx.save();
          bCtx.globalAlpha = Math.max(0, alpha);
          bCtx.translate(x, groundY);
          if (slot.flip) bCtx.scale(-1, 1);
          bCtx.drawImage(img, -targetW * 0.5, -targetH, targetW, targetH);
          bCtx.restore();
        });

        // Midground lane (Lane 1) & Lane 2 — ALL drawn behind Amr so the road in front of Amr stays 100% clear!
        walkers.filter((wk) => wk.lane === 1).forEach((wk) => drawWalker(bCtx, wk));
        walkers.filter((wk) => wk.lane === 2).forEach((wk) => drawWalker(bCtx, wk));

        // 4b. Draw Amr's Clean Center Hero Entrance (Clip 1 only)
        if (heroTimeRef.current >= 0) {
          heroTimeRef.current += dt;
        }
        const clip1Dur = HERO_FRAME_COUNT / HERO_FPS; // 10.5s
        const tHero = heroTimeRef.current;

        const idx1 = (() => {
          if (tHero < 0) return 0;
          if (tHero < clip1Dur) {
            return Math.min(HERO_FRAME_COUNT - 1, Math.floor(tHero * HERO_FPS));
          }
          // Subtle infinite ping-pong idle loop on the final hands-in-pockets head movement (frames 98–105)
          const idleStart = 97;
          const idleEnd = HERO_FRAME_COUNT - 1;
          const span = idleEnd - idleStart;
          const idleFps = 6;
          const step = Math.floor((tHero - clip1Dur) * idleFps) % (span * 2);
          return step <= span ? idleEnd - step : idleStart + (step - span);
        })();
        const heroImg = heroImgsRef.current[idx1];

        if (heroImg && heroImg.complete && heroImg.naturalWidth) {
          lastValidHeroImgRef.current = heroImg;
        }
        const renderHeroImg = lastValidHeroImgRef.current;

        if (renderHeroImg && renderHeroImg.complete && renderHeroImg.naturalWidth) {
          const targetH = Math.min(h * 0.92, 410);
          const targetW =
            (renderHeroImg.naturalWidth / renderHeroImg.naturalHeight) * targetH;
          const drawX = w * 0.5 - targetW * 0.5;
          const drawY = h - targetH - 6;

          fCtx.save();
          fCtx.globalAlpha = 1;
          fCtx.drawImage(renderHeroImg, drawX, drawY, targetW, targetH);
          fCtx.restore();

          const bubbleX = w * 0.5 - targetW * 0.36;
          const bubbleY = drawY + 62;

          if (tHero >= 5.4 && tHero < 7.0) {
            drawSpeechBubble(fCtx, bubbleX, bubbleY, now / 1000, "Hi...", w, "right");
          } else if (tHero >= 7.0 && tHero < 8.8) {
            drawSpeechBubble(fCtx, bubbleX, bubbleY, now / 1000, "This is me, Amr.", w, "right");
          } else if (tHero >= 8.8 && tHero <= clip1Dur + 2.0) {
            drawSpeechBubble(
              fCtx,
              bubbleX,
              bubbleY,
              now / 1000,
              "Welcome to my side\nof the internet.",
              w,
              "right"
            );
          }
        }

        // 5. NPC speech bubbles disabled so Amr's story clouds own the stage cleanly
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
        aria-label={`${profile.footer.crowdName} Replay hero entrance`}
        aria-describedby={descId}
        onClick={() => {
          heroTimeRef.current = 0;
        }}
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
        <canvas
          ref={frontCanvasRef}
          className="footer-crowd-layer footer-crowd-front"
          aria-hidden="true"
        />
      </button>
    </>
  );
}

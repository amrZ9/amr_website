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

/** 3 clear visual depth lanes so back walkers are never hidden behind front walkers */
const LANES = [
  { id: 0, z: 0.15, groundRatio: 0.63, heightRatio: 0.24, speedMult: 0.72, alpha: 0.76 }, // Far back
  { id: 1, z: 0.50, groundRatio: 0.80, heightRatio: 0.34, speedMult: 0.92, alpha: 0.90 }, // Midground
  { id: 2, z: 0.85, groundRatio: 0.96, heightRatio: 0.44, speedMult: 1.08, alpha: 1.00 }, // Foreground
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
  chatPartnerId: string | null;
  activeLine: string | null;
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
  imgs: HTMLImageElement[];
  timer: number;     // 0 -> 12s lifecycle (1s fade-in, 10s hold, 1s fade/slide out)
  phase: number;
  flip: boolean;
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

    // Preload first batch
    walkerPool.slice(0, 10).forEach(getFrames);
    ambientPool.slice(0, 4).forEach(getFrames);

    // Round-robin cursors: strictly 1 -> 32 for walkers, 1 -> 21 for ambient
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
        chatPartnerId: null,
        activeLine: null,
        reactionGlyph: null,
        reactionTimer: 0,
        speedBoost: 1,
        phase: rand(0, 6),
        flip: dir < 0,
      };
    };

    // 7 active walkers distributed cleanly across the 3 depth lanes:
    // Lane 0 (far back): 3 walkers | Lane 1 (mid): 2 walkers | Lane 2 (front): 2 walkers
    const laneAssignments: (0 | 1 | 2)[] = [0, 0, 0, 1, 1, 2, 2];
    const walkers: LiveWalker[] = laneAssignments.map((lane, i) =>
      spawnWalkerInLane(lane, ((i + 0.5) / laneAssignments.length) * initialW)
    );

    // 2 rotating ambient slots (Left & Right) — each holds for 10s then exits & rotates through all 21!
    const nextAmbientDef = () => {
      const def = ambientPool[nextAmbientIdx % ambientPool.length];
      nextAmbientIdx++;
      return def;
    };

    const ambientSlots: AmbientSlot[] = [
      (() => {
        const def = nextAmbientDef();
        return {
          side: "left",
          xRatio: 0.11,
          lane: 1,
          def,
          imgs: getFrames(def),
          timer: 0,
          phase: 0,
          flip: false,
        };
      })(),
      (() => {
        const def = nextAmbientDef();
        return {
          side: "right",
          xRatio: 0.89,
          lane: 1,
          def,
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
      maxWidth: number
    ) => {
      ctx.save();
      const floatY = cy - Math.sin(t * 2.5) * 2;
      if (text) {
        ctx.font = "600 11px 'Space Grotesk', system-ui, sans-serif";
        const shortText = text.length > 52 ? text.slice(0, 49).trim() + "…" : text;
        const padX = 10;
        const metrics = ctx.measureText(shortText);
        const bw = Math.min(maxWidth - 20, metrics.width + padX * 2);
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
      }
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
          if (!pausedRef.current) {
            slot.timer += dt;
            slot.phase += dt * 2.4;
            if (slot.timer >= HOLD_TOTAL) {
              const nextDef = nextAmbientDef();
              slot.def = nextDef;
              slot.imgs = getFrames(nextDef);
              slot.timer = 0;
              slot.phase = 0;
              slot.flip = Boolean(nextDef.defaultFlip);
            }
          }
        });

        // 2. Update walkers (strict sequential 1->32 rotation, alternating left<->right)
        for (let i = 0; i < walkers.length; i++) {
          const wk = walkers[i];
          if (pausedRef.current) continue;

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
              wk.chatPartnerId = null;
              wk.activeLine = null;
              wk.chatCooldown = rand(14, 22);
              wk.flip = wk.dir < 0;
            }
            continue;
          }

          const laneCfg = LANES[wk.lane];
          const targetVx = wk.dir * wk.def.speed * laneCfg.speedMult * wk.speedBoost;
          wk.vx += (targetVx - wk.vx) * Math.min(1, dt * 6);
          wk.x += wk.vx * dt;
          wk.flip = wk.dir < 0;
          wk.phase += dt * (4.8 + wk.lane * 0.8) * wk.speedBoost;

          // Exited off-screen? Replace with the next NPC in the 1->32 queue!
          if ((wk.dir === 1 && wk.x > w + 140) || (wk.dir === -1 && wk.x < -140)) {
            const fresh = spawnWalkerInLane(wk.lane);
            fresh.x = fresh.dir === 1 ? -110 : w + 110;
            walkers[i] = fresh;
          }
        }

        // 3. Same-lane encounter rules (max 2 chats, never behind Amr)
        if (!pausedRef.current) {
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

        // 4. Draw Lane 0 (far back) & Lane 1 (midground) + Ambient Slots on backCanvas
        const drawWalker = (ctx: CanvasRenderingContext2D, wk: LiveWalker) => {
          const laneCfg = LANES[wk.lane];
          const isMoving = wk.state === "walking";
          const frameIdx =
            wk.imgs.length > 1
              ? isMoving
                ? Math.floor(wk.phase * 0.85) % wk.imgs.length
                : 1
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

        // Ambient vignettes (10s hold + smooth slide/fade toward screen edge)
        ambientSlots.forEach((slot) => {
          const laneCfg = LANES[slot.lane];
          const frameIdx = Math.floor(slot.phase) % Math.max(1, slot.imgs.length);
          const img = slot.imgs[frameIdx];
          if (!img || !img.complete || !img.naturalWidth) return;

          let alpha = laneCfg.alpha;
          let slideOffset = 0;
          if (slot.timer < 1.0) {
            // Entering from edge
            const t = slot.timer;
            alpha *= t;
            slideOffset = (1 - t) * (slot.side === "left" ? -50 : 50);
          } else if (slot.timer > 11.0) {
            // Vanishing toward screen exit
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

        // Midground lane (Lane 1)
        walkers.filter((wk) => wk.lane === 1).forEach((wk) => drawWalker(bCtx, wk));

        // Foreground lane (Lane 2) on frontCanvas
        walkers.filter((wk) => wk.lane === 2).forEach((wk) => drawWalker(fCtx, wk));

        // 5. Speech bubbles on front layer (max 2, never overlapping)
        const drawnPairs = new Set<string>();
        const bubbleXs: number[] = [];
        walkers.forEach((a) => {
          if (drawnPairs.size >= 2) return;
          if (a.state !== "chatting" || !a.chatPartnerId) return;
          const pairKey = [a.def.id, a.chatPartnerId].sort().join("|");
          if (drawnPairs.has(pairKey)) return;
          const b = walkers.find((n) => n.def.id === a.chatPartnerId);
          if (!b || b.state !== "chatting") return;

          const midX = (a.x + b.x) * 0.5;
          if (bubbleXs.some((bx) => Math.abs(bx - midX) < 260)) return;
          drawnPairs.add(pairKey);
          bubbleXs.push(midX);

          const laneCfg = LANES[a.lane];
          const gy = h * laneCfg.groundRatio;
          const th = h * laneCfg.heightRatio;
          drawSpeechBubble(fCtx, midX, gy - th - 14, now / 1000, a.activeLine || b.activeLine, w);
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

export type NpcBehaviorType =
  | "stroller"   // Walks across the street, can meet others to chat or pause
  | "customer"   // Visits the foul cart, waits there, then strolls away
  | "cruiser"    // Jogger moving faster across the street
  | "ambient";   // Living street vignette (foul cart, oud player, newspaper reader)

export interface PointOfInterest {
  id: string;
  xRatio: number; // 0..1 across scene width
  z: number;      // 0 = far back, 1 = foreground
}

export interface NpcDefinition {
  id: string;
  name: string;
  behavior: NpcBehaviorType;
  /** 6-frame walk cycles for moving NPCs, or 1 frame for ambient vignettes */
  frames: string[];
  /** Base speed in px/sec (0 for ambient) */
  speed: number;
  /** Preferred depth range [minZ, maxZ] */
  zRange: [number, number];
  /** Optional home POI (for ambient props or customer targets) */
  homePoi?: string;
  /** Optional ambient particle effect */
  effect?: "steam" | "music" | "exhaust";
  /** Initial facing direction (true = facing left) */
  defaultFlip?: boolean;
  /** Relative size multiplier */
  sizeScale?: number;
  /** Whether this NPC can stop to chat when meeting another NPC */
  social?: boolean;
}

const walkFrames = (slug: string, count = 6) =>
  Array.from(
    { length: count },
    (_, i) => `/footer/street/${slug}-${String(i + 1).padStart(2, "0")}.webp`
  );

export const STREET_POIS: Record<string, PointOfInterest> = {
  foulCart: { id: "foulCart", xRatio: 0.11, z: 0.36 },
  foulQueue: { id: "foulQueue", xRatio: 0.18, z: 0.40 },
  oudCorner: { id: "oudCorner", xRatio: 0.25, z: 0.24 },
  centerBack: { id: "centerBack", xRatio: 0.50, z: 0.28 },
  rightBench: { id: "rightBench", xRatio: 0.87, z: 0.34 },
};

// 22 animated characters from Downloads/footor, scattered across depths & behaviors
const CAST_22: NpcDefinition[] = Array.from({ length: 22 }, (_, i) => {
  const num = String(i + 1).padStart(2, "0");
  const isCustomer = i % 6 === 0;
  const minZ = 0.24 + (i % 5) * 0.08;
  const maxZ = Math.min(0.66, minZ + 0.14);
  const speed = 22 + (i % 5) * 3.5;

  return {
    id: `cast-${num}`,
    name: `Street Character ${num}`,
    behavior: isCustomer ? "customer" : "stroller",
    frames: walkFrames(`cast-${num}`),
    speed,
    zRange: [minZ, maxZ] as [number, number],
    homePoi: isCustomer ? "foulQueue" : undefined,
    sizeScale: 0.94,
    social: i % 2 === 0, // Half of the cast will stop & chat when they meet!
  };
});

export const STREET_NPCS: NpcDefinition[] = [
  // --- Ambient living vignettes ---
  {
    id: "foul-vendor",
    name: "Foul Cart Vendor",
    behavior: "ambient",
    frames: ["/footer/street/still-01.webp"],
    speed: 0,
    zRange: [0.36, 0.36],
    homePoi: "foulCart",
    effect: "steam",
    sizeScale: 0.96,
  },
  {
    id: "oud-player",
    name: "Oud Player",
    behavior: "ambient",
    frames: ["/footer/street/still-06.webp"],
    speed: 0,
    zRange: [0.24, 0.24],
    homePoi: "oudCorner",
    effect: "music",
    sizeScale: 0.9,
  },
  {
    id: "newspaper-man",
    name: "Newspaper Reader",
    behavior: "ambient",
    frames: ["/footer/street/still-04.webp"],
    speed: 0,
    zRange: [0.34, 0.34],
    homePoi: "rightBench",
    defaultFlip: true,
    sizeScale: 0.92,
  },

  // --- All 22 animated walking characters ---
  ...CAST_22,
];

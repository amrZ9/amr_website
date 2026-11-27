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

  // --- Walking pairs & specialty characters ---
  {
    id: "pair-couple-phone",
    name: "Couple Walking",
    behavior: "stroller",
    frames: walkFrames("pair-couple-phone"),
    speed: 26,
    zRange: [0.34, 0.54],
    sizeScale: 0.98,
    social: false,
  },
  {
    id: "pair-friends-coffee",
    name: "Friends with Coffee",
    behavior: "stroller",
    frames: walkFrames("pair-friends-coffee"),
    speed: 28,
    zRange: [0.38, 0.58],
    sizeScale: 0.98,
    social: false,
  },
  {
    id: "pair-football",
    name: "Street Footballers",
    behavior: "stroller",
    frames: walkFrames("pair-football"),
    speed: 24,
    zRange: [0.28, 0.44],
    sizeScale: 0.92,
    social: false,
  },
  {
    id: "pair-mom-daughter",
    name: "Mother and Daughter",
    behavior: "stroller",
    frames: walkFrames("pair-mom-daughter"),
    speed: 22,
    zRange: [0.40, 0.60],
    sizeScale: 0.98,
    social: false,
  },
  {
    id: "pair-uncles-chat",
    name: "Chatting Uncles",
    behavior: "stroller",
    frames: walkFrames("pair-uncles-chat"),
    speed: 19,
    zRange: [0.26, 0.42],
    sizeScale: 0.96,
    social: false,
  },
  {
    id: "worker-plank",
    name: "Construction Worker",
    behavior: "stroller",
    frames: walkFrames("worker-plank"),
    speed: 25,
    zRange: [0.32, 0.50],
    sizeScale: 0.96,
    social: true,
  },
  {
    id: "football-juggler",
    name: "Football Juggler",
    behavior: "stroller",
    frames: walkFrames("football-juggler"),
    speed: 27,
    zRange: [0.42, 0.60],
    sizeScale: 0.96,
    social: false,
  },
  {
    id: "abaya-phone",
    name: "Abaya Phone Walker",
    behavior: "stroller",
    frames: walkFrames("abaya-phone"),
    speed: 26,
    zRange: [0.36, 0.56],
    sizeScale: 0.95,
    social: true,
  },
  {
    id: "tourist-map",
    name: "Map Reader",
    behavior: "stroller",
    frames: walkFrames("tourist-map"),
    speed: 23,
    zRange: [0.30, 0.48],
    sizeScale: 0.95,
    social: true,
  },
  {
    id: "officer-walk",
    name: "Patrol Officer",
    behavior: "stroller",
    frames: walkFrames("officer-walk"),
    speed: 28,
    zRange: [0.34, 0.52],
    sizeScale: 0.96,
    social: true,
  },
];

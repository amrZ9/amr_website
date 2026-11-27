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
  // --- Animated Ambient Street Vignettes (3 active per visit, all visible in /npc-hub) ---
  {
    id: "amb-tea-cart",
    name: "Tea Cart Vendor",
    behavior: "ambient",
    frames: walkFrames("amb-tea-cart"),
    speed: 0,
    zRange: [0.36, 0.36],
    homePoi: "foulCart",
    effect: "steam",
    sizeScale: 1.0,
  },
  {
    id: "amb-corn-cart",
    name: "Grilled Corn Cart",
    behavior: "ambient",
    frames: walkFrames("amb-corn-cart"),
    speed: 0,
    zRange: [0.36, 0.36],
    homePoi: "foulCart",
    effect: "steam",
    sizeScale: 1.02,
  },
  {
    id: "amb-corn-kid",
    name: "Corn Cart & Kid",
    behavior: "ambient",
    frames: walkFrames("amb-corn-kid"),
    speed: 0,
    zRange: [0.36, 0.36],
    homePoi: "foulCart",
    effect: "steam",
    sizeScale: 1.02,
  },
  {
    id: "amb-fruit-cart",
    name: "Fruit Cart Vendor",
    behavior: "ambient",
    frames: walkFrames("amb-fruit-cart"),
    speed: 0,
    zRange: [0.36, 0.36],
    homePoi: "foulCart",
    sizeScale: 0.98,
  },
  {
    id: "amb-bread-oven",
    name: "Baladi Bread Baker",
    behavior: "ambient",
    frames: walkFrames("amb-bread-oven"),
    speed: 0,
    zRange: [0.26, 0.26],
    homePoi: "oudCorner",
    effect: "steam",
    sizeScale: 0.96,
  },
  {
    id: "amb-shisha",
    name: "Shisha Cafe Guy",
    behavior: "ambient",
    frames: walkFrames("amb-shisha"),
    speed: 0,
    zRange: [0.26, 0.26],
    homePoi: "oudCorner",
    sizeScale: 0.92,
  },
  {
    id: "amb-ahwa-elder",
    name: "Ahwa Tea Elder",
    behavior: "ambient",
    frames: walkFrames("amb-ahwa-elder"),
    speed: 0,
    zRange: [0.26, 0.26],
    homePoi: "oudCorner",
    sizeScale: 0.94,
  },
  {
    id: "amb-bench-thinker",
    name: "Bench Daydreamer",
    behavior: "ambient",
    frames: walkFrames("amb-bench-thinker"),
    speed: 0,
    zRange: [0.26, 0.26],
    homePoi: "oudCorner",
    sizeScale: 0.92,
  },
  {
    id: "amb-backgammon",
    name: "Backgammon Players",
    behavior: "ambient",
    frames: walkFrames("amb-backgammon"),
    speed: 0,
    zRange: [0.34, 0.34],
    homePoi: "rightBench",
    sizeScale: 0.98,
  },
  {
    id: "amb-cafe-newspaper",
    name: "Cafe Newspaper Reader",
    behavior: "ambient",
    frames: walkFrames("amb-cafe-newspaper"),
    speed: 0,
    zRange: [0.34, 0.34],
    homePoi: "rightBench",
    defaultFlip: true,
    sizeScale: 0.94,
  },
  {
    id: "amb-cafe-women",
    name: "Laughing Cafe Friends",
    behavior: "ambient",
    frames: walkFrames("amb-cafe-women"),
    speed: 0,
    zRange: [0.34, 0.34],
    homePoi: "rightBench",
    sizeScale: 0.98,
  },
  {
    id: "amb-traffic-cop",
    name: "Traffic Officer",
    behavior: "ambient",
    frames: walkFrames("amb-traffic-cop"),
    speed: 0,
    zRange: [0.34, 0.34],
    homePoi: "rightBench",
    defaultFlip: true,
    sizeScale: 0.95,
  },
  {
    id: "amb-delivery-bike",
    name: "Delivery Bike",
    behavior: "ambient",
    frames: walkFrames("amb-delivery-bike"),
    speed: 0,
    zRange: [0.36, 0.36],
    homePoi: "foulCart",
    sizeScale: 0.96,
  },
  {
    id: "amb-sugarcane",
    name: "Sugarcane Juice Cart",
    behavior: "ambient",
    frames: walkFrames("amb-sugarcane"),
    speed: 0,
    zRange: [0.36, 0.36],
    homePoi: "foulCart",
    sizeScale: 1.04,
  },
  {
    id: "amb-taameya",
    name: "Ta'ameya Cart & Student",
    behavior: "ambient",
    frames: walkFrames("amb-taameya"),
    speed: 0,
    zRange: [0.36, 0.36],
    homePoi: "foulCart",
    effect: "steam",
    sizeScale: 1.04,
  },
  {
    id: "amb-foul-girl",
    name: "Foul Cart & Customer",
    behavior: "ambient",
    frames: walkFrames("amb-foul-girl"),
    speed: 0,
    zRange: [0.36, 0.36],
    homePoi: "foulCart",
    effect: "steam",
    sizeScale: 1.04,
  },
  {
    id: "amb-fruit-stand",
    name: "Awning Fruit Stand",
    behavior: "ambient",
    frames: walkFrames("amb-fruit-stand"),
    speed: 0,
    zRange: [0.36, 0.36],
    homePoi: "foulCart",
    sizeScale: 1.02,
  },
  {
    id: "amb-laptop-coder",
    name: "Laptop Coder",
    behavior: "ambient",
    frames: walkFrames("amb-laptop-coder"),
    speed: 0,
    zRange: [0.26, 0.26],
    homePoi: "oudCorner",
    sizeScale: 0.9,
  },
  {
    id: "amb-mom-son",
    name: "Mom & Son",
    behavior: "ambient",
    frames: walkFrames("amb-mom-son"),
    speed: 0,
    zRange: [0.26, 0.26],
    homePoi: "oudCorner",
    sizeScale: 0.94,
  },
  {
    id: "amb-dad-daughter",
    name: "Dad & Daughter",
    behavior: "ambient",
    frames: walkFrames("amb-dad-daughter"),
    speed: 0,
    zRange: [0.34, 0.34],
    homePoi: "rightBench",
    sizeScale: 0.96,
  },
  {
    id: "amb-sweeper-kind",
    name: "Neighbor & Street Sweeper",
    behavior: "ambient",
    frames: walkFrames("amb-sweeper-kind"),
    speed: 0,
    zRange: [0.34, 0.34],
    homePoi: "rightBench",
    sizeScale: 0.98,
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

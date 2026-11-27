export type NpcBehaviorType =
  | "stroller"   // Walks across the street, occasionally pauses to look around
  | "customer"   // Walks to the foul cart, waits/chats there, then walks away
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
  catCorner: { id: "catCorner", xRatio: 0.77, z: 0.22 },
};

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

  // --- Customers who visit the Foul Cart & stroll away ---
  {
    id: "student-backpack",
    name: "Backpack Student",
    behavior: "customer",
    frames: walkFrames("backpack-walk"),
    speed: 30,
    zRange: [0.34, 0.52],
    homePoi: "foulQueue",
    sizeScale: 0.95,
  },
  {
    id: "coffee-girl",
    name: "Coffee Walker",
    behavior: "customer",
    frames: walkFrames("coffee-walk"),
    speed: 28,
    zRange: [0.32, 0.48],
    homePoi: "foulQueue",
    sizeScale: 0.94,
  },
  {
    id: "apron-uncle",
    name: "Cafe Uncle",
    behavior: "customer",
    frames: walkFrames("apron-walk"),
    speed: 26,
    zRange: [0.36, 0.50],
    homePoi: "foulQueue",
    sizeScale: 0.96,
  },

  // --- Natural strollers (6-frame walk cycles) ---
  {
    id: "striped-girl",
    name: "Tote Bag Stroller",
    behavior: "stroller",
    frames: walkFrames("striped-walk"),
    speed: 30,
    zRange: [0.48, 0.66],
    sizeScale: 0.96,
  },
  {
    id: "hijabi-books",
    name: "Student with Books",
    behavior: "stroller",
    frames: walkFrames("books-walk"),
    speed: 29,
    zRange: [0.40, 0.58],
    sizeScale: 0.94,
  },
  {
    id: "nubian-woman",
    name: "Traditional Dress Stroller",
    behavior: "stroller",
    frames: walkFrames("nubian-walk"),
    speed: 27,
    zRange: [0.30, 0.48],
    sizeScale: 0.95,
  },
  {
    id: "reading-hijabi",
    name: "Reading Student",
    behavior: "stroller",
    frames: walkFrames("reading-walk"),
    speed: 24,
    zRange: [0.44, 0.62],
    sizeScale: 0.94,
  },
  {
    id: "briefcase-man",
    name: "Office Commuter",
    behavior: "stroller",
    frames: walkFrames("briefcase-walk"),
    speed: 34,
    zRange: [0.38, 0.58],
    sizeScale: 0.96,
  },
  {
    id: "elder-cane",
    name: "Elder with Cane",
    behavior: "stroller",
    frames: walkFrames("elder-walk"),
    speed: 18,
    zRange: [0.25, 0.42],
    sizeScale: 0.95,
  },

  // --- Fast runner (jogger) ---
  {
    id: "jogger-girl",
    name: "Morning Jogger",
    behavior: "cruiser",
    frames: walkFrames("jogger-run"),
    speed: 78,
    zRange: [0.46, 0.56],
    sizeScale: 0.94,
  },
];

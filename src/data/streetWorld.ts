export type NpcBehaviorType =
  | "stroller"   // Walks across the street, occasionally pauses to look around or check phone
  | "customer"   // Walks to the foul cart, waits/chats there, then walks away
  | "cruiser"    // Delivery scooter / jogger moving faster with occasional brief stop
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
  /** Supports 1 static frame now, or multi-frame walk-cycle arrays later */
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
    frames: ["/footer/street/walk-01.webp"],
    speed: 38,
    zRange: [0.34, 0.52],
    homePoi: "foulQueue",
    sizeScale: 0.92,
  },
  {
    id: "coffee-girl",
    name: "Coffee Walker",
    behavior: "customer",
    frames: ["/footer/street/walk-04.webp"],
    speed: 34,
    zRange: [0.32, 0.48],
    homePoi: "foulQueue",
    sizeScale: 0.9,
  },

  // --- Natural strollers (walk, pause, look around, continue) ---
  {
    id: "laptop-hijabi",
    name: "Laptop Student",
    behavior: "stroller",
    frames: ["/footer/street/walk-02.webp"],
    speed: 36,
    zRange: [0.42, 0.62],
    sizeScale: 0.88,
  },
  {
    id: "phone-guy",
    name: "Phone Caller",
    behavior: "stroller",
    frames: ["/footer/street/walk-03.webp"],
    speed: 32,
    zRange: [0.26, 0.46],
    sizeScale: 0.9,
  },
  {
    id: "briefcase-man",
    name: "Office Commuter",
    behavior: "stroller",
    frames: ["/footer/street/walk-06.webp"],
    speed: 42,
    zRange: [0.38, 0.58],
    sizeScale: 0.9,
  },
  {
    id: "striped-girl",
    name: "Tote Bag Stroller",
    behavior: "stroller",
    frames: [
      "/footer/street/striped-walk-01.webp",
      "/footer/street/striped-walk-02.webp",
      "/footer/street/striped-walk-03.webp",
      "/footer/street/striped-walk-04.webp",
      "/footer/street/striped-walk-05.webp",
      "/footer/street/striped-walk-06.webp",
    ],
    speed: 44,
    zRange: [0.48, 0.68],
    sizeScale: 0.96,
  },
  {
    id: "elder-cane",
    name: "Elder with Cane",
    behavior: "stroller",
    frames: ["/footer/street/walk-12.webp"],
    speed: 20,
    zRange: [0.25, 0.42],
    sizeScale: 0.92,
  },
];

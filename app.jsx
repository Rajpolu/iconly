const { useState, useEffect, useRef, useCallback, useMemo } = React;

/* ----------------------------------------------------------------
   BASE ICON SHAPES — hand-drawn primitives across categories.
   The icon library now shows one canonical entry per source design:
   no rotated, mirrored, or position-shifted clones.
------------------------------------------------------------------*/
const BASE_SHAPES = [
  // Symbols
  { id: "bolt", name: "Bolt", cat: "Symbols", rotSym: 360, mirrorSym: false, paths: [{ d: "M13 2 L4 14 H11 L10 22 L20 9 H13 Z" }] },
  { id: "star", name: "Star", cat: "Symbols", rotSym: 360, mirrorSym: true, paths: [{ d: "M12 2 L14.7 9 L22 9.3 L16.3 14 L18.2 21 L12 17 L5.8 21 L7.7 14 L2 9.3 L9.3 9 Z" }] },
  { id: "heart", name: "Heart", cat: "Symbols", rotSym: 360, mirrorSym: true, paths: [{ d: "M12 21 C12 21 3 14.7 3 8.6 C3 5.6 5.4 3.2 8.4 3.2 C10.1 3.2 11.4 4 12 5.2 C12.6 4 13.9 3.2 15.6 3.2 C18.6 3.2 21 5.6 21 8.6 C21 14.7 12 21 12 21 Z" }] },
  { id: "shield", name: "Shield", cat: "Symbols", rotSym: 360, mirrorSym: true, paths: [{ d: "M12 2 L20 5.5 V11 C20 16 16.6 20 12 22 C7.4 20 4 16 4 11 V5.5 Z" }] },
  { id: "crown", name: "Crown", cat: "Symbols", rotSym: 360, mirrorSym: true, paths: [{ d: "M3 8 L8 12 L12 5 L16 12 L21 8 L19 18 H5 Z" }] },
  // Shapes
  { id: "diamond", name: "Diamond", cat: "Shapes", rotSym: 360, mirrorSym: true, paths: [{ d: "M6 2 H18 L22 9 L12 22 L2 9 Z" }] },
  { id: "hexagon", name: "Hexagon", cat: "Shapes", rotSym: 180, mirrorSym: true, paths: [{ d: "M12 2 L21 7 V17 L12 22 L3 17 V7 Z" }] },
  { id: "circle", name: "Circle", cat: "Shapes", rotSym: 90, mirrorSym: true, paths: [{ type: "circle", cx: 12, cy: 12, r: 10 }] },
  { id: "square", name: "Square", cat: "Shapes", rotSym: 90, mirrorSym: true, paths: [{ type: "rect", x: 3, y: 3, w: 18, h: 18, rx: 5 }] },
  { id: "triangle", name: "Triangle", cat: "Shapes", rotSym: 360, mirrorSym: true, paths: [{ d: "M12 2 L22 21 H2 Z" }] },
  // Nature
  { id: "flame", name: "Flame", cat: "Nature", rotSym: 360, mirrorSym: true, paths: [{ d: "M12 2 C12 6 7 8 7 13 C7 17.4 9.6 21 12 22 C14.4 21 17 17.4 17 13 C17 11 16 9.5 15 8.5 C15 10 14 11 13 11 C13 8 11 6 12 2 Z" }] },
  { id: "leaf", name: "Leaf", cat: "Nature", rotSym: 360, mirrorSym: false, paths: [{ d: "M20 4 C10 4 4 10 4 18 C4 20 4 20 4 20 C12 20 20 14 20 4 Z" }] },
  { id: "sun", name: "Sun", cat: "Nature", rotSym: 90, mirrorSym: true, paths: [{ type: "circle", cx: 12, cy: 12, r: 5 }, { d: "M12 1 V4 M12 20 V23 M1 12 H4 M20 12 H23 M4.2 4.2 L6.3 6.3 M17.7 17.7 L19.8 19.8 M4.2 19.8 L6.3 17.7 M17.7 6.3 L19.8 4.2", stroke: true }] },
  { id: "drop", name: "Droplet", cat: "Nature", rotSym: 360, mirrorSym: true, paths: [{ d: "M12 2 C12 2 20 12 20 16.5 C20 21 16.4 22.5 12 22.5 C7.6 22.5 4 21 4 16.5 C4 12 12 2 12 2 Z" }] },
  { id: "moon", name: "Moon", cat: "Nature", rotSym: 360, mirrorSym: false, paths: [{ d: "M14 3 C9 3 5 7 5 12 C5 17 9 21 14 21 C10.5 18.5 8.5 15.5 8.5 12 C8.5 8.5 10.5 5.5 14 3 Z" }] },
  // Tech
  { id: "rocket", name: "Rocket", cat: "Tech", rotSym: 360, mirrorSym: true, paths: [{ d: "M12 2 C16 4 18 9 17 14 L15 16 L9 16 L7 14 C6 9 8 4 12 2 Z" }, { d: "M9 16 L7 21 L10 19 M15 16 L17 21 L14 19", stroke: true }] },
  { id: "gear", name: "Gear", cat: "Tech", rotSym: 90, mirrorSym: true, paths: [{ type: "circle", cx: 12, cy: 12, r: 4 }, { d: "M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22 M4.5 4.5 L6.6 6.6 M17.4 17.4 L19.5 19.5 M4.5 19.5 L6.6 17.4 M17.4 6.6 L19.5 4.5", stroke: true, w: 2.5 }] },
  { id: "chip", name: "Chip", cat: "Tech", rotSym: 90, mirrorSym: true, paths: [{ type: "rect", x: 6, y: 6, w: 12, h: 12, rx: 2 }, { d: "M9 2 V6 M12 2 V6 M15 2 V6 M9 18 V22 M12 18 V22 M15 18 V22 M2 9 H6 M2 12 H6 M2 15 H6 M18 9 H22 M18 12 H22 M18 15 H22", stroke: true, w: 1.6 }] },
  { id: "camera", name: "Camera", cat: "Tech", rotSym: 360, mirrorSym: true, paths: [{ type: "rect", x: 2, y: 7, w: 20, h: 13, rx: 2 }, { type: "circle", cx: 12, cy: 13.5, r: 4 }, { d: "M9 7 L10.5 4 H13.5 L15 7" }] },
  { id: "bulb", name: "Bulb", cat: "Tech", rotSym: 360, mirrorSym: true, paths: [{ type: "circle", cx: 12, cy: 10, r: 6 }, { type: "rect", x: 9, y: 16, w: 6, h: 4, rx: 1 }] },
  // Social
  { id: "bell", name: "Bell", cat: "Social", rotSym: 360, mirrorSym: true, paths: [{ d: "M12 2 C9.8 2 8 3.8 8 6 V10 C8 12 7 13.5 5.5 15 H18.5 C17 13.5 16 12 16 10 V6 C16 3.8 14.2 2 12 2 Z M10 18 C10 19.1 10.9 20 12 20 C13.1 20 14 19.1 14 18" }] },
  { id: "chat", name: "Chat", cat: "Social", rotSym: 360, mirrorSym: false, paths: [{ d: "M4 5 H20 C21 5 22 6 22 7 V15 C22 16 21 17 20 17 H10 L5 21 V17 H4 C3 17 2 16 2 15 V7 C2 6 3 5 4 5 Z" }] },
  { id: "gift", name: "Gift", cat: "Social", rotSym: 360, mirrorSym: true, paths: [{ type: "rect", x: 3, y: 9, w: 18, h: 12, rx: 1 }, { type: "rect", x: 2, y: 6, w: 20, h: 4, rx: 1 }, { d: "M12 6 V21" }] },
  { id: "thumb", name: "Thumbs up", cat: "Social", rotSym: 360, mirrorSym: false, paths: [{ d: "M7 10 H4 V21 H7 Z" }, { d: "M7 10 L10 3 C11 3 12 4 12 5.5 L11 10 H18 C19 10 20 11 19.5 12.5 L17.5 19 C17.2 20 16.3 21 15 21 H7 Z" }] },
  { id: "mail", name: "Mail", cat: "Social", rotSym: 360, mirrorSym: true, paths: [{ type: "rect", x: 2, y: 5, w: 20, h: 14, rx: 2 }, { d: "M3 6 L12 13 L21 6", stroke: true }] },
  // Food
  { id: "cup", name: "Cup", cat: "Food", rotSym: 360, mirrorSym: false, paths: [{ d: "M4 3 H16 V13 C16 17 12.4 20 10 20 C7.6 20 4 17 4 13 Z" }, { d: "M16 6 H19 C20 6 21 7 21 8.5 C21 10 20 11 19 11 H16" }] },
  { id: "pizza", name: "Pizza", cat: "Food", rotSym: 360, mirrorSym: true, paths: [{ d: "M12 2 L22 20 H2 Z" }, { type: "circle", cx: 12, cy: 10, r: 1.1 }, { type: "circle", cx: 9, cy: 14, r: 1.1 }, { type: "circle", cx: 15, cy: 14, r: 1.1 }] },
  { id: "apple", name: "Apple", cat: "Food", rotSym: 360, mirrorSym: true, paths: [{ d: "M12 8 C9 6 5 8 5 13 C5 18 8 21 11 21 C11.6 21 12.4 21 13 21 C16 21 19 18 19 13 C19 8 15 6 12 8 Z" }, { d: "M12 8 C12 6 13 4 15 3.5", stroke: true }] },
  { id: "cake", name: "Cake", cat: "Food", rotSym: 360, mirrorSym: true, paths: [{ type: "rect", x: 3, y: 12, w: 18, h: 9, rx: 1 }, { d: "M3 12 C3 9 21 9 21 12" }, { d: "M8 9 V6 M12 9 V5 M16 9 V6" }] },
  { id: "burger", name: "Burger", cat: "Food", rotSym: 360, mirrorSym: true, paths: [{ d: "M3 8 C3 5 21 5 21 8 Z" }, { type: "rect", x: 3, y: 10, w: 18, h: 3 }, { d: "M3 16 C3 19 21 19 21 16 Z" }] },
  // Travel
  { id: "plane", name: "Plane", cat: "Travel", rotSym: 360, mirrorSym: false, paths: [{ d: "M2 14 L22 8 L20 11 L13 13 L14 20 L11 21 L9 15 L3 17 Z" }] },
  { id: "car", name: "Car", cat: "Travel", rotSym: 360, mirrorSym: false, paths: [{ d: "M4 15 L6 8 H18 L20 15 Z" }, { type: "rect", x: 3, y: 15, w: 18, h: 4, rx: 1 }, { type: "circle", cx: 7.5, cy: 19, r: 2 }, { type: "circle", cx: 16.5, cy: 19, r: 2 }] },
  { id: "anchor", name: "Anchor", cat: "Travel", rotSym: 360, mirrorSym: true, paths: [{ type: "circle", cx: 12, cy: 4, r: 2 }, { d: "M12 6 V20 M6 14 C6 18 9 20 12 20 C15 20 18 18 18 14", stroke: true, w: 2.4 }, { d: "M5 9 H19", stroke: true }] },
  { id: "compass", name: "Compass", cat: "Travel", rotSym: 360, mirrorSym: false, paths: [{ type: "circle", cx: 12, cy: 12, r: 10 }, { d: "M15 8 L11 11 L9 16 L13 13 Z" }] },
  { id: "globe", name: "Globe", cat: "Travel", rotSym: 180, mirrorSym: true, paths: [{ type: "circle", cx: 12, cy: 12, r: 10 }, { d: "M2 12 H22 M12 2 C15 5 15 19 12 22 C9 19 9 5 12 2 Z", stroke: true } ] },
  // Weather
  { id: "cloud", name: "Cloud", cat: "Weather", rotSym: 360, mirrorSym: false, paths: [{ d: "M7 18 C4 18 2 16 2 13.5 C2 11 4 9.3 6.4 9.1 C7.2 6.2 9.8 4 13 4 C16.6 4 19.5 6.8 19.7 10.3 C21.6 10.9 23 12.6 23 14.6 C23 17 20.9 18 18.5 18 Z" }] },
  { id: "snowflake", name: "Snowflake", cat: "Weather", rotSym: 180, mirrorSym: true, paths: [{ d: "M12 2 V22 M4 7 L20 17 M4 17 L20 7", stroke: true, w: 2 }] },
  { id: "umbrella", name: "Umbrella", cat: "Weather", rotSym: 360, mirrorSym: true, paths: [{ d: "M2 12 C2 6 6.5 2 12 2 C17.5 2 22 6 22 12 Z" }, { d: "M12 12 V20 C12 21.5 10.5 22 9.5 21", stroke: true, w: 2 }] },
  { id: "rainbow", name: "Rainbow", cat: "Weather", rotSym: 360, mirrorSym: true, paths: [{ d: "M2 20 C2 11 22 11 22 20", stroke: true, w: 3 }] },
  { id: "wind", name: "Wind", cat: "Weather", rotSym: 360, mirrorSym: false, paths: [{ d: "M2 8 H15 C17 8 18 6.5 17 5 C16 3.5 13.5 4 13 6 M2 13 H19 C21.5 13 22.5 10.5 21 9 M2 18 H12 C14 18 15 20 13.5 21.5", stroke: true, w: 2 }] },
  // Business
  { id: "briefcase", name: "Briefcase", cat: "Business", rotSym: 360, mirrorSym: true, paths: [{ type: "rect", x: 2, y: 8, w: 20, h: 12, rx: 2 }, { d: "M9 8 V5 C9 4 10 3 11 3 H13 C14 3 15 4 15 5 V8" }] },
  { id: "chartbar", name: "Chart", cat: "Business", rotSym: 360, mirrorSym: false, paths: [{ type: "rect", x: 3, y: 12, w: 4, h: 9 }, { type: "rect", x: 10, y: 6, w: 4, h: 15 }, { type: "rect", x: 17, y: 9, w: 4, h: 12 }] },
  { id: "target", name: "Target", cat: "Business", rotSym: 90, mirrorSym: true, paths: [{ type: "circle", cx: 12, cy: 12, r: 10 }, { type: "circle", cx: 12, cy: 12, r: 6 }, { type: "circle", cx: 12, cy: 12, r: 2 }] },
  { id: "medal", name: "Medal", cat: "Business", rotSym: 360, mirrorSym: true, paths: [{ type: "circle", cx: 12, cy: 15, r: 7 }, { d: "M8 9 L5 2 H9 L12 9 M16 9 L19 2 H15 L12 9" }] },
  { id: "handshake", name: "Handshake", cat: "Business", rotSym: 360, mirrorSym: true, paths: [{ d: "M2 12 L7 8 L11 12 L9 14 L7 12 L2 15 Z M22 12 L17 8 L13 12 L15 14 L17 12 L22 15 Z" }] },
  // Animals
  { id: "paw", name: "Paw", cat: "Animals", rotSym: 360, mirrorSym: true, paths: [{ type: "circle", cx: 12, cy: 16, r: 5 }, { type: "circle", cx: 6, cy: 8, r: 2.3 }, { type: "circle", cx: 12, cy: 5, r: 2.3 }, { type: "circle", cx: 18, cy: 8, r: 2.3 }] },
  { id: "fish", name: "Fish", cat: "Animals", rotSym: 360, mirrorSym: false, paths: [{ d: "M3 12 C7 6 17 6 21 12 C17 18 7 18 3 12 Z" }, { d: "M21 12 L23 9 V15 Z" }] },
  { id: "bird", name: "Bird", cat: "Animals", rotSym: 360, mirrorSym: false, paths: [{ d: "M4 15 C4 9 9 5 15 6 C13 7 12 8.5 12 10 C16 9 20 10 22 13 C19 12.5 17 13 16 14.5 C14 17 9 18 4 15 Z" }] },
  { id: "cat", name: "Cat", cat: "Animals", rotSym: 360, mirrorSym: true, paths: [{ d: "M6 5 L8 10 H16 L18 5 L15 9 H9 Z" }, { type: "circle", cx: 12, cy: 13, r: 6 }] },
  { id: "butterfly", name: "Butterfly", cat: "Animals", rotSym: 360, mirrorSym: true, paths: [{ d: "M12 4 V20 M12 8 C8 4 2 6 3 11 C4 15 9 14 12 11 M12 8 C16 4 22 6 21 11 C20 15 15 14 12 11", stroke: true, w: 2 }] },
  // Objects
  { id: "key", name: "Key", cat: "Objects", rotSym: 360, mirrorSym: false, paths: [{ type: "circle", cx: 7, cy: 12, r: 5 }, { d: "M12 12 H22 V15 M18 12 V16", stroke: true, w: 2.4 }] },
  { id: "lock", name: "Lock", cat: "Objects", rotSym: 360, mirrorSym: true, paths: [{ type: "rect", x: 4, y: 11, w: 16, h: 11, rx: 2 }, { d: "M7 11 V7 C7 4 9.2 2 12 2 C14.8 2 17 4 17 7 V11", stroke: true, w: 2.2 }] },
  { id: "clock", name: "Clock", cat: "Objects", rotSym: 360, mirrorSym: false, paths: [{ type: "circle", cx: 12, cy: 12, r: 10 }, { d: "M12 6 V12 L16 15", stroke: true, w: 2 }] },
  { id: "book", name: "Book", cat: "Objects", rotSym: 360, mirrorSym: true, paths: [{ d: "M3 4 H11 C12 4 12 4.5 12 5 V21 C12 20.4 11.4 20 10.5 20 H3 Z M21 4 H13 C12 4 12 4.5 12 5 V21 C12 20.4 12.6 20 13.5 20 H21 Z" }] },
  { id: "envelope", name: "Envelope", cat: "Objects", rotSym: 360, mirrorSym: true, paths: [{ type: "rect", x: 2, y: 6, w: 20, h: 13, rx: 2 }, { d: "M3 7 L12 14 L21 7", stroke: true } ] },
  // Logos
  { id: "orbit-mark", name: "Orbit Mark", cat: "Logos", paths: [{ type: "circle", cx: 12, cy: 12, r: 4.2 }, { d: "M3 12 C6 5 18 5 21 12 C18 19 6 19 3 12 Z", stroke: true, w: 2.1 }] },
  { id: "nova-loop", name: "Nova Loop", cat: "Logos", paths: [{ d: "M12 2 L16.3 8.2 L23 9.3 L18 14 L19.2 21 L12 17.6 L4.8 21 L6 14 L1 9.3 L7.7 8.2 Z" }, { type: "circle", cx: 12, cy: 12, r: 3.2 }] },
  { id: "prism-fold", name: "Prism Fold", cat: "Logos", paths: [{ d: "M4 4 H15 L20 9 V20 H9 L4 15 Z" }, { d: "M15 4 V9 H20 M9 20 V15 H4", stroke: true, w: 1.8 }] },
  { id: "wave-spark", name: "Wave Spark", cat: "Logos", paths: [{ d: "M2 14 C5 7 10 7 12 12 C14 17 19 17 22 10 V17 C18 22 13 22 10.8 16.6 C8.7 11.3 5.2 11.4 2 18 Z" }] },
  { id: "ribbon-a", name: "Ribbon A", cat: "Logos", paths: [{ d: "M12 2 L22 22 H16.4 L14.6 17 H9.4 L7.6 22 H2 Z M10.8 12.8 H13.2 L12 9.2 Z" }] },
  { id: "monolith", name: "Monolith", cat: "Logos", paths: [{ d: "M8 2 H18 L16 22 H6 Z" }, { d: "M8 2 L16 22", stroke: true, w: 1.7 }] },
  { id: "split-gem", name: "Split Gem", cat: "Logos", paths: [{ d: "M12 2 L22 8 L18 22 H6 L2 8 Z" }, { d: "M12 2 V22 M2 8 H22", stroke: true, w: 1.5 }] },
  { id: "pulse-core", name: "Pulse Core", cat: "Logos", paths: [{ d: "M3 13 H7 L9 7 L13 18 L16 10 L18 13 H21", stroke: true, w: 2.7 }, { type: "circle", cx: 12, cy: 12, r: 2.5 }] },
  { id: "apex-ring", name: "Apex Ring", cat: "Logos", paths: [{ d: "M12 2 L22 20 H2 Z" }, { d: "M12 7 L17 17 H7 Z" }] },
  { id: "signal-stack", name: "Signal Stack", cat: "Logos", paths: [{ type: "rect", x: 4, y: 15, w: 4, h: 6, rx: 1.2 }, { type: "rect", x: 10, y: 10, w: 4, h: 11, rx: 1.2 }, { type: "rect", x: 16, y: 4, w: 4, h: 17, rx: 1.2 }] },
  { id: "helix-mark", name: "Helix Mark", cat: "Logos", paths: [{ d: "M6 3 C17 3 17 9 6 12 C17 15 17 21 6 21", stroke: true, w: 3 }, { type: "circle", cx: 6, cy: 3, r: 1.8 }, { type: "circle", cx: 6, cy: 21, r: 1.8 }] },
  { id: "keystone", name: "Keystone", cat: "Logos", paths: [{ d: "M5 3 H19 L16 21 H8 Z" }, { d: "M8 8 H16 L14.5 16 H9.5 Z" }] },
  { id: "arc-lift", name: "Arc Lift", cat: "Logos", paths: [{ d: "M4 18 C6 8 18 8 20 18 H16 C14.5 12.5 9.5 12.5 8 18 Z" }, { d: "M12 4 L15 9 H9 Z" }] },
  { id: "pixel-bloom", name: "Pixel Bloom", cat: "Logos", paths: [{ type: "rect", x: 4, y: 4, w: 6, h: 6, rx: 1.5 }, { type: "rect", x: 14, y: 4, w: 6, h: 6, rx: 1.5 }, { type: "rect", x: 4, y: 14, w: 6, h: 6, rx: 1.5 }, { type: "rect", x: 14, y: 14, w: 6, h: 6, rx: 1.5 }, { type: "circle", cx: 12, cy: 12, r: 2.2 }] },
  { id: "flux-diamond", name: "Flux Diamond", cat: "Logos", paths: [{ d: "M12 2 L22 12 L12 22 L2 12 Z" }, { d: "M12 2 L12 22 M2 12 H22", stroke: true, w: 1.6 }] },
  { id: "crescent-block", name: "Crescent Block", cat: "Logos", paths: [{ d: "M15 3 C9 3 4 8 4 14 C4 18.5 7.5 21 12 21 C9.5 18.5 8.5 15.6 9.4 12.7 C10.4 9.3 12.5 6.2 15 3 Z" }, { type: "rect", x: 13, y: 7, w: 7, h: 10, rx: 2 }] },
  { id: "beam-cross", name: "Beam Cross", cat: "Logos", paths: [{ d: "M10 2 H14 V10 H22 V14 H14 V22 H10 V14 H2 V10 H10 Z" }] },
  { id: "soft-capsule", name: "Soft Capsule", cat: "Logos", paths: [{ d: "M7 5 H17 C20 5 22 7 22 10 C22 13 20 15 17 15 H12 C10.3 15 9 16.3 9 18 C9 20.2 7.2 22 5 22 C3.3 22 2 20.7 2 19 V10 C2 7 4 5 7 5 Z" }] },
  { id: "vector-vault", name: "Vector Vault", cat: "Logos", paths: [{ d: "M3 5 H21 L18 19 H6 Z" }, { d: "M8 9 L12 15 L16 9", stroke: true, w: 2.2 }] },
  { id: "halo-triangle", name: "Halo Triangle", cat: "Logos", paths: [{ d: "M12 5 L20 19 H4 Z" }, { type: "circle", cx: 12, cy: 12, r: 10 }] },
  { id: "dash-crown", name: "Dash Crown", cat: "Logos", paths: [{ d: "M4 17 H20 L18.5 8 L14.5 13 L12 5 L9.5 13 L5.5 8 Z" }, { d: "M7 21 H17", stroke: true, w: 2.2 }] },
  { id: "lens-spark", name: "Lens Spark", cat: "Logos", paths: [{ d: "M2 12 C5 6 19 6 22 12 C19 18 5 18 2 12 Z" }, { type: "circle", cx: 12, cy: 12, r: 3.4 }, { d: "M18 3 V7 M16 5 H20", stroke: true, w: 1.8 }] },
  { id: "axis-node", name: "Axis Node", cat: "Logos", paths: [{ type: "circle", cx: 6, cy: 6, r: 3 }, { type: "circle", cx: 18, cy: 6, r: 3 }, { type: "circle", cx: 12, cy: 18, r: 3 }, { d: "M8.5 7.5 L11 15 M15.5 7.5 L13 15 M9 6 H15", stroke: true, w: 1.8 }] },
  { id: "portal-cut", name: "Portal Cut", cat: "Logos", paths: [{ d: "M12 2 C17.5 2 22 6.5 22 12 C22 17.5 17.5 22 12 22 H7 V12 C7 9.2 9.2 7 12 7 C14.8 7 17 9.2 17 12 C17 14.8 14.8 17 12 17 H12 Z" }] },
  { id: "north-star", name: "North Star", cat: "Logos", paths: [{ d: "M12 1 L14.2 9.8 L23 12 L14.2 14.2 L12 23 L9.8 14.2 L1 12 L9.8 9.8 Z" }, { type: "circle", cx: 12, cy: 12, r: 2.8 }] },
  { id: "zenith-z", name: "Zenith Z", cat: "Logos", paths: [{ d: "M4 4 H21 L10 14 H20 L18 20 H3 L14 10 H4 Z" }] },
  { id: "lumen-drop", name: "Lumen Drop", cat: "Logos", paths: [{ d: "M12 2 C12 2 19 9.5 19 15 C19 19.2 16 22 12 22 C8 22 5 19.2 5 15 C5 9.5 12 2 12 2 Z" }, { d: "M10 8 L15 12 L11 17", stroke: true, w: 2 }] },
  { id: "cube-spark", name: "Cube Spark", cat: "Logos", paths: [{ d: "M12 2 L21 7 V17 L12 22 L3 17 V7 Z" }, { d: "M12 2 V12 M3 7 L12 12 L21 7 M12 12 V22", stroke: true, w: 1.5 }] },
  { id: "spiral-core", name: "Spiral Core", cat: "Logos", paths: [{ d: "M19 8 C17 4.5 12 3.5 8.5 6 C4.5 8.8 4 15 8 18.2 C11.8 21.2 18 19.5 19.3 15 C20.4 11.2 16.7 8.2 13.2 9.2 C10.2 10 9.7 14 12.3 15.3", stroke: true, w: 2.7 }] },
  { id: "tri-slice", name: "Tri Slice", cat: "Logos", paths: [{ d: "M12 2 L22 21 H2 Z" }, { d: "M12 2 V21 M6.5 12 H17.5", stroke: true, w: 1.6 }] },
  { id: "delta-wing", name: "Delta Wing", cat: "Logos", paths: [{ d: "M2 20 L12 3 L22 20 L12 15 Z" }, { d: "M12 3 V15", stroke: true, w: 1.8 }] },
  { id: "echo-bars", name: "Echo Bars", cat: "Logos", paths: [{ type: "rect", x: 3, y: 5, w: 4, h: 14, rx: 2 }, { type: "rect", x: 10, y: 8, w: 4, h: 8, rx: 2 }, { type: "rect", x: 17, y: 3, w: 4, h: 18, rx: 2 }] },
  { id: "quantum-q", name: "Quantum Q", cat: "Logos", paths: [{ type: "circle", cx: 11.5, cy: 11.5, r: 8.5 }, { d: "M15.5 15.5 L21 21", stroke: true, w: 2.6 }] },
  { id: "flare-cube", name: "Flare Cube", cat: "Logos", paths: [{ d: "M6 6 H18 V18 H6 Z" }, { d: "M12 1 V5 M12 19 V23 M1 12 H5 M19 12 H23", stroke: true, w: 2 }] },
  { id: "stacked-s", name: "Stacked S", cat: "Logos", paths: [{ d: "M6 4 H19 L17 9 H9 L8.5 11 H16 C19 11 20.5 13.2 19.5 16 L18.2 20 H5 L7 15 H16 L16.5 13 H9 C6 13 4.5 10.8 5.5 8 Z" }] },
  { id: "void-ring", name: "Void Ring", cat: "Logos", paths: [{ type: "circle", cx: 12, cy: 12, r: 10 }, { type: "circle", cx: 12, cy: 12, r: 5.5 }] },
  { id: "horizon-line", name: "Horizon Line", cat: "Logos", paths: [{ d: "M3 14 C6 7 18 7 21 14 Z" }, { d: "M4 17 H20", stroke: true, w: 2.4 }] },
  { id: "kinetic-k", name: "Kinetic K", cat: "Logos", paths: [{ d: "M5 3 H10 V10 L17 3 H23 L14 12 L23 21 H17 L10 14 V21 H5 Z" }] },
  { id: "facet-heart", name: "Facet Heart", cat: "Logos", paths: [{ d: "M12 21 C8 17.8 4 14.7 4 9.2 C4 6.2 6.2 4 9 4 C10.5 4 11.5 4.7 12 5.8 C12.5 4.7 13.5 4 15 4 C17.8 4 20 6.2 20 9.2 C20 14.7 16 17.8 12 21 Z" }, { d: "M12 5.8 V21 M4 9.2 H20", stroke: true, w: 1.4 }] },
  { id: "crystal-c", name: "Crystal C", cat: "Logos", paths: [{ d: "M19 5 C16.8 3 13.2 2.5 10 3.6 C5.8 5 3 8.5 3 12.5 C3 16.7 6 20 10.2 21 C13.4 21.8 17 20.8 19.3 18.4 L16 15.5 C14.7 16.8 12.8 17.3 11 16.8 C8.8 16.2 7.4 14.5 7.4 12.3 C7.4 10.1 8.8 8.4 11 7.8 C12.8 7.3 14.7 7.8 16 9.1 Z" }] },
  { id: "magnet-u", name: "Magnet U", cat: "Logos", paths: [{ d: "M5 4 H10 V14 C10 16 10.9 17 12 17 C13.1 17 14 16 14 14 V4 H19 V14 C19 19 16.2 22 12 22 C7.8 22 5 19 5 14 Z" }] },
  { id: "matrix-m", name: "Matrix M", cat: "Logos", paths: [{ d: "M3 21 V3 H8 L12 11 L16 3 H21 V21 H16 V11 L12 18 L8 11 V21 Z" }] },
  { id: "velocity-v", name: "Velocity V", cat: "Logos", paths: [{ d: "M2 4 H8 L12 15 L16 4 H22 L14 22 H10 Z" }, { d: "M4 8 H8 M5 12 H9", stroke: true, w: 1.8 }] },
  { id: "solar-sail", name: "Solar Sail", cat: "Logos", paths: [{ d: "M4 20 L20 4 L17 17 Z" }, { d: "M4 20 L13 7", stroke: true, w: 1.6 }] },
  { id: "anchor-point", name: "Anchor Point", cat: "Logos", paths: [{ type: "circle", cx: 12, cy: 12, r: 4 }, { d: "M12 2 V8 M12 16 V22 M2 12 H8 M16 12 H22", stroke: true, w: 2.2 }] },
  { id: "beacon-bolt", name: "Beacon Bolt", cat: "Logos", paths: [{ d: "M14 2 L5 13 H12 L10 22 L20 9 H13 Z" }, { d: "M5 4 C2.8 6 1.5 8.8 1.5 12 M22.5 12 C22.5 8.8 21.2 6 19 4", stroke: true, w: 1.7 }] },
  { id: "glyph-gate", name: "Glyph Gate", cat: "Logos", paths: [{ d: "M4 21 V7 C4 4 6 2 9 2 H15 C18 2 20 4 20 7 V21 H15 V8 C15 7 14.5 6.5 13.5 6.5 H10.5 C9.5 6.5 9 7 9 8 V21 Z" }] },
  { id: "radial-rosette", name: "Radial Rosette", cat: "Logos", paths: [{ type: "circle", cx: 12, cy: 12, r: 3.2 }, { d: "M12 2 C15 5 15 8 12 12 C9 8 9 5 12 2 Z M22 12 C19 15 16 15 12 12 C16 9 19 9 22 12 Z M12 22 C9 19 9 16 12 12 C15 16 15 19 12 22 Z M2 12 C5 9 8 9 12 12 C8 15 5 15 2 12 Z" }] },
  { id: "offset-orb", name: "Offset Orb", cat: "Logos", paths: [{ type: "circle", cx: 10, cy: 12, r: 8 }, { type: "circle", cx: 16, cy: 8, r: 4.5 }] },
  { id: "folded-f", name: "Folded F", cat: "Logos", paths: [{ d: "M5 3 H20 L18 8 H10 V11 H17 L15 16 H10 V21 H5 Z" }, { d: "M10 8 L18 8 L17 11", stroke: true, w: 1.5 }] },
  { id: "circuit-bloom", name: "Circuit Bloom", cat: "Logos", paths: [{ type: "circle", cx: 12, cy: 12, r: 3.5 }, { type: "circle", cx: 5, cy: 5, r: 2.2 }, { type: "circle", cx: 19, cy: 5, r: 2.2 }, { type: "circle", cx: 5, cy: 19, r: 2.2 }, { type: "circle", cx: 19, cy: 19, r: 2.2 }, { d: "M7 7 L9.5 9.5 M17 7 L14.5 9.5 M7 17 L9.5 14.5 M17 17 L14.5 14.5", stroke: true, w: 1.6 }] },
  { id: "wave-box", name: "Wave Box", cat: "Logos", paths: [{ type: "rect", x: 3, y: 4, w: 18, h: 16, rx: 4 }, { d: "M5 13 C8 8 11 18 14 13 C16 9.5 18 10 19 12", stroke: true, w: 2.2 }] },
  { id: "summit-stack", name: "Summit Stack", cat: "Logos", paths: [{ d: "M3 19 L9 10 L13 15 L16 11 L22 19 Z" }, { d: "M9 10 L12 5 L16 11", stroke: true, w: 1.8 }] },
  { id: "infinity-chip", name: "Infinity Chip", cat: "Logos", paths: [{ type: "rect", x: 3, y: 5, w: 18, h: 14, rx: 3 }, { d: "M7 12 C9 8.5 11 8.5 12 12 C13 15.5 15 15.5 17 12 C15 8.5 13 8.5 12 12 C11 15.5 9 15.5 7 12 Z" }] },
  { id: "meridian-mark", name: "Meridian Mark", cat: "Logos", paths: [{ type: "circle", cx: 12, cy: 12, r: 10 }, { d: "M12 2 C15 6 15 18 12 22 C9 18 9 6 12 2 Z M2 12 H22", stroke: true, w: 1.5 }] },
];

const CATS = ["All", ...Array.from(new Set(BASE_SHAPES.map((i) => i.cat)))];

/* ----------------------------------------------------------------
   ICON LIBRARY — one unique visible entry per base mark. IDs keep
   the old "-0-0-regular" shape so presets and exports stay stable.
------------------------------------------------------------------*/
function buildVariants(base) {
  return [{
    id: `${base.id}-0-0-regular`,
    name: base.name,
    cat: base.cat,
    baseId: base.id,
    paths: base.paths,
    rotation: 0,
    mirror: false,
    weight: "regular",
    tags: [base.cat.toLowerCase(), base.name.toLowerCase(), base.id.replace(/-/g, " ")],
  }];
}

const ICONS = BASE_SHAPES.flatMap(buildVariants);

/* ----------------------------------------------------------------
   SEEDED RANDOM GRADIENTS — every icon gets a pleasant default
   gradient (deterministic per icon id) that the user can override.
------------------------------------------------------------------*/
const GRADIENT_PAIRS = [
  ["#8B7CF6", "#4C3BCB"], ["#FF9466", "#E5502B"], ["#5FE0B0", "#12A47B"], ["#F6A8C6", "#D8558E"],
  ["#6DD5FA", "#2980B9"], ["#FDCB6E", "#E17055"], ["#A29BFE", "#6C5CE7"], ["#55EFC4", "#00B894"],
  ["#FAB1A0", "#E17055"], ["#74B9FF", "#0984E3"], ["#FFEAA7", "#E8AC3E"], ["#FD79A8", "#E84393"],
  ["#81ECEC", "#00A8A6"], ["#B2BEC3", "#636E72"], ["#FFC371", "#FF5F6D"],
];

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function seededGradient(id) {
  return GRADIENT_PAIRS[hashStr(id) % GRADIENT_PAIRS.length];
}

const MOOD_GRADIENTS = {
  cool: { from: "#7C8CF8", to: "#3C4CC7" },
  warm: { from: "#FF9C6B", to: "#E2502B" },
  mono: { from: "#9AA0AE", to: "#4B505C" },
  vivid: { from: "#F6A8C6", to: "#8B7CF6" },
  luxury: { from: "#E8C878", to: "#8A6A2A" },
  pastel: { from: "#C9E4FF", to: "#F6C9E4" },
  nature: { from: "#8FD3A0", to: "#2E8B57" },
  retro: { from: "#FFB35C", to: "#D8456A" },
};
function gradientForMood(mood) {
  return MOOD_GRADIENTS[mood] || MOOD_GRADIENTS.cool;
}
const MOOD_SWATCHES = Object.entries(MOOD_GRADIENTS).map(([id, g]) => ({
  id, label: id.charAt(0).toUpperCase() + id.slice(1), from: g.from, to: g.to,
}));

const AI_LOGO_INTENT_ICONS = [
  "orbit-mark", "prism-fold", "wave-spark", "pulse-core", "apex-ring",
  "helix-mark", "flux-diamond", "portal-cut", "north-star", "zenith-z",
  "quantum-q", "kinetic-k", "matrix-m", "velocity-v", "meridian-mark",
].map((id) => `${id}-0-0-regular`);

const AI_INDUSTRY_ICON_HINTS = [
  { re: /\b(ai|agent|automation|robot|ml|machine|neural|data)\b/, icons: ["circuit-bloom", "axis-node", "chip", "matrix-m"], mood: "vivid" },
  { re: /\b(fintech|finance|bank|crypto|wallet|pay|trading|invest)\b/, icons: ["pulse-core", "signal-stack", "chartbar", "quantum-q"], mood: "vivid" },
  { re: /\b(health|wellness|meditation|fitness|care|clinic)\b/, icons: ["lumen-drop", "leaf", "halo-triangle", "soft-capsule"], mood: "nature" },
  { re: /\b(security|privacy|vault|auth|lock|safe)\b/, icons: ["shield", "lock", "vector-vault", "keystone"], mood: "cool" },
  { re: /\b(food|restaurant|coffee|delivery|kitchen|chef)\b/, icons: ["cup", "burger", "apple", "flame"], mood: "warm" },
  { re: /\b(travel|map|flight|trip|navigation|global)\b/, icons: ["compass", "globe", "plane", "meridian-mark"], mood: "cool" },
  { re: /\b(creator|design|studio|media|photo|video|art)\b/, icons: ["lens-spark", "pixel-bloom", "prism-fold", "nova-loop"], mood: "pastel" },
  { re: /\b(enterprise|saas|b2b|workspace|ops|dashboard)\b/, icons: ["briefcase", "chartbar", "monolith", "glyph-gate"], mood: "cool" },
];

const AI_MAGIC_PRESETS = [
  { key: "brandify", label: "Brandify", prompt: "Create a polished premium startup logo with a distinctive mark, balanced 3D gradient, subtle glow, and export-ready background" },
  { key: "logo", label: "Logo Oracle", prompt: "Invent a unique abstract logo mark for a modern AI product, futuristic but memorable, with a luminous gradient" },
  { key: "glow", label: "3D Glow", prompt: "Make the current icon feel more dimensional, glossy, floating, neon, and magical with depth and glow" },
  { key: "minimal", label: "Refine", prompt: "Refine this into a clean professional brand icon: simpler, sharper, balanced, elegant, and deployment ready" },
];

/* ----------------------------------------------------------------
   3D-STYLE ICON RENDERER
   Fill/gradient + rotation/mirror/weight variant transform + a
   glossy highlight CLIPPED to the icon's own silhouette (fixes the
   earlier bug where the highlight floated as a stray ellipse).
------------------------------------------------------------------*/
function shapeEl(p, key) {
  if (p.type === "circle") return <circle key={key} cx={p.cx} cy={p.cy} r={p.r} />;
  if (p.type === "rect") return <rect key={key} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.rx || 0} />;
  return <path key={key} d={p.d} />;
}

function Icon3D({ icon, gradId, fillMode, solid, gradFrom, gradTo, gradAngle, glassTint = "#8B7CF6", glassFrost = 0.35, glassHighlight = 0.6, opacity = 1, size = 64, glossy = true, imgScale = 0.82, imgFit = "contain", letterScale = 0.62 }) {
  if (icon.isLetter) {
    const fontSize = 24 * letterScale;
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} style={{ display: "block", opacity, overflow: "visible" }} aria-hidden="true">
        <defs>
          <filter id={`${gradId}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0.6" stdDeviation="0.6" floodColor="#000" floodOpacity="0.28" />
          </filter>
        </defs>
        <text
          x="12" y="12"
          dominantBaseline="central" textAnchor="middle"
          fontFamily={icon.font} fontWeight="700" fontSize={fontSize}
          fill={icon.color}
          filter={`url(#${gradId}-shadow)`}
        >
          {icon.text}
        </text>
      </svg>
    );
  }
  if (icon.isImage) {
    const inset = ((1 - imgScale) * 24) / 2;
    const s = 24 - inset * 2;
    const preserve = imgFit === "cover" ? "xMidYMid slice" : "xMidYMid meet";
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} style={{ display: "block", opacity, overflow: "visible" }} aria-hidden="true">
        <defs>
          <filter id={`${gradId}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1.2" stdDeviation="1.1" floodColor="#000" floodOpacity="0.30" />
          </filter>
          <clipPath id={`${gradId}-imgclip`}>
            <rect x={inset} y={inset} width={s} height={s} rx={s * 0.16} />
          </clipPath>
        </defs>
        <g filter={`url(#${gradId}-shadow)`}>
          <g clipPath={imgFit === "cover" ? `url(#${gradId}-imgclip)` : undefined}>
            <image
              href={icon.dataUrl}
              x={inset} y={inset} width={s} height={s}
              preserveAspectRatio={preserve}
              style={{ imageRendering: "-webkit-optimize-contrast" }}
            />
          </g>
        </g>
      </svg>
    );
  }
  const angle = (gradAngle || 135) * (Math.PI / 180);
  const x1 = 50 - Math.cos(angle) * 50, y1 = 50 - Math.sin(angle) * 50;
  const x2 = 50 + Math.cos(angle) * 50, y2 = 50 + Math.sin(angle) * 50;
  const isGlass = fillMode === "glass";
  const fill = fillMode === "gradient" ? `url(#${gradId})` : isGlass ? glassTint : solid;
  const rotation = icon.rotation || 0;
  const mirror = !!icon.mirror;
  const weight = icon.weight || "regular";
  const groupTransform = `rotate(${rotation} 12 12) scale(${mirror ? -1 : 1},1) translate(${mirror ? -24 : 0},0)`;
  const fillShapes = icon.paths.filter((p) => !p.stroke);
  const strokeShapes = icon.paths.filter((p) => p.stroke);

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={{ display: "block", opacity, overflow: "visible" }} aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}>
          <stop offset="0%" stopColor={gradFrom} />
          <stop offset="100%" stopColor={gradTo} />
        </linearGradient>
        <filter id={`${gradId}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1.2" stdDeviation="1.1" floodColor="#000" floodOpacity="0.35" />
        </filter>
        <clipPath id={`${gradId}-clip`}>
          <g transform={groupTransform}>{fillShapes.map((p, i) => shapeEl(p, `c${i}`))}</g>
        </clipPath>
        {isGlass && (
          <>
            <radialGradient id={`${gradId}-glass-sheen`} cx="35%" cy="18%" r="80%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9 * glassHighlight} />
              <stop offset="45%" stopColor="#ffffff" stopOpacity={0.22 * glassHighlight} />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <filter id={`${gradId}-frost`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="1.4" />
            </filter>
          </>
        )}
      </defs>
      <g fill={fill} fillOpacity={isGlass ? 0.28 + glassFrost * 0.55 : 1} filter={`url(#${gradId}-shadow)`}>
        {weight === "bold" && (
          <g transform={`${groupTransform}`} opacity="0.4">
            <g transform="translate(12 12) scale(1.05) translate(-12 -12)">
              {fillShapes.map((p, i) => shapeEl(p, `b${i}`))}
            </g>
          </g>
        )}
        <g transform={groupTransform} opacity={weight === "soft" ? 0.88 : 1}>
          {fillShapes.map((p, i) => shapeEl(p, `f${i}`))}
        </g>
        <g transform={groupTransform}>
          {strokeShapes.map((p, i) => (
            <path key={`s${i}`} d={p.d} stroke={fill} strokeWidth={p.w || 2} strokeLinecap="round" fill="none" />
          ))}
        </g>
      </g>
      {isGlass && fillShapes.length > 0 && (
        <g clipPath={`url(#${gradId}-clip)`}>
          <rect x="0" y="0" width="24" height="24" fill={`url(#${gradId}-glass-sheen)`} />
          <ellipse cx="8.5" cy="6" rx="8.5" ry="4.6" fill="#ffffff" opacity={0.55 * glassHighlight} transform="rotate(-16 8.5 6)" filter={`url(#${gradId}-frost)`} />
        </g>
      )}
      {isGlass && fillShapes.length > 0 && (
        <g transform={groupTransform} opacity="0.5">
          {fillShapes.map((p, i) => (p.d ? <path key={`rim${i}`} d={p.d} fill="none" stroke="#ffffff" strokeWidth="0.5" /> : null))}
        </g>
      )}
      {glossy && !isGlass && fillShapes.length > 0 && (
        <g clipPath={`url(#${gradId}-clip)`}>
          <ellipse cx="9" cy="6.5" rx="9" ry="5.5" fill="#ffffff" opacity="0.24" transform="rotate(-18 9 6.5)" />
        </g>
      )}
    </svg>
  );
}

/* ----------------------------------------------------------------
   BACKGROUND SHAPES
------------------------------------------------------------------*/
const BG_SHAPES = [
  { id: "square", label: "Square" },
  { id: "rounded", label: "Rounded" },
  { id: "squircle", label: "Squircle" },
  { id: "circle", label: "Circle" },
];
const BG_PRESETS = [
  { id: "violet-pop", from: "#B517FF", to: "#521BDB", patch: { bgType: "gradient", bgFrom: "#B517FF", bgTo: "#521BDB", bgRadialGlare: true, bgNoiseTexture: false } },
  { id: "mint-glass", from: "#D9FFF2", to: "#3A7F6F", patch: { bgType: "gradient", bgFrom: "#D9FFF2", bgTo: "#3A7F6F", bgRadialGlare: true, bgNoiseTexture: true, bgNoiseOpacity: 0.14 } },
  { id: "magenta", from: "#FF5CCB", to: "#B31386", patch: { bgType: "gradient", bgFrom: "#FF5CCB", bgTo: "#B31386", bgRadialGlare: true, bgNoiseTexture: false } },
  { id: "ice", from: "#E2F6FF", to: "#7E7BED", patch: { bgType: "gradient", bgFrom: "#E2F6FF", bgTo: "#7E7BED", bgRadialGlare: true, bgNoiseTexture: false } },
  { id: "sun-fire", from: "#FFE941", to: "#FF3E12", patch: { bgType: "gradient", bgFrom: "#FFE941", bgTo: "#FF3E12", bgRadialGlare: true, bgNoiseTexture: false } },
  { id: "rose", from: "#FFE5F2", to: "#F43F77", patch: { bgType: "gradient", bgFrom: "#FFE5F2", bgTo: "#F43F77", bgRadialGlare: true, bgNoiseTexture: true, bgNoiseOpacity: 0.1 } },
  { id: "orchid", from: "#F4D4FF", to: "#8042AA", patch: { bgType: "gradient", bgFrom: "#F4D4FF", bgTo: "#8042AA", bgRadialGlare: true, bgNoiseTexture: false } },
  { id: "cyan-deep", from: "#12E3F6", to: "#00537D", patch: { bgType: "gradient", bgFrom: "#12E3F6", bgTo: "#00537D", bgRadialGlare: true, bgNoiseTexture: false } },
  { id: "lavender", from: "#F1F5FF", to: "#6550D9", patch: { bgType: "gradient", bgFrom: "#F1F5FF", bgTo: "#6550D9", bgRadialGlare: true, bgNoiseTexture: false } },
  { id: "ruby", from: "#FF2028", to: "#4B0000", patch: { bgType: "gradient", bgFrom: "#FF2028", bgTo: "#4B0000", bgRadialGlare: true, bgNoiseTexture: true, bgNoiseOpacity: 0.16 } },
  { id: "linen", from: "#FFF8E3", to: "#6B806C", patch: { bgType: "gradient", bgFrom: "#FFF8E3", bgTo: "#6B806C", bgRadialGlare: true, bgNoiseTexture: true, bgNoiseOpacity: 0.12 } },
  { id: "pink-blue", from: "#F65DCD", to: "#3B7CFF", patch: { bgType: "gradient", bgFrom: "#F65DCD", bgTo: "#3B7CFF", bgRadialGlare: true, bgNoiseTexture: false } },
  { id: "silver", from: "#F6F7FF", to: "#6B6D7E", patch: { bgType: "gradient", bgFrom: "#F6F7FF", bgTo: "#6B6D7E", bgRadialGlare: true, bgNoiseTexture: true, bgNoiseOpacity: 0.08 } },
  { id: "blue-ray", from: "#37D9FF", to: "#2151E8", patch: { bgType: "gradient", bgFrom: "#37D9FF", bgTo: "#2151E8", bgRadialGlare: true, bgNoiseTexture: false } },
  { id: "black-sheen", from: "#2A2C32", to: "#050608", patch: { bgType: "gradient", bgFrom: "#2A2C32", bgTo: "#050608", bgRadialGlare: true, bgNoiseTexture: true, bgNoiseOpacity: 0.18 } },
  { id: "amber", from: "#FFE45C", to: "#FF8A13", patch: { bgType: "gradient", bgFrom: "#FFE45C", bgTo: "#FF8A13", bgRadialGlare: true, bgNoiseTexture: false } },
  { id: "emerald", from: "#35E98B", to: "#063C23", patch: { bgType: "gradient", bgFrom: "#35E98B", bgTo: "#063C23", bgRadialGlare: true, bgNoiseTexture: true, bgNoiseOpacity: 0.14 } },
  { id: "paper", from: "#FFFFFF", to: "#CFCFCB", patch: { bgType: "gradient", bgFrom: "#FFFFFF", bgTo: "#CFCFCB", bgRadialGlare: false, bgNoiseTexture: true, bgNoiseOpacity: 0.08 } },
  { id: "sky-glass", from: "#F2FBFF", to: "#74CFEA", patch: { bgType: "gradient", bgFrom: "#F2FBFF", bgTo: "#74CFEA", bgRadialGlare: true, bgNoiseTexture: true, bgNoiseOpacity: 0.08 } },
  { id: "hot-coral", from: "#FF4C54", to: "#B4141C", patch: { bgType: "gradient", bgFrom: "#FF4C54", bgTo: "#B4141C", bgRadialGlare: true, bgNoiseTexture: false } },
  { id: "yellow-flat", from: "#FFE832", to: "#FFD72E", patch: { bgType: "gradient", bgFrom: "#FFE832", bgTo: "#FFD72E", bgRadialGlare: false, bgNoiseTexture: false } },
];
function bgRadiusFor(shape, size, customRadius) {
  if (shape === "circle") return size / 2;
  if (shape === "squircle") return size * 0.28;
  if (shape === "rounded") return Math.max(customRadius, size * 0.12);
  return customRadius;
}

/* ----------------------------------------------------------------
   PATTERN BACKGROUNDS — CSS renderers for the live canvas preview
   (dots / grid / noise / mesh gradient)
------------------------------------------------------------------*/
const PATTERN_TYPES = [
  { id: "dots", label: "Dots" },
  { id: "grid", label: "Grid" },
  { id: "noise", label: "Noise" },
  { id: "mesh", label: "Mesh" },
];
function hexToRgba(hex, alpha) {
  const h = (hex || "#000000").replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
function patternCssStyle(style) {
  const scale = style.bgPatternScale || 1;
  if (style.bgType === "dots") {
    const gap = 22 * scale;
    return {
      backgroundColor: style.bgPatternBg,
      backgroundImage: `radial-gradient(${hexToRgba(style.bgPatternFg, 0.85)} ${1.6 * scale}px, transparent ${1.6 * scale}px)`,
      backgroundSize: `${gap}px ${gap}px`,
      backgroundPosition: "0 0",
    };
  }
  if (style.bgType === "grid") {
    const gap = 32 * scale;
    const line = hexToRgba(style.bgPatternFg, 0.5);
    return {
      backgroundColor: style.bgPatternBg,
      backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
      backgroundSize: `${gap}px ${gap}px`,
      backgroundPosition: "0 0",
    };
  }
  if (style.bgType === "noise") {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${0.8 / scale}' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 ${parseInt(style.bgPatternFg.slice(1,3),16)/255} 0 0 0 0 ${parseInt(style.bgPatternFg.slice(3,5),16)/255} 0 0 0 0 ${parseInt(style.bgPatternFg.slice(5,7),16)/255} 0 0 0 0.35 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>`;
    return {
      backgroundColor: style.bgPatternBg,
      backgroundImage: `url("data:image/svg+xml,${svg}")`,
      backgroundSize: "180px 180px",
    };
  }
  if (style.bgType === "mesh") {
    return {
      backgroundColor: style.bgMeshBase,
      backgroundImage: [
        `radial-gradient(at 20% 25%, ${hexToRgba(style.bgMeshC1, 0.65)} 0px, transparent 55%)`,
        `radial-gradient(at 80% 20%, ${hexToRgba(style.bgMeshC2, 0.6)} 0px, transparent 55%)`,
        `radial-gradient(at 50% 85%, ${hexToRgba(style.bgMeshC3, 0.55)} 0px, transparent 55%)`,
      ].join(", "),
    };
  }
  return {};
}
function bgEffectsStyle(style) {
  const layers = [];
  if (style.bgRadialGlare) {
    layers.push("radial-gradient(circle at 30% 22%, rgba(255,255,255,0.46), rgba(255,255,255,0.10) 24%, transparent 54%)");
    layers.push("radial-gradient(circle at 74% 78%, rgba(255,255,255,0.18), transparent 45%)");
  }
  if (style.bgNoiseTexture) {
    const opacity = style.bgNoiseOpacity == null ? 0.12 : style.bgNoiseOpacity;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='table' tableValues='0 ${opacity}'/></feComponentTransfer></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>`;
    layers.push(`url("data:image/svg+xml,${svg}")`);
  }
  return layers.length ? { backgroundImage: layers.join(", "), mixBlendMode: "screen", opacity: 1 } : null;
}
/* ----------------------------------------------------------------
   SHADOW & GLOW — CSS filter for the live preview
------------------------------------------------------------------*/
function shadowGlowFilterCss(style) {
  const parts = [];
  if (style.shadowEnabled) {
    parts.push(`drop-shadow(${style.shadowOffsetX}px ${style.shadowOffsetY}px ${style.shadowBlur}px ${hexToRgba(style.shadowColor, style.shadowOpacity)})`);
  }
  if (style.glowEnabled) {
    parts.push(`drop-shadow(0px 0px ${style.glowBlur}px ${hexToRgba(style.glowColor, style.glowOpacity)})`);
    parts.push(`drop-shadow(0px 0px ${Math.round(style.glowBlur / 2)}px ${hexToRgba(style.glowColor, Math.min(1, style.glowOpacity * 0.9))})`);
  }
  return parts.length ? parts.join(" ") : "none";
}

/* ----------------------------------------------------------------
   PRESETS
------------------------------------------------------------------*/
const PRESETS = [
  { id: "p1", label: "Violet glass", icon: "bolt-0-0-regular", fillMode: "gradient", gradFrom: "#8B7CF6", gradTo: "#4C3BCB", gradAngle: 135, bgType: "transparent", opacity: 1, borderWidth: 0, borderColor: "#000000" },
  { id: "p2", label: "Coral pop", icon: "flame-0-0-regular", fillMode: "gradient", gradFrom: "#FF9466", gradTo: "#E5502B", gradAngle: 135, bgType: "solid", bgSolid: "#1B1B22", opacity: 1, borderWidth: 0, borderColor: "#000000" },
  { id: "p3", label: "Mint fresh", icon: "leaf-0-0-regular", fillMode: "gradient", gradFrom: "#5FE0B0", gradTo: "#12A47B", gradAngle: 120, bgType: "transparent", opacity: 1, borderWidth: 2, borderColor: "#0E7A5C" },
  { id: "p4", label: "Midnight steel", icon: "shield-0-0-regular", fillMode: "solid", solid: "#6D7690", bgType: "gradient", bgFrom: "#1C1D24", bgTo: "#33364A", opacity: 1, borderWidth: 0, borderColor: "#000000" },
  { id: "p5", label: "Sunburst", icon: "sun-0-0-regular", fillMode: "gradient", gradFrom: "#FFD166", gradTo: "#F4873A", gradAngle: 100, bgType: "transparent", opacity: 1, borderWidth: 0, borderColor: "#000000" },
  { id: "p6", label: "Rose quartz", icon: "diamond-0-0-regular", fillMode: "gradient", gradFrom: "#F6A8C6", gradTo: "#D8558E", gradAngle: 140, bgType: "transparent", opacity: 1, borderWidth: 3, borderColor: "#B23A6E" },
  { id: "p7", label: "Liquid glass", icon: "drop-0-0-regular", fillMode: "glass", glassTint: "#8FD3FF", glassFrost: 0.32, glassHighlight: 0.75, bgType: "gradient", bgFrom: "#151824", bgTo: "#232B42", opacity: 1, borderWidth: 0, borderColor: "#000000" },
];
function iconById(id) {
  const exact = ICONS.find((i) => i.id === id);
  if (exact) return exact;
  const legacyVariant = String(id || "").match(/^(.*)-\d+-(0|1)-(regular|bold|soft)$/);
  if (legacyVariant) {
    const canonical = ICONS.find((i) => i.id === `${legacyVariant[1]}-0-0-regular`);
    if (canonical) return canonical;
  }
  return ICONS[0];
}

/* ----------------------------------------------------------------
   ONBOARDING QUESTIONNAIRE
------------------------------------------------------------------*/
const OB_STEPS = [
  { key: "purpose", title: "What are you creating an icon for?", options: [
      { v: "app", label: "App icon" }, { v: "logo", label: "Logo mark" },
      { v: "social", label: "Social avatar" }, { v: "brand", label: "Brand system" } ] },
  { key: "style", title: "Pick the aesthetic that feels right", options: [
      { v: "minimal", label: "Minimal and clean" }, { v: "bold", label: "Bold and vibrant" },
      { v: "playful", label: "Playful and rounded" }, { v: "corporate", label: "Corporate and sharp" } ] },
  { key: "mood", title: "What color mood suits your brand?", options: [
      { v: "cool", label: "Cool tones" }, { v: "warm", label: "Warm tones" },
      { v: "mono", label: "Monochrome" }, { v: "vivid", label: "Vivid multicolor" } ] },
];

function suggestFromAnswers(answers) {
  const m = gradientForMood(answers.mood);
  const iconByPurpose = { app: "gear-0-0-regular", logo: "diamond-0-0-regular", social: "chat-0-0-regular", brand: "shield-0-0-regular" };
  return {
    icon: iconByPurpose[answers.purpose] || "bolt-0-0-regular",
    fillMode: "gradient",
    gradFrom: m.from,
    gradTo: m.to,
    gradAngle: 135,
    bgType: answers.style === "corporate" ? "solid" : "transparent",
    bgSolid: "#16171D",
    bgShape: answers.style === "playful" ? "squircle" : "square",
    borderWidth: answers.style === "corporate" ? 3 : 0,
    borderColor: m.to,
  };
}

function promptLogoIconFrom(message) {
  const q = String(message || "").toLowerCase();
  const h = hashStr(q || "logo");
  const archetypes = [
    {
      name: "Generated Orbit",
      paths: [{ type: "circle", cx: 12, cy: 12, r: 4.1 }, { d: "M3 12 C6 5.5 18 5.5 21 12 C18 18.5 6 18.5 3 12 Z", stroke: true, w: 2.2 }],
    },
    {
      name: "Generated Prism",
      paths: [{ d: "M4 5 H15 L21 11 L14 21 H4 Z" }, { d: "M15 5 V11 H21 M8 21 L14 11", stroke: true, w: 1.7 }],
    },
    {
      name: "Generated Pulse",
      paths: [{ d: "M3 13 H7 L9.2 7 L13 18 L16.3 9.5 L18 13 H21", stroke: true, w: 2.8 }, { type: "circle", cx: 12, cy: 12, r: 2.8 }],
    },
    {
      name: "Generated Apex",
      paths: [{ d: "M12 2 L22 21 H2 Z" }, { d: "M12 7 L17 17 H7 Z" }],
    },
    {
      name: "Generated Portal",
      paths: [{ d: "M12 2 C17.5 2 22 6.5 22 12 C22 17.5 17.5 22 12 22 H7 V12 C7 9.2 9.2 7 12 7 C14.8 7 17 9.2 17 12 C17 14.8 14.8 17 12 17 H12 Z" }],
    },
    {
      name: "Generated Matrix",
      paths: [{ d: "M3 21 V3 H8 L12 11 L16 3 H21 V21 H16 V11 L12 18 L8 11 V21 Z" }],
    },
    {
      name: "Generated Bloom",
      paths: [{ type: "circle", cx: 12, cy: 12, r: 3.1 }, { d: "M12 2 C15 5 15 8 12 12 C9 8 9 5 12 2 Z M22 12 C19 15 16 15 12 12 C16 9 19 9 22 12 Z M12 22 C9 19 9 16 12 12 C15 16 15 19 12 22 Z M2 12 C5 9 8 9 12 12 C8 15 5 15 2 12 Z" }],
    },
    {
      name: "Generated Zenith",
      paths: [{ d: "M4 4 H21 L10 14 H20 L18 20 H3 L14 10 H4 Z" }],
    },
  ];
  const keywordMap = [
    { re: /\b(portal|gateway|security|vault|privacy)\b/, index: 4 },
    { re: /\b(fintech|finance|pulse|trading|crypto)\b/, index: 2 },
    { re: /\b(prism|design|creative|studio|media)\b/, index: 1 },
    { re: /\b(enterprise|saas|matrix|system)\b/, index: 5 },
    { re: /\b(apex|summit|growth|launch)\b/, index: 3 },
    { re: /\b(orbit|global|planet|space)\b/, index: 0 },
    { re: /\b(ai|agent|neural|data|circuit)\b/, index: 6 },
  ];
  const mapped = keywordMap.find((item) => item.re.test(q));
  const picked = archetypes[mapped ? mapped.index : h % archetypes.length];
  const accent = h % 3;
  const accentPaths = [
    { d: "M18 3 V7 M16 5 H20", stroke: true, w: 1.7 },
    { type: "circle", cx: 18, cy: 6, r: 1.9 },
    { d: "M4 18 H9 M6.5 15.5 V20.5", stroke: true, w: 1.7 },
  ];
  return {
    id: "ai-generated-logo",
    baseId: "ai-generated-logo",
    name: picked.name,
    cat: "Generated",
    paths: [...picked.paths, accentPaths[accent]],
    rotation: 0,
    mirror: false,
    weight: "regular",
    tags: ["generated", "logo", "ai", ...((q.match(/[a-z0-9]+/g) || []).slice(0, 6))],
  };
}

/* ----------------------------------------------------------------
   ASK-AI — local, offline keyword-based suggestion engine.
   This runs entirely in the browser (no network call), so the
   assistant works the same whether this file is opened directly
   or hosted anywhere else.
------------------------------------------------------------------*/
function localAiSuggest(message) {
  const q = message.toLowerCase();
  const words = (q.match(/[a-z0-9]+/g) || []).filter((w) => w.length >= 3);
  const wantsLogo = /\b(logo|brand|mark|identity|startup|company|product|app icon|favicon)\b/.test(q);
  const wantsPolish = /\b(polish|improve|refine|better|level up|next level|magical|premium|professional)\b/.test(q);

  // 1) Try to match a specific icon by name/tag, then fall back to
  //    matching an entire category (e.g. "food app" -> Food icons).
  let matchedIcon = null;
  let industryHint = AI_INDUSTRY_ICON_HINTS.find((hint) => hint.re.test(q));
  for (const w of words) {
    matchedIcon = ICONS.find((i) => i.name.toLowerCase().includes(w) || i.tags.some((t) => t.includes(w)));
    if (matchedIcon) break;
  }
  if (!matchedIcon && industryHint) {
    const iconPool = industryHint.icons
      .map((id) => iconById(`${id}-0-0-regular`))
      .filter(Boolean);
    matchedIcon = iconPool[hashStr(q) % iconPool.length];
  }
  if (!matchedIcon && wantsLogo) {
    matchedIcon = iconById(AI_LOGO_INTENT_ICONS[hashStr(q) % AI_LOGO_INTENT_ICONS.length]);
  }
  if (!matchedIcon) {
    const catHit = CATS.find((c) => c !== "All" && q.includes(c.toLowerCase()));
    if (catHit) {
      const inCat = ICONS.filter((i) => i.cat === catHit && i.rotation === 0 && !i.mirror && i.weight === "regular");
      matchedIcon = inCat[hashStr(q) % inCat.length];
    }
  }

  // 2) Mood detection — wider vocabulary, checked in priority order.
  let mood = industryHint && industryHint.mood ? industryHint.mood : "cool";
  if (/\b(luxury|premium|gold\w*|elegant|exclusive|opulent)\b/.test(q)) mood = "luxury";
  else if (/\b(pastel|soft|gentle|dreamy|baby)\b/.test(q)) mood = "pastel";
  else if (/\b(nature|forest|eco|green|organic|natural|plant\w*|leaf\w*)\b/.test(q)) mood = "nature";
  else if (/\b(retro|vintage|80s|90s|synthwave|throwback)\b/.test(q)) mood = "retro";
  else if (/\b(neon|electric|cyber|tech|fintech|futur\w*|crypto)\b/.test(q)) mood = "vivid";
  else if (/\b(warm|earth\w*|sunset|cozy|wellness|calm)\b/.test(q)) mood = "warm";
  else if (/\b(mono|monochrome|grayscale|black.?(and.?)?white)\b/.test(q)) mood = "mono";
  else if (/\b(playful|fun|bright|kid\w*|candy|cheerful)\b/.test(q)) mood = "vivid";
  else if (/\b(dark|glass|liquid|navy|deep|moody)\b/.test(q)) mood = "cool";

  const g = gradientForMood(mood);
  const corporate = /\b(corporate|professional|business|enterprise|formal|serious|b2b|saas)\b/.test(q);
  const playful = /\b(playful|fun|kid\w*|candy|round\w*|cute)\b/.test(q);
  const glass = /\b(glass|liquid|frost\w*)\b/.test(q);
  const glow = /\b(glow\w*|neon|luminous|shine\w*|magical|magic)\b/.test(q) || wantsPolish;
  const shadow = /\b(shadow|depth|3d|floating|elevated|dimensional)\b/.test(q) || wantsPolish;
  const mono = mood === "mono";

  // 3) Background pattern / angle hints
  let bgType = corporate || wantsPolish ? "solid" : "transparent";
  if (/\b(dots?|dotted|polka)\b/.test(q)) bgType = "dots";
  else if (/\b(grid|graph.?paper)\b/.test(q)) bgType = "grid";
  else if (/\b(mesh|blob\w*|blurr?y|abstract)\b/.test(q)) bgType = "mesh";
  else if (/\b(noise|grain\w*|texture[d]?)\b/.test(q)) bgType = "noise";

  let gradAngle = 135;
  if (/\bvertical\b/.test(q)) gradAngle = 180;
  else if (/\bhorizontal\b/.test(q)) gradAngle = 90;
  else if (/\bdiagonal\b/.test(q)) gradAngle = 135;

  const suggestion = {
    fillMode: glass ? "glass" : mono ? "solid" : "gradient",
    gradFrom: g.from, gradTo: g.to, gradAngle,
    solid: mono ? "#9AA0AE" : g.from,
    glassTint: g.from, glassFrost: glass ? 0.42 : 0.35, glassHighlight: glass || wantsPolish ? 0.78 : 0.6,
    bgType,
    bgSolid: corporate ? "#11131B" : "#16171D",
    bgMeshBase: "#10121A", bgMeshC1: g.from, bgMeshC2: g.to, bgMeshC3: mood === "warm" ? "#F6A85F" : "#2BB3A3",
    bgPatternFg: g.from, bgPatternBg: "#16171D", bgPatternScale: 1,
    bgShape: playful || wantsLogo ? "squircle" : corporate ? "rounded" : "square",
    borderWidth: corporate || wantsPolish ? 2 : 0,
    borderColor: g.to,
    opacity: 1,
    glowEnabled: glow, glowColor: g.from, glowOpacity: wantsPolish ? 0.62 : 0.55, glowBlur: wantsPolish ? 38 : 30,
    shadowEnabled: shadow, shadowColor: "#000000", shadowOpacity: 0.48, shadowBlur: wantsPolish ? 36 : 28, shadowOffsetX: 0, shadowOffsetY: 16,
  };
  if (matchedIcon) suggestion.icon = matchedIcon.id;
  if (wantsLogo || /\b(generate|invent|create|oracle)\b/.test(q)) {
    suggestion.icon = "ai-generated-logo";
    suggestion.generatedIcon = promptLogoIconFrom(message);
  }

  const alternates = (wantsLogo ? AI_LOGO_INTENT_ICONS : ICONS.map((i) => i.id))
    .filter((id) => id !== suggestion.icon)
    .slice(hashStr(q) % 12)
    .slice(0, 3)
    .map((iconId, idx) => ({
      label: ["Sharper", "Softer", "Bolder"][idx],
      patch: {
        ...suggestion,
        icon: suggestion.generatedIcon ? "ai-generated-logo" : iconId,
        generatedIcon: suggestion.generatedIcon ? promptLogoIconFrom(`${message} ${["sharp angular", "soft rounded", "bold compact"][idx]}`) : undefined,
        gradAngle: [110, 145, 35][idx],
        bgShape: idx === 1 ? "squircle" : suggestion.bgShape,
        glowBlur: suggestion.glowBlur + idx * 6,
      },
    }));

  const moodPhrase = {
    vivid: "a bold, vivid gradient",
    warm: "warm, earthy tones",
    mono: "a clean monochrome look",
    cool: "a cool, modern gradient",
    luxury: "a rich gold-and-bronze gradient",
    pastel: "a soft, dreamy pastel palette",
    nature: "an organic, leafy green gradient",
    retro: "a punchy retro sunset gradient",
  }[mood];
  const iconPhrase = suggestion.generatedIcon
    ? ` I generated a new **${suggestion.generatedIcon.name}** mark from your prompt.`
    : matchedIcon
    ? ` I picked the **${matchedIcon.name}** icon to match.`
    : "";
  const extras = [
    corporate ? "a structured, corporate frame" : null,
    glass ? "a frosted glass finish" : null,
    glow ? "a soft outer glow" : null,
    shadow ? "an elevated drop shadow" : null,
    wantsLogo ? "a distinct logo-mark silhouette" : null,
    bgType !== "transparent" && bgType !== "solid" ? `a ${bgType} background pattern` : null,
  ].filter(Boolean).join(", ");

  const openers = [
    "I read this as a brand system with",
    "Here is a smarter logo direction with",
    "For a stronger identity, I would use",
    "This feels like the right visual move:",
  ];
  const opener = openers[hashStr(q) % openers.length];
  const text = `${opener} ${moodPhrase}${extras ? `, plus ${extras}` : ""}.${iconPhrase} I also prepared alternate directions below so you can branch the logo quickly.`;
  return { text, suggestion, alternates };
}

/* ----------------------------------------------------------------
   EXPORT — real SVG / PNG / JPG generation and download
------------------------------------------------------------------*/
function pathMarkup(p, fill) {
  if (p.type === "circle") return `<circle cx="${p.cx}" cy="${p.cy}" r="${p.r}" fill="${fill}"/>`;
  if (p.type === "rect") return `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="${p.rx || 0}" fill="${fill}"/>`;
  if (p.stroke) return `<path d="${p.d}" stroke="${fill}" stroke-width="${p.w || 2}" fill="none" stroke-linecap="round"/>`;
  return `<path d="${p.d}" fill="${fill}"/>`;
}
function escapeXML(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
}
function buildPatternDefs(style, size) {
  const scale = (style.bgPatternScale || 1) * (size / 512);
  if (style.bgType === "dots") {
    const gap = Math.max(6, 22 * scale);
    return {
      fill: "url(#bgPattern)",
      defs: `<pattern id="bgPattern" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse">` +
        `<rect width="${gap}" height="${gap}" fill="${style.bgPatternBg}"/>` +
        `<circle cx="${gap / 2}" cy="${gap / 2}" r="${Math.max(1, 1.6 * scale)}" fill="${style.bgPatternFg}"/>` +
        `</pattern>`,
    };
  }
  if (style.bgType === "grid") {
    const gap = Math.max(8, 32 * scale);
    return {
      fill: "url(#bgPattern)",
      defs: `<pattern id="bgPattern" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse">` +
        `<rect width="${gap}" height="${gap}" fill="${style.bgPatternBg}"/>` +
        `<path d="M ${gap} 0 L 0 0 0 ${gap}" fill="none" stroke="${style.bgPatternFg}" stroke-width="1" opacity="0.5"/>` +
        `</pattern>`,
    };
  }
  if (style.bgType === "noise") {
    return {
      fill: `${style.bgPatternBg}`,
      defs: `<filter id="bgNoise"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 ${(parseInt(style.bgPatternFg.slice(1,3),16)||0)/255} 0 0 0 0 ${(parseInt(style.bgPatternFg.slice(3,5),16)||0)/255} 0 0 0 0 ${(parseInt(style.bgPatternFg.slice(5,7),16)||0)/255} 0 0 0 0.35 0"/></filter>`,
      overlay: `<rect x="0" y="0" width="${size}" height="${size}" filter="url(#bgNoise)"/>`,
    };
  }
  if (style.bgType === "mesh") {
    return {
      fill: style.bgMeshBase,
      defs: `<radialGradient id="mesh1" cx="20%" cy="25%" r="60%"><stop offset="0%" stop-color="${style.bgMeshC1}" stop-opacity="0.65"/><stop offset="100%" stop-color="${style.bgMeshC1}" stop-opacity="0"/></radialGradient>` +
        `<radialGradient id="mesh2" cx="80%" cy="20%" r="60%"><stop offset="0%" stop-color="${style.bgMeshC2}" stop-opacity="0.6"/><stop offset="100%" stop-color="${style.bgMeshC2}" stop-opacity="0"/></radialGradient>` +
        `<radialGradient id="mesh3" cx="50%" cy="85%" r="60%"><stop offset="0%" stop-color="${style.bgMeshC3}" stop-opacity="0.55"/><stop offset="100%" stop-color="${style.bgMeshC3}" stop-opacity="0"/></radialGradient>`,
      overlay: `<rect x="0" y="0" width="${size}" height="${size}" fill="url(#mesh1)"/><rect x="0" y="0" width="${size}" height="${size}" fill="url(#mesh2)"/><rect x="0" y="0" width="${size}" height="${size}" fill="url(#mesh3)"/>`,
    };
  }
  return null;
}
function buildBgEffectsOverlay(style, size) {
  let defs = "";
  let overlay = "";
  if (style.bgRadialGlare) {
    defs += `<radialGradient id="bgGlare" cx="30%" cy="22%" r="58%"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.46"/><stop offset="35%" stop-color="#ffffff" stop-opacity="0.10"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></radialGradient>`;
    overlay += `<rect x="0" y="0" width="${size}" height="${size}" fill="url(#bgGlare)"/>`;
  }
  if (style.bgNoiseTexture) {
    const opacity = style.bgNoiseOpacity == null ? 0.12 : style.bgNoiseOpacity;
    defs += `<filter id="bgFxNoise"><feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 ${opacity}"/></feComponentTransfer></filter>`;
    overlay += `<rect x="0" y="0" width="${size}" height="${size}" filter="url(#bgFxNoise)" opacity="0.9"/>`;
  }
  return { defs, overlay };
}
function buildShadowGlowFilter(style, size) {
  if (!style.shadowEnabled && !style.glowEnabled) return null;
  const k = size / 512;
  let primitives = "";
  const merges = [];
  if (style.glowEnabled) {
    const blur = Math.max(0.5, style.glowBlur * k);
    primitives += `<feDropShadow dx="0" dy="0" stdDeviation="${blur}" flood-color="${style.glowColor}" flood-opacity="${style.glowOpacity}"/>`;
  }
  if (style.shadowEnabled) {
    const blur = Math.max(0.5, style.shadowBlur * k);
    primitives += `<feDropShadow dx="${style.shadowOffsetX * k}" dy="${style.shadowOffsetY * k}" stdDeviation="${blur}" flood-color="${style.shadowColor}" flood-opacity="${style.shadowOpacity}"/>`;
  }
  return `<filter id="shadowGlow" x="-60%" y="-60%" width="220%" height="220%">${primitives}</filter>`;
}
function buildExportMarkup(icon, style, size) {
  const pattern = (style.bgType === "dots" || style.bgType === "grid" || style.bgType === "noise" || style.bgType === "mesh") ? buildPatternDefs(style, size) : null;
  const bgFill = pattern ? pattern.fill : (style.bgType === "solid" ? style.bgSolid : style.bgType === "gradient" ? "url(#bgGrad)" : "none");
  const radius = bgRadiusFor(style.bgShape, size, style.borderRadius);
  const bgGradDefs = (style.bgType === "gradient" ? `<linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${style.bgFrom}"/><stop offset="100%" stop-color="${style.bgTo}"/></linearGradient>` : "") + (pattern ? pattern.defs : "");
  const patternOverlay = pattern && pattern.overlay ? pattern.overlay : "";
  const bgEffects = buildBgEffectsOverlay(style, size);
  const shadowGlowFilterDef = buildShadowGlowFilter(style, size);
  const shadowGlowAttr = shadowGlowFilterDef ? ` filter="url(#shadowGlow)"` : "";
  const strokeAttr = style.borderWidth ? ` stroke="${style.borderColor}" stroke-width="${style.borderWidth}"` : "";
  const textMarkup = style.typographyText
    ? `<text x="${size / 2}" y="${size * 0.86}" text-anchor="middle" font-family="${style.typographyFont}" font-size="${style.typographySize * (size / 512)}" fill="${style.typographyColor}">${escapeXML(style.typographyText)}</text>`
    : "";

  if (icon.isLetter) {
    const fontSize = size * (style.letterScale != null ? style.letterScale : 0.62);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
      `<defs>${bgGradDefs}${bgEffects.defs}${shadowGlowFilterDef || ""}</defs>` +
      `<rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" fill="${bgFill}"${strokeAttr}/>` +
      `${patternOverlay}` +
      `${bgEffects.overlay}` +
      `<text x="${size / 2}" y="${size / 2}" dominant-baseline="central" text-anchor="middle" font-family="${icon.font}" font-weight="700" font-size="${fontSize}" fill="${icon.color}" opacity="${style.opacity}"${shadowGlowAttr}>${escapeXML(icon.text)}</text>` +
      `${textMarkup}` +
      `</svg>`;
  }

  if (icon.isImage) {
    const scale = style.logoScale != null ? style.logoScale : 0.82;
    const inset = ((1 - scale) * size) / 2;
    const inner = size - inset * 2;
    const fit = style.logoFit === "cover" ? "xMidYMid slice" : "xMidYMid meet";
    const clipDef = style.logoFit === "cover" ? `<clipPath id="logoClip"><rect x="${inset}" y="${inset}" width="${inner}" height="${inner}" rx="${inner * 0.16}"/></clipPath>` : "";
    const imageMarkup = `<g${style.logoFit === "cover" ? ` clip-path="url(#logoClip)"` : ""}${shadowGlowAttr}><image href="${icon.dataUrl}" x="${inset}" y="${inset}" width="${inner}" height="${inner}" preserveAspectRatio="${fit}" opacity="${style.opacity}"/></g>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
      `<defs>${bgGradDefs}${bgEffects.defs}${clipDef}${shadowGlowFilterDef || ""}</defs>` +
      `<rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" fill="${bgFill}"${strokeAttr}/>` +
      `${patternOverlay}` +
      `${bgEffects.overlay}` +
      imageMarkup +
      `${textMarkup}` +
      `</svg>`;
  }

  const angle = (style.gradAngle || 135) * (Math.PI / 180);
  const x1 = 50 - Math.cos(angle) * 50, y1 = 50 - Math.sin(angle) * 50;
  const x2 = 50 + Math.cos(angle) * 50, y2 = 50 + Math.sin(angle) * 50;
  const fill = style.fillMode === "gradient" ? "url(#fillGrad)" : style.solid;
  const rotation = icon.rotation || 0;
  const mirror = !!icon.mirror;
  const iconBox = size * (280 / 512);
  const scale = iconBox / 24;
  const cx = size / 2, cy = size / 2;
  const shapes = icon.paths.map((p) => pathMarkup(p, fill)).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `<defs><linearGradient id="fillGrad" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%"><stop offset="0%" stop-color="${style.gradFrom}"/><stop offset="100%" stop-color="${style.gradTo}"/></linearGradient>${bgGradDefs}${bgEffects.defs}${shadowGlowFilterDef || ""}</defs>` +
    `<rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" fill="${bgFill}"${strokeAttr}/>` +
    `${patternOverlay}` +
    `${bgEffects.overlay}` +
    `<g transform="translate(${cx} ${cy}) rotate(${rotation}) scale(${(mirror ? -1 : 1) * scale} ${scale}) translate(-12 -12)" opacity="${style.opacity}"${shadowGlowAttr}>${shapes}</g>` +
    `${textMarkup}` +
    `</svg>`;
}
/* ----------------------------------------------------------------
   CUSTOM LOGO — file reading + crisp, clutter-free image processing
------------------------------------------------------------------*/
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
function loadImageEl(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}
// Cleans up an uploaded raster logo so exports read crisp and clutter-free:
//  1. Progressive (step-wise, never more than 2x per pass) resampling avoids the
//     muddy blur a single large scale jump produces.
//  2. Alpha edges are snapped (near-0 -> fully transparent, near-255 -> fully opaque)
//     to remove the faint fuzzy halo/fringe that comes from compressed or poorly
//     exported source images.
//  3. Fully-transparent padding is trimmed and replaced with a small, even margin
//     so the mark isn't awkwardly off-center or crowding the canvas edge.
async function processLogoImage(dataUrl, isVector) {
  if (isVector) return dataUrl; // SVGs stay perfectly crisp at any size natively
  const img = await loadImageEl(dataUrl);
  const CANON = 1024;

  let curCanvas = document.createElement("canvas");
  curCanvas.width = img.naturalWidth || img.width || CANON;
  curCanvas.height = img.naturalHeight || img.height || CANON;
  let cctx = curCanvas.getContext("2d");
  cctx.drawImage(img, 0, 0, curCanvas.width, curCanvas.height);

  let curW = curCanvas.width, curH = curCanvas.height;
  while (Math.max(curW, curH) > CANON * 2 || Math.max(curW, curH) < CANON / 2) {
    const factor = Math.max(curW, curH) > CANON ? 0.5 : 2;
    const nextW = Math.max(1, Math.round(curW * factor));
    const nextH = Math.max(1, Math.round(curH * factor));
    const next = document.createElement("canvas");
    next.width = nextW; next.height = nextH;
    const nctx = next.getContext("2d");
    nctx.imageSmoothingEnabled = true;
    nctx.imageSmoothingQuality = "high";
    nctx.drawImage(curCanvas, 0, 0, nextW, nextH);
    curCanvas = next; curW = nextW; curH = nextH;
  }

  const scale = Math.min(CANON / curW, CANON / curH);
  const fitW = Math.max(1, Math.round(curW * scale)), fitH = Math.max(1, Math.round(curH * scale));
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = CANON; finalCanvas.height = CANON;
  const fctx = finalCanvas.getContext("2d");
  fctx.imageSmoothingEnabled = true;
  fctx.imageSmoothingQuality = "high";
  fctx.drawImage(curCanvas, (CANON - fitW) / 2, (CANON - fitH) / 2, fitW, fitH);

  const imgData = fctx.getImageData(0, 0, CANON, CANON);
  const d = imgData.data;
  let minX = CANON, minY = CANON, maxX = -1, maxY = -1;
  for (let i = 0; i < d.length; i += 4) {
    let a = d[i + 3];
    if (a < 10) a = 0;
    else if (a > 245) a = 255;
    d[i + 3] = a;
    if (a > 0) {
      const px = (i / 4) % CANON, py = Math.floor((i / 4) / CANON);
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    }
  }
  fctx.putImageData(imgData, 0, 0);

  if (maxX <= minX || maxY <= minY) return finalCanvas.toDataURL("image/png");

  const trimW = maxX - minX + 1, trimH = maxY - minY + 1;
  const side = Math.max(trimW, trimH);
  const margin = Math.round(side * 0.08);
  const outSide = side + margin * 2;
  const trimmed = document.createElement("canvas");
  trimmed.width = outSide; trimmed.height = outSide;
  const tctx = trimmed.getContext("2d");
  tctx.imageSmoothingEnabled = true;
  tctx.imageSmoothingQuality = "high";
  const dx = margin + (side - trimW) / 2;
  const dy = margin + (side - trimH) / 2;
  tctx.drawImage(finalCanvas, minX, minY, trimW, trimH, dx, dy, trimW, trimH);
  return trimmed.toDataURL("image/png");
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  requestAnimationFrame(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

/* ----------------------------------------------------------------
   MAIN APP
------------------------------------------------------------------*/
function IconStudio() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [obStep, setObStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 860 : false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [sidebarDragging, setSidebarDragging] = useState(false);
  const sidebarDragRef = useRef({ startX: 0, startWidth: 300, moved: false });
  const [tab, setTab] = useState("presets"); // presets | icons | customize | ai
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [visibleCount, setVisibleCount] = useState(60);

  const defaultStyle = {
    icon: "bolt-0-0-regular",
    fillMode: "gradient", solid: "#8B7CF6",
    gradFrom: "#8B7CF6", gradTo: "#4C3BCB", gradAngle: 135,
    glassTint: "#8B7CF6", glassFrost: 0.35, glassHighlight: 0.6,
    bgType: "transparent", bgShape: "square", bgSolid: "#16171D", bgFrom: "#1C1D24", bgTo: "#33364A",
    bgPatternFg: "#8B7CF6", bgPatternBg: "#16171D", bgPatternScale: 1,
    bgMeshC1: "#8B7CF6", bgMeshC2: "#4C3BCB", bgMeshC3: "#2BB3A3", bgMeshBase: "#14151F",
    bgRadialGlare: false, bgNoiseTexture: false, bgNoiseOpacity: 0.12,
    opacity: 1,
    typographyText: "", typographyFont: "Space Grotesk", typographySize: 28, typographyColor: "#EDEBFF",
    borderWidth: 0, borderColor: "#4C3BCB", borderRadius: 28,
    showGrid: false,
    logoScale: 0.82, logoFit: "contain",
    letterText: "", letterFont: "Space Grotesk", letterColor: "#EDEBFF", letterScale: 0.62,
    shadowEnabled: false, shadowColor: "#000000", shadowOpacity: 0.45, shadowBlur: 24, shadowOffsetX: 0, shadowOffsetY: 14,
    glowEnabled: false, glowColor: "#8B7CF6", glowOpacity: 0.55, glowBlur: 28,
  };

  const [style, setStyle] = useState(defaultStyle);
  const [customLogo, setCustomLogo] = useState(null); // { name, dataUrl, isVector }
  const [generatedLogo, setGeneratedLogo] = useState(null);
  const [logoProcessing, setLogoProcessing] = useState(false);
  const [logoDragOver, setLogoDragOver] = useState(false);
  const [history, setHistory] = useState([defaultStyle]);
  const [histIndex, setHistIndex] = useState(0);
  const [zoom, setZoom] = useState(0.55);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("PNG");
  const [exportSize, setExportSize] = useState(512);
  const [announce, setAnnounce] = useState("");

  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem("iconStudio.favorites");
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  });
  const [recentColors, setRecentColors] = useState(() => {
    try {
      const raw = localStorage.getItem("iconStudio.recentColors");
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  });
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    try { localStorage.setItem("iconStudio.favorites", JSON.stringify(favorites)); } catch (e) {}
  }, [favorites]);
  useEffect(() => {
    try { localStorage.setItem("iconStudio.recentColors", JSON.stringify(recentColors)); } catch (e) {}
  }, [recentColors]);

  function addRecentColor(hex) {
    if (!hex || !/^#[0-9a-fA-F]{3,8}$/.test(hex)) return;
    setRecentColors((prev) => {
      const next = [hex, ...prev.filter((c) => c.toLowerCase() !== hex.toLowerCase())];
      return next.slice(0, 10);
    });
  }

  useEffect(() => {
    const handler = (e) => addRecentColor(e.detail);
    window.addEventListener("iconstudio:recentcolor", handler);
    return () => window.removeEventListener("iconstudio:recentcolor", handler);
  }, []);

  function isFavorited(iconId) {
    return favorites.some((f) => f.iconId === iconId);
  }
  function toggleFavorite(iconObj) {
    if (!iconObj) return;
    const iconId = iconObj.id || iconObj.baseId;
    setFavorites((prev) => {
      const exists = prev.some((f) => f.iconId === iconId);
      if (exists) {
        setAnnounce("Removed from favorites");
        return prev.filter((f) => f.iconId !== iconId);
      }
      setAnnounce("Added to favorites");
      return [{ iconId, name: iconObj.name || iconId, addedAt: Date.now() }, ...prev].slice(0, 60);
    });
  }

  // Ask AI state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([{ role: "ai", text: "Hi! Describe the icon vibe you want — I'll suggest styles, colors, and shapes. Try: *\"make it feel like a neon fintech app\"* or *\"calm wellness brand, earthy tones\"*." }]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSpotlightIdx, setAiSpotlightIdx] = useState(null); // active index chip
  const [aiMagicPulse, setAiMagicPulse] = useState(0);
  const aiInputRef = useRef(null);
  const aiMessagesRef = useRef(null);

  const AI_SPOTLIGHT_HINTS = [
    { label: "Neon fintech", prompt: "Neon fintech app icon — electric blue and violet, bold geometric shapes with a glow" },
    { label: "Calm wellness", prompt: "Calm wellness brand — soft earthy tones, organic rounded shapes" },
    { label: "Bold startup", prompt: "Bold startup logo — vivid gradient, confident and modern" },
    { label: "Dark glass", prompt: "Dark glass aesthetic — liquid glass effect, deep navy background" },
    { label: "Minimal mono", prompt: "Ultra-minimal monochrome — black and white, clean sharp lines" },
    { label: "Playful kids", prompt: "Playful children's app — warm bright colors, fun rounded shapes" },
    { label: "Luxury gold", prompt: "Luxury premium brand — elegant gold gradient, subtle shadow" },
    { label: "Retro sunset", prompt: "Retro 80s synthwave icon — vintage sunset gradient, diagonal" },
    { label: "AI logo", prompt: "Distinct AI startup logo mark — intelligent, premium, luminous, memorable, magical 3D gradient" },
    { label: "SaaS brand", prompt: "Professional SaaS product logo — clean enterprise geometry, balanced depth, trustworthy blue gradient" },
  ];

  function surpriseMe() {
    const pool = AI_SPOTLIGHT_HINTS.map((h) => h.prompt);
    const prompt = pool[Math.floor(Math.random() * pool.length)];
    setAiSpotlightIdx(null);
    sendAiMessage(prompt);
  }

  function applyAiMagic(preset) {
    setAiSpotlightIdx(null);
    sendAiMessage(preset.prompt);
  }

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setAiOpen(false); };
    if (aiOpen) {
      window.addEventListener("keydown", handler);
      setTimeout(() => aiInputRef.current && aiInputRef.current.focus(), 80);
    }
    return () => window.removeEventListener("keydown", handler);
  }, [aiOpen]);

  useEffect(() => {
    if (aiMessagesRef.current) aiMessagesRef.current.scrollTop = aiMessagesRef.current.scrollHeight;
  }, [aiMessages, aiLoading]);

  async function sendAiMessage(text) {
    const msg = (text || aiInput).trim();
    if (!msg || aiLoading) return;
    setAiInput("");
    setAiSpotlightIdx(null);
    setAiMessages((m) => [...m, { role: "user", text: msg }]);
    setAiLoading(true);

    // Local, offline suggestion engine — no network call, so this
    // works identically whether the file is hosted or opened directly.
    await new Promise((resolve) => setTimeout(resolve, 450 + Math.random() * 350));
    try {
      const { text: displayText, suggestion, alternates } = localAiSuggest(msg);
      setAiMessages((m) => [...m, { role: "ai", text: displayText, suggestion, alternates }]);
    } catch (e) {
      setAiMessages((m) => [...m, { role: "ai", text: "Hmm, I couldn't come up with a suggestion for that — try describing a mood, color, or vibe." }]);
    } finally {
      setAiLoading(false);
    }
  }

  function applyAiSuggestion(suggestion) {
    const { generatedIcon, ...stylePatch } = suggestion;
    if (generatedIcon) setGeneratedLogo(generatedIcon);
    updateStyle({ ...stylePatch });
    setAiMagicPulse((v) => v + 1);
    setAnnounce(generatedIcon ? "AI generated a prompt-based logo mark" : "AI style applied");
  }

  const firstFieldRef = useRef(null);
  const sidebarOpen = sidebarWidth > 0;
  const SIDEBAR_OPEN_WIDTH = 300;
  const SIDEBAR_MIN_WIDTH = 220;
  const SIDEBAR_MAX_WIDTH = 360;
  const SIDEBAR_COLLAPSE_AT = 120;

  function toggleSidebar() {
    setSidebarWidth((w) => (w > 0 ? 0 : SIDEBAR_OPEN_WIDTH));
  }

  function beginSidebarDrag(e) {
    e.preventDefault();
    sidebarDragRef.current = { startX: e.clientX, startWidth: sidebarWidth, moved: false };
    setSidebarDragging(true);
    if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId);
  }

  function moveSidebarDrag(e) {
    if (!sidebarDragging) return;
    const drag = sidebarDragRef.current;
    const delta = e.clientX - drag.startX;
    if (Math.abs(delta) > 4) drag.moved = true;
    const next = Math.max(0, Math.min(SIDEBAR_MAX_WIDTH, drag.startWidth + delta));
    setSidebarWidth(next < 24 ? 0 : next);
  }

  function endSidebarDrag() {
    if (!sidebarDragging) return;
    const moved = sidebarDragRef.current.moved;
    setSidebarDragging(false);
    setSidebarWidth((w) => {
      if (!moved) return w;
      return w < SIDEBAR_COLLAPSE_AT ? 0 : Math.max(SIDEBAR_MIN_WIDTH, w);
    });
  }

  function handleSidebarToggleClick() {
    if (sidebarDragRef.current.moved) {
      sidebarDragRef.current.moved = false;
      return;
    }
    toggleSidebar();
  }

  function handleSidebarKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleSidebar();
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setSidebarWidth(0);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setSidebarWidth(SIDEBAR_OPEN_WIDTH);
    }
  }

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 860);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Global ⌘K / Ctrl+K shortcut to toggle Ask AI
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setAiOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (showOnboarding && firstFieldRef.current) firstFieldRef.current.focus();
  }, [showOnboarding, obStep]);

  useEffect(() => { setVisibleCount(60); }, [search, activeCat, tab]);

  const pushHistory = useCallback((next) => {
    setHistory((h) => {
      const trimmed = h.slice(0, histIndex + 1);
      const updated = [...trimmed, next];
      return updated.slice(-40);
    });
    setHistIndex((i) => Math.min(i + 1, 39));
    setStyle(next);
  }, [histIndex]);

  const updateStyle = (patch) => pushHistory({ ...style, ...patch });

  const undo = () => { if (histIndex > 0) { setHistIndex(histIndex - 1); setStyle(history[histIndex - 1]); setAnnounce("Undo"); } };
  const redo = () => { if (histIndex < history.length - 1) { setHistIndex(histIndex + 1); setStyle(history[histIndex + 1]); setAnnounce("Redo"); } };

  // Recenters the zoom/pan control back on the logo canvas at default zoom.
  const resetZoomPan = () => { setZoom(0.55); setAnnounce("Canvas recentered"); };

  async function handleLogoUpload(file) {
    if (!file) return;
    if (!/^image\//.test(file.type) && !/\.svg$/i.test(file.name)) {
      setAnnounce("Please upload an SVG, PNG, JPG, or WEBP image");
      return;
    }
    setLogoProcessing(true);
    try {
      const raw = await readFileAsDataURL(file);
      const isVector = file.type === "image/svg+xml" || /\.svg$/i.test(file.name);
      const cleaned = await processLogoImage(raw, isVector);
      setCustomLogo({ name: file.name, dataUrl: cleaned, isVector });
      updateStyle({ icon: "custom-logo" });
      setAnnounce(`Uploaded ${file.name} as a custom logo icon`);
    } catch (e) {
      setAnnounce("Couldn't process that logo file — please try another image");
    } finally {
      setLogoProcessing(false);
    }
  }
  function removeCustomLogo() {
    setCustomLogo(null);
    if (style.icon === "custom-logo") updateStyle({ icon: defaultStyle.icon });
    setAnnounce("Custom logo removed");
  }

  const currentIcon = style.icon === "custom-logo" && customLogo
    ? { id: "custom-logo", baseId: "custom-logo", name: customLogo.name || "Custom logo", isImage: true, dataUrl: customLogo.dataUrl }
    : style.icon === "ai-generated-logo" && generatedLogo
    ? generatedLogo
    : style.icon === "letter-mark" && style.letterText
    ? { id: "letter-mark", baseId: "letter-mark", name: "Letter icon", isLetter: true, text: style.letterText, font: style.letterFont, color: style.letterColor }
    : iconById(style.icon);

  const filteredIcons = useMemo(() => {
    const q = search.toLowerCase();
    const favIds = showFavorites ? new Set(favorites.map((f) => f.iconId)) : null;
    return ICONS.filter((i) => {
      const matchesCat = activeCat === "All" || i.cat === activeCat;
      const matchesSearch = !q || i.name.toLowerCase().includes(q) || i.tags.some((t) => t.includes(q));
      const matchesFav = !favIds || favIds.has(i.id);
      return matchesCat && matchesSearch && matchesFav;
    });
  }, [search, activeCat, showFavorites, favorites]);

  function selectIcon(icon) {
    const [f, t] = seededGradient(icon.id);
    updateStyle({ icon: icon.id, fillMode: "gradient", gradFrom: f, gradTo: t });
  }

  function applyPreset(p) {
    updateStyle({ icon: p.icon, fillMode: p.fillMode, solid: p.solid || style.solid, gradFrom: p.gradFrom || style.gradFrom, gradTo: p.gradTo || style.gradTo, gradAngle: p.gradAngle || style.gradAngle, glassTint: p.glassTint || style.glassTint, glassFrost: p.glassFrost != null ? p.glassFrost : style.glassFrost, glassHighlight: p.glassHighlight != null ? p.glassHighlight : style.glassHighlight, bgType: p.bgType, bgSolid: p.bgSolid || style.bgSolid, bgFrom: p.bgFrom || style.bgFrom, bgTo: p.bgTo || style.bgTo, borderWidth: p.borderWidth, borderColor: p.borderColor });
    setAnnounce(`Applied ${p.label} preset`);
  }

  function finishOnboarding(skip) {
    if (!skip) {
      const suggestion = suggestFromAnswers(answers);
      pushHistory({ ...defaultStyle, ...suggestion });
      setAnnounce("Personalized starting style applied");
    }
    setShowOnboarding(false);
  }

  async function handleExport() {
    const svgString = buildExportMarkup(currentIcon, style, exportSize);
    const filename = `${(currentIcon.baseId || "icon")}-${exportSize}`;
    if (exportFormat === "SVG") {
      downloadBlob(new Blob([svgString], { type: "image/svg+xml" }), `${filename}.svg`);
      setAnnounce(`Exported ${filename}.svg`);
      setExportOpen(false);
      return;
    }
    try {
      const img = new Image();
      const svg64 = btoa(unescape(encodeURIComponent(svgString)));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = exportSize;
        canvas.height = exportSize;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        if (exportFormat === "JPG") {
          ctx.fillStyle = style.bgType === "solid" ? (style.bgSolid || "#16171d")
            : (style.bgType === "dots" || style.bgType === "grid") ? (style.bgPatternBg || "#16171d")
            : style.bgType === "mesh" ? (style.bgMeshBase || "#16171d")
            : "#16171d";
          ctx.fillRect(0, 0, exportSize, exportSize);
        }
        ctx.drawImage(img, 0, 0, exportSize, exportSize);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              downloadBlob(blob, `${filename}.${exportFormat.toLowerCase()}`);
              setAnnounce(`Exported ${filename}.${exportFormat.toLowerCase()}`);
            } else {
              setAnnounce("Export failed, please try again");
            }
          },
          exportFormat === "JPG" ? "image/jpeg" : "image/png",
          0.92
        );
        setExportOpen(false);
      };
      img.onerror = () => setAnnounce("Export failed, please try again");
      img.src = "data:image/svg+xml;base64," + svg64;
    } catch (e) {
      setAnnounce("Export failed, please try again");
    }
  }

  async function handleCopySvg() {
    const svgString = buildExportMarkup(currentIcon, style, 512);
    try {
      await navigator.clipboard.writeText(svgString);
      setAnnounce("SVG code copied to clipboard");
    } catch (e) {
      setAnnounce("Copy failed — your browser may block clipboard access");
    }
  }

  const isPatternBg = style.bgType === "dots" || style.bgType === "grid" || style.bgType === "noise" || style.bgType === "mesh";
  const canvasBg =
    style.bgType === "solid" ? style.bgSolid :
    style.bgType === "gradient" ? `linear-gradient(135deg, ${style.bgFrom}, ${style.bgTo})` :
    "transparent";
  const canvasRadius = bgRadiusFor(style.bgShape, 512, style.borderRadius);
  const canvasPatternStyle = isPatternBg ? patternCssStyle(style) : null;
  const canvasBgEffectsStyle = bgEffectsStyle(style);
  const canvasFilterCss = shadowGlowFilterCss(style);

  return (
    <div style={styles.appShell}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

        /* ── Liquid Glass Design System ────────────────────────── */
        :root {
          --glass-bg:         rgba(18, 19, 28, 0.72);
          --glass-border:     rgba(255,255,255,0.10);
          --glass-highlight:  rgba(255,255,255,0.50);
          --glass-sheen-a:    rgba(255,255,255,0.55);
          --glass-sheen-b:    rgba(255,255,255,0.00);
          --glass-blur:       blur(28px) saturate(180%);
          --glass-shadow:     0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12);
          --accent:           #8B7CF6;
          --accent-deep:      #4C3BCB;
          --accent-glow:      rgba(139,124,246,0.30);
          --surface:          #13141E;
          --surface-raised:   #1A1B28;
          --surface-hover:    rgba(255,255,255,0.04);
          --text-primary:     #F0EFF8;
          --text-secondary:   #9A9BAA;
          --text-muted:       #5E5F72;
          --border-subtle:    rgba(255,255,255,0.06);
          --border-default:   rgba(255,255,255,0.10);
          --radius-sm:        8px;
          --radius-md:        12px;
          --radius-lg:        18px;
          --radius-xl:        24px;
          --ease-spring:      cubic-bezier(0.34, 1.56, 0.64, 1);
          --ease-smooth:      cubic-bezier(0.16, 1, 0.3, 1);
        }

        * { box-sizing: border-box; }
        .is-app-root, .is-app-root * { font-family: 'Inter', system-ui, sans-serif; }
        .is-app-root button { cursor: pointer; }
        .is-app-root button:focus-visible,
        .is-app-root input:focus-visible,
        .is-app-root select:focus-visible,
        .is-app-root textarea:focus-visible,
        .is-app-root [tabindex]:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }
        .is-tab-btn { transition: color .18s var(--ease-smooth), background-color .18s var(--ease-smooth); }
        .is-swatch { transition: transform .18s var(--ease-smooth), box-shadow .18s var(--ease-smooth); }
        .is-swatch:hover { transform: translateY(-2px) scale(1.02); }
        .is-swatch[aria-pressed="true"] { animation: is-pop .32s var(--ease-spring); }
        @keyframes is-pop { 0% { transform: scale(.88); } 60% { transform: scale(1.08); } 100% { transform: scale(1); } }
        .is-fade-in { animation: is-fade .28s var(--ease-smooth); }
        @keyframes is-fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .is-sheet-enter { animation: is-sheet .36s var(--ease-smooth); }
        @keyframes is-sheet { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .is-canvas-wrap { transition: transform .2s var(--ease-smooth), border-radius .2s var(--ease-smooth); }
        .is-btn-press { transition: transform .12s var(--ease-spring), box-shadow .12s ease; }
        .is-btn-press:active { transform: scale(.93); }

        /* ── Liquid Glass Logo Mark ─────────────────────────── */
        .is-logo-glass {
          position: relative;
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px;
          border-radius: 11px;
          background: linear-gradient(145deg,
            rgba(255,255,255,0.22) 0%,
            rgba(139,124,246,0.14) 40%,
            rgba(76,59,203,0.08) 100%);
          border: 1px solid rgba(255,255,255,0.28);
          box-shadow:
            inset 0 1.5px 1px rgba(255,255,255,0.45),
            inset 0 -6px 14px rgba(76,59,203,0.40),
            0 0 0 1px rgba(76,59,203,0.20),
            0 8px 24px rgba(76,59,203,0.35),
            0 2px 6px rgba(0,0,0,0.30);
          backdrop-filter: blur(16px) saturate(200%);
          -webkit-backdrop-filter: blur(16px) saturate(200%);
          overflow: hidden; flex-shrink: 0;
        }
        .is-logo-glass::before {
          content: "";
          position: absolute; inset: 0;
          background: linear-gradient(130deg,
            rgba(255,255,255,0.60) 0%,
            rgba(255,255,255,0.08) 28%,
            rgba(255,255,255,0.00) 60%,
            rgba(139,124,246,0.15) 100%);
          mix-blend-mode: overlay;
          pointer-events: none;
        }
        .is-logo-glass::after {
          content: "";
          position: absolute; top: -80%; left: -40%;
          width: 50%; height: 260%;
          background: linear-gradient(105deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.65) 48%,
            rgba(255,255,255,0) 64%);
          transform: translateX(-45%) rotate(22deg);
          animation: is-glass-sheen 6s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes is-glass-sheen {
          0%, 100% { transform: translateX(-45%) rotate(22deg); opacity: 0; }
          40% { opacity: 1; }
          55% { transform: translateX(190%) rotate(22deg); opacity: 0; }
        }

        /* ── Glass Surface Variants ──────────────────────────── */
        .is-glass-pill {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          box-shadow: var(--glass-shadow);
        }
        .is-glass-surface {
          background: linear-gradient(160deg, rgba(26,27,40,0.85) 0%, rgba(18,19,28,0.95) 100%);
          border: 1px solid var(--border-default);
          backdrop-filter: blur(20px) saturate(160%);
          -webkit-backdrop-filter: blur(20px) saturate(160%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 16px 48px rgba(0,0,0,0.50);
        }

        /* ── New Sidebar Nav Rail ───────────────────────────── */
        .is-nav-rail {
          display: flex; flex-direction: column; align-items: center;
          width: 56px; padding: 12px 0;
          background: linear-gradient(180deg, rgba(16,17,22,0.98) 0%, rgba(13,14,20,0.98) 100%);
          border-right: 1px solid var(--border-subtle);
          gap: 4px; flex-shrink: 0;
        }
        .is-nav-btn {
          position: relative;
          width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 11px; border: none;
          background: transparent; color: var(--text-muted);
          font-size: 17px; transition: all .18s var(--ease-smooth);
          flex-shrink: 0;
        }
        .is-nav-btn:hover { background: var(--surface-hover); color: var(--text-secondary); }
        .is-nav-btn.active {
          background: linear-gradient(135deg, rgba(139,124,246,0.22), rgba(76,59,203,0.16));
          color: var(--accent);
          border: 1px solid rgba(139,124,246,0.30);
          box-shadow: 0 0 14px rgba(139,124,246,0.20), inset 0 1px 0 rgba(255,255,255,0.12);
        }
        .is-nav-btn.active::before {
          content: "";
          position: absolute; left: -1px; top: 50%; transform: translateY(-50%);
          width: 3px; height: 20px;
          background: linear-gradient(to bottom, var(--accent), var(--accent-deep));
          border-radius: 0 3px 3px 0;
          box-shadow: 0 0 8px var(--accent-glow);
        }
        .is-nav-tooltip {
          position: absolute; left: calc(100% + 10px); top: 50%; transform: translateY(-50%);
          background: rgba(18,19,28,0.95); color: var(--text-primary);
          border: 1px solid var(--border-default);
          backdrop-filter: blur(12px);
          font-size: 11px; font-weight: 600; white-space: nowrap;
          padding: 5px 9px; border-radius: 7px;
          pointer-events: none; opacity: 0; z-index: 100;
          box-shadow: 0 4px 16px rgba(0,0,0,0.40);
          transition: opacity .15s ease;
          letter-spacing: 0.2px;
        }
        .is-nav-btn:hover .is-nav-tooltip { opacity: 1; }
        .is-nav-divider { width: 28px; height: 1px; background: var(--border-subtle); margin: 6px 0; }
        .is-sidebar-panel {
          width: 300px; flex-shrink: 0;
          display: flex; flex-direction: column;
          background: linear-gradient(180deg, rgba(17,18,26,0.97) 0%, rgba(13,14,20,0.99) 100%);
          border-right: 1px solid var(--border-subtle);
          overflow: hidden;
          transition: width .18s var(--ease-smooth), border-color .18s ease;
        }
        .is-sidebar-panel.is-dragging {
          transition: none;
          user-select: none;
        }
        .is-sidebar-panel.is-collapsed {
          border-right-color: transparent;
          border-right-width: 0;
        }
        .is-sidebar-panel.is-collapsed .is-panel-header,
        .is-sidebar-panel.is-collapsed .is-panel-body {
          opacity: 0;
          pointer-events: none;
        }
        .is-sidebar-shell {
          position: relative;
          display: flex;
          flex-shrink: 0;
        }
        .is-sidebar-resizer {
          position: sticky;
          top: 53px;
          width: 18px;
          height: calc(100vh - 53px);
          margin-left: -9px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: ew-resize;
          z-index: 18;
          padding: 0;
          flex-shrink: 0;
          touch-action: none;
        }
        .is-sidebar-resizer::before {
          content: "";
          width: 4px;
          height: 44px;
          border-radius: 999px;
          background: rgba(139,124,246,0.38);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 0 18px rgba(139,124,246,0.18);
          transition: width .14s ease, height .14s ease, background .14s ease;
        }
        .is-sidebar-resizer:hover::before,
        .is-sidebar-resizer:focus-visible::before,
        .is-sidebar-resizer.is-dragging::before {
          width: 6px;
          height: 56px;
          background: rgba(139,124,246,0.72);
        }
        .is-sidebar-resizer:focus-visible {
          outline: 2px solid rgba(139,124,246,0.65);
          outline-offset: -4px;
        }
        .is-panel-header {
          padding: 18px 16px 12px;
          border-bottom: 1px solid var(--border-subtle);
          flex-shrink: 0;
          transition: opacity .12s ease;
        }
        .is-panel-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 13px; font-weight: 600;
          color: var(--text-secondary); letter-spacing: 0.6px;
          text-transform: uppercase;
        }
        .is-panel-body {
          flex: 1; overflow-y: auto; padding: 14px 14px 20px;
          transition: opacity .12s ease;
        }

        /* ── Field Group Glass Refresh ──────────────────────── */
        .is-fieldgroup-glass {
          background: rgba(255,255,255,0.025);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 12px 14px; margin: 0;
        }
        .is-fieldgroup-glass legend {
          font-size: 10.5px; color: var(--text-muted); font-weight: 700;
          padding: 0 5px; text-transform: uppercase; letter-spacing: 0.6px;
        }

        /* ── Custom Logo Uploader ─────────────────────────────── */
        .is-logo-drop {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 6px; text-align: center;
          padding: 20px 12px; border-radius: var(--radius-md);
          border: 1.5px dashed rgba(255,255,255,0.16);
          background: rgba(255,255,255,0.02);
          color: var(--text-secondary); font-size: 12px; font-weight: 500;
          cursor: pointer; transition: all .16s var(--ease-smooth); width: 100%;
        }
        .is-logo-drop:hover, .is-logo-drop.is-drag-over {
          border-color: rgba(139,124,246,0.45);
          background: linear-gradient(145deg, rgba(139,124,246,0.08), rgba(76,59,203,0.05));
          color: var(--text-primary);
        }
        .is-logo-drop svg { opacity: 0.6; }
        .is-logo-preview-row {
          display: flex; align-items: center; gap: 10px;
          padding: 8px; border-radius: var(--radius-md);
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
        }
        .is-logo-thumb {
          width: 40px; height: 40px; border-radius: 8px; flex-shrink: 0;
          background-image:
            linear-gradient(45deg, #22232e 25%, transparent 25%),
            linear-gradient(-45deg, #22232e 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #22232e 75%),
            linear-gradient(-45deg, transparent 75%, #22232e 75%);
          background-size: 10px 10px;
          background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
          background-color: #181921;
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .is-logo-thumb img { width: 100%; height: 100%; object-fit: contain; image-rendering: -webkit-optimize-contrast; }
        .is-logo-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
        .is-logo-name { font-size: 12px; font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .is-logo-sub { font-size: 10.5px; color: var(--text-muted); }
        .is-logo-remove {
          flex-shrink: 0; width: 26px; height: 26px; border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          color: var(--text-secondary); font-size: 13px;
        }
        .is-logo-remove:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.35); color: #FCA5A5; }

        /* ── Checker, Scrollbar, Range ──────────────────────── */
        .is-checker {
          background-image:
            linear-gradient(45deg, #22232e 25%, transparent 25%),
            linear-gradient(-45deg, #22232e 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #22232e 75%),
            linear-gradient(-45deg, transparent 75%, #22232e 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
          background-color: #181921;
        }
        input[type="range"] {
          -webkit-appearance: none; appearance: none;
          width: 100%; height: 3px; border-radius: 999px;
          background: rgba(255,255,255,0.10); border: none; outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 15px; height: 15px; border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), var(--accent-deep));
          border: 2px solid rgba(255,255,255,0.20); cursor: pointer;
          box-shadow: 0 2px 8px var(--accent-glow);
        }
        input[type="range"]::-moz-range-thumb {
          width: 15px; height: 15px; border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), var(--accent-deep));
          border: 2px solid rgba(255,255,255,0.20); cursor: pointer;
        }
        input[type="range"]::-moz-range-track { background: transparent; border: none; }
        @media (prefers-reduced-motion: reduce) {
          .is-swatch, .is-fade-in, .is-sheet-enter, .is-canvas-wrap, .is-tab-btn,
          .is-logo-glass::after, .is-btn-press { animation: none !important; transition: none !important; }
        }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.10); border-radius: 99px; }
        ::-webkit-scrollbar-track { background: transparent; }

        /* ── Customize Tab (v2) ───────────────────────────────── */
        .is-cz-header {
          display: flex; align-items: center; justify-content: space-between;
          padding-bottom: 2px;
        }
        .is-cz-header-title { font-size: 11.5px; font-weight: 700; color: var(--text-secondary); letter-spacing: .02em; text-transform: uppercase; }
        .is-cz-reset-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 5px 10px; border-radius: 8px; font-size: 11px; font-weight: 600;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: var(--text-secondary);
          transition: all .14s ease;
        }
        .is-cz-reset-btn:hover { background: rgba(255,90,90,0.10); border-color: rgba(255,90,90,0.30); color: #FF8A8A; }
        .is-cz-section-toggle {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          background: none; border: none; padding: 0; cursor: pointer; color: var(--text-primary);
        }
        .is-cz-section-title { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; letter-spacing: .01em; }
        .is-cz-section-icon {
          display: inline-flex; align-items: center; justify-content: center;
          width: 20px; height: 20px; border-radius: 6px; font-size: 10.5px; flex-shrink: 0;
          background: rgba(139,124,246,0.12); color: #C4B8FF;
        }
        .is-cz-chevron { color: var(--text-muted); transition: transform .18s ease; flex-shrink: 0; }
        .is-cz-swatch-row { display: flex; gap: 7px; flex-wrap: wrap; padding-bottom: 2px; }
        .is-cz-mood-swatch {
          width: 26px; height: 26px; border-radius: 8px; border: 1.5px solid rgba(255,255,255,0.14);
          padding: 0; cursor: pointer; transition: transform .14s var(--ease-spring), border-color .14s ease;
        }
        .is-cz-mood-swatch:hover { transform: scale(1.12); border-color: rgba(255,255,255,0.35); }

        /* ── Icons Tab (v2) ───────────────────────────────────── */
        .is-icon-search-wrap {
          position: relative; display: flex; align-items: center;
          margin-bottom: 10px;
        }
        .is-icon-search-glass {
          position: absolute; left: 11px; color: var(--text-muted); pointer-events: none;
        }
        .is-icon-search-input {
          width: 100%; box-sizing: border-box;
          padding: 9px 30px 9px 32px; border-radius: 10px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
          color: var(--text-primary); font-size: 13px; font-family: 'Inter', sans-serif;
          outline: none; transition: border-color .16s ease, background .16s ease;
        }
        .is-icon-search-input::placeholder { color: var(--text-muted); }
        .is-icon-search-input:focus { border-color: rgba(139,124,246,0.45); background: rgba(255,255,255,0.06); }
        .is-icon-search-clear {
          position: absolute; right: 8px; width: 18px; height: 18px; border-radius: 5px; border: none;
          background: rgba(255,255,255,0.08); color: var(--text-secondary);
          font-size: 13px; line-height: 1; display: flex; align-items: center; justify-content: center;
        }
        .is-icon-search-clear:hover { background: rgba(255,255,255,0.16); color: var(--text-primary); }
        .is-cat-scroll {
          display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 6px;
          scrollbar-width: none;
        }
        .is-cat-scroll::-webkit-scrollbar { display: none; }
        .is-cat-pill {
          display: inline-flex; align-items: center; gap: 5px; flex-shrink: 0;
          padding: 6px 12px; border-radius: 999px; white-space: nowrap;
          font-size: 11.5px; font-weight: 600; color: var(--text-secondary);
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          transition: all .14s ease;
        }
        .is-cat-pill:hover { background: rgba(255,255,255,0.08); color: var(--text-primary); }
        .is-cat-pill.active {
          background: linear-gradient(135deg, rgba(139,124,246,0.28), rgba(76,59,203,0.20));
          border-color: rgba(139,124,246,0.45); color: #C4B8FF;
        }
        .is-icon-grid-header {
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
          font-size: 10.5px; color: var(--text-muted); padding: 2px 1px 8px;
        }
        .is-icon-grid-current strong { color: var(--text-secondary); font-weight: 600; }
        .is-icon-tile { position: relative; }
        .is-icon-tile-btn {
          width: 100%; aspect-ratio: 1;
          display: flex; align-items: center; justify-content: center;
          border-radius: 12px; background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          transition: transform .14s var(--ease-spring), background .14s ease, border-color .14s ease;
        }
        .is-icon-tile-btn:hover { background: rgba(255,255,255,0.07); transform: translateY(-1px) scale(1.04); }
        .is-icon-tile-btn.active {
          background: rgba(139,124,246,0.14); border-color: rgba(139,124,246,0.45);
          box-shadow: 0 0 0 1px rgba(139,124,246,0.25) inset;
        }
        .is-icon-fav-btn {
          position: absolute; top: 3px; right: 3px; width: 17px; height: 17px; border-radius: 5px;
          border: none; background: rgba(14,15,20,0.55); color: rgba(255,255,255,0.55);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity .14s ease, color .14s ease, background .14s ease;
        }
        .is-icon-tile:hover .is-icon-fav-btn, .is-icon-fav-btn.active { opacity: 1; }
        .is-icon-fav-btn.active { color: #F5B342; background: rgba(245,179,66,0.16); }
        .is-icon-fav-btn:hover { color: #F5B342; }
        .is-icon-empty {
          grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; gap: 8px;
          padding: 28px 12px; color: var(--text-muted);
        }
        .is-icon-action-row {
          display: grid; grid-template-columns: minmax(0, 1fr) 44px 44px 44px;
          gap: 8px; align-items: center; margin-bottom: 10px;
        }
        .is-icon-action-row .is-icon-search-wrap { margin-bottom: 0; min-width: 0; }
        .is-icon-tool-btn {
          height: 44px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.055);
          color: var(--text-secondary);
          display: flex; align-items: center; justify-content: center;
          transition: background .14s ease, border-color .14s ease, color .14s ease;
        }
        .is-icon-tool-btn:hover, .is-icon-tool-btn.active {
          background: rgba(139,124,246,0.16);
          border-color: rgba(139,124,246,0.38);
          color: #D8D1FF;
        }
        .is-icon-text-panel {
          display: flex; flex-direction: column; gap: 8px;
          margin: 0 0 10px; padding: 10px;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; background: rgba(255,255,255,0.03);
        }
        .is-icon-text-label {
          font-size: 12px; font-weight: 700; color: var(--text-muted);
        }
        .is-bg-preset-grid {
          display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px;
        }
        .is-bg-preset-btn {
          aspect-ratio: 1; border-radius: 9px; border: 1px solid rgba(255,255,255,0.08);
          padding: 0; box-shadow: inset 0 1px 0 rgba(255,255,255,0.24), 0 8px 18px rgba(0,0,0,0.18);
          transition: transform .14s var(--ease-spring), border-color .14s ease;
        }
        .is-bg-preset-btn:hover { transform: translateY(-1px) scale(1.04); border-color: rgba(255,255,255,0.32); }
        .is-bg-preset-btn.active { border-color: rgba(139,124,246,0.75); box-shadow: 0 0 0 2px rgba(139,124,246,0.20), inset 0 1px 0 rgba(255,255,255,0.24); }

        /* ── Ask AI Spotlight ─────────────────────────────────── */
        .is-ai-backdrop {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(6,7,14,0.55);
          backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
          display: flex; align-items: flex-start; justify-content: flex-end;
          padding: 60px 16px 0 0;
        }
        .is-ai-panel {
          width: 380px; max-height: calc(100vh - 80px);
          background: linear-gradient(160deg, rgba(22,23,36,0.97) 0%, rgba(14,15,24,0.99) 100%);
          border: 1px solid rgba(139,124,246,0.22);
          border-radius: 18px;
          box-shadow: 0 0 0 1px rgba(139,124,246,0.10), 0 32px 80px rgba(0,0,0,0.70), 0 0 60px rgba(139,124,246,0.08);
          display: flex; flex-direction: column; overflow: hidden;
          animation: is-ai-drop .28s var(--ease-spring);
        }
        @keyframes is-ai-drop {
          from { opacity: 0; transform: translateY(-12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .is-ai-header {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 16px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .is-ai-icon-badge {
          width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
          background: linear-gradient(135deg, rgba(139,124,246,0.30), rgba(76,59,203,0.22));
          border: 1px solid rgba(139,124,246,0.35);
          box-shadow: 0 0 14px rgba(139,124,246,0.20);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
        }
        .is-ai-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px; font-weight: 700; color: var(--text-primary);
          flex: 1;
        }
        .is-ai-close {
          width: 26px; height: 26px; border-radius: 7px; border: none;
          background: rgba(255,255,255,0.05); color: var(--text-secondary);
          font-size: 15px; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .is-ai-close:hover { background: rgba(255,255,255,0.10); color: var(--text-primary); }
        .is-ai-spotlight-row {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .is-ai-input {
          flex: 1; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px; padding: 9px 12px;
          font-size: 13px; color: var(--text-primary);
          font-family: 'Inter', sans-serif; outline: none;
          transition: border-color .16s ease;
        }
        .is-ai-input::placeholder { color: var(--text-muted); }
        .is-ai-input:focus { border-color: rgba(139,124,246,0.45); }
        .is-ai-send {
          width: 36px; height: 36px; border-radius: 10px; border: none; flex-shrink: 0;
          background: linear-gradient(135deg, #8B7CF6, #4C3BCB);
          color: #fff; font-size: 14px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(76,59,203,0.40);
          transition: opacity .15s ease, transform .12s ease;
        }
        .is-ai-send:hover { opacity: 0.9; transform: scale(1.04); }
        .is-ai-send:disabled { opacity: 0.45; transform: none; }
        .is-ai-idx-row {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px 4px;
          flex-shrink: 0;
        }
        .is-ai-idx-chip {
          font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
          color: var(--text-muted); background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 6px; padding: 3px 7px; cursor: pointer;
          transition: all .14s ease; white-space: nowrap;
        }
        .is-ai-idx-chip:hover { background: rgba(139,124,246,0.12); border-color: rgba(139,124,246,0.30); color: var(--accent); }
        .is-ai-idx-chip.active { background: rgba(139,124,246,0.18); border-color: rgba(139,124,246,0.40); color: #C4B8FF; }
        .is-ai-surprise-chip { border-style: dashed; }
        .is-ai-surprise-chip:hover { background: rgba(139,124,246,0.14); border-color: rgba(139,124,246,0.35); color: var(--accent); }
        .is-ai-magic-row {
          display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6px; padding: 0 14px 10px; flex-shrink: 0;
        }
        .is-ai-magic-btn {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          min-height: 30px; padding: 7px 9px; border-radius: 9px;
          border: 1px solid rgba(139,124,246,0.24);
          background: linear-gradient(135deg, rgba(139,124,246,0.16), rgba(43,179,163,0.08));
          color: #D8D1FF; font-size: 11.5px; font-weight: 700;
          transition: transform .14s var(--ease-spring), border-color .14s ease, background .14s ease;
        }
        .is-ai-magic-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(139,124,246,0.48);
          background: linear-gradient(135deg, rgba(139,124,246,0.26), rgba(43,179,163,0.14));
        }
        .is-ai-messages {
          flex: 1; overflow-y: auto; padding: 12px 14px 14px;
          display: flex; flex-direction: column; gap: 10px;
        }
        .is-ai-msg-user {
          align-self: flex-end;
          background: linear-gradient(135deg, rgba(139,124,246,0.25), rgba(76,59,203,0.18));
          border: 1px solid rgba(139,124,246,0.30);
          border-radius: 12px 12px 4px 12px;
          padding: 8px 12px; font-size: 13px; color: var(--text-primary);
          max-width: 85%; line-height: 1.45;
        }
        .is-ai-msg-ai {
          align-self: flex-start;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px 12px 12px 4px;
          padding: 10px 12px; font-size: 13px; color: var(--text-secondary);
          max-width: 92%; line-height: 1.55;
        }
        .is-ai-msg-ai strong { color: var(--text-primary); }
        .is-ai-typing {
          display: flex; gap: 5px; align-items: center; padding: 4px 2px;
        }
        .is-ai-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--accent); opacity: 0.5;
          animation: is-ai-pulse 1.2s ease-in-out infinite;
        }
        .is-ai-dot:nth-child(2) { animation-delay: .2s; }
        .is-ai-dot:nth-child(3) { animation-delay: .4s; }
        @keyframes is-ai-pulse {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.35; }
          40% { transform: scale(1.1); opacity: 1; }
        }
        .is-ai-apply-btn {
          margin-top: 8px; padding: 6px 12px; border-radius: 8px; border: none; font-size: 12px; font-weight: 600;
          background: linear-gradient(135deg, rgba(139,124,246,0.22), rgba(76,59,203,0.16));
          color: #C4B8FF; border: 1px solid rgba(139,124,246,0.35);
          cursor: pointer; transition: all .14s ease; display: inline-block;
        }
        .is-ai-apply-btn:hover { background: linear-gradient(135deg, rgba(139,124,246,0.35), rgba(76,59,203,0.28)); }
        .is-ai-route-row {
          display: flex; flex-wrap: wrap; gap: 6px; margin: 7px 0 0 2px;
        }
        .is-ai-route-btn {
          padding: 5px 8px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.045); color: var(--text-secondary);
          font-size: 11px; font-weight: 700;
        }
        .is-ai-route-btn:hover {
          color: #D8D1FF; border-color: rgba(139,124,246,0.38);
          background: rgba(139,124,246,0.14);
        }
        .is-ai-canvas-sparkle {
          position: absolute; inset: 0; pointer-events: none; z-index: 10;
          border-radius: inherit; overflow: hidden;
        }
        .is-ai-canvas-sparkle::before {
          content: "";
          position: absolute; inset: -30%;
          background:
            radial-gradient(circle at 24% 30%, rgba(255,255,255,0.9) 0 2px, transparent 3px),
            radial-gradient(circle at 68% 24%, rgba(196,184,255,0.95) 0 2px, transparent 3px),
            radial-gradient(circle at 76% 70%, rgba(43,179,163,0.85) 0 2px, transparent 3px),
            linear-gradient(110deg, transparent 28%, rgba(255,255,255,0.32) 48%, transparent 62%);
          animation: is-ai-sparkle-sweep .86s ease-out forwards;
        }
        @keyframes is-ai-sparkle-sweep {
          0% { opacity: 0; transform: translateX(-30%) rotate(8deg) scale(0.96); }
          22% { opacity: 1; }
          100% { opacity: 0; transform: translateX(32%) rotate(8deg) scale(1.04); }
        }

        /* ── Ask AI Trigger Button ───────────────────────────── */
        .is-ask-ai-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 7px 14px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, rgba(139,124,246,0.16), rgba(76,59,203,0.10));
          border: 1px solid rgba(139,124,246,0.30);
          color: #C4B8FF; font-size: 13px; font-weight: 600;
          box-shadow: 0 0 16px rgba(139,124,246,0.12), inset 0 1px 0 rgba(255,255,255,0.10);
          transition: all .16s var(--ease-smooth); white-space: nowrap;
        }
        .is-ask-ai-btn:hover {
          background: linear-gradient(135deg, rgba(139,124,246,0.26), rgba(76,59,203,0.18));
          border-color: rgba(139,124,246,0.50);
          box-shadow: 0 0 22px rgba(139,124,246,0.22), inset 0 1px 0 rgba(255,255,255,0.14);
        }
        .is-ask-ai-btn .ai-kbd {
          font-size: 10px; opacity: 0.55; letter-spacing: 0.3px;
          background: rgba(255,255,255,0.08); border-radius: 4px;
          padding: 1px 5px; font-weight: 500;
        }

        /* ── Footer Credit ───────────────────────────────────── */
        .is-footer-credit {
          position: relative; display: inline-flex; align-items: center; gap: 7px;
          padding: 6px 16px; border-radius: 999px;
          font-size: 11.5px; font-weight: 600; letter-spacing: 0.3px;
          color: rgba(180,176,220,0.70);
          background: rgba(18,19,28,0.80);
          cursor: default; white-space: nowrap;
        }
        .is-footer-credit::before {
          content: "";
          position: absolute; inset: -1px; border-radius: 999px;
          background: linear-gradient(100deg, #8B7CF6 0%, #4C3BCB 40%, rgba(139,124,246,0.25) 70%, #4C3BCB 100%);
          z-index: -1;
          background-size: 200% 200%;
          animation: is-credit-shimmer 5s linear infinite;
        }
        @keyframes is-credit-shimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .is-footer-credit .credit-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: rgba(139,124,246,0.60);
        }
        .is-canvas-footer {
          display: flex; align-items: center; justify-content: center;
          position: absolute; left: 50%; bottom: calc(10px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%);
          z-index: 6; pointer-events: none;
        }
      `}</style>

      <div className="is-app-root" style={{ width: "100%", height: "100%" }}>
        <div aria-live="polite" style={visuallyHidden}>{announce}</div>

        {/* TOP BAR */}
        <header style={styles.topBar}>
          <div style={styles.brand}>
            <span className="is-logo-glass" aria-hidden="true">
              <Icon3D icon={ICONS[0]} gradId="brand-mark" fillMode="gradient" gradFrom="#A594FF" gradTo="#4C3BCB" gradAngle={135} size={20} glossy />
            </span>
            <span style={styles.brandText}>Iconly</span>
          </div>

          <div style={styles.topBarRight}>
            {/* Ask AI Button */}
            <button
              className="is-ask-ai-btn is-btn-press"
              onClick={() => setAiOpen((v) => !v)}
              aria-haspopup="dialog"
              aria-expanded={aiOpen}
              title="Ask AI for style suggestions (Ctrl+K)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M12 2a10 10 0 1 0 10 10"/>
                <path d="M12 8v4l2 2"/>
                <circle cx="19" cy="5" r="3" fill="currentColor" stroke="none" opacity="0.8"/>
              </svg>
              Ask AI
              <span className="ai-kbd">⌘K</span>
            </button>

            <div style={{ position: "relative" }}>
              <button
                className="is-btn-press"
                style={styles.exportBtn}
                onClick={() => setExportOpen((v) => !v)}
                aria-haspopup="dialog"
                aria-expanded={exportOpen}
                aria-controls="export-panel"
              >
                Export
              </button>
              {exportOpen && (
                <div id="export-panel" role="dialog" aria-label="Export settings" className="is-fade-in" style={styles.exportPanel}>
                  <label style={styles.fieldLabel} htmlFor="fmt-select">Format</label>
                  <select id="fmt-select" value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} style={styles.select}>
                    <option>PNG</option><option>SVG</option><option>JPG</option>
                  </select>
                  <label style={styles.fieldLabel} htmlFor="size-select">Size</label>
                  <select id="size-select" value={exportSize} onChange={(e) => setExportSize(Number(e.target.value))} style={styles.select}>
                    {[16, 32, 64, 128, 256, 512, 1024].map((s) => <option key={s} value={s}>{`${s} x ${s}`}</option>)}
                  </select>
                  <button className="is-btn-press" style={styles.primaryBtn} onClick={handleExport}>Download {exportFormat}</button>
                  <button className="is-btn-press" style={styles.ghostBtnWide} onClick={handleCopySvg} title="Copy raw SVG markup to clipboard">
                    Copy SVG Code
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div style={styles.workArea}>
          {/* SIDEBAR (desktop) — new icon rail + panel */}
          {!isMobile && (
            <div className="is-sidebar-shell">
              {/* Icon Nav Rail */}
              <nav className="is-nav-rail" aria-label="Editor sections" style={{ height: "calc(100vh - 53px)", position: "sticky", top: 53 }}>
                {[
                  { key: "presets", icon: "⬡", label: "Presets" },
                  { key: "icons", icon: "◈", label: "Icons" },
                  { key: "customize", icon: "⊙", label: "Customize" },
                ].map(({ key, icon, label }) => (
                  <button
                    key={key}
                    className={`is-nav-btn${tab === key ? " active" : ""}`}
                    onClick={() => setTab(key)}
                    aria-pressed={tab === key}
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      {key === "presets" && <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>}
                      {key === "icons" && <><circle cx="5" cy="5" r="3"/><circle cx="19" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/></>}
                      {key === "customize" && <><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></>}
                    </svg>
                    <span className="is-nav-tooltip">{label}</span>
                  </button>
                ))}
                <div className="is-nav-divider" />
                {/* Undo/Redo in rail */}
                <button className="is-nav-btn" onClick={undo} disabled={histIndex === 0} aria-label="Undo" title="Undo">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>
                  <span className="is-nav-tooltip">Undo</span>
                </button>
                <button className="is-nav-btn" onClick={redo} disabled={histIndex === history.length - 1} aria-label="Redo" title="Redo">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/></svg>
                  <span className="is-nav-tooltip">Redo</span>
                </button>
              </nav>

              {/* Sidebar Panel */}
              <aside
                className={`is-sidebar-panel${sidebarOpen ? "" : " is-collapsed"}${sidebarDragging ? " is-dragging" : ""}`}
                style={{ width: sidebarWidth, height: "calc(100vh - 53px)", position: "sticky", top: 53 }}
                aria-label="Icon editor tools"
                aria-hidden={!sidebarOpen}
              >
                <div className="is-panel-header">
                  <span className="is-panel-title">
                    {tab === "presets" ? "Style Presets" : tab === "icons" ? "Icon Library" : "Customize"}
                  </span>
                </div>
                <div className="is-panel-body">
                  <SidebarContent
                    tab={tab} setTab={setTab}
                    search={search} setSearch={setSearch}
                    activeCat={activeCat} setActiveCat={setActiveCat}
                    filteredIcons={filteredIcons}
                    visibleCount={visibleCount} setVisibleCount={setVisibleCount}
                    style={style} updateStyle={updateStyle}
                    currentIcon={currentIcon}
                    applyPreset={applyPreset}
                    selectIcon={selectIcon}
                    customLogo={customLogo} logoProcessing={logoProcessing}
                    onLogoUpload={handleLogoUpload} onRemoveLogo={removeCustomLogo}
                    onUseLogo={() => updateStyle({ icon: "custom-logo" })}
                    showFavorites={showFavorites} setShowFavorites={setShowFavorites}
                    favorites={favorites} toggleFavorite={toggleFavorite} isFavorited={isFavorited}
                    recentColors={recentColors} setAnnounce={setAnnounce}
                    handleCopySvg={handleCopySvg}
                    onResetStyle={() => { pushHistory(defaultStyle); setAnnounce("Style reset to defaults"); }}
                  />
                </div>
              </aside>
              <button
                type="button"
                className={`is-sidebar-resizer${sidebarDragging ? " is-dragging" : ""}`}
                aria-label={sidebarOpen ? "Drag or click to close sidebar" : "Drag or click to open sidebar"}
                aria-expanded={sidebarOpen}
                title={sidebarOpen ? "Drag left or click to close sidebar" : "Drag right or click to open sidebar"}
                onPointerDown={beginSidebarDrag}
                onPointerMove={moveSidebarDrag}
                onPointerUp={endSidebarDrag}
                onPointerCancel={endSidebarDrag}
                onClick={handleSidebarToggleClick}
                onKeyDown={handleSidebarKeyDown}
              />
            </div>
          )}

          {/* CANVAS */}
          <main style={styles.canvasArea} aria-label="Icon canvas">
            <div
              className="is-canvas-wrap is-checker"
              style={{
                ...styles.canvas,
                transform: `scale(${zoom})`,
                background: style.bgType === "transparent" ? undefined : (isPatternBg ? undefined : canvasBg),
                ...(isPatternBg ? canvasPatternStyle : {}),
                border: style.borderWidth ? `${style.borderWidth}px solid ${style.borderColor}` : "1px solid #2b2c34",
                borderRadius: canvasRadius,
              }}
              role="img"
              aria-label={`Preview of ${currentIcon.name} icon, 512 by 512 canvas`}
            >
              {canvasBgEffectsStyle && <span style={{ ...styles.canvasBgFx, ...canvasBgEffectsStyle }} aria-hidden="true" />}
              {aiMagicPulse > 0 && <span key={aiMagicPulse} className="is-ai-canvas-sparkle" aria-hidden="true" />}
              {style.showGrid && <GridOverlay />}
              <div style={{ ...styles.canvasIconWrap, filter: canvasFilterCss }}>
                <Icon3D
                  icon={currentIcon}
                  gradId="canvas-grad"
                  fillMode={style.fillMode}
                  solid={style.solid}
                  gradFrom={style.gradFrom}
                  gradTo={style.gradTo}
                  gradAngle={style.gradAngle}
                  glassTint={style.glassTint}
                  glassFrost={style.glassFrost}
                  glassHighlight={style.glassHighlight}
                  opacity={style.opacity}
                  size={280}
                  imgScale={style.logoScale}
                  imgFit={style.logoFit}
                  letterScale={style.letterScale}
                />
                {style.typographyText && (
                  <div style={{ ...styles.canvasType, fontFamily: style.typographyFont, fontSize: style.typographySize, color: style.typographyColor }}>
                    {style.typographyText}
                  </div>
                )}
              </div>
            </div>

            {/* Rounded zoom/pan control — anchored to the canvas itself (via canvasArea),
                pinned to top-center so it stays clear of content and the mobile
                bottom sheet, on every device screen. */}
            <div className="is-glass-pill" style={styles.toolStrip} role="toolbar" aria-label="Canvas zoom and pan controls">
              <button className="is-btn-press" style={styles.iconBtn} onClick={undo} disabled={histIndex === 0} aria-label="Undo">{"\u21BA"}</button>
              <button className="is-btn-press" style={styles.iconBtn} onClick={redo} disabled={histIndex === history.length - 1} aria-label="Redo">{"\u21BB"}</button>
              <span style={styles.divider} aria-hidden="true" />
              <button className="is-btn-press" style={styles.iconBtn} onClick={() => setZoom((z) => Math.max(0.1, +(z - 0.05).toFixed(2)))} aria-label="Zoom out">{"\u2212"}</button>
              <span style={styles.zoomLabel} aria-live="polite">{Math.round(zoom * 100)}%</span>
              <button className="is-btn-press" style={styles.iconBtn} onClick={() => setZoom((z) => Math.min(2, +(z + 0.05).toFixed(2)))} aria-label="Zoom in">+</button>
              <span style={styles.divider} aria-hidden="true" />
              <button className="is-btn-press" style={styles.iconBtn} onClick={resetZoomPan} aria-label="Recenter canvas">{"\u2316"}</button>
            </div>

            {/* Footer credit — pinned to the center-bottom of the icon
                canvas itself. Positioned absolutely relative to
                canvasArea (not the zoomed/scrollable canvas surface),
                so it never scrolls or moves with pan/zoom. */}
            <div className="is-canvas-footer" aria-hidden="true">
              <div className="is-footer-credit" style={{ pointerEvents: "auto" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ opacity: 0.6 }} aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                Crafted by RajPolu
                <span className="credit-dot" />
                FluiderUI v4.0
              </div>
            </div>
          </main>
        </div>

        {/* MOBILE BOTTOM-CENTER CUSTOMIZE TRIGGER + SHEET */}
        {isMobile && (
          <>
            <button
              className="is-btn-press"
              style={styles.mobileCenterBtn}
              onClick={() => setMobilePanelOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={mobilePanelOpen}
            >
              Customize
            </button>
            {mobilePanelOpen && (
              <div style={styles.sheetBackdrop} onClick={() => setMobilePanelOpen(false)}>
                <div
                  className="is-sheet-enter"
                  style={styles.sheet}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Icon editor tools"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={styles.sheetHandle} aria-hidden="true" />
                  <button style={styles.sheetClose} onClick={() => setMobilePanelOpen(false)} aria-label="Close panel">{"\u00d7"}</button>
                  <div className="is-tab-row" role="tablist" aria-label="Editor sections" style={styles.sheetTabRow}>
                    {[
                      { key: "presets", label: "Presets" },
                      { key: "icons", label: "Icons" },
                      { key: "customize", label: "Customize" },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        role="tab"
                        aria-selected={tab === key}
                        className="is-tab-btn"
                        style={{ ...styles.sheetTabBtn, ...(tab === key ? styles.sheetTabBtnActive : {}) }}
                        onClick={() => setTab(key)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <SidebarContent
                    tab={tab} setTab={setTab}
                    search={search} setSearch={setSearch}
                    activeCat={activeCat} setActiveCat={setActiveCat}
                    filteredIcons={filteredIcons}
                    visibleCount={visibleCount} setVisibleCount={setVisibleCount}
                    style={style} updateStyle={updateStyle}
                    currentIcon={currentIcon}
                    applyPreset={applyPreset}
                    selectIcon={selectIcon}
                    customLogo={customLogo} logoProcessing={logoProcessing}
                    onLogoUpload={handleLogoUpload} onRemoveLogo={removeCustomLogo}
                    onUseLogo={() => updateStyle({ icon: "custom-logo" })}
                    showFavorites={showFavorites} setShowFavorites={setShowFavorites}
                    favorites={favorites} toggleFavorite={toggleFavorite} isFavorited={isFavorited}
                    recentColors={recentColors} setAnnounce={setAnnounce}
                    handleCopySvg={handleCopySvg}
                    onResetStyle={() => { pushHistory(defaultStyle); setAnnounce("Style reset to defaults"); }}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* ASK AI SPOTLIGHT */}
        {aiOpen && (
          <div className="is-ai-backdrop" onClick={() => setAiOpen(false)} role="presentation">
            <div
              className="is-ai-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Ask AI for icon style suggestions"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="is-ai-header">
                <div className="is-ai-icon-badge" aria-hidden="true">✦</div>
                <span className="is-ai-title">Ask AI</span>
                <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.4px", textTransform: "uppercase" }}>Style Assistant</span>
                <button className="is-ai-close" onClick={() => setAiOpen(false)} aria-label="Close AI panel">×</button>
              </div>

              {/* Input row */}
              <div className="is-ai-spotlight-row">
                <input
                  ref={aiInputRef}
                  className="is-ai-input"
                  type="text"
                  placeholder="Describe the icon style you want…"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendAiMessage(); }}
                  aria-label="Describe the icon style"
                />
                <button
                  className="is-ai-send"
                  onClick={() => sendAiMessage()}
                  disabled={!aiInput.trim() || aiLoading}
                  aria-label="Send"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>

              {/* Spotlight index chips */}
              <div className="is-ai-idx-row" style={{ flexWrap: "wrap", gap: 5, padding: "8px 14px" }}>
                {AI_SPOTLIGHT_HINTS.map((h, i) => (
                  <button
                    key={i}
                    className={`is-ai-idx-chip${aiSpotlightIdx === i ? " active" : ""}`}
                    onClick={() => { setAiSpotlightIdx(i); sendAiMessage(h.prompt); }}
                    aria-pressed={aiSpotlightIdx === i}
                  >
                    {h.label}
                  </button>
                ))}
                <button
                  className="is-ai-idx-chip is-ai-surprise-chip"
                  onClick={surpriseMe}
                  title="Get a random style suggestion"
                >
                  Surprise me
                </button>
              </div>

              <div className="is-ai-magic-row" aria-label="AI magic actions">
                {AI_MAGIC_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    className="is-ai-magic-btn"
                    onClick={() => applyAiMagic(preset)}
                    disabled={aiLoading}
                  >
                    <span aria-hidden="true">✦</span>
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Messages */}
              <div className="is-ai-messages" ref={aiMessagesRef}>
                {aiMessages.map((m, i) => (
                  <div key={i}>
                    <div className={m.role === "user" ? "is-ai-msg-user" : "is-ai-msg-ai"}>
                      {m.text.split(/(\*[^*]+\*)/).map((part, j) =>
                        part.startsWith("*") && part.endsWith("*")
                          ? <em key={j} style={{ fontStyle: "normal", color: "var(--accent)" }}>{part.slice(1, -1)}</em>
                          : <span key={j}>{part}</span>
                      )}
                    </div>
                    {m.suggestion && (
                      <button
                        className="is-ai-apply-btn"
                        onClick={() => applyAiSuggestion(m.suggestion)}
                        style={{ marginLeft: 2 }}
                      >
                        ✦ Apply suggestion
                      </button>
                    )} 
                    {m.alternates && m.alternates.length > 0 && (
                      <div className="is-ai-route-row" aria-label="Alternate AI directions">
                        {m.alternates.map((alt, altIdx) => (
                          <button
                            key={`${i}-${altIdx}`}
                            type="button"
                            className="is-ai-route-btn"
                            onClick={() => applyAiSuggestion(alt.patch)}
                          >
                            {alt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {aiLoading && (
                  <div className="is-ai-msg-ai">
                    <div className="is-ai-typing">
                      <div className="is-ai-dot" />
                      <div className="is-ai-dot" />
                      <div className="is-ai-dot" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ONBOARDING */}
        {showOnboarding && (
          <div style={styles.obBackdrop} role="presentation">
            <div className="is-fade-in" style={styles.obModal} role="dialog" aria-modal="true" aria-labelledby="ob-title">
              <p style={styles.obStepLabel}>Step {obStep + 1} of {OB_STEPS.length}</p>
              <h2 id="ob-title" style={styles.obTitle}>{OB_STEPS[obStep].title}</h2>
              <div style={styles.obOptions}>
                {OB_STEPS[obStep].options.map((opt, idx) => {
                  const key = OB_STEPS[obStep].key;
                  const selected = answers[key] === opt.v;
                  return (
                    <button
                      key={opt.v}
                      ref={idx === 0 ? firstFieldRef : null}
                      className="is-swatch"
                      aria-pressed={selected}
                      style={{ ...styles.obOption, ...(selected ? styles.obOptionSelected : {}) }}
                      onClick={() => setAnswers((a) => ({ ...a, [key]: opt.v }))}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <div style={styles.obFooter}>
                <button className="is-btn-press" style={styles.ghostBtn} onClick={() => finishOnboarding(true)}>Skip</button>
                <div style={{ display: "flex", gap: 8 }}>
                  {obStep > 0 && <button className="is-btn-press" style={styles.ghostBtn} onClick={() => setObStep((s) => s - 1)}>Back</button>}
                  {obStep < OB_STEPS.length - 1 ? (
                    <button className="is-btn-press" style={styles.primaryBtn} disabled={!answers[OB_STEPS[obStep].key]} onClick={() => setObStep((s) => s + 1)}>Next</button>
                  ) : (
                    <button className="is-btn-press" style={styles.primaryBtn} disabled={!answers[OB_STEPS[obStep].key]} onClick={() => finishOnboarding(false)}>Create my style</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   SIDEBAR CONTENT (shared between desktop rail and mobile sheet)
------------------------------------------------------------------*/
function SidebarContent({
  tab, setTab, search, setSearch, activeCat, setActiveCat, filteredIcons, visibleCount, setVisibleCount,
  style, updateStyle, currentIcon, applyPreset, selectIcon,
  customLogo, logoProcessing, onLogoUpload, onRemoveLogo, onUseLogo,
  showFavorites, setShowFavorites, favorites, toggleFavorite, isFavorited,
  recentColors, setAnnounce, handleCopySvg, onResetStyle,
}) {
  const shown = filteredIcons.slice(0, visibleCount);
  const logoInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [showTextIcon, setShowTextIcon] = useState(false);
  function randomizeIcon() {
    const pool = filteredIcons.length ? filteredIcons : ICONS;
    selectIcon(pool[Math.floor(Math.random() * pool.length)]);
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={styles.tabPanel} className="is-fade-in">
        {tab === "presets" && (
          <div style={styles.presetGrid}>
            {PRESETS.map((p) => (
              <button key={p.id} className="is-swatch" style={styles.presetCard} onClick={() => applyPreset(p)} aria-label={`Apply ${p.label} preset`}>
                <Icon3D
                  icon={iconById(p.icon)}
                  gradId={`preset-${p.id}`}
                  fillMode={p.fillMode}
                  solid={p.solid}
                  gradFrom={p.gradFrom}
                  gradTo={p.gradTo}
                  gradAngle={p.gradAngle}
                  size={40}
                />
                <span style={styles.presetLabel}>{p.label}</span>
              </button>
            ))}
          </div>
        )}

        {tab === "icons" && (
          <div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,.svg"
              style={visuallyHidden}
              onChange={(e) => { const f = e.target.files && e.target.files[0]; onLogoUpload(f); e.target.value = ""; }}
            />
            <div className="is-icon-action-row">
              <label htmlFor="icon-search" style={visuallyHidden}>Search icons</label>
              <div className="is-icon-search-wrap">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="is-icon-search-glass" aria-hidden="true">
                  <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
                </svg>
                <input
                  id="icon-search"
                  type="search"
                  placeholder={`Search ${ICONS.length} unique icons...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="is-icon-search-input"
                />
                {search && (
                  <button
                    type="button"
                    className="is-icon-search-clear"
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                  >
                    {"\u00d7"}
                  </button>
                )}
              </div>
              <button type="button" className="is-icon-tool-btn" onClick={randomizeIcon} aria-label="Randomize icon" title="Randomize icon">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/>
                </svg>
              </button>
              <button type="button" className={`is-icon-tool-btn${showTextIcon ? " active" : ""}`} onClick={() => setShowTextIcon((v) => !v)} aria-label="Create text icon" title="Text icon">
                <span style={{ fontSize: 18, fontWeight: 700 }}>Aa</span>
              </button>
              <button type="button" className="is-icon-tool-btn" onClick={() => logoInputRef.current && logoInputRef.current.click()} aria-label="Upload icon" title="Upload icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 7h5l2 2h9v10a2 2 0 0 1-2 2H4z"/><path d="M4 7v12a2 2 0 0 0 2 2"/>
                </svg>
              </button>
            </div>
            {showTextIcon && (
              <div className="is-icon-text-panel">
                <span className="is-icon-text-label">Text</span>
                <input
                  type="text"
                  placeholder="Ad"
                  maxLength={2}
                  value={style.letterText}
                  onChange={(e) => updateStyle(e.target.value ? { letterText: e.target.value, icon: "letter-mark" } : { letterText: e.target.value })}
                  style={{ ...styles.searchInput, marginBottom: 0 }}
                  aria-label="Text icon letters"
                />
              </div>
            )}
            {customLogo && (
              <div className="is-logo-preview-row" style={{ marginBottom: 10 }}>
                <div className="is-logo-thumb"><img src={customLogo.dataUrl} alt="" /></div>
                <div className="is-logo-meta">
                  <span className="is-logo-name">{customLogo.name}</span>
                  <span className="is-logo-sub">{style.icon === "custom-logo" ? "Active on canvas" : "Uploaded"}</span>
                </div>
                {style.icon !== "custom-logo" && <button type="button" className="is-btn-press" style={{ ...styles.ghostBtn, padding: "6px 9px", fontSize: 11 }} onClick={onUseLogo}>Use</button>}
                <button type="button" className="is-logo-remove" onClick={onRemoveLogo} aria-label="Remove custom logo">{"\u00d7"}</button>
              </div>
            )}
            {customLogo && style.icon === "custom-logo" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                <SegButtons options={[["contain", "Fit"], ["cover", "Fill"]]} value={style.logoFit} onChange={(v) => updateStyle({ logoFit: v })} />
                <RangeField label="Logo size" min={0.4} max={1} step={0.02} value={style.logoScale} format={(v) => `${Math.round(v * 100)}%`} onChange={(v) => updateStyle({ logoScale: v })} />
              </div>
            )}
            <div
              className={`is-logo-drop${dragOver ? " is-drag-over" : ""}`}
              style={{ display: "none" }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files && e.dataTransfer.files[0];
                if (f) onLogoUpload(f);
              }}
            />

            <div className="is-cat-scroll" role="tablist" aria-label="Icon categories">
              <button
                className={`is-cat-pill${showFavorites ? " active" : ""}`}
                aria-pressed={showFavorites}
                onClick={() => setShowFavorites((v) => !v)}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill={showFavorites ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                Favorites{favorites.length ? ` · ${favorites.length}` : ""}
              </button>
              {CATS.map((c) => (
                <button
                  key={c}
                  className={`is-cat-pill${!showFavorites && activeCat === c ? " active" : ""}`}
                  role="tab"
                  aria-selected={activeCat === c}
                  onClick={() => { setActiveCat(c); setShowFavorites(false); }}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="is-icon-grid-header">
              <span>{shown.length} of {filteredIcons.length} icons</span>
              {currentIcon && (
                <span className="is-icon-grid-current">
                  Selected: <strong>{currentIcon.name}</strong>
                </span>
              )}
            </div>

            <div style={styles.iconGrid}>
              {shown.map((icon) => {
                const [f, t] = seededGradient(icon.id);
                const active = currentIcon.id === icon.id;
                return (
                  <div key={icon.id} className="is-icon-tile" title={icon.name}>
                    <button
                      className={`is-swatch is-icon-tile-btn${active ? " active" : ""}`}
                      aria-pressed={active}
                      aria-label={icon.name}
                      onClick={() => selectIcon(icon)}
                    >
                      <Icon3D icon={icon} gradId={`list-${icon.id}`} fillMode="gradient" gradFrom={f} gradTo={t} gradAngle={135} size={30} />
                    </button>
                    <button
                      className={`is-icon-fav-btn${isFavorited(icon.id) ? " active" : ""}`}
                      aria-label={isFavorited(icon.id) ? `Remove ${icon.name} from favorites` : `Add ${icon.name} to favorites`}
                      aria-pressed={isFavorited(icon.id)}
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(icon); }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill={isFavorited(icon.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    </button>
                  </div>
                );
              })}
              {filteredIcons.length === 0 && (
                <div className="is-icon-empty">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
                  </svg>
                  <p style={styles.emptyState}>
                    {showFavorites ? "No favorites yet — tap the star on an icon to save it." : `No icons match "${search}".`}
                  </p>
                </div>
              )}
            </div>
            {visibleCount < filteredIcons.length && (
              <button className="is-btn-press" style={styles.ghostBtnWide} onClick={() => setVisibleCount((v) => v + 60)}>
                Show {Math.min(60, filteredIcons.length - visibleCount)} more icons
              </button>
            )}
          </div>
        )}

        {tab === "customize" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="is-cz-header">
              <span className="is-cz-header-title">Style controls</span>
              <button type="button" className="is-cz-reset-btn" onClick={onResetStyle}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" />
                </svg>
                Reset
              </button>
            </div>

            {recentColors.length > 0 && (
              <FieldGroup label="Recent colors" icon="●" defaultOpen={false}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {recentColors.map((c) => (
                    <button
                      key={c}
                      title={`Copy ${c}`}
                      aria-label={`Copy color ${c} to clipboard`}
                      onClick={() => { navigator.clipboard.writeText(c).then(() => setAnnounce(`Copied ${c}`)).catch(() => {}); }}
                      style={{
                        width: 24, height: 24, borderRadius: 6, background: c,
                        border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer", padding: 0,
                      }}
                    />
                  ))}
                </div>
              </FieldGroup>
            )}
            <FieldGroup label="Fill" icon="◐">
              <div className="is-cz-swatch-row">
                {MOOD_SWATCHES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="is-cz-mood-swatch"
                    title={m.label}
                    aria-label={`Apply ${m.label} gradient`}
                    style={{ background: `linear-gradient(135deg, ${m.from}, ${m.to})` }}
                    onClick={() => updateStyle({ fillMode: "gradient", gradFrom: m.from, gradTo: m.to })}
                  />
                ))}
              </div>
              <SegButtons
                options={[["solid", "Solid"], ["gradient", "Gradient"], ["glass", "Liquid Glass"]]}
                value={style.fillMode}
                onChange={(v) => updateStyle({ fillMode: v })}
              />
              {style.fillMode === "solid" && (
                <ColorField label="Color" value={style.solid} onChange={(v) => updateStyle({ solid: v })} />
              )}
              {style.fillMode === "gradient" && (
                <>
                  <ColorField label="From" value={style.gradFrom} onChange={(v) => updateStyle({ gradFrom: v })} />
                  <ColorField label="To" value={style.gradTo} onChange={(v) => updateStyle({ gradTo: v })} />
                  <RangeField label="Angle" min={0} max={360} value={style.gradAngle} suffix=" degrees" onChange={(v) => updateStyle({ gradAngle: v })} />
                </>
              )}
              {style.fillMode === "glass" && (
                <>
                  <ColorField label="Tint" value={style.glassTint} onChange={(v) => updateStyle({ glassTint: v })} />
                  <RangeField label="Frost" min={0} max={1} step={0.01} value={style.glassFrost} format={(v) => `${Math.round(v * 100)}%`} onChange={(v) => updateStyle({ glassFrost: v })} />
                  <RangeField label="Highlight" min={0} max={1} step={0.01} value={style.glassHighlight} format={(v) => `${Math.round(v * 100)}%`} onChange={(v) => updateStyle({ glassHighlight: v })} />
                </>
              )}
            </FieldGroup>

            <FieldGroup label="Background shape" icon="▢" defaultOpen={false}>
              <SegButtons options={BG_SHAPES.map((s) => [s.id, s.label])} value={style.bgShape} onChange={(v) => updateStyle({ bgShape: v })} />
              {(style.bgShape === "square" || style.bgShape === "rounded") && (
                <RangeField label="Corner radius" min={0} max={256} value={style.borderRadius} suffix="px" onChange={(v) => updateStyle({ borderRadius: v })} />
              )}
            </FieldGroup>

            <FieldGroup label="Background fill" icon="▦" defaultOpen={true}>
              <div className="is-bg-preset-grid" aria-label="Background gradient presets">
                {BG_PRESETS.map((preset) => {
                  const active = style.bgType === "gradient" && style.bgFrom === preset.patch.bgFrom && style.bgTo === preset.patch.bgTo;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      className={`is-bg-preset-btn${active ? " active" : ""}`}
                      aria-label={`Apply ${preset.id} background`}
                      title={preset.id.replace(/-/g, " ")}
                      style={{ background: `radial-gradient(circle at 28% 22%, rgba(255,255,255,0.58), transparent 34%), linear-gradient(135deg, ${preset.from}, ${preset.to})` }}
                      onClick={() => updateStyle(preset.patch)}
                    />
                  );
                })}
              </div>
              <SegButtons
                options={[["transparent", "None"], ["solid", "Solid"], ["gradient", "Gradient"]]}
                value={style.bgType}
                onChange={(v) => updateStyle({ bgType: v })}
              />
              <SegButtons
                options={PATTERN_TYPES.map((p) => [p.id, p.label])}
                value={PATTERN_TYPES.some((p) => p.id === style.bgType) ? style.bgType : ""}
                onChange={(v) => updateStyle({ bgType: v })}
              />
              {style.bgType === "solid" && <ColorField label="Color" value={style.bgSolid} onChange={(v) => updateStyle({ bgSolid: v })} />}
              {style.bgType === "gradient" && (
                <>
                  <ColorField label="From" value={style.bgFrom} onChange={(v) => updateStyle({ bgFrom: v })} />
                  <ColorField label="To" value={style.bgTo} onChange={(v) => updateStyle({ bgTo: v })} />
                </>
              )}
              {(style.bgType === "dots" || style.bgType === "grid" || style.bgType === "noise") && (
                <>
                  <ColorField label="Pattern color" value={style.bgPatternFg} onChange={(v) => updateStyle({ bgPatternFg: v })} />
                  <ColorField label="Background" value={style.bgPatternBg} onChange={(v) => updateStyle({ bgPatternBg: v })} />
                  <RangeField label="Scale" min={0.4} max={2.5} step={0.05} value={style.bgPatternScale} format={(v) => `${Math.round(v * 100)}%`} onChange={(v) => updateStyle({ bgPatternScale: v })} />
                </>
              )}
              <label style={styles.checkboxRow}>
                <input type="checkbox" checked={!!style.bgRadialGlare} onChange={(e) => updateStyle({ bgRadialGlare: e.target.checked })} />
                Radial glare
              </label>
              <label style={styles.checkboxRow}>
                <input type="checkbox" checked={!!style.bgNoiseTexture} onChange={(e) => updateStyle({ bgNoiseTexture: e.target.checked })} />
                Noise texture
              </label>
              {style.bgNoiseTexture && (
                <RangeField label="Noise opacity" min={0.02} max={0.45} step={0.01} value={style.bgNoiseOpacity} format={(v) => `${Math.round(v * 100)}%`} onChange={(v) => updateStyle({ bgNoiseOpacity: v })} />
              )}
              {style.bgType === "mesh" && (
                <>
                  <ColorField label="Base" value={style.bgMeshBase} onChange={(v) => updateStyle({ bgMeshBase: v })} />
                  <ColorField label="Blob 1" value={style.bgMeshC1} onChange={(v) => updateStyle({ bgMeshC1: v })} />
                  <ColorField label="Blob 2" value={style.bgMeshC2} onChange={(v) => updateStyle({ bgMeshC2: v })} />
                  <ColorField label="Blob 3" value={style.bgMeshC3} onChange={(v) => updateStyle({ bgMeshC3: v })} />
                </>
              )}
            </FieldGroup>

            <FieldGroup label="Opacity" icon="◑" defaultOpen={false}>
              <RangeField label="Icon opacity" min={0.1} max={1} step={0.05} value={style.opacity} format={(v) => `${Math.round(v * 100)}%`} onChange={(v) => updateStyle({ opacity: v })} />
            </FieldGroup>

            <FieldGroup label="Border" icon="◻" defaultOpen={false}>
              <RangeField label="Width" min={0} max={12} value={style.borderWidth} suffix="px" onChange={(v) => updateStyle({ borderWidth: v })} />
              {style.borderWidth > 0 && <ColorField label="Color" value={style.borderColor} onChange={(v) => updateStyle({ borderColor: v })} />}
            </FieldGroup>

            <FieldGroup label="Drop shadow" icon="◼" defaultOpen={false}>
              <label style={styles.checkboxRow}>
                <input type="checkbox" checked={style.shadowEnabled} onChange={(e) => updateStyle({ shadowEnabled: e.target.checked })} />
                Enable drop shadow
              </label>
              {style.shadowEnabled && (
                <>
                  <ColorField label="Color" value={style.shadowColor} onChange={(v) => updateStyle({ shadowColor: v })} />
                  <RangeField label="Shadow opacity" min={0} max={1} step={0.05} value={style.shadowOpacity} format={(v) => `${Math.round(v * 100)}%`} onChange={(v) => updateStyle({ shadowOpacity: v })} />
                  <RangeField label="Blur" min={0} max={80} value={style.shadowBlur} suffix="px" onChange={(v) => updateStyle({ shadowBlur: v })} />
                  <RangeField label="Offset X" min={-60} max={60} value={style.shadowOffsetX} suffix="px" onChange={(v) => updateStyle({ shadowOffsetX: v })} />
                  <RangeField label="Offset Y" min={-60} max={60} value={style.shadowOffsetY} suffix="px" onChange={(v) => updateStyle({ shadowOffsetY: v })} />
                </>
              )}
            </FieldGroup>

            <FieldGroup label="Glow" icon="✦" defaultOpen={false}>
              <label style={styles.checkboxRow}>
                <input type="checkbox" checked={style.glowEnabled} onChange={(e) => updateStyle({ glowEnabled: e.target.checked })} />
                Enable glow
              </label>
              {style.glowEnabled && (
                <>
                  <ColorField label="Color" value={style.glowColor} onChange={(v) => updateStyle({ glowColor: v })} />
                  <RangeField label="Glow opacity" min={0} max={1} step={0.05} value={style.glowOpacity} format={(v) => `${Math.round(v * 100)}%`} onChange={(v) => updateStyle({ glowOpacity: v })} />
                  <RangeField label="Depth (blur)" min={2} max={80} value={style.glowBlur} suffix="px" onChange={(v) => updateStyle({ glowBlur: v })} />
                </>
              )}
            </FieldGroup>

            <FieldGroup label="Canvas" icon="⊞" defaultOpen={false}>
              <label style={styles.checkboxRow}>
                <input type="checkbox" checked={style.showGrid} onChange={(e) => updateStyle({ showGrid: e.target.checked })} />
                Show alignment grid
              </label>
            </FieldGroup>
          </div>
        )}
      </div>
    </div>
  );
}

function FieldGroup({ label, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <fieldset className="is-cz-section" style={styles.fieldGroup}>
      <legend style={{ width: "100%", padding: 0, margin: 0 }}>
        <button
          type="button"
          className="is-cz-section-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <span className="is-cz-section-title">
            {icon && <span className="is-cz-section-icon" aria-hidden="true">{icon}</span>}
            {label}
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
            className="is-cz-chevron" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }} aria-hidden="true">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </legend>
      {open && <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 10 }}>{children}</div>}
    </fieldset>
  );
}

function SegButtons({ options, value, onChange }) {
  return (
    <div style={styles.segRow} role="radiogroup">
      {options.map(([v, label]) => (
        <button
          key={v}
          className="is-tab-btn"
          role="radio"
          aria-checked={value === v}
          style={{ ...styles.segBtn, ...(value === v ? styles.segBtnActive : {}) }}
          onClick={() => onChange(v)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function ColorField({ label, value, onChange, onCommit }) {
  const idRef = useRef(`color-${label.replace(/\s+/g, "-").toLowerCase()}-${Math.random().toString(36).slice(2, 6)}`);
  return (
    <div style={styles.colorRow}>
      <label htmlFor={idRef.current} style={styles.fieldLabel}>{label}</label>
      <div style={styles.colorInputWrap}>
        <input
          id={idRef.current}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => { window.dispatchEvent(new CustomEvent("iconstudio:recentcolor", { detail: e.target.value })); onCommit && onCommit(e.target.value); }}
          style={styles.colorSwatch}
        />
        <span style={styles.colorHex}>{value}</span>
      </div>
    </div>
  );
}

function RangeField({ label, min, max, step = 1, value, onChange, suffix = "", format }) {
  const id = `range-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div>
      <div style={styles.rangeHeader}>
        <label htmlFor={id} style={styles.fieldLabel}>{label}</label>
        <span style={styles.rangeValue}>{format ? format(value) : `${value}${suffix}`}</span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function GridOverlay() {
  return (
    <svg viewBox="0 0 512 512" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} aria-hidden="true">
      {[128, 256, 384].map((v) => (
        <React.Fragment key={v}>
          <line x1={v} y1="0" x2={v} y2="512" stroke="rgba(255,255,255,0.14)" strokeWidth={v === 256 ? 1.4 : 0.8} />
          <line x1="0" y1={v} x2="512" y2={v} stroke="rgba(255,255,255,0.14)" strokeWidth={v === 256 ? 1.4 : 0.8} />
        </React.Fragment>
      ))}
    </svg>
  );
}

const visuallyHidden = { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 };

/* ----------------------------------------------------------------
   STYLES
------------------------------------------------------------------*/
const styles = {
  appShell: { width: "100%", minHeight: "100vh", background: "#0D0E18", color: "#F0EFF8" },
  topBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, background: "rgba(13,14,24,0.90)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", zIndex: 20 },
  brand: { display: "flex", alignItems: "center", gap: 9 },
  brandText: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15.5, letterSpacing: -0.4, color: "#F0EFF8" },
  topBarRight: { display: "flex", alignItems: "center", gap: 8 },
  exportBtn: { background: "linear-gradient(135deg,#8B7CF6,#4C3BCB)", color: "#fff", border: "1px solid rgba(139,124,246,0.40)", padding: "8px 16px", borderRadius: 10, fontWeight: 600, fontSize: 13, boxShadow: "0 4px 14px rgba(76,59,203,0.40)" },
  exportPanel: { position: "absolute", right: 0, top: "calc(100% + 8px)", background: "rgba(18,19,30,0.96)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 14, padding: 14, width: 220, display: "flex", flexDirection: "column", gap: 10, boxShadow: "0 16px 48px rgba(0,0,0,0.60)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", zIndex: 30 },
  select: { background: "rgba(255,255,255,0.04)", color: "#F0EFF8", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 8, padding: "7px 8px", fontSize: 12.5, width: "100%" },
  fieldLabel: { fontSize: 11.5, color: "#8A8B9A", display: "block", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 },
  primaryBtn: { background: "linear-gradient(135deg,#8B7CF6,#4C3BCB)", color: "#fff", border: "1px solid rgba(139,124,246,0.30)", padding: "9px 14px", borderRadius: 9, fontWeight: 600, fontSize: 13, marginTop: 4, boxShadow: "0 4px 14px rgba(76,59,203,0.35)" },
  ghostBtn: { background: "rgba(255,255,255,0.04)", color: "#B4B5C6", border: "1px solid rgba(255,255,255,0.08)", padding: "9px 14px", borderRadius: 9, fontWeight: 500, fontSize: 13 },
  ghostBtnWide: { background: "rgba(255,255,255,0.04)", color: "#B4B5C6", border: "1px solid rgba(255,255,255,0.08)", padding: "9px 14px", borderRadius: 9, fontWeight: 500, fontSize: 12.5, marginTop: 10, width: "100%" },

  toolStrip: { position: "absolute", left: "50%", top: 18, transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 999, zIndex: 15 },

  workArea: { display: "flex", minHeight: "calc(100vh - 53px)" },

  tabPanel: { flex: 1 },

  presetGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  presetCard: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 8px", transition: "background .16s ease, border-color .16s ease" },
  presetLabel: { fontSize: 11, color: "#9A9BAA", textAlign: "center", fontWeight: 500 },

  searchInput: { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9, padding: "9px 12px", color: "#F0EFF8", fontSize: 13, marginBottom: 10, outline: "none" },
  textarea: { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9, padding: "9px 12px", color: "#F0EFF8", fontSize: 13, resize: "vertical", outline: "none" },
  catRow: { display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 },
  catChip: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#7A7B8A", fontSize: 11, padding: "4px 10px", borderRadius: 999, fontWeight: 500 },
  catChipActive: { background: "rgba(139,124,246,0.18)", color: "#C4B8FF", borderColor: "rgba(139,124,246,0.35)" },
  countLabel: { fontSize: 11, color: "#5E5F72", margin: "0 0 8px" },
  iconGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7 },
  iconCell: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center" },
  iconCellActive: { borderColor: "rgba(139,124,246,0.55)", boxShadow: "0 0 0 2px rgba(139,124,246,0.25), 0 0 12px rgba(139,124,246,0.20)" },
  emptyState: { fontSize: 12.5, color: "#5E5F72", gridColumn: "1 / -1", textAlign: "center", padding: "28px 0" },

  fieldGroup: { background: "none", border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", borderRadius: 0, padding: "16px 2px 0", margin: 0 },
  fieldGroupLabel: { fontSize: 11, color: "#7A7B8A", fontWeight: 700, padding: "0 2px", textTransform: "uppercase", letterSpacing: 0.7 },
  segRow: { display: "flex", gap: 5, marginBottom: 4, flexWrap: "wrap" },
  segBtn: { flex: "1 1 auto", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#7A7B8A", fontSize: 12.5, padding: "8px 10px", borderRadius: 9, fontWeight: 500 },
  segBtnActive: { background: "linear-gradient(135deg, rgba(139,124,246,0.22), rgba(76,59,203,0.16))", color: "#C4B8FF", borderColor: "rgba(139,124,246,0.35)" },
  colorRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  colorInputWrap: { display: "flex", alignItems: "center", gap: 8 },
  colorSwatch: { width: 32, height: 32, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: 0, background: "none", cursor: "pointer" },
  colorHex: { fontSize: 11.5, color: "#7A7B8A", fontFamily: "monospace" },
  rangeHeader: { display: "flex", justifyContent: "space-between", marginBottom: 4 },
  rangeValue: { fontSize: 11.5, color: "#7A7B8A" },
  checkboxRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#B4B5C6" },

  canvasArea: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", padding: 24, overflow: "hidden", background: "radial-gradient(ellipse at 50% 40%, rgba(76,59,203,0.07) 0%, transparent 60%)" },
  canvas: { width: 512, height: 512, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" },
  canvasBgFx: { position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 },
  canvasIconWrap: { position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  canvasType: { fontWeight: 600, letterSpacing: -0.2 },

  iconBtn: { width: 30, height: 30, borderRadius: "50%", border: "none", background: "transparent", color: "#B4B5C6", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", transition: "background .14s ease, color .14s ease" },
  divider: { width: 1, height: 16, background: "rgba(255,255,255,0.08)", margin: "0 3px" },
  zoomLabel: { fontSize: 12, color: "#9A9BAA", minWidth: 38, textAlign: "center", fontVariantNumeric: "tabular-nums" },

  mobileCenterBtn: { position: "fixed", bottom: "calc(72px + env(safe-area-inset-bottom, 0px))", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#8B7CF6,#4C3BCB)", color: "#fff", border: "1px solid rgba(139,124,246,0.40)", padding: "12px 24px", borderRadius: 999, fontWeight: 600, fontSize: 14, boxShadow: "0 12px 28px rgba(76,59,203,0.50)", zIndex: 25 },
  sheetBackdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.60)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", zIndex: 40, display: "flex", alignItems: "flex-end" },
  sheet: { width: "100%", maxHeight: "84vh", background: "linear-gradient(180deg, rgba(18,19,28,0.98) 0%, rgba(12,13,20,0.99) 100%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px 20px 0 0", padding: "10px 14px 24px", overflowY: "auto", position: "relative" },
  sheetHandle: { width: 36, height: 3, borderRadius: 999, background: "rgba(255,255,255,0.14)", margin: "6px auto 14px" },
  sheetClose: { position: "absolute", top: 10, right: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "50%", color: "#9A9BAA", fontSize: 16, lineHeight: 1, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center" },
  sheetTabRow: { display: "flex", gap: 6, padding: "0 2px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: 12 },
  sheetTabBtn: { flex: "1 1 0", textAlign: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#9A9BAA", fontSize: 12.5, fontWeight: 600, padding: "8px 6px", borderRadius: 10 },
  sheetTabBtnActive: { background: "linear-gradient(135deg, rgba(139,124,246,0.24), rgba(76,59,203,0.18))", color: "#C4B8FF", borderColor: "rgba(139,124,246,0.40)" },

  obBackdrop: { position: "fixed", inset: 0, background: "rgba(6,7,14,0.80)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 },
  obModal: { width: "100%", maxWidth: 460, background: "linear-gradient(160deg, rgba(22,23,36,0.97) 0%, rgba(14,15,24,0.99) 100%)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 20, padding: "28px 24px", boxShadow: "0 32px 80px rgba(0,0,0,0.70), 0 0 0 1px rgba(139,124,246,0.14)" },
  obStepLabel: { fontSize: 11, color: "#8B7CF6", fontWeight: 700, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.7 },
  obTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, margin: "0 0 20px", lineHeight: 1.3 },
  obOptions: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 22 },
  obOption: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#E0DFF0", borderRadius: 12, padding: "15px 12px", fontSize: 13, fontWeight: 500, textAlign: "left", transition: "all .16s ease" },
  obOptionSelected: { borderColor: "rgba(139,124,246,0.55)", background: "rgba(139,124,246,0.15)", boxShadow: "0 0 0 2px rgba(139,124,246,0.20)" },
  obFooter: { display: "flex", alignItems: "center", justifyContent: "space-between" },
};

import React from 'react';

/**
 * Original vector artwork: a container port at dusk. It is an illustration, not a photograph.
 * Everything is generated from fixed numbers, so it renders the same every time.
 */

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
}

const PALETTE = ['#c2410c', '#ea580c', '#1d4ed8', '#1e3a8a', '#0f766e', '#475569', '#9a3412', '#6d28d9', '#b45309'];

function stackRow(
  random: () => number,
  startX: number,
  endX: number,
  step: number,
  baseY: number,
  width: number,
  height: number,
  minRows: number,
  maxRows: number,
): Box[] {
  const boxes: Box[] = [];
  for (let x = startX; x < endX; x += step) {
    const rows = minRows + Math.floor(random() * (maxRows - minRows + 1));
    const fill = PALETTE[Math.floor(random() * PALETTE.length)];
    for (let row = 0; row < rows; row += 1) {
      const tint = random() < 0.25 ? PALETTE[Math.floor(random() * PALETTE.length)] : fill;
      boxes.push({ x, y: baseY - (row + 1) * height, w: width, h: height - 1, fill: tint });
    }
  }
  return boxes;
}

function buildScene() {
  const random = seeded(20260311);

  const skyline: Box[] = [];
  for (let x = 640; x < 1600; ) {
    const w = 14 + Math.floor(random() * 22);
    const h = 10 + Math.floor(random() * 58);
    skyline.push({ x, y: 402 - h, w, h, fill: '#0b1024' });
    x += w + 2 + Math.floor(random() * 6);
  }
  const windows: Box[] = [];
  for (const building of skyline) {
    if (building.h < 30) continue;
    for (let wy = building.y + 6; wy < 398; wy += 9) {
      for (let wx = building.x + 3; wx < building.x + building.w - 3; wx += 6) {
        if (random() < 0.22) windows.push({ x: wx, y: wy, w: 2, h: 3, fill: '#ffb14a' });
      }
    }
  }

  const shipStacks = stackRow(random, 806, 1322, 34, 430, 33, 16, 2, 6);
  const quayStacks = stackRow(random, 30, 770, 40, 438, 38, 17, 1, 4);
  const foreground = stackRow(random, 1352, 1620, 47, 612, 46, 24, 3, 8);

  const streaks: Box[] = [];
  for (let i = 0; i < 46; i += 1) {
    const y = 476 + i * 2.7;
    const w = 24 + random() * 150 * (1 - i / 60);
    const x = 1030 + (random() - 0.5) * 300;
    const alpha = 0.34 - i * 0.006;
    streaks.push({ x: x - w / 2, y, w, h: 1.6 + random() * 1.4, fill: `rgba(255,150,70,${Math.max(alpha, 0.05).toFixed(2)})` });
  }

  const shipWindows: Box[] = [];
  for (let wy = 358; wy < 424; wy += 11) {
    for (let wx = 1346; wx < 1388; wx += 8) shipWindows.push({ x: wx, y: wy, w: 4, h: 4, fill: '#ffd9a0' });
  }

  return { skyline, windows, shipStacks, quayStacks, foreground, streaks, shipWindows };
}

const SCENE = buildScene();
const CRANES = [150, 360, 570];

function Crane({ x, scale }: { x: number; scale: number }) {
  return (
    <g transform={`translate(${x} 438) scale(${scale})`} fill="#0a0f20">
      <rect x="-34" y="-170" width="5" height="170" />
      <rect x="28" y="-170" width="5" height="170" />
      <rect x="-48" y="-174" width="150" height="8" />
      <rect x="-30" y="-120" width="62" height="3" />
      <polygon points="98,-174 196,-160 196,-155 98,-168" />
      <polygon points="-8,-174 22,-222 52,-174" />
      <line x1="196" y1="-158" x2="22" y2="-221" stroke="#0a0f20" strokeWidth="1.6" />
      <line x1="196" y1="-158" x2="-46" y2="-176" stroke="#0a0f20" strokeWidth="1.2" />
      <rect x="150" y="-157" width="14" height="16" />
      <circle cx="22" cy="-225" r="3.4" fill="#ff7a1a" />
      <circle cx="22" cy="-225" r="8" fill="#ff7a1a" opacity="0.25" />
    </g>
  );
}

export default function PortScene({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1600 600"
      preserveAspectRatio="xMaxYMid slice"
      role="img"
      aria-label="Illustration of a container port at dusk"
    >
      <defs>
        <linearGradient id="portSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#070b1f" />
          <stop offset="0.3" stopColor="#151d58" />
          <stop offset="0.52" stopColor="#4d2b7d" />
          <stop offset="0.72" stopColor="#b8445c" />
          <stop offset="0.88" stopColor="#ff8a3d" />
          <stop offset="1" stopColor="#ffc36e" />
        </linearGradient>
        <radialGradient id="portSun" gradientUnits="userSpaceOnUse" cx="1120" cy="392" r="470">
          <stop offset="0" stopColor="#fff0c8" stopOpacity="1" />
          <stop offset="0.12" stopColor="#ffc66e" stopOpacity="0.95" />
          <stop offset="0.4" stopColor="#ff8a3d" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ff5a00" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="portSea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#241a3a" />
          <stop offset="0.35" stopColor="#0d1124" />
          <stop offset="1" stopColor="#04060d" />
        </linearGradient>
        <linearGradient id="portHaze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff9a4d" stopOpacity="0" />
          <stop offset="0.55" stopColor="#ff9a4d" stopOpacity="0.28" />
          <stop offset="1" stopColor="#ff9a4d" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="portDusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b0f22" stopOpacity="0.1" />
          <stop offset="1" stopColor="#0b0f22" stopOpacity="0.55" />
        </linearGradient>
        <filter id="portBlur" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>

      <rect width="1600" height="404" fill="url(#portSky)" />
      <rect width="1600" height="600" fill="url(#portSun)" />
      <circle cx="1120" cy="392" r="30" fill="#fff4d6" />

      <g filter="url(#portBlur)">
        <ellipse cx="380" cy="230" rx="260" ry="26" fill="#2b1a4f" opacity="0.7" />
        <ellipse cx="900" cy="190" rx="300" ry="22" fill="#2b1a4f" opacity="0.6" />
        <ellipse cx="1280" cy="300" rx="240" ry="20" fill="#7a2f5e" opacity="0.55" />
        <ellipse cx="1000" cy="352" rx="360" ry="16" fill="#ff8c42" opacity="0.55" />
        <ellipse cx="1260" cy="336" rx="260" ry="12" fill="#ffb25a" opacity="0.45" />
        <ellipse cx="520" cy="338" rx="260" ry="14" fill="#c2563a" opacity="0.3" />
      </g>

      {SCENE.skyline.map((b, i) => (
        <rect key={`sk${i}`} x={b.x} y={b.y} width={b.w} height={b.h} fill={b.fill} />
      ))}
      {SCENE.windows.map((b, i) => (
        <rect key={`wi${i}`} x={b.x} y={b.y} width={b.w} height={b.h} fill={b.fill} opacity="0.75" />
      ))}

      <rect x="0" y="402" width="1600" height="198" fill="url(#portSea)" />
      <rect x="0" y="372" width="1600" height="96" fill="url(#portHaze)" />
      {SCENE.streaks.map((b, i) => (
        <rect key={`st${i}`} x={b.x} y={b.y} width={b.w} height={b.h} fill={b.fill} />
      ))}

      {/* container ship */}
      <polygon points="742,428 1462,428 1432,458 1380,474 806,474 762,454" fill="#090c1a" />
      <polygon points="752,446 1444,446 1438,454 758,454" fill="#8a2323" opacity="0.85" />
      {SCENE.shipStacks.map((b, i) => (
        <g key={`ss${i}`}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={b.fill} />
          <rect x={b.x} y={b.y} width={b.w} height="2" fill="#ffffff" opacity="0.14" />
        </g>
      ))}
      <rect x="1336" y="348" width="62" height="82" fill="#0c1128" />
      <rect x="1330" y="344" width="74" height="8" fill="#10163a" />
      {SCENE.shipWindows.map((b, i) => (
        <rect key={`sw${i}`} x={b.x} y={b.y} width={b.w} height={b.h} fill={b.fill} opacity="0.85" />
      ))}
      <rect x="806" y="426" width="520" height="6" fill="url(#portDusk)" />

      {/* quay, container stacks and gantry cranes */}
      <rect x="0" y="438" width="780" height="34" fill="#080b18" />
      {SCENE.quayStacks.map((b, i) => (
        <g key={`qs${i}`}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={b.fill} />
          <rect x={b.x} y={b.y} width={b.w} height="2" fill="#ffffff" opacity="0.1" />
        </g>
      ))}
      <rect x="0" y="372" width="780" height="70" fill="url(#portDusk)" opacity="0.5" />
      {CRANES.map((x, i) => (
        <Crane key={x} x={x} scale={0.92 + i * 0.07} />
      ))}

      {/* foreground containers */}
      {SCENE.foreground.map((b, i) => (
        <g key={`fg${i}`}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={b.fill} />
          <rect x={b.x} y={b.y} width={b.w} height="2.4" fill="#ffffff" opacity="0.2" />
          <rect x={b.x + b.w - 3} y={b.y} width="3" height={b.h} fill="#000000" opacity="0.28" />
        </g>
      ))}
      <rect x="0" y="560" width="1600" height="40" fill="url(#portDusk)" opacity="0.7" />
    </svg>
  );
}

import React from 'react';

/** Original vector illustrations for the homepage cards. They are artwork, not photographs. */

export type ArtKind =
  | 'machinery'
  | 'steel'
  | 'textile'
  | 'chemicals'
  | 'packaging'
  | 'electronics'
  | 'agriculture'
  | 'construction'
  | 'generic';

const KIND_PATTERNS: Array<[RegExp, ArtKind]> = [
  [/machin|equipment|industrial|tool/i, 'machinery'],
  [/steel|metal|alumin|iron|pipe/i, 'steel'],
  [/textile|garment|fabric|apparel|cloth|yarn/i, 'textile'],
  [/chemi|raw material|polymer|plastic|resin/i, 'chemicals'],
  [/packag|carton|box|paper/i, 'packaging'],
  [/electr|electronic|circuit|solar|semicon/i, 'electronics'],
  [/agri|food|grain|spice|farm|fruit/i, 'agriculture'],
  [/construct|cement|building|brick|tile/i, 'construction'],
];

export function artKindFor(name: string | null | undefined): ArtKind {
  if (!name) return 'generic';
  return KIND_PATTERNS.find(([pattern]) => pattern.test(name))?.[1] ?? 'generic';
}

function Gear({ x, y, r, teeth, fill, hole }: { x: number; y: number; r: number; teeth: number; fill: string; hole: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: teeth }, (_, i) => (
        <rect
          key={i}
          x={-r * 0.22}
          y={-r - r * 0.34}
          width={r * 0.44}
          height={r * 0.4}
          rx="1.5"
          fill={fill}
          transform={`rotate(${(360 / teeth) * i})`}
        />
      ))}
      <circle r={r} fill={fill} />
      <circle r={r * 0.72} fill="none" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="2" />
      <circle r={hole} fill="#101a30" />
    </g>
  );
}

function Pipe({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="11" fill="#64748b" />
      <circle r="8.2" fill="#94a3b8" />
      <circle r="5.2" fill="#0b1224" />
      <path d="M-8 -3 A8 8 0 0 1 3 -8" fill="none" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}

function Roll({ x, y, color, light }: { x: number; y: number; color: string; light: string }) {
  return (
    <g>
      <rect x={x} y={y} width="92" height="22" rx="11" fill={color} />
      <rect x={x + 30} y={y + 3} width="2" height="16" fill="#ffffff" opacity="0.18" />
      <rect x={x + 54} y={y + 3} width="2" height="16" fill="#ffffff" opacity="0.12" />
      <ellipse cx={x + 11} cy={y + 11} rx="9" ry="11" fill={light} />
      <circle cx={x + 11} cy={y + 11} r="3.4" fill="#0b1224" />
    </g>
  );
}

function Barrel({ x, y, h }: { x: number; y: number; h: number }) {
  return (
    <g>
      <rect x={x} y={y} width="32" height={h} rx="6" fill="#2563eb" />
      <rect x={x} y={y + h * 0.28} width="32" height="3" fill="#1e40af" />
      <rect x={x} y={y + h * 0.66} width="32" height="3" fill="#1e40af" />
      <ellipse cx={x + 16} cy={y + 1} rx="16" ry="5" fill="#60a5fa" />
      <circle cx={x + 10} cy={y + 1} r="2" fill="#1e3a8a" />
      <rect x={x + 9} y={y + h * 0.4} width="14" height="9" rx="1.5" fill="#ff7a1a" opacity="0.9" />
    </g>
  );
}

function Cube({ x, y, s }: { x: number; y: number; s: number }) {
  const h = s * 0.5;
  return (
    <g transform={`translate(${x} ${y})`}>
      <polygon points={`0,${-s} ${s},${-s + h} 0,${-s + 2 * h} ${-s},${-s + h}`} fill="#e3b87f" />
      <polygon points={`${-s},${-s + h} 0,${-s + 2 * h} 0,${h * 2} ${-s},${h}`} fill="#c28f55" />
      <polygon points={`0,${-s + 2 * h} ${s},${-s + h} ${s},${h} 0,${h * 2}`} fill="#9c6b3a" />
      <line x1="0" y1={-s} x2="0" y2={-s + 2 * h} stroke="#f5dfb8" strokeOpacity="0.7" strokeWidth="3.5" />
    </g>
  );
}

const ART: Record<ArtKind, React.ReactNode> = {
  machinery: (
    <>
      <Gear x={62} y={58} r={24} teeth={8} fill="#475569" hole={9} />
      <Gear x={108} y={42} r={15} teeth={6} fill="#ff6a00" hole={6} />
      <rect x="28" y="86" width="104" height="8" rx="3" fill="#1e293b" />
      <rect x="40" y="80" width="14" height="8" fill="#334155" />
    </>
  ),
  steel: (
    <>
      {[44, 66, 88, 110].map((x) => (
        <Pipe key={`a${x}`} x={x} y={76} />
      ))}
      {[55, 77, 99].map((x) => (
        <Pipe key={`b${x}`} x={x} y={57} />
      ))}
      {[66, 88].map((x) => (
        <Pipe key={`c${x}`} x={x} y={38} />
      ))}
    </>
  ),
  textile: (
    <>
      <Roll x={30} y={24} color="#db2777" light="#f472b6" />
      <Roll x={42} y={48} color="#2563eb" light="#60a5fa" />
      <Roll x={34} y={72} color="#f59e0b" light="#fcd34d" />
    </>
  ),
  chemicals: (
    <>
      <Barrel x={26} y={44} h={48} />
      <Barrel x={64} y={34} h={58} />
      <Barrel x={102} y={46} h={46} />
    </>
  ),
  packaging: (
    <>
      <Cube x={62} y={78} s={30} />
      <Cube x={112} y={86} s={22} />
    </>
  ),
  electronics: (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect x={54 + i * 10} y="22" width="4" height="8" fill="#94a3b8" />
          <rect x={54 + i * 10} y="80" width="4" height="8" fill="#94a3b8" />
        </g>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="40" y={36 + i * 11} width="8" height="4" fill="#94a3b8" />
          <rect x="112" y={36 + i * 11} width="8" height="4" fill="#94a3b8" />
        </g>
      ))}
      <rect x="48" y="30" width="64" height="50" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
      <rect x="62" y="42" width="36" height="26" rx="3" fill="#1e293b" stroke="#ff6a00" strokeWidth="1.6" />
      <circle cx="80" cy="55" r="4" fill="#ff6a00" />
      <path d="M20 46h20M20 66h20M120 46h20M120 66h20" stroke="#38bdf8" strokeOpacity="0.5" strokeWidth="1.5" />
    </>
  ),
  agriculture: (
    <>
      <path d="M30 92 C22 70 30 54 46 48 C50 46 58 46 62 48 C78 54 86 70 78 92 Z" fill="#c9a06a" />
      <rect x="44" y="45" width="20" height="5" rx="2" fill="#8b6b3d" />
      <path d="M72 92 C64 64 78 44 98 38 C104 36 114 36 120 38 C140 44 152 64 144 92 Z" fill="#d6b07c" />
      <rect x="96" y="35" width="26" height="6" rx="2" fill="#8b6b3d" />
      {[38, 52, 66, 90, 104, 118, 132].map((x, i) => (
        <circle key={x} cx={x} cy={94 + (i % 2)} r="2.2" fill="#f4c542" />
      ))}
    </>
  ),
  construction: (
    <>
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3, 4].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={22 + col * 25 + (row % 2) * 12}
            y={56 + row * 10}
            width="24"
            height="9"
            fill="#c2410c"
            opacity={0.85 + ((row + col) % 3) * 0.05}
          />
        )),
      )}
      <path d="M92 52 a26 24 0 0 1 52 0 z" fill="#fbbf24" />
      <rect x="86" y="50" width="64" height="5" rx="2" fill="#f59e0b" />
      <rect x="114" y="30" width="6" height="22" fill="#f59e0b" />
    </>
  ),
  generic: (
    <>
      <Cube x={80} y={78} s={32} />
    </>
  ),
};

export function CategoryArt({ kind, className }: { kind: ArtKind; className?: string }) {
  return (
    <svg viewBox="0 0 160 110" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="160" height="110" fill="#111a30" />
      <circle cx="136" cy="18" r="40" fill="#ff5a00" opacity="0.1" />
      <ellipse cx="80" cy="97" rx="58" ry="6" fill="#000000" opacity="0.35" />
      {ART[kind]}
    </svg>
  );
}

export function TruckArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 250 130" className={className} aria-hidden="true">
      <rect x="6" y="108" width="238" height="3" rx="1.5" fill="#22c55e" opacity="0.35" />
      <path d="M2 70h28M10 82h22M6 58h18" stroke="#22c55e" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" />
      <rect x="36" y="24" width="130" height="70" rx="5" fill="#e8f5ee" />
      <rect x="36" y="24" width="130" height="8" rx="4" fill="#ffffff" opacity="0.5" />
      <rect x="36" y="76" width="130" height="8" fill="#22c55e" />
      <rect x="52" y="40" width="26" height="26" rx="3" fill="#cfe9db" />
      <path d="M58 53l7-5 7 5v10H58z" fill="#22c55e" opacity="0.85" />
      <path d="M168 44h30q10 0 16 10l12 16q4 6 4 12v12h-62z" fill="#16a34a" />
      <path d="M174 50h22q7 0 11 7l8 12h-41z" fill="#cfeadf" />
      <rect x="168" y="86" width="62" height="8" fill="#14532d" />
      {[62, 112, 196].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="98" r="12" fill="#0b1220" />
          <circle cx={cx} cy="98" r="7" fill="#94a3b8" />
          <circle cx={cx} cy="98" r="3" fill="#0b1220" />
        </g>
      ))}
    </svg>
  );
}

export function WalletArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 150" className={className} aria-hidden="true">
      <ellipse cx="102" cy="138" rx="74" ry="7" fill="#000000" opacity="0.35" />
      <rect x="48" y="26" width="108" height="64" rx="8" fill="#1e293b" transform="rotate(-8 100 60)" />
      <rect x="54" y="34" width="96" height="10" rx="3" fill="#ff7a1a" opacity="0.85" transform="rotate(-8 100 60)" />
      <rect x="22" y="48" width="148" height="86" rx="16" fill="#ea580c" />
      <rect x="22" y="48" width="148" height="30" rx="16" fill="#ff7a1a" />
      <rect x="112" y="80" width="70" height="38" rx="10" fill="#c2410c" />
      <circle cx="132" cy="99" r="8" fill="#ffc247" />
      <circle cx="132" cy="99" r="4" fill="#ea580c" />
      <path d="M34 62h60" stroke="#ffffff" strokeOpacity="0.28" strokeWidth="3" strokeLinecap="round" />
      <g>
        <ellipse cx="38" cy="30" rx="17" ry="6" fill="#d9a21b" />
        <ellipse cx="38" cy="26" rx="17" ry="6" fill="#ffc247" />
        <ellipse cx="38" cy="22" rx="17" ry="6" fill="#ffd36e" />
        <ellipse cx="38" cy="22" rx="9" ry="3" fill="#e9a915" />
      </g>
    </svg>
  );
}

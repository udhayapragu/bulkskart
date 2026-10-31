import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Anchor, ArrowRight } from 'lucide-react';
import { FlagBadge } from '@/components/home/landing/shared';
import { MAP_HEIGHT, MAP_LAT_BOTTOM, MAP_LAT_TOP, MAP_WIDTH, WORLD_DOTS_PATH } from '@/data/worldDots';
import type { LoadState } from '@/hooks/useHomepageData';
import { findCountry, flagEmoji, type RegionId, REGIONS } from '@/lib/countries';
import { formatNumber, type MarketplaceOverview } from '@/lib/homepageData';

interface TradeCountry {
  key: string;
  name: string;
  iso2: string | null;
  region: RegionId | null;
  lon: number | null;
  lat: number | null;
  suppliers: number;
  buyers: number;
}

const project = (lon: number, lat: number): [number, number] => [
  ((lon + 180) / 360) * MAP_WIDTH,
  ((MAP_LAT_TOP - lat) / (MAP_LAT_TOP - MAP_LAT_BOTTOM)) * MAP_HEIGHT,
];

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

function mergeCountries(overview: MarketplaceOverview | null): TradeCountry[] {
  const byKey = new Map<string, TradeCountry>();
  const add = (list: MarketplaceOverview['supplierCountries'], field: 'suppliers' | 'buyers') => {
    for (const entry of list ?? []) {
      const key = entry.country.toLowerCase();
      const info = findCountry(entry.country);
      const row =
        byKey.get(key) ??
        {
          key,
          name: entry.country,
          iso2: entry.iso2,
          region: info?.region ?? null,
          lon: info?.lon ?? null,
          lat: info?.lat ?? null,
          suppliers: 0,
          buyers: 0,
        };
      row[field] += entry.count;
      byKey.set(key, row);
    }
  };
  add(overview?.supplierCountries ?? null, 'suppliers');
  add(overview?.buyerCountries ?? null, 'buyers');
  return [...byKey.values()].sort((a, b) => b.suppliers + b.buyers - (a.suppliers + a.buyers));
}

interface PlacedMarker {
  country: TradeCountry;
  x: number;
  y: number;
  radius: number;
}

interface LabelSpot {
  x: number;
  y: number;
  anchor: 'start' | 'middle' | 'end';
}

const LABEL_CHAR_WIDTH = 6.6;

/** Places the largest markers' labels without letting them overlap: above, below, right, then left. */
function placeLabels(markers: PlacedMarker[]): Map<string, LabelSpot> {
  const taken: Array<{ x1: number; x2: number; y1: number; y2: number }> = [];
  const spots = new Map<string, LabelSpot>();
  for (const marker of markers.slice(0, 8)) {
    const width = marker.country.name.length * LABEL_CHAR_WIDTH + 8;
    const options: LabelSpot[] = [
      { x: marker.x, y: marker.y - marker.radius - 9, anchor: 'middle' },
      { x: marker.x, y: marker.y + marker.radius + 17, anchor: 'middle' },
      { x: marker.x + marker.radius + 8, y: marker.y + 4, anchor: 'start' },
      { x: marker.x - marker.radius - 8, y: marker.y + 4, anchor: 'end' },
    ];
    for (const option of options) {
      const x1 = option.anchor === 'middle' ? option.x - width / 2 : option.anchor === 'start' ? option.x : option.x - width;
      const box = { x1, x2: x1 + width, y1: option.y - 12, y2: option.y + 4 };
      if (box.x1 < 2 || box.x2 > MAP_WIDTH - 2 || box.y1 < 2 || box.y2 > MAP_HEIGHT - 2) continue;
      if (taken.some((other) => box.x1 < other.x2 && box.x2 > other.x1 && box.y1 < other.y2 && box.y2 > other.y1)) continue;
      taken.push(box);
      spots.set(marker.country.key, option);
      break;
    }
  }
  return spots;
}

function WorldMap({ countries, region }: { countries: TradeCountry[]; region: RegionId | 'all' }) {
  const reduced = usePrefersReducedMotion();
  const placed: PlacedMarker[] = countries
    .filter((country) => country.lon !== null && country.lat !== null)
    .map((country) => {
      const [x, y] = project(country.lon as number, country.lat as number);
      return { country, x, y, radius: 4.2 + Math.min(Math.sqrt(country.suppliers) * 1.2, 6) };
    });
  const visibleForLabels = placed.filter(({ country }) => region === 'all' || country.region === region);
  const labels = placeLabels(visibleForLabels);

  return (
    <svg
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      className="h-auto w-full"
      role="img"
      aria-label="World map showing countries with verified suppliers and countries named in active buying requirements"
    >
      <path d={WORLD_DOTS_PATH} stroke="#38bdf8" strokeOpacity="0.42" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      {placed.map(({ country, x, y, radius }) => {
        const dim = region !== 'all' && country.region !== region;
        const label = labels.get(country.key);
        return (
          <g key={country.key} opacity={dim ? 0.18 : 1}>
            {country.buyers > 0 && (
              <circle cx={x} cy={y} r={radius + 5} fill="none" stroke="#38bdf8" strokeOpacity="0.9" strokeWidth="1.5" />
            )}
            {country.suppliers > 0 ? (
              <>
                <circle cx={x} cy={y} r={radius + 8} fill="#ff5a00" opacity="0.2">
                  {!reduced && (
                    <>
                      <animate attributeName="r" values={`${radius + 4};${radius + 14};${radius + 4}`} dur="2.6s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.32;0;0.32" dur="2.6s" repeatCount="indefinite" />
                    </>
                  )}
                </circle>
                <circle cx={x} cy={y} r={radius} fill="#ff5a00" stroke="#ffffff" strokeWidth="1.2" />
              </>
            ) : (
              <circle cx={x} cy={y} r="3.4" fill="#38bdf8" />
            )}
            {label && (
              <text
                x={label.x}
                y={label.y}
                textAnchor={label.anchor}
                fontSize="11.5"
                fontWeight="700"
                fill="#ffffff"
                stroke="#050812"
                strokeWidth="3.2"
                paintOrder="stroke"
              >
                {country.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function TradeRoutes({ overview }: { overview: LoadState<MarketplaceOverview> }) {
  const [region, setRegion] = useState<RegionId | 'all'>('all');
  const countries = useMemo(() => mergeCountries(overview.data), [overview.data]);
  const visible = countries.filter((country) => region === 'all' || country.region === region);
  const hasData = countries.length > 0;
  const unavailable =
    !overview.loading && (overview.failed || (overview.data?.supplierCountries === null && overview.data?.buyerCountries === null));

  return (
    <section aria-label="Global trade routes" className="mx-auto max-w-[1400px] px-4 pt-10 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-border bg-card/70">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Anchor className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">Global Trade Routes</h2>
              <p className="text-sm text-muted-foreground">
                Where verified suppliers and buyer requirements are located. Shipping routes and cargo movements are not shown.
              </p>
            </div>
          </div>
          <div>
            <label htmlFor="trade-region" className="sr-only">
              Select region
            </label>
            <select
              id="trade-region"
              value={region}
              onChange={(event) => setRegion(event.target.value as RegionId | 'all')}
              className="h-10 min-w-[11rem] rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Regions</option>
              {REGIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.9fr_1fr]">
          <div className="relative bg-[#070b16] p-3 sm:p-5">
            <WorldMap countries={countries} region={region} />
            {!hasData && (
              <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-slate-300">
                {overview.loading
                  ? 'Loading marketplace countries…'
                  : unavailable
                    ? 'Country data is unavailable right now.'
                    : 'No supplier or buyer countries are listed yet.'}
              </p>
            )}
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-300" aria-label="Map legend">
              <li className="flex items-center gap-2">
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-primary ring-1 ring-white" />
                Countries with verified suppliers
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden="true" className="h-3 w-3 rounded-full border border-sky-400" />
                Countries named in active buying requirements
              </li>
            </ul>
          </div>

          <div className="flex flex-col border-t border-border p-4 sm:p-5 lg:border-l lg:border-t-0">
            <h3 className="mb-3 text-sm font-bold text-foreground">
              {region === 'all' ? 'All regions' : REGIONS.find((item) => item.id === region)?.label}
            </h3>
            {visible.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {hasData ? 'No suppliers or requirements listed in this region.' : 'Nothing to show yet.'}
              </p>
            ) : (
              <ul className="max-h-[17rem] divide-y divide-border overflow-y-auto pr-1">
                {visible.map((country) => (
                  <li key={country.key}>
                    <Link
                      to={`/products?country=${encodeURIComponent(country.name)}`}
                      className="flex items-center gap-3 py-2.5 text-sm hover:text-primary"
                    >
                      <FlagBadge flag={flagEmoji(country.iso2)} />
                      <span className="min-w-0 flex-1 truncate font-semibold text-foreground">{country.name}</span>
                      <span className="shrink-0 text-right text-xs text-muted-foreground">
                        {country.suppliers > 0 && (
                          <span className="block">
                            {formatNumber(country.suppliers)} {country.suppliers === 1 ? 'supplier' : 'suppliers'}
                          </span>
                        )}
                        {country.buyers > 0 && (
                          <span className="block">
                            {formatNumber(country.buyers)} {country.buyers === 1 ? 'requirement' : 'requirements'}
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link
              to="/trade-assistant"
              className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              Import & export tools
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

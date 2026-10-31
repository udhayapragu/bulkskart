import { supabase } from '@/db/supabase';
import { findCountry } from '@/lib/countries';
import type { Category } from '@/types/types';

/** Stock and AI image hosts. Photos from these hosts are never shown on the homepage. */
const BLOCKED_IMAGE_HOSTS = ['pixabay.com', 'unsplash.com', 'pexels.com'];
/** Test and debug RFQs stay out of public listings, matching getRequirements. */
const TEST_TITLE_PATTERN = /\b(test|debug|timed|timeout)\b/i;
/** Scan size for country figures. A result this large is treated as incomplete and the figure is hidden. */
const SCAN_LIMIT = 5000;
const DAY_MS = 86_400_000;

export interface CountryCount {
  country: string;
  iso2: string | null;
  count: number;
}

export interface MarketplaceOverview {
  verifiedManufacturers: number | null;
  activeProducts: number | null;
  activeRequirements: number | null;
  liveAuctions: number | null;
  /** Countries of verified manufacturers. */
  supplierCountries: CountryCount[] | null;
  /** Destination countries of active buying requirements. */
  buyerCountries: CountryCount[] | null;
}

export interface CategoryTree {
  top: Category[];
  /** Descendant category ids for each top-level category, so products in subcategories are counted. */
  childIds: Record<string, string[]>;
}

export interface CategoryTile {
  category: Category;
  productCount: number | null;
  /** Photo uploaded for the category. Null when none exists, and the tile shows artwork instead. */
  image: string | null;
}

export interface FeaturedProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  priceLabel: string;
  moqLabel: string | null;
  companyName: string;
  companySlug: string;
  city: string | null;
  country: string | null;
  categoryName: string | null;
}

export interface VerifiedManufacturer {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  country: string | null;
  tagline: string | null;
  image: string;
  imageIsLogo: boolean;
  productCount: number | null;
  categories: string[];
}

export interface LiveRequirement {
  id: string;
  routeId: string;
  title: string;
  quantity: string;
  location: string | null;
  postedAt: string;
  buyerVerified: boolean;
  categoryName: string | null;
  image: string | null;
  isNew: boolean;
  isUrgent: boolean;
}

export type AuctionTab = 'live' | 'upcoming' | 'reverse' | 'ended';
export type AuctionPhase = 'live' | 'closing_soon' | 'upcoming' | 'ended';

export interface HomeAuction {
  id: string;
  type: 'forward' | 'reverse';
  title: string;
  phase: AuctionPhase;
  image: string | null;
  startTime: string | null;
  endTime: string;
  currentBid: number | null;
  startingPrice: number | null;
  totalBids: number;
  quantityLabel: string | null;
}

interface CategoryRow extends Category {
  parent_id: string | null;
}

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  images: string[] | null;
  moq: number | null;
  moq_unit: string | null;
  price_min: number | string | null;
  price_max: number | string | null;
  price_currency: string | null;
  companies: {
    company_name: string;
    slug: string;
    city: string | null;
    country: string | null;
    verification_status: string;
  } | null;
  categories: { name: string } | null;
}

interface CompanyRow {
  id: string;
  company_name: string;
  slug: string;
  city: string | null;
  country: string | null;
  tagline: string | null;
  cover_url: string | null;
  banner_url: string | null;
  logo_url: string | null;
}

interface RequirementRow {
  id: string;
  req_number: string | null;
  title: string;
  quantity: number | null;
  quantity_unit: string | null;
  destination_city: string | null;
  destination_country: string | null;
  is_verified_buyer: boolean | null;
  created_at: string;
  expires_at: string | null;
  deadline: string | null;
  images: string[] | null;
  categories: { name: string } | null;
}

interface AuctionRow {
  id: string;
  auction_type: string | null;
  title: string;
  status: string;
  start_time: string | null;
  end_time: string;
  current_highest_bid: number | string | null;
  starting_price: number | string | null;
  total_bids: number | null;
  total_quantity: number | null;
  quantity_unit: string | null;
  images: string[] | null;
}

export function isUsableImageUrl(url: unknown): url is string {
  if (typeof url !== 'string' || url.trim() === '') return false;
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== 'https:' && protocol !== 'http:') return false;
    return !BLOCKED_IMAGE_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

function firstUsableImage(candidates: unknown[]): string | null {
  return candidates.find(isUsableImageUrl) ?? null;
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-IN');
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${formatNumber(amount)}`;
  }
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** "2d 4h" for more than a day, "HH:MM:SS" below that. */
export function formatCountdown(remainingMs: number): string {
  if (remainingMs <= 0) return 'Ended';
  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${hours}h`;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
}

function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatPriceLabel(min: number | null, max: number | null, currency: string, unit: string | null): string {
  const low = min ?? max;
  if (low === null) return 'Price on request';
  const high = min !== null && max !== null && max > min ? max : null;
  const amount =
    high === null ? formatMoney(low, currency) : `${formatMoney(low, currency)} – ${formatMoney(high, currency)}`;
  return unit ? `${amount} / ${unit}` : amount;
}

function groupCountries(values: Array<string | null>): CountryCount[] {
  const byName = new Map<string, CountryCount>();
  for (const value of values) {
    const raw = value?.trim();
    if (!raw) continue;
    const info = findCountry(raw);
    const name = info?.name ?? raw;
    const key = name.toLowerCase();
    const existing = byName.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      byName.set(key, { country: name, iso2: info?.iso2 ?? null, count: 1 });
    }
  }
  return [...byName.values()].sort((a, b) => b.count - a.count || a.country.localeCompare(b.country));
}

/** Count query that returns null instead of throwing, so one failed figure hides only itself. */
async function countOrNull(query: PromiseLike<{ count: number | null; error: unknown }>): Promise<number | null> {
  const { count, error } = await query;
  return error ? null : count;
}

let categoryTreeCache: { at: number; value: Promise<CategoryTree> } | null = null;

/** Active categories, cached for five minutes. Shared by the header, the hero, the tabs and the tiles. */
export function fetchCategoryTree(): Promise<CategoryTree> {
  if (categoryTreeCache && Date.now() - categoryTreeCache.at < 5 * 60_000) return categoryTreeCache.value;

  const value = (async (): Promise<CategoryTree> => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;

    const all = (data ?? []) as unknown as CategoryRow[];
    const topLevel = all.filter((category) => !category.parent_id);
    const top = topLevel.length > 0 ? topLevel : all;

    const childrenOf = new Map<string, string[]>();
    for (const category of all) {
      if (!category.parent_id) continue;
      const siblings = childrenOf.get(category.parent_id) ?? [];
      siblings.push(category.id);
      childrenOf.set(category.parent_id, siblings);
    }
    const descendants = (id: string, seen = new Set<string>()): string[] => {
      for (const childId of childrenOf.get(id) ?? []) {
        if (seen.has(childId)) continue;
        seen.add(childId);
        descendants(childId, seen);
      }
      return [...seen];
    };
    const childIds: Record<string, string[]> = {};
    for (const category of top) childIds[category.id] = descendants(category.id);
    return { top, childIds };
  })();

  categoryTreeCache = { at: Date.now(), value };
  value.catch(() => {
    if (categoryTreeCache?.value === value) categoryTreeCache = null;
  });
  return value;
}

/** Top categories with the number of active products in each, including their subcategories. */
export async function fetchCategoryTiles(limit = 8): Promise<CategoryTile[]> {
  const tree = await fetchCategoryTree();
  return Promise.all(
    tree.top.slice(0, limit).map(async (category) => {
      const ids = [category.id, ...(tree.childIds[category.id] ?? [])];
      const productCount = await countOrNull(
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true).in('category_id', ids),
      );
      return {
        category,
        productCount,
        image: isUsableImageUrl(category.image_url) ? category.image_url : null,
      };
    }),
  );
}

export async function fetchMarketplaceOverview(): Promise<MarketplaceOverview> {
  const nowIso = new Date().toISOString();
  const [verified, products, requirements, auctions, supplierRows, buyerRows] = await Promise.all([
    countOrNull(
      supabase.from('companies').select('id', { count: 'exact', head: true }).eq('verification_status', 'verified'),
    ),
    countOrNull(supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true)),
    countOrNull(supabase.from('requirements').select('id', { count: 'exact', head: true }).eq('status', 'active')),
    countOrNull(
      supabase
        .from('auctions')
        .select('id', { count: 'exact', head: true })
        .in('status', ['live', 'closing_soon'])
        .gt('end_time', nowIso),
    ),
    supabase.from('companies').select('country').eq('verification_status', 'verified').limit(SCAN_LIMIT),
    supabase.from('requirements').select('destination_country').eq('status', 'active').limit(SCAN_LIMIT),
  ]);

  const completeRows = <T,>(result: { data: unknown; error: unknown }): T[] | null => {
    if (result.error || !Array.isArray(result.data) || result.data.length >= SCAN_LIMIT) return null;
    return result.data as T[];
  };
  const suppliers = completeRows<{ country: string | null }>(supplierRows);
  const buyers = completeRows<{ destination_country: string | null }>(buyerRows);

  return {
    verifiedManufacturers: verified,
    activeProducts: products,
    activeRequirements: requirements,
    liveAuctions: auctions,
    supplierCountries: suppliers ? groupCountries(suppliers.map((row) => row.country)) : null,
    buyerCountries: buyers ? groupCountries(buyers.map((row) => row.destination_country)) : null,
  };
}

/**
 * Products from verified manufacturers with a real photo. Featured products come first, then the
 * newest listings fill the grid. Products without a photo are not published.
 */
export async function fetchFeaturedProducts(
  options: { categoryIds?: string[] | null; limit?: number } = {},
): Promise<FeaturedProduct[]> {
  const limit = options.limit ?? 8;
  let query = supabase
    .from('products')
    .select(
      'id,name,slug,images,moq,moq_unit,price_min,price_max,price_currency,is_featured,created_at,companies!company_id(company_name,slug,city,country,verification_status),categories!category_id(name)',
    )
    .eq('is_active', true);
  if (options.categoryIds && options.categoryIds.length > 0) {
    query = query.in('category_id', options.categoryIds);
  }
  const { data, error } = await query
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(80);
  if (error) throw error;

  const cards: FeaturedProduct[] = [];
  for (const row of (data ?? []) as unknown as ProductRow[]) {
    const company = row.companies;
    const image = firstUsableImage(row.images ?? []);
    if (!company || company.verification_status !== 'verified' || !image || !row.slug || !company.slug) continue;
    cards.push({
      id: row.id,
      name: row.name,
      slug: row.slug,
      image,
      priceLabel: formatPriceLabel(
        toNumber(row.price_min),
        toNumber(row.price_max),
        row.price_currency || 'INR',
        row.moq_unit,
      ),
      moqLabel: row.moq ? `MOQ: ${formatNumber(row.moq)}${row.moq_unit ? ` ${row.moq_unit}` : ''}` : null,
      companyName: company.company_name,
      companySlug: company.slug,
      city: company.city,
      country: company.country,
      categoryName: row.categories?.name ?? null,
    });
    if (cards.length === limit) break;
  }
  return cards;
}

async function fetchCompanyCategories(companyIds: string[]): Promise<Map<string, string[]>> {
  const byCompany = new Map<string, string[]>();
  const { data, error } = await supabase
    .from('products')
    .select('company_id,categories!category_id(name)')
    .eq('is_active', true)
    .in('company_id', companyIds)
    .limit(500);
  if (error || !Array.isArray(data)) return byCompany;

  for (const row of data as unknown as Array<{ company_id: string; categories: { name: string } | null }>) {
    const name = row.categories?.name;
    if (!name) continue;
    const names = byCompany.get(row.company_id) ?? [];
    if (!names.includes(name) && names.length < 3) names.push(name);
    byCompany.set(row.company_id, names);
  }
  return byCompany;
}

/** Verified manufacturers that have a real company photo or logo. */
export async function fetchVerifiedManufacturers(limit = 4): Promise<VerifiedManufacturer[]> {
  const { data, error } = await supabase
    .from('companies')
    .select('id,company_name,slug,city,country,tagline,cover_url,banner_url,logo_url,is_featured,created_at')
    .eq('verification_status', 'verified')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(40);
  if (error) throw error;

  const picked: Array<{ row: CompanyRow; image: string; imageIsLogo: boolean }> = [];
  for (const row of (data ?? []) as unknown as CompanyRow[]) {
    if (!row.slug) continue;
    const photo = firstUsableImage([row.cover_url, row.banner_url]);
    const image = photo ?? firstUsableImage([row.logo_url]);
    if (!image) continue;
    picked.push({ row, image, imageIsLogo: photo === null });
    if (picked.length === limit) break;
  }
  if (picked.length === 0) return [];

  const ids = picked.map((entry) => entry.row.id);
  const [categoriesByCompany, counts] = await Promise.all([
    fetchCompanyCategories(ids),
    Promise.all(
      ids.map((id) =>
        countOrNull(
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('company_id', id).eq('is_active', true),
        ),
      ),
    ),
  ]);

  return picked.map(({ row, image, imageIsLogo }, index) => ({
    id: row.id,
    name: row.company_name,
    slug: row.slug,
    city: row.city,
    country: row.country,
    tagline: row.tagline,
    image,
    imageIsLogo,
    productCount: counts[index],
    categories: categoriesByCompany.get(row.id) ?? [],
  }));
}

/** Active RFQs. Buyer contact details are never selected, so they cannot reach the browser. */
export async function fetchLiveRequirements(
  options: { categoryIds?: string[] | null; limit?: number } = {},
): Promise<LiveRequirement[]> {
  const limit = options.limit ?? 3;
  let query = supabase.from('requirements').select('*, categories!category_id(name)').eq('status', 'active');
  if (options.categoryIds && options.categoryIds.length > 0) {
    query = query.in('category_id', options.categoryIds);
  }
  const { data, error } = await query.order('created_at', { ascending: false }).limit(60);
  if (error) throw error;

  const now = Date.now();
  const seenTitles = new Set<string>();
  const items: LiveRequirement[] = [];
  for (const row of (data ?? []) as unknown as RequirementRow[]) {
    const title = row.title?.trim();
    if (!title || TEST_TITLE_PATTERN.test(title)) continue;
    if (row.expires_at && new Date(row.expires_at).getTime() <= now) continue;
    const key = title.toLowerCase();
    if (seenTitles.has(key)) continue;
    seenTitles.add(key);

    const deadlineMs = row.deadline ? new Date(row.deadline).getTime() : null;
    items.push({
      id: row.id,
      routeId: row.req_number || row.id,
      title,
      quantity: row.quantity
        ? `${formatNumber(row.quantity)}${row.quantity_unit ? ` ${row.quantity_unit}` : ''}`
        : 'Not specified',
      location: [row.destination_city, row.destination_country].filter(Boolean).join(', ') || null,
      postedAt: row.created_at,
      buyerVerified: row.is_verified_buyer === true,
      categoryName: row.categories?.name ?? null,
      image: firstUsableImage(row.images ?? []),
      isNew: now - new Date(row.created_at).getTime() < DAY_MS,
      isUrgent: deadlineMs !== null && deadlineMs > now && deadlineMs - now < 7 * DAY_MS,
    });
    if (items.length === limit) break;
  }
  return items;
}

function phaseOf(status: string): AuctionPhase {
  if (status === 'live') return 'live';
  if (status === 'closing_soon') return 'closing_soon';
  if (status === 'scheduled') return 'upcoming';
  return 'ended';
}

/** Auctions for one tab. Simulated auctions are never added. */
export async function fetchAuctions(tab: AuctionTab, limit = 3): Promise<HomeAuction[]> {
  const nowIso = new Date().toISOString();
  let query = supabase
    .from('auctions')
    .select(
      'id,auction_type,title,status,start_time,end_time,current_highest_bid,starting_price,total_bids,total_quantity,quantity_unit,images',
    );
  if (tab === 'live') {
    query = query.in('status', ['live', 'closing_soon']).gt('end_time', nowIso).order('end_time', { ascending: true });
  } else if (tab === 'upcoming') {
    query = query.eq('status', 'scheduled').order('start_time', { ascending: true });
  } else if (tab === 'reverse') {
    query = query
      .eq('auction_type', 'reverse')
      .in('status', ['live', 'closing_soon', 'scheduled'])
      .gt('end_time', nowIso)
      .order('end_time', { ascending: true });
  } else {
    query = query
      .in('status', ['completed', 'awarded', 'no_winner', 'sold', 'concluded', 'unsold'])
      .order('end_time', { ascending: false });
  }
  const { data, error } = await query.limit(limit);
  if (error) throw error;

  return ((data ?? []) as unknown as AuctionRow[]).map((row) => ({
    id: row.id,
    type: row.auction_type === 'forward' ? 'forward' : 'reverse',
    title: row.title,
    phase: phaseOf(row.status),
    image: firstUsableImage(row.images ?? []),
    startTime: row.start_time,
    endTime: row.end_time,
    currentBid: toNumber(row.current_highest_bid),
    startingPrice: toNumber(row.starting_price),
    totalBids: row.total_bids ?? 0,
    quantityLabel: row.total_quantity
      ? `${formatNumber(row.total_quantity)} ${row.quantity_unit || 'units'}`
      : null,
  }));
}

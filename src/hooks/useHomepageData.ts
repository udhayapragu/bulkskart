import { useEffect, useRef, useState } from 'react';
import {
  type AuctionTab,
  fetchAuctions,
  fetchCategoryTiles,
  fetchCategoryTree,
  fetchFeaturedProducts,
  fetchLiveRequirements,
  fetchMarketplaceOverview,
  fetchVerifiedManufacturers,
} from '@/lib/homepageData';

export interface LoadState<T> {
  data: T | null;
  loading: boolean;
  failed: boolean;
  retry: () => void;
}

/**
 * Runs a loader on mount, when the dependencies change, and on retry. With refreshMs it also
 * reloads quietly on an interval and keeps what is on screen if a refresh fails.
 */
function useLoadable<T>(loader: () => Promise<T>, deps: readonly unknown[], refreshMs?: number): LoadState<T> {
  const [state, setState] = useState<{ data: T | null; loading: boolean; failed: boolean }>({
    data: null,
    loading: true,
    failed: false,
  });
  const [attempt, setAttempt] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    let active = true;
    setState({ data: null, loading: true, failed: false });
    loaderRef
      .current()
      .then((data) => {
        if (active) setState({ data, loading: false, failed: false });
      })
      .catch(() => {
        if (active) setState({ data: null, loading: false, failed: true });
      });

    let timer: number | undefined;
    if (refreshMs) {
      timer = window.setInterval(() => {
        loaderRef
          .current()
          .then((data) => {
            if (active) setState({ data, loading: false, failed: false });
          })
          .catch(() => {
            // Keep the data already on screen when a background refresh fails.
          });
      }, refreshMs);
    }

    return () => {
      active = false;
      if (timer !== undefined) window.clearInterval(timer);
    };
  }, [attempt, refreshMs, ...deps]);

  return { ...state, retry: () => setAttempt((count) => count + 1) };
}

export function useMarketplaceOverview() {
  return useLoadable(fetchMarketplaceOverview, [], 60_000);
}

export function useCategoryTree() {
  return useLoadable(fetchCategoryTree, []);
}

export function useCategoryTiles() {
  return useLoadable(() => fetchCategoryTiles(), []);
}

export function useFeaturedProducts(categoryIds: string[] | null) {
  const key = categoryIds ? categoryIds.join(',') : 'all';
  return useLoadable(() => fetchFeaturedProducts({ categoryIds, limit: 4 }), [key], 30_000);
}

export function useVerifiedManufacturers() {
  return useLoadable(() => fetchVerifiedManufacturers(), []);
}

export function useLiveRequirements(categoryIds: string[] | null) {
  const key = categoryIds ? categoryIds.join(',') : 'all';
  return useLoadable(() => fetchLiveRequirements({ categoryIds }), [key], 60_000);
}

export function useAuctions(tab: AuctionTab) {
  return useLoadable(() => fetchAuctions(tab), [tab], 30_000);
}

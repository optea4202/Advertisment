import { useState, useEffect, useCallback } from 'react';
import { getMyAds, getAds, getAdById, type Ad } from '../api/ads.js';
import { algoliasearch } from 'algoliasearch';

interface AlgoliaAdHit {
  id: number;
  owner_id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  location: string;
  contact_info?: string;
  latitude?: number | null;
  longitude?: number | null;
  created_at: number; // Unix timestamp
  image_url?: string;
  owner_name?: string;
  owner_photo?: string | null;
}

// Initialize the Algolia client using Search-Only key (v5 client)
let searchClient: ReturnType<typeof algoliasearch> | null = null;
const adsIndexName = import.meta.env.VITE_ALGOLIA_ADS_INDEX_NAME || 'fakna_ads';

try {
  const appId = import.meta.env.VITE_ALGOLIA_APP_ID || '';
  const searchKey = import.meta.env.VITE_ALGOLIA_SEARCH_ONLY_API_KEY || '';
  if (appId && searchKey && !appId.includes('placeholder') && !searchKey.includes('placeholder')) {
    searchClient = algoliasearch(appId, searchKey);
  }
} catch (err) {
  console.warn('Algolia search client initialization skipped or failed:', err);
}

interface FeedCacheItem {
  ads: Ad[];
  total: number;
  totalPages: number;
}

// ----- localStorage persistence helpers -----
const LS_FEED_PREFIX = 'fakna_feed_';
const LS_FEED_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

interface PersistedFeed {
  data: FeedCacheItem;
  savedAt: number;
}

const saveFeedToStorage = (key: string, item: FeedCacheItem) => {
  try {
    const payload: PersistedFeed = { data: item, savedAt: Date.now() };
    localStorage.setItem(LS_FEED_PREFIX + key, JSON.stringify(payload));
  } catch {
    // Ignore storage quota errors
  }
};

const loadFeedFromStorage = (key: string): FeedCacheItem | null => {
  try {
    const raw = localStorage.getItem(LS_FEED_PREFIX + key);
    if (!raw) return null;
    const parsed: PersistedFeed = JSON.parse(raw);
    // Discard if older than 24 hours
    if (Date.now() - parsed.savedAt > LS_FEED_MAX_AGE_MS) {
      localStorage.removeItem(LS_FEED_PREFIX + key);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
};
// ----- end localStorage helpers -----

// Client-side in-memory caches
const feedCache: { [key: string]: FeedCacheItem } = {};
let myAdsCache: Ad[] | null = null;
const adDetailCache: { [id: number]: Ad } = {};

export const clearAdsCache = () => {
  // Clear feedCache
  for (const key in feedCache) {
    delete feedCache[key];
  }
  // Clear myAdsCache
  myAdsCache = null;
  // Clear adDetailCache
  for (const key in adDetailCache) {
    delete adDetailCache[Number(key)];
  }
  // Clear persisted feed from localStorage
  try {
    const toDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(LS_FEED_PREFIX)) toDelete.push(k);
    }
    toDelete.forEach(k => localStorage.removeItem(k));
  } catch { /* ignore */ }
  console.log('🧹 Ads cache cleared.');
};


export const useMyAds = () => {
  const [ads, setAds] = useState<Ad[]>(myAdsCache || []);
  const [loading, setLoading] = useState(myAdsCache === null);
  const [error, setError] = useState<Error | null>(null);

  const fetchAds = useCallback(async () => {
    try {
      if (!myAdsCache) {
        setLoading(true);
      }
      const data = await getMyAds();
      setAds(data);
      myAdsCache = data;
      setError(null);
    } catch (err: any) {
      console.error('Error fetching my ads:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  return { ads, loading, error, refresh: fetchAds };
};

export const useFeed = (category?: string, search?: string, page: number = 1) => {
  const [limit, setLimit] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1280 ? 12 : 15);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setLimit(window.innerWidth < 1280 ? 12 : 15);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cacheKey = `${category || ''}_${search || ''}_${page}_${limit}`;

  // Load persisted data immediately so offline refresh shows stale ads instantly
  const storedFeed = feedCache[cacheKey] || loadFeedFromStorage(cacheKey);
  if (storedFeed && !feedCache[cacheKey]) {
    feedCache[cacheKey] = storedFeed;
  }

  const [ads, setAds] = useState<Ad[]>(storedFeed?.ads || []);
  const [total, setTotal] = useState<number>(storedFeed?.total || 0);
  const [totalPages, setTotalPages] = useState<number>(storedFeed?.totalPages || 1);
  const [loading, setLoading] = useState(storedFeed === null || storedFeed === undefined);
  const [error, setError] = useState<Error | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const fetchAds = useCallback(async () => {
    try {
      if (!feedCache[cacheKey]) {
        setLoading(true);
      }

      if (search && search.trim() && searchClient) {
        // Query Algolia directly for keyword searches
        let algoliaFilters = '';
        if (category) {
          algoliaFilters = `categories:"${category}"`;
        }

        const res = await searchClient.searchSingleIndex({
          indexName: adsIndexName,
          searchParams: {
            query: search,
            filters: algoliaFilters,
            hitsPerPage: limit,
            page: page - 1
          }
        });

        // Map Algolia v5 hits back into standard Ad format
        // Assert res.hits as unknown then as AlgoliaAdHit[] to safely type the external SDK result without using any
        const mappedAds: Ad[] = (res.hits as unknown as AlgoliaAdHit[]).map((hit): Ad => ({
          id: hit.id,
          owner_id: hit.owner_id,
          title: hit.title,
          description: hit.description,
          category: hit.category,
          price: hit.price,
          location: hit.location,
          contact_info: hit.contact_info || '',
          latitude: hit.latitude || null,
          longitude: hit.longitude || null,
          created_at: new Date(hit.created_at * 1000).toISOString(),
          updated_at: new Date(hit.created_at * 1000).toISOString(),
          images: hit.image_url
            ? [{ id: 0, ad_id: hit.id, cloudinary_url: hit.image_url, display_order: 0 }]
            : [],
          owner_name: hit.owner_name,
          owner_photo: hit.owner_photo || undefined
        }));

        const totalCount = res.nbHits || 0;
        const totalPgs = res.nbPages || 1;
        const item: FeedCacheItem = { ads: mappedAds, total: totalCount, totalPages: totalPgs };

        setAds(mappedAds);
        setTotal(totalCount);
        setTotalPages(totalPgs);
        feedCache[cacheKey] = item;
        saveFeedToStorage(cacheKey, item);
        setFromCache(false);
      } else {
        // Fall back to category/search database feed if no search query, or Algolia unavailable
        const data = await getAds({ category, search, page, limit });
        const item: FeedCacheItem = { ads: data.ads, total: data.total, totalPages: data.totalPages };
        setAds(data.ads);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        feedCache[cacheKey] = item;
        saveFeedToStorage(cacheKey, item);
        setFromCache(false);
      }
      setError(null);
    } catch (err: any) {
      console.warn('Feed fetch failed, checking localStorage cache...', err.message);
      // Try localStorage fallback when offline or network error
      const persisted = loadFeedFromStorage(cacheKey);
      if (persisted && persisted.ads.length > 0) {
        setAds(persisted.ads);
        setTotal(persisted.total);
        setTotalPages(persisted.totalPages);
        feedCache[cacheKey] = persisted;
        setFromCache(true);
        setError(null);
        console.log(`📦 Loaded ${persisted.ads.length} ads from offline cache.`);
      } else {
        setError(err);
        setFromCache(false);
      }
    } finally {
      setLoading(false);
    }
  }, [category, search, page, limit, cacheKey]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  return { ads, total, totalPages, loading, error, fromCache, limit, refresh: fetchAds };
};

export const useAd = (id: number) => {
  const [ad, setAd] = useState<Ad | null>(adDetailCache[id] || null);
  const [loading, setLoading] = useState(adDetailCache[id] === undefined && !isNaN(id));
  const [error, setError] = useState<Error | null>(null);

  const fetchAd = useCallback(async () => {
    if (isNaN(id)) return;
    try {
      if (adDetailCache[id] === undefined) {
        setLoading(true);
      }
      const data = await getAdById(id);
      setAd(data);
      adDetailCache[id] = data;
      setError(null);
    } catch (err: any) {
      console.error('Error fetching ad detail:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAd();
  }, [fetchAd]);

  return { ad, loading, error, refresh: fetchAd };
};




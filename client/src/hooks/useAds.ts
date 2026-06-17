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
  const cacheKey = `${category || ''}_${search || ''}_${page}`;
  const [ads, setAds] = useState<Ad[]>(feedCache[cacheKey]?.ads || []);
  const [total, setTotal] = useState<number>(feedCache[cacheKey]?.total || 0);
  const [totalPages, setTotalPages] = useState<number>(feedCache[cacheKey]?.totalPages || 1);
  const [loading, setLoading] = useState(feedCache[cacheKey] === undefined);
  const [error, setError] = useState<Error | null>(null);

  const fetchAds = useCallback(async () => {
    try {
      if (feedCache[cacheKey] === undefined) {
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
            hitsPerPage: 12,
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

        setAds(mappedAds);
        setTotal(totalCount);
        setTotalPages(totalPgs);
        feedCache[cacheKey] = { ads: mappedAds, total: totalCount, totalPages: totalPgs };
      } else {
        // Fall back to category/search database feed if no search query is typed, or if Algolia is unavailable
        const data = await getAds({ category, search, page, limit: 12 });
        setAds(data.ads);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        feedCache[cacheKey] = { ads: data.ads, total: data.total, totalPages: data.totalPages };
      }
      setError(null);
    } catch (err: any) {
      console.error('Error fetching feed ads:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [category, search, page, cacheKey]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  return { ads, total, totalPages, loading, error, refresh: fetchAds };
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




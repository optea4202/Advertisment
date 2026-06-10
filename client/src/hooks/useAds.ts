import { useState, useEffect, useCallback } from 'react';
import { getMyAds, getAds, getAdById, type Ad } from '../api/ads.js';

// Client-side in-memory caches
const feedCache: { [key: string]: Ad[] } = {};
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

export const useFeed = (category?: string, search?: string) => {
  const cacheKey = `${category || ''}_${search || ''}`;
  const [ads, setAds] = useState<Ad[]>(feedCache[cacheKey] || []);
  const [loading, setLoading] = useState(feedCache[cacheKey] === undefined);
  const [error, setError] = useState<Error | null>(null);

  const fetchAds = useCallback(async () => {
    try {
      if (feedCache[cacheKey] === undefined) {
        setLoading(true);
      }
      const data = await getAds({ category, search });
      setAds(data);
      feedCache[cacheKey] = data;
      setError(null);
    } catch (err: any) {
      console.error('Error fetching feed ads:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [category, search, cacheKey]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  return { ads, loading, error, refresh: fetchAds };
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




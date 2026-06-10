import { useState, useEffect, useCallback } from 'react';
import { getMyAds, getAds, getAdById, type Ad } from '../api/ads.js';

export const useMyAds = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyAds();
      setAds(data);
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
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAds({ category, search });
      setAds(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching feed ads:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  return { ads, loading, error, refresh: fetchAds };
};

export const useAd = (id: number) => {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAd = useCallback(async () => {
    if (isNaN(id)) return;
    try {
      setLoading(true);
      const data = await getAdById(id);
      setAd(data);
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



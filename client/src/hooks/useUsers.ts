import { useState, useEffect, useCallback } from 'react';
import { getPublicProfile, type PublicProfileData } from '../api/users.js';

// Client-side in-memory cache for profiles
const profileCache: { [id: number]: PublicProfileData } = {};

export const clearProfileCache = () => {
  for (const key in profileCache) {
    delete profileCache[Number(key)];
  }
  console.log('🧹 Profile cache cleared.');
};

export const usePublicProfile = (userId: number) => {
  const [profile, setProfile] = useState<PublicProfileData | null>(profileCache[userId] || null);
  const [loading, setLoading] = useState(profileCache[userId] === undefined && !isNaN(userId) && userId > 0);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    if (isNaN(userId) || userId <= 0) return;
    try {
      if (profileCache[userId] === undefined) {
        setLoading(true);
      }
      const data = await getPublicProfile(userId);
      setProfile(data);
      profileCache[userId] = data;
      setError(null);
    } catch (err: any) {
      console.error('Error fetching public profile:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refresh: fetchProfile };
};


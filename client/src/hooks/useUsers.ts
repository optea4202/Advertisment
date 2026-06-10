import { useState, useEffect, useCallback } from 'react';
import { getPublicProfile, type PublicProfileData } from '../api/users.js';

export const usePublicProfile = (userId: number) => {
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    if (isNaN(userId) || userId <= 0) return;
    try {
      setLoading(true);
      const data = await getPublicProfile(userId);
      setProfile(data);
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

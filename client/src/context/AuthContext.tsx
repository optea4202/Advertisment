import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { fetchMe, type UserProfile } from '../api/users.js';
import api from '../api/index.js';
import { clearAdsCache } from '../hooks/useAds.js';
import { clearProfileCache } from '../hooks/useUsers.js';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: Error | null;
  syncUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, getToken, isLoaded } = useClerkAuth();
  
  // Try to load cached user from localStorage
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem('adhub_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('adhub_user');
      return !cached; // If cached user exists, loading starts as false
    } catch {
      return true;
    }
  });

  const [error, setError] = useState<Error | null>(null);

  // Set up request interceptor to dynamically attach/refresh Clerk JWT on every request
  // Also register response interceptor to automatically invalidate caches on successful mutative operations
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      async (config) => {
        try {
          const token = await getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          } else {
            delete config.headers.Authorization;
          }
        } catch (err) {
          console.error('Error attaching auth token to request:', err);
        }
        return config;
      },
      (err) => {
        return Promise.reject(err);
      }
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => {
        const method = response.config.method?.toUpperCase();
        if (method && ['POST', 'PUT', 'DELETE'].includes(method)) {
          console.log(`🧹 Mutating request (${method} ${response.config.url}) detected. Clearing client caches...`);
          clearAdsCache();
          clearProfileCache();
        }
        return response;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [getToken]);

  const syncUser = async () => {
    try {
      // If we don't have cached user, show loading spinner.
      // If we do, fetch silently in the background
      const hasCache = !!localStorage.getItem('adhub_user');
      if (!hasCache) {
        setLoading(true);
      }
      
      const token = await getToken();
      if (token) {
        const profile = await fetchMe();
        setUser(profile);
        localStorage.setItem('adhub_user', JSON.stringify(profile));
        setError(null);
      } else {
        setUser(null);
        localStorage.removeItem('adhub_user');
      }
    } catch (err: any) {
      console.error('Error syncing user with database:', err);
      setError(err);
      // Clear cache and log out if explicitly unauthorized or banned
      if (err.response?.status === 401 || err.response?.status === 403) {
        setUser(null);
        localStorage.removeItem('adhub_user');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      syncUser();
    } else {
      setUser(null);
      setLoading(false);
      localStorage.removeItem('adhub_user');
    }
  }, [isSignedIn, isLoaded]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: loading || !isLoaded,
        error,
        syncUser,
        isAuthenticated: !!isSignedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


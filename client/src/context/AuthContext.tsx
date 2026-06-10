import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { fetchMe, type UserProfile } from '../api/users.js';
import api from '../api/index.js';

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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Set up request interceptor to dynamically attach/refresh Clerk JWT on every request
  useEffect(() => {
    const interceptor = api.interceptors.request.use(
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

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, [getToken]);

  const syncUser = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (token) {
        const profile = await fetchMe();
        setUser(profile);
        setError(null);
      } else {
        setUser(null);
      }
    } catch (err: any) {
      console.error('Error syncing user with database:', err);
      setError(err);
      setUser(null);
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

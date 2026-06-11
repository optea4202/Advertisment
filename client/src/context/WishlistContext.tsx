import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext.js';
import { getWishlistIds, addToWishlist, removeFromWishlist } from '../api/wishlist.js';

interface WishlistContextType {
  wishlistIds: Set<number>;
  loading: boolean;
  toggleWishlist: (adId: number) => Promise<void>;
  isInWishlist: (adId: number) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchWishlistIds = useCallback(async () => {
    if (!user) {
      setWishlistIds(new Set());
      return;
    }
    setLoading(true);
    try {
      const ids = await getWishlistIds();
      setWishlistIds(new Set(ids));
    } catch (err) {
      console.error('Failed to fetch wishlist IDs:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlistIds();
  }, [fetchWishlistIds]);

  const toggleWishlist = async (adId: number) => {
    if (!user) return;

    const exists = wishlistIds.has(adId);
    
    // Optimistic Update: toggle locally immediately for a fast, premium experience
    setWishlistIds(prev => {
      const next = new Set(prev);
      if (exists) {
        next.delete(adId);
      } else {
        next.add(adId);
      }
      return next;
    });

    try {
      if (exists) {
        await removeFromWishlist(adId);
      } else {
        await addToWishlist(adId);
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
      // Revert change in case of network/server failure
      setWishlistIds(prev => {
        const next = new Set(prev);
        if (exists) {
          next.add(adId);
        } else {
          next.delete(adId);
        }
        return next;
      });
    }
  };

  const isInWishlist = (adId: number) => wishlistIds.has(adId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        loading,
        toggleWishlist,
        isInWishlist,
        refreshWishlist: fetchWishlistIds
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

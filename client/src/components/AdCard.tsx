import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { type Ad } from '../api/ads.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useAuth } from '../context/AuthContext.js';

interface AdCardProps {
  ad: Ad;
  showActions?: boolean;
  onDeleteClick?: (id: number) => void;
  onEditClick?: (id: number) => void;
}

export const AdCard: React.FC<AdCardProps> = ({
  ad,
  showActions = false,
  onDeleteClick,
  onEditClick
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(ad.id);
  const [showShare, setShowShare] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
    } else {
      toggleWishlist(ad.id);
    }
  };

  const adUrl = `${window.location.origin}/ads/${ad.id}`;
  const pageTitle = encodeURIComponent(ad.title ?? 'Check out this ad on Fakna');
  const encodedUrl = encodeURIComponent(adUrl);

  const shareTargets = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
      href: `https://wa.me/?text=${pageTitle}%20${encodedUrl}`,
    },
    {
      id: 'telegram',
      label: 'Telegram',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${pageTitle}`,
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      id: 'twitter',
      label: 'Twitter / X',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/5/57/X_logo_2023_%28white%29.png',
      href: `https://twitter.com/intent/tweet?text=${pageTitle}&url=${encodedUrl}`,
      dark: true,
    },
  ];

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(adUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleShareButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShare(true);
  };

  // Get cover image URL or a placeholder if none exists
  const coverImageUrl = ad.images && ad.images.length > 0 
    ? ad.images[0].cloudinary_url 
    : 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop';

  return (
    <Link 
      to={`/ads/${ad.id}`}
      className="cursor-pointer bg-surface-container-lowest rounded-2xl elevation-1 border border-outline-variant/20 overflow-hidden flex flex-col h-full hover:elevation-2 hover:border-outline-variant/40 transition-all duration-200 no-underline text-inherit"
    >
      
      {/* Ad Image Container */}
      <div className="relative aspect-video w-full bg-surface-container-low overflow-hidden">
        <img 
          src={coverImageUrl} 
          alt={ad.title} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
        />
        
        {/* Wishlist Button Overlay */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-md right-md w-8 h-8 rounded-full bg-surface/85 hover:bg-surface text-on-surface hover:text-error flex items-center justify-center shadow-md backdrop-blur-sm transition-all duration-200 focus:outline-none border border-outline-variant/10 z-10"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <span
            className={`material-symbols-outlined text-[18px] transition-transform active:scale-125 duration-150 ${isWishlisted ? 'text-error' : 'text-on-surface-variant'}`}
            style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
        </button>

        {/* Share Button Overlay */}
        <button
          onClick={handleShareButtonClick}
          className="absolute top-[56px] right-md w-8 h-8 rounded-full bg-surface/85 hover:bg-surface text-on-surface hover:text-primary flex items-center justify-center shadow-md backdrop-blur-sm transition-all duration-200 focus:outline-none border border-outline-variant/10 z-10"
          aria-label="Share this ad"
        >
          <span className="material-symbols-outlined text-[18px]">
            share
          </span>
        </button>

        {/* Share Overlay */}
        {showShare && (
          <div 
            className="absolute inset-0 bg-surface/95 backdrop-blur-md z-20 flex flex-col items-center justify-center p-sm animate-fade-in"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {/* Close button inside share overlay */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowShare(false);
              }}
              className="absolute top-sm right-sm w-7 h-7 rounded-full bg-surface-container hover:bg-surface-container-high text-secondary hover:text-on-surface flex items-center justify-center focus:outline-none border border-outline-variant/10 transition-colors"
              aria-label="Close share menu"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>

            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider mb-sm">
              Share via
            </span>

            {/* Social Share Icons */}
            <div className="flex gap-md justify-center mb-md">
              {shareTargets.map((t) => (
                <a
                  key={t.id}
                  href={t.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShare(false);
                  }}
                  className="flex flex-col items-center gap-[4px] group no-underline"
                  title={`Share on ${t.label}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm border border-outline-variant/15 transition-all group-hover:scale-110 group-hover:shadow-md ${t.dark ? 'bg-black' : 'bg-white'}`}>
                    <img src={t.icon} alt={t.label} className="w-5 h-5 object-contain" />
                  </div>
                  <span className="font-label-sm text-[10px] text-secondary group-hover:text-primary transition-colors">
                    {t.label.split(' ')[0]}
                  </span>
                </a>
              ))}
            </div>

            {/* Copy Link Button */}
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-xs w-4/5 px-sm py-xs rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 transition-all active:scale-[0.98] focus:outline-none"
            >
              <span className={`material-symbols-outlined text-[16px] transition-colors ${copied ? 'text-primary' : 'text-on-surface-variant'}`}>
                {copied ? 'check_circle' : 'link'}
              </span>
              <span className={`font-label-sm text-label-sm transition-colors ${copied ? 'text-primary' : 'text-on-surface-variant'}`}>
                {copied ? 'Link copied!' : 'Copy link'}
              </span>
            </button>
          </div>
        )}
        
        {/* Price Tag Overlay */}
        <div className="absolute bottom-md left-md bg-primary text-on-primary font-label-md text-label-md px-md py-[6px] rounded-lg shadow-sm border-t border-white/20">
          ₹{ad.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Ad Content */}
      <div className="p-lg flex flex-col flex-grow gap-md">
        
        {/* Category Chip */}
        <div className="flex">
          <span className="bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm px-sm py-[4px] rounded-full uppercase tracking-wider">
            {ad.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-headline-md text-headline-md text-on-surface line-clamp-1">
          {ad.title}
        </h3>

        {/* Description Snippet */}
        <p className="font-body-sm text-body-sm text-secondary line-clamp-2">
          {ad.description}
        </p>

        {/* Meta Info (Location & Date) */}
        <div className="flex flex-col gap-xs mt-auto pt-sm border-t border-outline-variant/10 text-secondary font-label-sm text-label-sm">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-[16px] text-secondary">location_on</span>
            <span>{ad.location}</span>
          </div>
          <div className="flex items-center gap-xs text-secondary/70">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span>{new Date(ad.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Dashboard Actions */}
        {showActions && (
          <div className="flex gap-sm mt-md border-t border-outline-variant/10 pt-md">
            {onEditClick && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEditClick(ad.id);
                }}
                className="flex-1 py-xs bg-surface-bright border border-outline-variant text-on-surface hover:bg-surface-container-low font-label-md text-label-md rounded-lg transition-colors flex items-center justify-center gap-sm"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Edit
              </button>
            )}
            
            {onDeleteClick && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDeleteClick(ad.id);
                }}
                className="flex-1 py-xs bg-error-container text-on-error-container hover:bg-error-container/85 border border-error/10 font-label-md text-label-md rounded-lg transition-colors flex items-center justify-center gap-sm"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

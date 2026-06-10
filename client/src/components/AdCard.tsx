import React from 'react';
import { useNavigate } from 'react-router-dom';
import { type Ad } from '../api/ads.js';

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
  const navigate = useNavigate();

  // Get cover image URL or a placeholder if none exists
  const coverImageUrl = ad.images && ad.images.length > 0 
    ? ad.images[0].cloudinary_url 
    : 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop';

  const handleCardClick = (e: React.MouseEvent) => {
    // If the click originated from an interactive element (button or link), do not trigger navigation
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    navigate(`/ads/${ad.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="cursor-pointer bg-surface-container-lowest rounded-2xl elevation-1 border border-outline-variant/20 overflow-hidden flex flex-col h-full hover:elevation-2 hover:border-outline-variant/40 transition-all duration-200"
    >
      
      {/* Ad Image Container */}
      <div className="relative aspect-video w-full bg-surface-container-low overflow-hidden">
        <img 
          src={coverImageUrl} 
          alt={ad.title} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
        />
        
        {/* Price Tag Overlay */}
        <div className="absolute bottom-md left-md bg-primary text-on-primary font-label-md text-label-md px-md py-[6px] rounded-lg shadow-sm border-t border-white/20">
          ${ad.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
    </div>
  );
};

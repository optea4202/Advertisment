import React, { useState } from 'react';
import { type AdImage } from '../api/ads.js';

interface ImageGalleryProps {
  images: AdImage[];
  title: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const fallbackUrl = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop';
  
  const displayImages = images && images.length > 0 
    ? images 
    : [{ id: 0, ad_id: 0, cloudinary_url: fallbackUrl, display_order: 0 }];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col gap-md w-full">
      {/* Main Image Container */}
      <div className="relative aspect-[4/3] md:aspect-video w-full bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm group">
        <img
          src={displayImages[activeIndex].cloudinary_url}
          alt={`${title} - view ${activeIndex + 1}`}
          className="w-full h-full object-cover transition-all duration-300"
        />

        {/* Carousel Controls (Only if > 1 image) */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-md top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface-container-lowest/80 hover:bg-surface-container-lowest backdrop-blur-sm shadow-sm flex items-center justify-center text-on-surface hover:text-primary transition-all active:scale-95 opacity-0 group-hover:opacity-100 focus:opacity-100"
              title="Previous image"
            >
              <span className="material-symbols-outlined text-[24px]">chevron_left</span>
            </button>
            
            <button
              onClick={handleNext}
              className="absolute right-md top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface-container-lowest/80 hover:bg-surface-container-lowest backdrop-blur-sm shadow-sm flex items-center justify-center text-on-surface hover:text-primary transition-all active:scale-95 opacity-0 group-hover:opacity-100 focus:opacity-100"
              title="Next image"
            >
              <span className="material-symbols-outlined text-[24px]">chevron_right</span>
            </button>

            {/* Position indicator pill */}
            <div className="absolute bottom-md right-md bg-inverse-surface/85 backdrop-blur-sm text-inverse-on-surface font-label-sm text-label-sm px-md py-[4px] rounded-full">
              {activeIndex + 1} / {displayImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails Row (Only if > 1 image) */}
      {displayImages.length > 1 && (
        <div className="flex gap-sm overflow-x-auto pb-xs">
          {displayImages.map((img, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={img.id || idx}
                onClick={() => setActiveIndex(idx)}
                className={`relative aspect-square w-16 md:w-20 rounded-lg overflow-hidden border bg-surface-container-low transition-all focus:outline-none flex-shrink-0 ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 scale-[0.98]'
                    : 'border-outline-variant hover:border-secondary'
                }`}
              >
                <img
                  src={img.cloudinary_url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

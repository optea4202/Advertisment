import React, { useState, useEffect, useRef } from 'react';
import { type AdImage } from '../api/ads.js';

interface ImageGalleryProps {
  images: AdImage[];
  title: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const dragStart = useRef({ x: 0, y: 0 });
  const lightboxRef = useRef<HTMLDivElement>(null);

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

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleLightboxPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    handlePrev();
    resetZoom();
  };

  const handleLightboxNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleNext();
    resetZoom();
  };

  const handleZoomInClick = () => {
    setScale((prev) => Math.min(prev + 0.5, 5));
  };

  const handleZoomOutClick = () => {
    setScale((prev) => {
      const nextScale = Math.max(prev - 0.5, 1);
      if (nextScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return nextScale;
    });
  };

  const setZoomPreset = (preset: 'small' | 'medium' | 'large') => {
    if (preset === 'small') {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else if (preset === 'medium') {
      setScale(2.5);
      setPosition({ x: 0, y: 0 });
    } else if (preset === 'large') {
      setScale(4);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    e.preventDefault();
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale <= 1) return;
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStart.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || scale <= 1) return;
    if (e.touches.length === 1) {
      const newX = e.touches[0].clientX - dragStart.current.x;
      const newY = e.touches[0].clientY - dragStart.current.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2.5);
      setPosition({ x: 0, y: 0 });
    }
  };

  // Prevent scroll when scroll wheel zooming inside Lightbox
  useEffect(() => {
    const handleWheelRaw = (e: WheelEvent) => {
      if (!isLightboxOpen) return;
      e.preventDefault();
      const zoomIntensity = 0.15;
      let newScale = scale + (e.deltaY < 0 ? zoomIntensity : -zoomIntensity);
      newScale = Math.min(Math.max(1, newScale), 5);
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
      setScale(newScale);
    };

    const container = lightboxRef.current;
    if (isLightboxOpen && container) {
      container.addEventListener('wheel', handleWheelRaw, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheelRaw);
      }
    };
  }, [isLightboxOpen, scale]);

  // Lock body scroll when Lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  // Keyboard navigation inside Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowRight') {
        handleNext();
        resetZoom();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
        resetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, activeIndex]);

  return (
    <div className="flex flex-col gap-md w-full">
      {/* Main Image Container */}
      <div className="relative aspect-[4/3] md:aspect-video w-full bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm group">
        <img
          src={displayImages[activeIndex].cloudinary_url}
          alt={`${title} - view ${activeIndex + 1}`}
          onClick={() => {
            resetZoom();
            setIsLightboxOpen(true);
          }}
          className="w-full h-full object-cover transition-all duration-300 cursor-zoom-in hover:scale-[1.01]"
        />

        {/* Floating Zoom Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            resetZoom();
            setIsLightboxOpen(true);
          }}
          className="absolute top-md right-md w-10 h-10 rounded-full bg-surface-container-lowest/80 hover:bg-surface-container-lowest backdrop-blur-sm shadow-sm flex items-center justify-center text-on-surface hover:text-primary transition-all active:scale-95 opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
          title="Zoom image"
        >
          <span className="material-symbols-outlined text-[24px]">zoom_in</span>
        </button>

        {/* Carousel Controls (Only if > 1 image) */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-md top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface-container-lowest/80 hover:bg-surface-container-lowest backdrop-blur-sm shadow-sm flex items-center justify-center text-on-surface hover:text-primary transition-all active:scale-95 opacity-0 group-hover:opacity-100 focus:opacity-100"
              title="Previous image"
            >
              <span className="material-symbols-outlined text-[24px]">chevron_left</span>
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
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

      {/* Full Screen Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          ref={lightboxRef}
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center select-none animate-fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Zoom controls toolbar */}
          <div 
            className="absolute top-6 left-1/2 -translate-x-1/2 bg-neutral-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 flex items-center gap-4 z-50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Zoom Out */}
            <button
              onClick={handleZoomOutClick}
              disabled={scale <= 1}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center disabled:opacity-30 disabled:hover:bg-white/5 transition-all"
              title="Zoom out"
            >
              <span className="material-symbols-outlined text-[20px]">zoom_out</span>
            </button>

            {/* Scale Value */}
            <span className="text-white/80 font-mono text-sm min-w-[48px] text-center">
              {Math.round(scale * 100)}%
            </span>

            {/* Zoom In */}
            <button
              onClick={handleZoomInClick}
              disabled={scale >= 5}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center disabled:opacity-30 disabled:hover:bg-white/5 transition-all"
              title="Zoom in"
            >
              <span className="material-symbols-outlined text-[20px]">zoom_in</span>
            </button>

            <div className="h-5 w-[1px] bg-white/20" />

            {/* Size Presets: Small, Medium, Large */}
            <div className="flex gap-2 bg-black/30 p-1 rounded-full border border-white/5">
              <button
                onClick={() => setZoomPreset('small')}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                  Math.abs(scale - 1) < 0.1
                    ? 'bg-primary text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Small
              </button>
              <button
                onClick={() => setZoomPreset('medium')}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                  Math.abs(scale - 2.5) < 0.1
                    ? 'bg-primary text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => setZoomPreset('large')}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                  Math.abs(scale - 4) < 0.1
                    ? 'bg-primary text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Large
              </button>
            </div>

            <div className="h-5 w-[1px] bg-white/20" />

            {/* Reset */}
            <button
              onClick={resetZoom}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all"
              title="Reset Zoom"
            >
              <span className="material-symbols-outlined text-[20px]">restart_alt</span>
            </button>
          </div>

          {/* Close button at top right */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center z-50 shadow-lg border border-white/10 transition-all hover:scale-105 active:scale-95"
            title="Close"
          >
            <span className="material-symbols-outlined text-[28px]">close</span>
          </button>

          {/* Navigation Controls (Overlay Chevrons) */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={handleLightboxPrev}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/45 hover:bg-black/60 border border-white/10 text-white flex items-center justify-center transition-all z-50 active:scale-95"
                title="Previous image"
              >
                <span className="material-symbols-outlined text-[36px]">chevron_left</span>
              </button>
              
              <button
                onClick={handleLightboxNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/45 hover:bg-black/60 border border-white/10 text-white flex items-center justify-center transition-all z-50 active:scale-95"
                title="Next image"
              >
                <span className="material-symbols-outlined text-[36px]">chevron_right</span>
              </button>
            </>
          )}

          {/* Image Display Area */}
          <div 
            className="relative w-full h-full flex items-center justify-center overflow-hidden"
            onClick={() => setIsLightboxOpen(false)}
          >
            <img
              src={displayImages[activeIndex].cloudinary_url}
              alt={title}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onDoubleClick={handleDoubleClick}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                maxHeight: '85vh',
                maxWidth: '90vw',
              }}
              className={`object-contain select-none shadow-2xl rounded-lg max-h-[85vh] max-w-[90vw] ${
                scale > 1 
                  ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') 
                  : 'cursor-default'
              }`}
            />
          </div>

          {/* Position Indicator */}
          <div className="absolute bottom-6 bg-neutral-900/80 backdrop-blur-md text-white/90 text-sm px-5 py-2 rounded-full border border-white/10 font-medium">
            {activeIndex + 1} / {displayImages.length}
          </div>
        </div>
      )}
    </div>
  );
};


import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { ImageGallery } from '../components/ImageGallery.js';
import { useAd } from '../hooks/useAds.js';
import { useAuth } from '../context/AuthContext.js';
import { useReviews } from '../hooks/useReviews.js';
import { ReviewForm } from '../components/ReviewForm.js';
import { ReviewList } from '../components/ReviewList.js';
import { startConversation } from '../api/chats.js';
import { useWishlist } from '../context/WishlistContext.js';
import { ReportModal } from '../components/ReportModal.js';

export const AdDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const adId = parseInt(id || '');

  const { user } = useAuth();
  const { ad, loading, error, refresh } = useAd(adId);
  const { reviews, loading: loadingReviews, error: errorReviews, addReview } = useReviews(adId);
  const { isInWishlist, toggleWishlist } = useWishlist();

  const navigate = useNavigate();
  const [startingChat, setStartingChat] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  const [reportType, setReportType] = useState<'ad' | 'review' | null>(null);
  const [reportItemId, setReportItemId] = useState<number | null>(null);

  // Close share sheet when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShowShareSheet(false);
      }
    };
    if (showShareSheet) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showShareSheet]);

  const pageUrl = window.location.href;
  const pageTitle = encodeURIComponent(ad?.title ?? 'Check out this ad on Fakna');
  const encodedUrl = encodeURIComponent(pageUrl);

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

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isOwner = user?.id === ad?.owner_id;
  const isWishlisted = ad ? isInWishlist(ad.id) : false;

  const handleChatWithSeller = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!ad) return;
    setStartingChat(true);
    try {
      const conv = await startConversation(ad.owner_id, adId);
      navigate(`/inbox?chatId=${conv.id}`, {
        state: {
          other_user_id: ad.owner_id,
          other_user_name: ad.owner_name,
          other_user_photo: ad.owner_photo,
          ad_title: ad.title
        }
      });
    } catch {
      // Silently fail — user stays on page
    } finally {
      setStartingChat(false);
    }
  };

  const handleReviewSubmit = async (comment: string) => {
    await addReview(comment);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow w-full max-w-container-max mx-auto px-md md:px-xl py-xl flex flex-col gap-lg">
        {/* Back Link */}
        <div className="py-xs">
          <Link 
            to="/" 
            className="inline-flex items-center gap-xs text-secondary hover:text-primary transition-colors font-label-md text-label-md"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Home
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-xl bg-error-container text-on-error-container rounded-2xl border border-error/10 flex flex-col gap-md items-center justify-center text-center max-w-xl mx-auto mt-lg">
            <span className="material-symbols-outlined text-[48px] text-error">error</span>
            <div>
              <h3 className="font-headline-md text-[18px] font-semibold">Failed to load advertisement</h3>
              <p className="font-body-sm text-body-sm text-on-error-container/85 mt-xs">
                We couldn't fetch details for this advertisement. It might have been deleted or there was a network error.
              </p>
            </div>
            <button 
              onClick={refresh}
              className="bg-error text-on-error font-label-md text-label-md px-lg py-sm rounded-lg hover:brightness-110 transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {!error && loading && (
          <div className="flex-grow flex flex-col items-center justify-center py-[100px] gap-md">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="font-label-sm text-label-sm text-secondary">Loading advertisement details...</p>
          </div>
        )}

        {/* Main Content Layout */}
        {!error && !loading && ad && (
          <div className="flex flex-col gap-xl">
            
            {/* Bento Grid: Gallery on left (7 cols), Details on right (5 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
              
              {/* Left Column: Image Gallery + Description */}
              <div className="lg:col-span-7 flex flex-col gap-lg w-full">
                <ImageGallery images={ad.images} title={ad.title} />

                {/* Description Block — below the image */}
                <div className="bg-surface-container-lowest rounded-2xl elevation-1 border border-outline-variant/20 p-xl flex flex-col gap-md">
                  <h3 className="font-headline-md text-[20px] font-semibold text-on-surface border-b border-outline-variant/10 pb-sm">
                    Description
                  </h3>
                  <p className="font-body-md text-body-md text-secondary leading-relaxed whitespace-pre-line">
                    {ad.description}
                  </p>
                </div>
              </div>

              {/* Right Column: Ad Details */}
              <div className="lg:col-span-5 flex flex-col gap-lg w-full">
                
                {/* Meta details card */}
                <div className="bg-surface-container-lowest rounded-2xl elevation-1 border border-outline-variant/20 p-xl flex flex-col gap-lg">
                  {/* Category & Title with Wishlist Toggle */}
                  <div className="flex flex-col gap-sm">
                    <div className="flex justify-between items-center">
                      <span className="bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm px-sm py-[4px] rounded-full uppercase tracking-wider">
                        {ad.category}
                      </span>

                      {/* Wishlist Button */}
                      <button
                        onClick={() => {
                          if (!user) {
                            navigate('/login');
                          } else {
                            toggleWishlist(ad.id);
                          }
                        }}
                        className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface hover:text-error flex items-center justify-center shadow-sm border border-outline-variant/10 transition-all duration-200 focus:outline-none active:scale-[0.95]"
                        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <span
                          className={`material-symbols-outlined text-[22px] transition-transform ${isWishlisted ? 'text-error animate-pulse' : 'text-on-surface-variant'}`}
                          style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          favorite
                        </span>
                      </button>
                    </div>
                    <h2 className="font-headline-lg text-[26px] md:text-headline-lg font-bold text-on-surface leading-tight tracking-tight">
                      {ad.title}
                    </h2>
                  </div>

                  {/* Price Tag */}
                  <div className="flex flex-col gap-xs border-y border-outline-variant/10 py-md">
                    <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Price</span>
                    <span className="font-display-lg text-headline-lg text-primary font-bold">
                      ₹{ad.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Meta details (Location & Timestamps) */}
                  <div className="flex flex-col gap-sm text-secondary font-body-sm text-body-sm">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-secondary text-[20px]">location_on</span>
                      <span>{ad.location}</span>
                    </div>

                    {/* Small Google Map (OLX style, placed between location text and posted date) */}
                    {ad.location && (
                      <div className="w-full rounded-xl overflow-hidden border border-outline-variant/20 shadow-sm my-xs">
                        <iframe
                          title="Ad location map"
                          width="100%"
                          height="150"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          src={
                            typeof ad.latitude === 'number' && typeof ad.longitude === 'number'
                              ? `https://maps.google.com/maps?q=${ad.latitude},${ad.longitude}&z=15&output=embed`
                              : `https://maps.google.com/maps?q=${encodeURIComponent(ad.location)}&z=15&output=embed`
                          }
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-secondary text-[20px]">calendar_today</span>
                      <span>Posted on {new Date(ad.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                    </div>
                  </div>

                  {/* Contact Info block */}
                  <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-md flex flex-col gap-xs">
                    <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[16px] text-primary">contact_phone</span>
                      Contact Information
                    </span>
                    <p className="font-body-md text-body-md text-on-surface whitespace-pre-line mt-xs">
                      {ad.contact_info}
                    </p>
                  </div>

                  {/* Share Section */}
                  <div ref={shareRef} className="relative">
                    {/* Toggle button */}
                    <button
                      id="share-ad-btn"
                      onClick={() => setShowShareSheet(v => !v)}
                      className="w-full flex items-center justify-center gap-sm border border-outline-variant/30 bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary font-label-md text-label-md px-md py-[9px] rounded-xl transition-all duration-200 active:scale-[0.98] focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[18px]">share</span>
                      Share this Ad
                    </button>

                    {/* Share sheet dropdown */}
                    {showShareSheet && (
                      <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-50 bg-surface-container-lowest border border-outline-variant/25 rounded-2xl shadow-lg p-md flex flex-col gap-sm animate-fade-in-up-sheet">
                        <p className="font-label-sm text-label-sm text-secondary uppercase tracking-wider px-xs pb-xs border-b border-outline-variant/10">Share via</p>

                        {/* App buttons */}
                        <div className="flex gap-sm justify-around px-xs py-xs">
                          {shareTargets.map(t => (
                            <a
                              key={t.id}
                              href={t.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setShowShareSheet(false)}
                              className="flex flex-col items-center gap-[5px] group"
                              title={`Share on ${t.label}`}
                            >
                              <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-sm border border-outline-variant/15 transition-all group-hover:scale-110 group-hover:shadow-md ${ t.dark ? 'bg-black' : 'bg-white' }`}>
                                <img src={t.icon} alt={t.label} className="w-6 h-6 object-contain" />
                              </div>
                              <span className="font-label-sm text-[10px] text-secondary group-hover:text-primary transition-colors">{t.label}</span>
                            </a>
                          ))}
                        </div>

                        {/* Copy Link */}
                        <button
                          onClick={handleCopyLink}
                          className="flex items-center gap-sm w-full px-md py-[9px] rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 transition-all active:scale-[0.98] focus:outline-none"
                        >
                          <span className={`material-symbols-outlined text-[18px] transition-colors ${ copied ? 'text-primary' : 'text-on-surface-variant' }`}>
                            {copied ? 'check_circle' : 'link'}
                          </span>
                          <span className={`font-label-md text-label-md transition-colors ${ copied ? 'text-primary' : 'text-on-surface-variant' }`}>
                            {copied ? 'Link copied!' : 'Copy link'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Report Section */}
                  {!isOwner && (
                    <button
                      onClick={() => {
                        if (!user) {
                          navigate('/login');
                        } else {
                          setReportType('ad');
                          setReportItemId(adId);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-sm border border-error/30 bg-error-container hover:bg-error-container/80 text-on-error-container font-label-md text-label-md px-md py-[9px] rounded-xl transition-all duration-200 active:scale-[0.98] focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[18px]">flag</span>
                      Report this Ad
                    </button>
                  )}

                </div>

                {/* Publisher info card — links to the owner's public profile */}
                <Link
                  to={`/profile/${ad.owner_id}`}
                  className="bg-surface-container-lowest rounded-2xl elevation-1 border border-outline-variant/20 p-lg flex items-center gap-md hover:border-primary/30 hover:shadow-2 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center overflow-hidden">
                    {ad.owner_photo ? (
                      <img src={ad.owner_photo} alt={ad.owner_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary-fixed flex items-center justify-center text-primary font-bold uppercase">
                        {ad.owner_name?.substring(0, 2)}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-grow">
                    <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Posted By</span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold mt-[2px] group-hover:text-primary transition-colors">{ad.owner_name}</span>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-secondary group-hover:text-primary transition-colors">chevron_right</span>
                </Link>

                {/* Chat with Seller CTA — hidden for the ad owner */}
                {!isOwner && (
                  <button
                    id="chat-with-seller-btn"
                    onClick={handleChatWithSeller}
                    disabled={startingChat}
                    className="w-full flex items-center justify-center gap-sm bg-primary text-on-primary font-label-md text-label-md px-md py-[10px] rounded-xl shadow-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {startingChat ? (
                      <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                    )}
                    {startingChat ? 'Opening chat…' : 'Chat with Seller'}
                  </button>
                )}

              </div>
            </div>




            {/* Reviews Section */}
            <div className="bg-surface-container-lowest rounded-2xl elevation-1 border border-outline-variant/20 p-xl flex flex-col gap-lg">
              <h3 className="font-headline-md text-[20px] font-semibold text-on-surface border-b border-outline-variant/10 pb-sm">
                Comments
              </h3>

              {/* Leave review form (Hidden for guests and the ad owner) */}
              {user && !isOwner && ad && (
                <div className="mb-md">
                  <ReviewForm onSubmit={handleReviewSubmit} />
                </div>
              )}

              <ReviewList 
                reviews={reviews} 
                loading={loadingReviews} 
                error={errorReviews} 
                onReportReview={(reviewId) => {
                  if (!user) {
                    navigate('/login');
                  } else {
                    setReportType('review');
                    setReportItemId(reviewId);
                  }
                }}
              />
            </div>

          </div>
        )}
      </main>
      <Footer />

      {reportType && reportItemId && (
        <ReportModal 
          type={reportType} 
          itemId={reportItemId} 
          onClose={() => {
            setReportType(null);
            setReportItemId(null);
          }} 
        />
      )}
    </div>
  );
};

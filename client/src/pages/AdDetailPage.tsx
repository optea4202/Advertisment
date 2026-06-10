import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar.js';
import { ImageGallery } from '../components/ImageGallery.js';
import { useAd } from '../hooks/useAds.js';
import { useAuth } from '../context/AuthContext.js';
import { useReviews } from '../hooks/useReviews.js';
import { ReviewForm } from '../components/ReviewForm.js';
import { ReviewList } from '../components/ReviewList.js';

export const AdDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const adId = parseInt(id || '');

  const { user } = useAuth();
  const { ad, loading, error, refresh } = useAd(adId);
  const { reviews, loading: loadingReviews, error: errorReviews, addReview } = useReviews(adId);

  const isOwner = user?.id === ad?.owner_id;

  const handleReviewSubmit = async (rating: number, comment: string) => {
    await addReview(rating, comment);
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
            Back to Feed
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
              
              {/* Left Column: Image Gallery */}
              <div className="lg:col-span-7 flex flex-col gap-lg w-full">
                <ImageGallery images={ad.images} title={ad.title} />
              </div>

              {/* Right Column: Ad Details */}
              <div className="lg:col-span-5 flex flex-col gap-lg w-full">
                
                {/* Meta details card */}
                <div className="bg-surface-container-lowest rounded-2xl elevation-1 border border-outline-variant/20 p-xl flex flex-col gap-lg">
                  
                  {/* Category & Title */}
                  <div className="flex flex-col gap-sm">
                    <div className="flex">
                      <span className="bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm px-sm py-[4px] rounded-full uppercase tracking-wider">
                        {ad.category}
                      </span>
                    </div>
                    <h2 className="font-headline-lg text-[26px] md:text-headline-lg font-bold text-on-surface leading-tight tracking-tight">
                      {ad.title}
                    </h2>
                  </div>

                  {/* Price Tag */}
                  <div className="flex flex-col gap-xs border-y border-outline-variant/10 py-md">
                    <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Price</span>
                    <span className="font-display-lg text-headline-lg text-primary font-bold">
                      ${ad.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Meta details (Location & Timestamps) */}
                  <div className="flex flex-col gap-sm text-secondary font-body-sm text-body-sm">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-secondary text-[20px]">location_on</span>
                      <span>{ad.location}</span>
                    </div>
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

              </div>
            </div>

            {/* Description Block */}
            <div className="bg-surface-container-lowest rounded-2xl elevation-1 border border-outline-variant/20 p-xl flex flex-col gap-md">
              <h3 className="font-headline-md text-[20px] font-semibold text-on-surface border-b border-outline-variant/10 pb-sm">
                Description
              </h3>
              <p className="font-body-md text-body-md text-secondary leading-relaxed whitespace-pre-line">
                {ad.description}
              </p>
            </div>

            {/* Reviews Section */}
            <div className="bg-surface-container-lowest rounded-2xl elevation-1 border border-outline-variant/20 p-xl flex flex-col gap-lg">
              <h3 className="font-headline-md text-[20px] font-semibold text-on-surface border-b border-outline-variant/10 pb-sm">
                Ratings & Reviews
              </h3>

              {/* Leave review form (Hidden for the ad owner) */}
              {!isOwner && ad && (
                <div className="mb-md">
                  <ReviewForm onSubmit={handleReviewSubmit} />
                </div>
              )}

              <ReviewList reviews={reviews} loading={loadingReviews} error={errorReviews} />
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

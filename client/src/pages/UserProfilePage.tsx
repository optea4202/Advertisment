import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar.js';
import { getPageBySlug } from '../api/pages.js';
import { Footer } from '../components/Footer.js';
import { AdCard } from '../components/AdCard.js';
import { usePublicProfile } from '../hooks/useUsers.js';
import { useAuth } from '../context/AuthContext.js';
import { deleteAd, type Ad } from '../api/ads.js';
import { startConversation } from '../api/chats.js';
import { getWishlist } from '../api/wishlist.js';
import { useWishlist } from '../context/WishlistContext.js';
import { ReportModal } from '../components/ReportModal.js';
import { useUserReviews } from '../hooks/useUserReviews.js';
import { ProfileReviewForm } from '../components/ProfileReviewForm.js';
import { ProfileReviewList } from '../components/ProfileReviewList.js';

export const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [featuredAdIds, setFeaturedAdIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchFeaturedIds = async () => {
      try {
        const data = await getPageBySlug('home');
        setFeaturedAdIds(data.featured_ad_ids || []);
      } catch (err) {
        console.error('Failed to fetch featured ad ids:', err);
      }
    };
    fetchFeaturedIds();
  }, []);
  const numericId = Number(id);
  const { profile, loading, error, refresh } = usePublicProfile(numericId);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const isOwnProfile = currentUser?.id === numericId;
  const [startingChat, setStartingChat] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Wishlist state and hooks
  const { wishlistIds } = useWishlist();
  const [activeTab, setActiveTab] = useState<'ads' | 'wishlist' | 'reviews'>('ads');
  const [wishlistAds, setWishlistAds] = useState<Ad[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [wishlistError, setWishlistError] = useState<Error | null>(null);

  // Profile reviews hook
  const { 
    reviews: profileReviews, 
    loading: loadingProfileReviews, 
    error: errorProfileReviews, 
    addUserReview, 
    removeUserReview 
  } = useUserReviews(numericId);

  const existingReview = profileReviews.find(r => r.reviewer_id === currentUser?.id);

  const handleProfileReviewSubmit = async (rating: number, comment: string) => {
    await addUserReview(rating, comment);
    await refresh(); // refresh the profile header stats
  };

  const handleDeleteProfileReview = async (reviewId: number, reviewerName: string) => {
    if (window.confirm(`Are you sure you want to delete the review by "${reviewerName}"?`)) {
      try {
        await removeUserReview(reviewId);
        await refresh(); // refresh the stats in the profile header
      } catch (err) {
        console.error('Failed to delete review:', err);
      }
    }
  };

  const fetchWishlistAds = async () => {
    setLoadingWishlist(true);
    try {
      const data = await getWishlist();
      setWishlistAds(data);
      setWishlistError(null);
    } catch (err: any) {
      console.error('Failed to fetch wishlist ads:', err);
      setWishlistError(err);
    } finally {
      setLoadingWishlist(false);
    }
  };

  React.useEffect(() => {
    if (isOwnProfile && activeTab === 'wishlist') {
      fetchWishlistAds();
    }
  }, [activeTab, isOwnProfile]);

  // Dynamically filter out removed wishlist items for a premium reactive UI
  React.useEffect(() => {
    if (isOwnProfile && wishlistAds.length > 0) {
      setWishlistAds(prev => prev.filter(ad => wishlistIds.has(ad.id)));
    }
  }, [wishlistIds, isOwnProfile]);

  const handleMessageUser = async () => {
    if (!profile) return;
    setStartingChat(true);
    try {
      const conv = await startConversation(profile.user.id, null);
      navigate(`/inbox?chatId=${conv.id}`, {
        state: {
          other_user_id: profile.user.id,
          other_user_name: profile.user.username,
          other_user_photo: profile.user.photo_url ?? null,
          ad_title: null,
        }
      });
    } catch {
      // silently fail
    } finally {
      setStartingChat(false);
    }
  };

  const handleEditClick = (adId: number) => {
    navigate(`/ads/edit/${adId}`);
  };

  const handleDeleteClick = async (adId: number) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      try {
        await deleteAd(adId);
        await refresh();
      } catch (err) {
        console.error('Failed to delete ad:', err);
        alert('Failed to delete advertisement. Please try again.');
      }
    }
  };

  const joinedDate = profile?.user.created_at
    ? new Date(profile.user.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
      })
    : null;

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow w-full max-w-container-max mx-auto px-md md:px-xl py-xl flex flex-col gap-xl">

        {/* Loading State */}
        {loading && (
          <div className="flex-grow flex flex-col items-center justify-center py-[100px] gap-md">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="font-label-sm text-label-sm text-secondary">Loading profile...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex-grow flex flex-col items-center justify-center py-[100px] gap-md text-center">
            <div className="w-20 h-20 rounded-full bg-error-container flex items-center justify-center">
              <span className="material-symbols-outlined text-error text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>person_off</span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md text-on-surface">Profile Not Found</h1>
              <p className="font-body-md text-body-md text-secondary mt-xs">This user profile doesn't exist or is not accessible.</p>
            </div>
            <Link to="/" className="mt-sm bg-primary text-on-primary font-label-md text-label-md px-xl py-sm rounded-lg hover:brightness-110 transition-all">
              Back to Home
            </Link>
          </div>
        )}

        {/* Profile Content */}
        {!loading && !error && profile && (
          <>
            {/* Profile Header Card */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-1 border border-outline-variant/30 overflow-hidden">
              {/* Cover gradient banner */}
              <div className="h-32 md:h-48 bg-gradient-to-br from-primary/30 via-primary/10 to-surface-container-low relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 to-transparent"></div>
              </div>

              {/* Profile info row */}
              <div className="px-lg md:px-xl pb-lg md:pb-xl relative">
                {/* Avatar — overlaps the banner */}
                <div className="-mt-14 md:-mt-16 mb-md flex items-end justify-between">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-surface-container-lowest bg-surface-container overflow-hidden shadow-2">
                    {profile.user.photo_url ? (
                      <img
                        src={profile.user.photo_url}
                        alt={profile.user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-[40px] uppercase">
                        {profile.user.username.substring(0, 2)}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-sm mt-2">
                    {isOwnProfile && (
                      <Link
                        to="/settings"
                        className="flex items-center gap-xs bg-surface-container text-on-surface border border-outline-variant font-label-md text-label-md px-md py-xs rounded-lg hover:bg-surface-container-high transition-all active:scale-[0.98]"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        Edit Profile
                      </Link>
                    )}
                    {!isOwnProfile && currentUser && (
                      <button
                        onClick={handleMessageUser}
                        disabled={startingChat}
                        className="flex items-center gap-xs bg-primary text-on-primary font-label-md text-label-md px-md py-xs rounded-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {startingChat ? (
                          <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                        ) : (
                          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                        )}
                        {startingChat ? 'Opening…' : 'Message'}
                      </button>
                    )}
                    {!isOwnProfile && (
                      <button
                        onClick={() => {
                          if (!currentUser) {
                            navigate('/login');
                          } else {
                            setShowReportModal(true);
                          }
                        }}
                        className="flex items-center gap-xs bg-error-container text-on-error-container border border-error/20 font-label-md text-label-md px-md py-xs rounded-lg hover:bg-error-container/80 transition-all active:scale-[0.98]"
                      >
                        <span className="material-symbols-outlined text-[16px]">flag</span>
                        Report
                      </button>
                    )}
                  </div>
                </div>

                {/* Username & bio */}
                <div className="flex flex-col gap-xs">
                  <div className="flex items-center gap-sm flex-wrap">
                    <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface tracking-tight">
                      {profile.user.username}
                    </h1>
                    {isOwnProfile && (
                      <span className="bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm px-sm py-[3px] rounded-full">
                        You
                      </span>
                    )}
                  </div>

                  {profile.user.bio && (
                    <p className="font-body-md text-body-md text-secondary max-w-[600px]">
                      {profile.user.bio}
                    </p>
                  )}

                  <div className="flex items-center gap-md mt-sm flex-wrap">
                    <span className="flex items-center gap-xs font-label-sm text-label-sm text-secondary">
                      <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                      Member since {joinedDate}
                    </span>
                    <span className="flex items-center gap-xs font-label-sm text-label-sm text-secondary">
                      <span className="material-symbols-outlined text-[16px]">campaign</span>
                      {profile.ads.length} {profile.ads.length === 1 ? 'advertisement' : 'advertisements'}
                    </span>
                    <span className="flex items-center gap-xs font-label-sm text-label-sm text-secondary">
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1", color: '#ffb700' }}>star</span>
                      {profile.avg_rating !== undefined && profile.avg_rating !== null ? Number(profile.avg_rating).toFixed(1) : '0.0'} ({profile.total_reviews || 0} {profile.total_reviews === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ads Grid Section */}
            <div className="flex flex-col gap-lg">
              {/* Tabs selection */}
              <div className="flex border-b border-outline-variant/30 gap-md mb-xs">
                <button
                  onClick={() => setActiveTab('ads')}
                  className={`pb-sm font-label-md text-label-md transition-all border-b-2 px-xs flex items-center gap-xs ${
                    activeTab === 'ads'
                      ? 'border-primary text-primary font-bold'
                      : 'border-transparent text-secondary hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">campaign</span>
                  {isOwnProfile ? 'My Ads' : 'Ads'} ({profile.ads.length})
                </button>
                {isOwnProfile && (
                  <button
                    onClick={() => setActiveTab('wishlist')}
                    className={`pb-sm font-label-md text-label-md transition-all border-b-2 px-xs flex items-center gap-xs ${
                      activeTab === 'wishlist'
                        ? 'border-primary text-primary font-bold'
                        : 'border-transparent text-secondary hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">favorite</span>
                    My Wishlist ({wishlistIds.size})
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-sm font-label-md text-label-md transition-all border-b-2 px-xs flex items-center gap-xs ${
                    activeTab === 'reviews'
                      ? 'border-primary text-primary font-bold'
                      : 'border-transparent text-secondary hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">rate_review</span>
                  Reviews ({profile.total_reviews || 0})
                </button>
              </div>

              {activeTab === 'ads' && (
                profile.ads.length === 0 ? (
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl py-[80px] px-xl flex flex-col items-center justify-center text-center gap-md shadow-1">
                    <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-[32px]">campaign</span>
                    </div>
                    <div>
                      <h3 className="font-headline-md text-[18px] font-semibold text-on-surface">No Advertisements Yet</h3>
                      <p className="font-body-sm text-body-sm text-secondary mt-xs max-w-[350px] mx-auto">
                        {isOwnProfile ? "You haven't posted any ads yet. Create your first one!" : 'This user has no active advertisements.'}
                      </p>
                    </div>
                    {isOwnProfile && (
                      <Link
                        to="/ads/create"
                        className="mt-sm bg-primary text-on-primary font-label-md text-label-md px-xl py-sm rounded-lg hover:brightness-110 transition-all flex items-center gap-xs"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Post Your First Ad
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
                    {profile.ads.map((ad) => (
                      <AdCard
                        key={ad.id}
                        ad={ad}
                        showActions={isOwnProfile}
                        onEditClick={handleEditClick}
                        onDeleteClick={handleDeleteClick}
                        isFeatured={featuredAdIds.includes(ad.id)}
                      />
                    ))}
                  </div>
                )
              )}

              {activeTab === 'wishlist' && isOwnProfile && (
                loadingWishlist ? (
                  <div className="flex flex-col items-center justify-center py-[80px] gap-md">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="font-label-sm text-label-sm text-secondary">Loading wishlist...</p>
                  </div>
                ) : wishlistError ? (
                  <div className="text-center py-[40px] text-error font-body-md">
                    Failed to load wishlist items. Please try again.
                  </div>
                ) : wishlistAds.length === 0 ? (
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl py-[80px] px-xl flex flex-col items-center justify-center text-center gap-md shadow-1">
                    <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-[32px]">favorite</span>
                    </div>
                    <div>
                      <h3 className="font-headline-md text-[18px] font-semibold text-on-surface">Your Wishlist is Empty</h3>
                      <p className="font-body-sm text-body-sm text-secondary mt-xs max-w-[350px] mx-auto">
                        Save ads you like by clicking the love symbol button on the marketplace.
                      </p>
                    </div>
                    <Link
                      to="/"
                      className="mt-sm bg-primary text-on-primary font-label-md text-label-md px-xl py-sm rounded-lg hover:brightness-110 transition-all flex items-center gap-xs"
                    >
                      <span className="material-symbols-outlined text-[18px]">explore</span>
                      Browse Home
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter animate-fade-in">
                    {wishlistAds.map((ad) => (
                      <AdCard
                        key={ad.id}
                        ad={ad}
                        showActions={false}
                        isFeatured={featuredAdIds.includes(ad.id)}
                      />
                    ))}
                  </div>
                )
              )}

              {activeTab === 'reviews' && (
                <div className="flex flex-col gap-lg animate-fade-in">
                  {currentUser && !isOwnProfile && (
                    <div className="mb-md">
                      <ProfileReviewForm 
                        onSubmit={handleProfileReviewSubmit}
                        initialRating={existingReview?.star_rating || 0}
                        initialComment={existingReview?.review_text || ''}
                        isUpdate={!!existingReview}
                      />
                    </div>
                  )}

                  <ProfileReviewList 
                    reviews={profileReviews}
                    loading={loadingProfileReviews}
                    error={errorProfileReviews}
                    onDeleteReview={handleDeleteProfileReview}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </main>
      <Footer />

      {showReportModal && profile && (
        <ReportModal
          type="user"
          itemId={profile.user.id}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};

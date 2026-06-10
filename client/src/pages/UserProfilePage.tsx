import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar.js';
import { AdCard } from '../components/AdCard.js';
import { usePublicProfile } from '../hooks/useUsers.js';
import { useAuth } from '../context/AuthContext.js';
import { deleteAd } from '../api/ads.js';

export const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);
  const { profile, loading, error, refresh } = usePublicProfile(numericId);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const isOwnProfile = currentUser?.id === numericId;

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
              Back to Feed
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
                  </div>
                </div>
              </div>
            </div>

            {/* Ads Grid Section */}
            <div className="flex flex-col gap-lg">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  {isOwnProfile ? 'Your Advertisements' : `Ads by ${profile.user.username}`}
                </h2>
                <span className="font-label-sm text-label-sm text-secondary bg-surface-container px-sm py-[4px] rounded-full">
                  {profile.ads.length}
                </span>
              </div>

              {profile.ads.length === 0 ? (
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
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar.js';
import { useAuth } from '../context/AuthContext.js';
import { 
  adminGetAds, 
  adminDeleteAd, 
  adminGetReviews, 
  adminDeleteReview, 
  adminGetUsers, 
  adminBanUser 
} from '../api/admin.js';
import { type Ad } from '../api/ads.js';
import { type Review } from '../api/reviews.js';
import { type UserProfile } from '../api/users.js';

type Tab = 'ads' | 'reviews' | 'users';

export const AdminPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<Tab>('ads');
  const [ads, setAds] = useState<Ad[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = async (tab: Tab) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (tab === 'ads') {
        const data = await adminGetAds();
        setAds(data);
      } else if (tab === 'reviews') {
        const data = await adminGetReviews();
        setReviews(data);
      } else if (tab === 'users') {
        const data = await adminGetUsers();
        setUsers(data);
      }
    } catch (err: any) {
      console.error(`Error fetching admin ${tab}:`, err);
      setErrorMsg(`Failed to load ${tab}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const showFeedback = (success: string | null = null, error: string | null = null) => {
    if (success) {
      setSuccessMsg(success);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
    if (error) {
      setErrorMsg(error);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  const handleDeleteAd = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete the advertisement "${title}"? This cannot be undone.`)) {
      return;
    }
    try {
      await adminDeleteAd(id);
      showFeedback(`Successfully deleted advertisement "${title}".`);
      fetchData('ads');
    } catch (err: any) {
      console.error('Admin delete ad failed:', err);
      showFeedback(null, err.response?.data?.error?.message || 'Failed to delete advertisement.');
    }
  };

  const handleDeleteReview = async (id: number, reviewer: string) => {
    if (!window.confirm(`Are you sure you want to delete the review by "${reviewer}"?`)) {
      return;
    }
    try {
      await adminDeleteReview(id);
      showFeedback(`Successfully deleted review by "${reviewer}".`);
      fetchData('reviews');
    } catch (err: any) {
      console.error('Admin delete review failed:', err);
      showFeedback(null, 'Failed to delete review.');
    }
  };

  const handleBanToggle = async (userId: number, username: string, currentBanStatus: boolean) => {
    const actionWord = currentBanStatus ? 'unban' : 'ban';
    if (!window.confirm(`Are you sure you want to ${actionWord} the user "${username}"?`)) {
      return;
    }
    try {
      await adminBanUser(userId, !currentBanStatus);
      showFeedback(`Successfully updated ban status for "${username}".`);
      fetchData('users');
    } catch (err: any) {
      console.error('Admin ban user toggle failed:', err);
      showFeedback(null, err.response?.data?.error?.message || `Failed to ${actionWord} user.`);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow w-full max-w-container-max mx-auto px-md md:px-xl py-xl flex flex-col gap-lg">
        
        {/* Page Header */}
        <div className="flex flex-col gap-xs">
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight flex items-center gap-xs">
            <span className="material-symbols-outlined text-[32px] text-primary">admin_panel_settings</span>
            Moderation Dashboard
          </h1>
          <p className="font-body-md text-body-md text-secondary">
            Manage active advertisements, user ratings, and configure account access bans.
          </p>
        </div>

        {/* Feedback Alerts */}
        {successMsg && (
          <div className="p-md bg-primary-fixed text-on-primary-fixed rounded-xl border border-primary/10 text-body-sm font-body-sm transition-all duration-200">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-md bg-error-container text-on-error-container rounded-xl border border-error/10 text-body-sm font-body-sm transition-all duration-200">
            {errorMsg}
          </div>
        )}

        {/* Tab Selection Row */}
        <div className="flex border-b border-outline-variant/30 gap-sm mt-xs">
          {(['ads', 'reviews', 'users'] as Tab[]).map((tab) => {
            const isActive = activeTab === tab;
            const labels = { ads: 'Advertisements', reviews: 'Reviews & Ratings', users: 'User Accounts' };
            const icons = { ads: 'campaign', reviews: 'rate_review', users: 'group' };
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setAds([]);
                  setReviews([]);
                  setUsers([]);
                }}
                className={`pb-md px-sm font-label-md text-label-md transition-all border-b-2 flex items-center gap-xs capitalize ${
                  isActive
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-secondary hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{icons[tab]}</span>
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* Dynamic List Content */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-md md:p-xl shadow-sm min-h-[350px]">
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-[60px] gap-md">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="font-label-sm text-label-sm text-secondary">Loading moderation list...</p>
            </div>
          )}

          {!loading && (
            <>
              {/* ADS TAB */}
              {activeTab === 'ads' && (
                <div className="overflow-x-auto">
                  {ads.length === 0 ? (
                    <div className="py-xl text-center text-secondary font-body-md">No advertisements exist on the platform.</div>
                  ) : (
                    <table className="w-full text-left font-body-md border-collapse">
                      <thead>
                        <tr className="border-b border-outline-variant/20 text-secondary text-label-sm font-label-sm uppercase tracking-wider">
                          <th className="pb-md pr-md">Cover</th>
                          <th className="pb-md">Title</th>
                          <th className="pb-md">Category</th>
                          <th className="pb-md">Price</th>
                          <th className="pb-md">Location</th>
                          <th className="pb-md text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {ads.map((ad) => {
                          const thumbnail = ad.images?.[0]?.cloudinary_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200&auto=format&fit=crop';
                          return (
                            <tr key={ad.id} className="hover:bg-surface-container-low/20 transition-colors">
                              <td className="py-md pr-md">
                                <div className="w-12 h-10 rounded-md overflow-hidden bg-surface-container border border-outline-variant/20">
                                  <img src={thumbnail} alt="" className="w-full h-full object-cover" />
                                </div>
                              </td>
                              <td className="py-md font-semibold text-on-surface">
                                <span className="block max-w-[200px] truncate">{ad.title}</span>
                              </td>
                              <td className="py-md text-secondary">{ad.category}</td>
                              <td className="py-md font-semibold text-primary">${ad.price.toFixed(2)}</td>
                              <td className="py-md text-secondary">{ad.location}</td>
                              <td className="py-md text-right">
                                <button
                                  onClick={() => handleDeleteAd(ad.id, ad.title)}
                                  className="py-[6px] px-md rounded-lg text-label-sm font-label-sm bg-error-container text-on-error-container border border-error/10 hover:brightness-95 active:scale-95 transition-all flex items-center gap-xs inline-flex"
                                >
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* REVIEWS TAB */}
              {activeTab === 'reviews' && (
                <div className="overflow-x-auto">
                  {reviews.length === 0 ? (
                    <div className="py-xl text-center text-secondary font-body-md">No reviews exist on the platform.</div>
                  ) : (
                    <table className="w-full text-left font-body-md border-collapse">
                      <thead>
                        <tr className="border-b border-outline-variant/20 text-secondary text-label-sm font-label-sm uppercase tracking-wider">
                          <th className="pb-md">Reviewer</th>
                          <th className="pb-md">Ad Title</th>
                          <th className="pb-md">Rating</th>
                          <th className="pb-md">Comment</th>
                          <th className="pb-md text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {reviews.map((rev) => (
                          <tr key={rev.id} className="hover:bg-surface-container-low/20 transition-colors">
                            <td className="py-md font-semibold text-on-surface">{rev.reviewer_name}</td>
                            <td className="py-md text-secondary">
                              <span className="block max-w-[150px] truncate">{(rev as any).ad_title}</span>
                            </td>
                            <td className="py-md">
                              <div className="flex items-center gap-[1px]">
                                {[1,2,3,4,5].map(s => (
                                  <span 
                                    key={s} 
                                    className="material-symbols-outlined text-[16px] select-none"
                                    style={{
                                      fontVariationSettings: s <= rev.star_rating ? "'FILL' 1" : "'FILL' 0",
                                      color: s <= rev.star_rating ? '#ffb700' : 'var(--color-outline-variant)'
                                    }}
                                  >
                                    star
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-md text-secondary max-w-[250px] truncate">
                              {rev.review_text || <span className="italic opacity-50">No text comment</span>}
                            </td>
                            <td className="py-md text-right">
                              <button
                                onClick={() => handleDeleteReview(rev.id, rev.reviewer_name)}
                                className="py-[6px] px-md rounded-lg text-label-sm font-label-sm bg-error-container text-on-error-container border border-error/10 hover:brightness-95 active:scale-95 transition-all flex items-center gap-xs inline-flex"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* USERS TAB */}
              {activeTab === 'users' && (
                <div className="overflow-x-auto">
                  {users.length === 0 ? (
                    <div className="py-xl text-center text-secondary font-body-md">No user accounts exist in the database.</div>
                  ) : (
                    <table className="w-full text-left font-body-md border-collapse">
                      <thead>
                        <tr className="border-b border-outline-variant/20 text-secondary text-label-sm font-label-sm uppercase tracking-wider">
                          <th className="pb-md">Profile</th>
                          <th className="pb-md">Username</th>
                          <th className="pb-md">Email</th>
                          <th className="pb-md">Status</th>
                          <th className="pb-md text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {users.map((usr) => {
                          const isSelf = currentUser && currentUser.id === usr.id;
                          return (
                            <tr key={usr.id} className="hover:bg-surface-container-low/20 transition-colors">
                              <td className="py-md">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container border border-outline-variant/30 flex items-center justify-center">
                                  {usr.photo_url ? (
                                    <img src={usr.photo_url} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="font-bold text-xs uppercase text-primary">{usr.username.substring(0, 2)}</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-md font-semibold text-on-surface">
                                {usr.username} {isSelf && <span className="text-[11px] bg-secondary-fixed text-on-secondary-fixed px-sm py-[2px] rounded-full ml-xs">You</span>}
                              </td>
                              <td className="py-md text-secondary">{usr.email}</td>
                              <td className="py-md">
                                {usr.is_admin ? (
                                  <span className="bg-primary-fixed text-on-primary-fixed text-[11px] font-semibold px-sm py-[2px] rounded-full uppercase tracking-wider">Admin</span>
                                ) : usr.is_banned ? (
                                  <span className="bg-error-container text-on-error-container text-[11px] font-semibold px-sm py-[2px] rounded-full uppercase tracking-wider">Banned</span>
                                ) : (
                                  <span className="bg-surface-container-highest text-on-surface-variant text-[11px] font-semibold px-sm py-[2px] rounded-full uppercase tracking-wider font-normal">Active</span>
                                )}
                              </td>
                              <td className="py-md text-right">
                                {!usr.is_admin && !isSelf && (
                                  <button
                                    onClick={() => handleBanToggle(usr.id, usr.username, usr.is_banned)}
                                    className={`py-[6px] px-md rounded-lg text-label-sm font-label-sm border hover:brightness-95 active:scale-95 transition-all inline-flex items-center gap-xs ${
                                      usr.is_banned
                                        ? 'bg-surface-container-highest text-on-surface-variant border-outline-variant/30'
                                        : 'bg-error-container text-on-error-container border-error/10 font-bold'
                                    }`}
                                  >
                                    <span className="material-symbols-outlined text-[16px]">{usr.is_banned ? 'gpp_good' : 'block'}</span>
                                    {usr.is_banned ? 'Unban Account' : 'Ban Account'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          )}

        </div>

      </main>
    </div>
  );
};

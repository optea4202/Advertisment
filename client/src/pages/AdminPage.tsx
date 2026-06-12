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
import { getReports, deleteReport, type Report } from '../api/reports.js';
import { Link, useSearchParams } from 'react-router-dom';

type Tab = 'ads' | 'reviews' | 'users' | 'reports';

export const AdminPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as Tab) || 'ads';
  const [ads, setAds] = useState<Ad[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  const [adsSearch, setAdsSearch] = useState('');
  const [reviewsSearch, setReviewsSearch] = useState('');
  const [usersSearch, setUsersSearch] = useState('');

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
      } else if (tab === 'reports') {
        const data = await getReports();
        setReports(data);
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
      fetchData(activeTab);
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
      fetchData(activeTab);
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
      fetchData(activeTab);
    } catch (err: any) {
      console.error('Admin ban user toggle failed:', err);
      showFeedback(null, err.response?.data?.error?.message || `Failed to ${actionWord} user.`);
    }
  };

  const handleDismissReport = async (reportId: number) => {
    try {
      await deleteReport(reportId);
      showFeedback('Report dismissed/resolved successfully.');
      fetchData('reports');
    } catch (err: any) {
      console.error('Failed to dismiss report:', err);
      showFeedback(null, 'Failed to dismiss report.');
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

        {/* Tab Selection Row integrated into the main header Navbar */}

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
                <div className="flex flex-col gap-md">
                  {/* Search bar */}
                  <div className="relative max-w-sm">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-secondary pointer-events-none">search</span>
                    <input
                      id="admin-ads-search"
                      type="text"
                      value={adsSearch}
                      onChange={(e) => setAdsSearch(e.target.value)}
                      placeholder="Search by title…"
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-outline-variant/30 bg-surface-container text-on-surface text-body-sm font-body-sm placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                    />
                    {adsSearch && (
                      <button
                        onClick={() => setAdsSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition"
                        aria-label="Clear search"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    {(() => {
                      const filtered = adsSearch.trim()
                        ? ads.filter(a => a.title.toLowerCase().includes(adsSearch.toLowerCase()))
                        : ads;
                      return filtered.length === 0 ? (
                        <div className="py-xl text-center text-secondary font-body-md">
                          {adsSearch.trim() ? `No ads match "${adsSearch}".` : 'No advertisements exist on the platform.'}
                        </div>
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
                            {filtered.map((ad) => {
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
                                  <td className="py-md font-semibold text-primary">₹{ad.price.toFixed(2)}</td>
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
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* REVIEWS TAB */}
              {activeTab === 'reviews' && (
                <div className="flex flex-col gap-md">
                  {/* Search bar */}
                  <div className="relative max-w-sm">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-secondary pointer-events-none">search</span>
                    <input
                      id="admin-reviews-search"
                      type="text"
                      value={reviewsSearch}
                      onChange={(e) => setReviewsSearch(e.target.value)}
                      placeholder="Search by comment…"
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-outline-variant/30 bg-surface-container text-on-surface text-body-sm font-body-sm placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                    />
                    {reviewsSearch && (
                      <button
                        onClick={() => setReviewsSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition"
                        aria-label="Clear search"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    {(() => {
                      const filtered = reviewsSearch.trim()
                        ? reviews.filter(r => (r.review_text || '').toLowerCase().includes(reviewsSearch.toLowerCase()))
                        : reviews;
                      return filtered.length === 0 ? (
                        <div className="py-xl text-center text-secondary font-body-md">
                          {reviewsSearch.trim() ? `No reviews match "${reviewsSearch}".` : 'No reviews exist on the platform.'}
                        </div>
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
                            {filtered.map((rev) => (
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
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* USERS TAB */}
              {activeTab === 'users' && (
                <div className="flex flex-col gap-md">
                  {/* Search bar */}
                  <div className="relative max-w-sm">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-secondary pointer-events-none">search</span>
                    <input
                      id="admin-users-search"
                      type="text"
                      value={usersSearch}
                      onChange={(e) => setUsersSearch(e.target.value)}
                      placeholder="Search by username…"
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-outline-variant/30 bg-surface-container text-on-surface text-body-sm font-body-sm placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                    />
                    {usersSearch && (
                      <button
                        onClick={() => setUsersSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition"
                        aria-label="Clear search"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    {(() => {
                      const filtered = usersSearch.trim()
                        ? users.filter(u => u.username.toLowerCase().includes(usersSearch.toLowerCase()))
                        : users;
                      return filtered.length === 0 ? (
                        <div className="py-xl text-center text-secondary font-body-md">
                          {usersSearch.trim() ? `No users match "${usersSearch}".` : 'No user accounts exist in the database.'}
                        </div>
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
                            {filtered.map((usr) => {
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
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* REPORTS TAB */}
              {activeTab === 'reports' && (
                <div className="overflow-x-auto">
                  {reports.length === 0 ? (
                    <div className="py-xl text-center text-secondary font-body-md">No reports exist on the platform.</div>
                  ) : (
                    <table className="w-full text-left font-body-md border-collapse">
                      <thead>
                        <tr className="border-b border-outline-variant/20 text-secondary text-label-sm font-label-sm uppercase tracking-wider">
                          <th className="pb-md">Reporter</th>
                          <th className="pb-md">Reported Type</th>
                          <th className="pb-md">Target Preview / Content</th>
                          <th className="pb-md">Reason for Report</th>
                          <th className="pb-md">Date</th>
                          <th className="pb-md text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {reports.map((rep) => {
                          let previewContent: React.ReactNode = null;
                          if (rep.reported_item_type === 'ad' && rep.ad_id) {
                            previewContent = (
                              <div className="flex flex-col gap-xs">
                                <span className="font-semibold text-on-surface">Ad Pinned</span>
                                <Link 
                                  to={`/ads/${rep.ad_id}`} 
                                  className="text-primary hover:underline text-body-sm inline-flex items-center gap-[2px]"
                                >
                                  {rep.ad_title || `Ad #${rep.ad_id}`}
                                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                </Link>
                              </div>
                            );
                          } else if (rep.reported_item_type === 'user' && rep.reported_user_id) {
                            previewContent = (
                              <div className="flex flex-col gap-xs">
                                <span className="font-semibold text-on-surface">User Profile</span>
                                <Link 
                                  to={`/profile/${rep.reported_user_id}`} 
                                  className="text-primary hover:underline text-body-sm inline-flex items-center gap-[2px]"
                                >
                                  @{rep.reported_username || `User #${rep.reported_user_id}`}
                                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                </Link>
                              </div>
                            );
                          } else if (rep.reported_item_type === 'review' && rep.review_id) {
                            previewContent = (
                              <div className="flex flex-col gap-xs max-w-[250px]">
                                <span className="font-semibold text-on-surface">Review Comment</span>
                                <p className="text-secondary text-body-sm italic truncate">"{rep.review_text || 'No comment text'}"</p>
                              </div>
                            );
                          }

                          return (
                            <tr key={rep.id} className="hover:bg-surface-container-low/20 transition-colors">
                              <td className="py-md font-semibold text-on-surface">@{rep.reporter_username}</td>
                              <td className="py-md">
                                <span className={`text-[11px] font-semibold px-sm py-[2px] rounded-full uppercase tracking-wider ${
                                  rep.reported_item_type === 'ad'
                                    ? 'bg-primary-fixed text-on-primary-fixed'
                                    : rep.reported_item_type === 'user'
                                    ? 'bg-secondary-fixed text-on-secondary-fixed'
                                    : 'bg-tertiary-fixed text-on-tertiary-fixed'
                                }`}>
                                  {rep.reported_item_type}
                                </span>
                              </td>
                              <td className="py-md">{previewContent}</td>
                              <td className="py-md text-secondary max-w-[200px] truncate" title={rep.reason}>
                                {rep.reason}
                              </td>
                              <td className="py-md text-secondary text-body-sm">
                                {new Date(rep.created_at).toLocaleDateString(undefined, { dateStyle: 'short' })}
                              </td>
                              <td className="py-md text-right">
                                <div className="flex items-center gap-xs justify-end flex-wrap">
                                  {/* Item deletion/ban actions */}
                                  {rep.reported_item_type === 'ad' && rep.ad_id && (
                                    <button
                                      onClick={() => handleDeleteAd(rep.ad_id!, rep.ad_title || 'Advertisement')}
                                      className="py-[6px] px-sm rounded-lg text-label-sm font-label-sm bg-error text-on-error hover:brightness-95 active:scale-95 transition-all flex items-center gap-xs inline-flex"
                                      title="Delete reported ad"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">delete</span>
                                      Delete Ad
                                    </button>
                                  )}
                                  {rep.reported_item_type === 'review' && rep.review_id && (
                                    <button
                                      onClick={() => handleDeleteReview(rep.review_id!, rep.reporter_username || 'Reviewer')}
                                      className="py-[6px] px-sm rounded-lg text-label-sm font-label-sm bg-error text-on-error hover:brightness-95 active:scale-95 transition-all flex items-center gap-xs inline-flex"
                                      title="Delete reported review"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">delete</span>
                                      Delete Review
                                    </button>
                                  )}
                                  {rep.reported_item_type === 'user' && rep.reported_user_id && (
                                    <button
                                      onClick={() => handleBanToggle(rep.reported_user_id!, rep.reported_username || 'User', false)}
                                      className="py-[6px] px-sm rounded-lg text-label-sm font-label-sm bg-error text-on-error hover:brightness-95 active:scale-95 transition-all flex items-center gap-xs inline-flex"
                                      title="Ban reported user"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">block</span>
                                      Ban User
                                    </button>
                                  )}

                                  {/* Dismiss Report button */}
                                  <button
                                    onClick={() => handleDismissReport(rep.id)}
                                    className="py-[6px] px-sm rounded-lg text-label-sm font-label-sm bg-surface-container-highest text-on-surface-variant border border-outline-variant/30 hover:brightness-95 active:scale-95 transition-all flex items-center gap-xs inline-flex"
                                    title="Dismiss report without taking action"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">check</span>
                                    Dismiss
                                  </button>
                                </div>
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

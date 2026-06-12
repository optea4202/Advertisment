import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar.js';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { 
  adminGetAds, 
  adminGetReviews, 
  adminGetUsers 
} from '../api/admin.js';
import { getReports, type Report } from '../api/reports.js';
import { type Ad } from '../api/ads.js';
import { type Review } from '../api/reviews.js';
import { type UserProfile } from '../api/users.js';
import { getCategories } from '../api/categories.js';

export const AdminHomePage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const [adsData, reviewsData, usersData, reportsData, categoriesData] = await Promise.all([
          adminGetAds(),
          adminGetReviews(),
          adminGetUsers(),
          getReports(),
          getCategories()
        ]);
        setAds(adsData);
        setReviews(reviewsData);
        setUsers(usersData);
        setReports(reportsData);
        setCategories(categoriesData.map(c => c.name));
      } catch (err: any) {
        console.error('Error fetching admin dashboard data:', err);
        setErrorMsg('Failed to load dashboard metrics. Please try refreshing.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // Compute metrics
  const totalAds = ads.length;
  const totalReviews = reviews.length;
  const totalUsers = users.length;
  const pendingReportsCount = reports.length;
  
  const bannedUsers = users.filter(u => u.is_banned).length;
  const activeUsers = totalUsers - bannedUsers;
  
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.star_rating, 0) / totalReviews).toFixed(1) 
    : '0.0';

  // Compute category distribution
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = ads.filter(ad => ad.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  // Sort and slice recent lists
  const recentReports = [...reports]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const recentAds = [...ads]
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 5);

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow w-full max-w-container-max mx-auto px-md md:px-xl py-xl flex flex-col gap-lg animate-fade-in-up">
        
        {/* Welcome Header */}
        <div className="flex flex-col gap-xs">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-[32px] text-primary">dashboard</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Dashboard Overview
            </h1>
          </div>
          <p className="font-body-md text-body-md text-secondary">
            Welcome back, <span className="font-semibold text-on-surface">@{currentUser?.username || 'Admin'}</span>. Here's a high-level summary of your platform's activity.
          </p>
        </div>

        {errorMsg && (
          <div className="p-md bg-error-container text-on-error-container rounded-xl border border-error/10 text-body-sm font-body-sm transition-all duration-200">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-[100px] gap-md flex-grow">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="font-label-sm text-label-sm text-secondary">Loading statistics & metrics...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-xl">
            
            {/* Stats Bento Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
              
              {/* Active Ads Card */}
              <Link to="/admin?tab=ads" className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-lg shadow-sm hover:border-primary/30 transition-all group flex flex-col justify-between min-h-[140px]">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-secondary font-label-sm text-label-sm uppercase tracking-wider">Active Ads</span>
                    <span className="font-headline-lg text-[36px] font-bold text-on-surface mt-xs leading-none">
                      {totalAds}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-primary-fixed/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">campaign</span>
                  </div>
                </div>
                <div className="flex items-center gap-xs text-body-sm text-primary font-semibold mt-md">
                  <span>Manage listings</span>
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
              </Link>

              {/* Total Users Card */}
              <Link to="/admin?tab=users" className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-lg shadow-sm hover:border-primary/30 transition-all group flex flex-col justify-between min-h-[140px]">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-secondary font-label-sm text-label-sm uppercase tracking-wider">Total Users</span>
                    <span className="font-headline-lg text-[36px] font-bold text-on-surface mt-xs leading-none">
                      {totalUsers}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-tertiary-fixed/30 text-tertiary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">group</span>
                  </div>
                </div>
                <div className="flex items-center gap-sm mt-md">
                  <span className="text-[11px] bg-primary-fixed text-on-primary-fixed px-sm py-[2px] rounded-full font-bold uppercase">{activeUsers} Active</span>
                  {bannedUsers > 0 && (
                    <span className="text-[11px] bg-error-container text-on-error-container px-sm py-[2px] rounded-full font-bold uppercase">{bannedUsers} Banned</span>
                  )}
                </div>
              </Link>

              {/* Reviews & Average Rating */}
              <Link to="/admin?tab=reviews" className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-lg shadow-sm hover:border-primary/30 transition-all group flex flex-col justify-between min-h-[140px]">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-secondary font-label-sm text-label-sm uppercase tracking-wider">Total Reviews</span>
                    <span className="font-headline-lg text-[36px] font-bold text-on-surface mt-xs leading-none">
                      {totalReviews}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-secondary-fixed/50 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">rate_review</span>
                  </div>
                </div>
                <div className="flex items-center gap-xs mt-md text-secondary text-body-sm font-semibold">
                  <span className="material-symbols-outlined text-[#ffb700] fill-1 text-[18px]">star</span>
                  <span>{avgRating} Avg Star Rating</span>
                </div>
              </Link>

              {/* Pending Reports */}
              <Link to="/admin?tab=reports" className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-lg shadow-sm hover:border-primary/30 transition-all group flex flex-col justify-between min-h-[140px]">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-secondary font-label-sm text-label-sm uppercase tracking-wider">Reports</span>
                    <span className="font-headline-lg text-[36px] font-bold text-on-surface mt-xs leading-none">
                      {pendingReportsCount}
                    </span>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                    pendingReportsCount > 0 ? 'bg-error-container text-error' : 'bg-surface-container text-secondary'
                  }`}>
                    <span className="material-symbols-outlined text-[24px]">flag</span>
                  </div>
                </div>
                <div className="flex items-center gap-xs mt-md text-body-sm font-semibold">
                  {pendingReportsCount > 0 ? (
                    <span className="text-error flex items-center gap-xs animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-error"></span>
                      Needs attention
                    </span>
                  ) : (
                    <span className="text-secondary flex items-center gap-[2px]">
                      <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
                      Clear queue
                    </span>
                  )}
                </div>
              </Link>

            </div>

            {/* Dashboard Insights: Left = Category distribution, Right = Quick actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
              
              {/* Category Breakdown list */}
              <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-lg shadow-sm flex flex-col gap-md">
                <div className="flex flex-col">
                  <h2 className="font-headline-md text-[20px] font-bold text-on-surface">Category Distribution</h2>
                  <p className="font-body-sm text-body-sm text-secondary">Breakdown of active listings per platform category.</p>
                </div>
                
                <div className="flex flex-col gap-md">
                  {categories.map(cat => {
                    const count = categoryCounts[cat] || 0;
                    const percentage = totalAds > 0 ? (count / totalAds) * 100 : 0;
                    return (
                      <div key={cat} className="flex flex-col gap-xs">
                        <div className="flex justify-between items-center text-body-sm font-semibold">
                          <span className="text-on-surface">{cat}</span>
                          <span className="text-secondary">{count} ads ({percentage.toFixed(0)}%)</span>
                        </div>
                        {/* Horizontal Bar */}
                        <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-lg shadow-sm flex flex-col gap-md">
                <h2 className="font-headline-md text-[20px] font-bold text-on-surface">Quick Actions</h2>
                <div className="flex flex-col gap-sm">
                  <Link to="/admin?tab=ads" className="w-full flex items-center justify-between p-md rounded-xl hover:bg-surface-container-low border border-outline-variant/10 transition-colors group">
                    <div className="flex items-center gap-md">
                      <span className="material-symbols-outlined text-primary">campaign</span>
                      <span className="font-label-md text-label-md text-on-surface">Manage Ads</span>
                    </div>
                    <span className="material-symbols-outlined text-secondary group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </Link>

                  <Link to="/admin?tab=users" className="w-full flex items-center justify-between p-md rounded-xl hover:bg-surface-container-low border border-outline-variant/10 transition-colors group">
                    <div className="flex items-center gap-md">
                      <span className="material-symbols-outlined text-tertiary">group</span>
                      <span className="font-label-md text-label-md text-on-surface">Account Moderation</span>
                    </div>
                    <span className="material-symbols-outlined text-secondary group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </Link>

                  <Link to="/admin?tab=reviews" className="w-full flex items-center justify-between p-md rounded-xl hover:bg-surface-container-low border border-outline-variant/10 transition-colors group">
                    <div className="flex items-center gap-md">
                      <span className="material-symbols-outlined text-secondary">rate_review</span>
                      <span className="font-label-md text-label-md text-on-surface">Manage Reviews</span>
                    </div>
                    <span className="material-symbols-outlined text-secondary group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </Link>

                  <Link to="/admin?tab=reports" className="w-full flex items-center justify-between p-md rounded-xl hover:bg-surface-container-low border border-outline-variant/10 transition-colors group">
                    <div className="flex items-center gap-md">
                      <span className="material-symbols-outlined text-error">flag</span>
                      <span className="font-label-md text-label-md text-on-surface">Review Reports</span>
                    </div>
                    {pendingReportsCount > 0 && (
                      <span className="bg-error-container text-on-error-container text-[11px] font-bold px-sm py-[2px] rounded-full">
                        {pendingReportsCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>

            </div>

            {/* Bottom Row: Recent reports list and Recent ads list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              
              {/* Recent Pending Reports */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-lg shadow-sm flex flex-col gap-md">
                <div className="flex justify-between items-center">
                  <h2 className="font-headline-md text-[20px] font-bold text-on-surface">Recent Reports</h2>
                  <Link to="/admin?tab=reports" className="text-primary hover:underline font-label-sm text-label-sm">View all</Link>
                </div>

                {recentReports.length === 0 ? (
                  <div className="py-lg text-center text-secondary font-body-md italic bg-surface-container-low/35 rounded-xl border border-dashed border-outline-variant/30">
                    No active reports to handle.
                  </div>
                ) : (
                  <div className="flex flex-col divide-y divide-outline-variant/10">
                    {recentReports.map(rep => (
                      <div key={rep.id} className="py-md first:pt-0 last:pb-0 flex items-start gap-md">
                        <div className="mt-xs">
                          <span className="material-symbols-outlined text-error text-[20px]">warning</span>
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center justify-between gap-sm">
                            <span className="font-semibold text-body-sm text-on-surface truncate">@{rep.reporter_username}</span>
                            <span className="text-[10px] bg-secondary-fixed text-on-secondary-fixed px-sm py-[2px] rounded-full uppercase tracking-wider font-bold shrink-0">
                              {rep.reported_item_type}
                            </span>
                          </div>
                          <p className="text-secondary text-body-sm mt-[2px] line-clamp-2" title={rep.reason}>
                            {rep.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Ads Posted */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-lg shadow-sm flex flex-col gap-md">
                <div className="flex justify-between items-center">
                  <h2 className="font-headline-md text-[20px] font-bold text-on-surface">Recent Listings</h2>
                  <Link to="/admin?tab=ads" className="text-primary hover:underline font-label-sm text-label-sm">View all</Link>
                </div>

                {recentAds.length === 0 ? (
                  <div className="py-lg text-center text-secondary font-body-md italic bg-surface-container-low/35 rounded-xl border border-dashed border-outline-variant/30">
                    No active listings.
                  </div>
                ) : (
                  <div className="flex flex-col divide-y divide-outline-variant/10">
                    {recentAds.map(ad => {
                      const thumb = ad.images?.[0]?.cloudinary_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200&auto=format&fit=crop';
                      return (
                        <div key={ad.id} className="py-md first:pt-0 last:pb-0 flex items-center justify-between gap-md">
                          <div className="flex items-center gap-md min-w-0">
                            <div className="w-12 h-10 rounded-md overflow-hidden bg-surface-container border border-outline-variant/20 shrink-0">
                              <img src={thumb} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-body-sm text-on-surface block truncate">{ad.title}</span>
                              <span className="text-secondary text-[11px] block">{ad.category} • ₹{ad.price.toFixed(2)}</span>
                            </div>
                          </div>
                          <Link 
                            to={`/ads/${ad.id}`} 
                            className="p-xs hover:bg-surface-container rounded-full text-secondary hover:text-primary transition-colors flex items-center justify-center shrink-0"
                            title="View ad page"
                          >
                            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
};

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
import { 
  adminGetAllUserReviews, 
  deleteUserReview as adminDeleteUserReview,
  type UserReview
} from '../api/userReviews.js';
import { type Ad } from '../api/ads.js';
import { type Review } from '../api/reviews.js';
import { type UserProfile } from '../api/users.js';
import { getReports, deleteReport, type Report } from '../api/reports.js';
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  type Category 
} from '../api/categories.js';
import { 
  getPages, 
  updatePage, 
  type PageContent 
} from '../api/pages.js';
import { ConfirmModal } from '../components/ConfirmModal.js';
import { Link, useSearchParams } from 'react-router-dom';
import { buildCategoryTree, flattenCategoryTree, isDescendantOf } from '../utils/categoryTree.js';

const AVAILABLE_SYMBOLS = [
  'category', 'devices', 'chair', 'directions_car', 'build', 
  'shopping_bag', 'fastfood', 'book', 'sports_esports', 'home', 
  'pets', 'checkroom', 'face', 'spa', 'flight', 
  'local_hospital', 'theater_comedy', 'handyman', 'school', 'celebration', 
  'work', 'brush', 'music_note', 'redeem', 'directions_run',
  'fitness_center', 'toys', 'videogame_asset', 'laptop_mac'
];

type Tab = 'ads' | 'reviews' | 'users' | 'reports' | 'categories' | 'profile_reviews' | 'pages' | 'featured';

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
  const [profileReviews, setProfileReviews] = useState<UserReview[]>([]);
  const [profileReviewsSearch, setProfileReviewsSearch] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySymbol, setNewCategorySymbol] = useState('category');
  const [newCategoryParentId, setNewCategoryParentId] = useState('');
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingSymbol, setEditingSymbol] = useState('category');
  const [editingParentId, setEditingParentId] = useState<number | null>(null);
  const [showEditSymbolPicker, setShowEditSymbolPicker] = useState(false);

  const [pages, setPages] = useState<PageContent[]>([]);

  const [editingPage, setEditingPage] = useState<PageContent | null>(null);
  const [editingPageSlug, setEditingPageSlug] = useState('');
  const [editingPageTitle, setEditingPageTitle] = useState('');
  const [editingPageContent, setEditingPageContent] = useState('');
  const [editingFeaturedAdIds, setEditingFeaturedAdIds] = useState<number[]>(Array(8).fill(0));

  // Featured Ads tab state
  const [featuredAdIds, setFeaturedAdIds] = useState<number[]>([]);
  const [featuredSearch, setFeaturedSearch] = useState('');
  const [featuredSaving, setFeaturedSaving] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDestructive: false
  });

  const openConfirm = (title: string, message: string, onConfirm: () => void, isDestructive = false) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        closeConfirm();
      },
      isDestructive
    });
  };

  const closeConfirm = () => {
    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
  };

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
      } else if (tab === 'categories') {
        const data = await getCategories();
        setCategories(data);
      } else if (tab === 'profile_reviews') {
        const data = await adminGetAllUserReviews();
        setProfileReviews(data);
      } else if (tab === 'pages') {
        const data = await getPages();
        setPages(data);
        const adsData = await adminGetAds();
        setAds(adsData);
      } else if (tab === 'featured') {
        const adsData = await adminGetAds();
        setAds(adsData);
        // Load current featured_ad_ids from home page
        const pagesData = await getPages();
        setPages(pagesData);
        const homePage = pagesData.find((p) => p.slug === 'home');
        setFeaturedAdIds(homePage?.featured_ad_ids || []);
      }
    } catch (err: any) {
      console.error(`Error fetching admin ${tab}:`, err);
      setErrorMsg(`Failed to load ${tab}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const parentId = newCategoryParentId ? parseInt(newCategoryParentId) : null;
      await createCategory(newCategoryName, newCategorySymbol, parentId);
      showFeedback(`Successfully created category "${newCategoryName}".`);
      setNewCategoryName('');
      setNewCategorySymbol('category');
      setNewCategoryParentId('');
      setShowSymbolPicker(false);
      fetchData('categories');
    } catch (err: any) {
      console.error('Failed to create category:', err);
      showFeedback(null, err.response?.data?.error?.message || 'Failed to create category.');
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingName.trim()) return;
    try {
      await updateCategory(editingCategory.id, editingName, editingSymbol, editingParentId);
      showFeedback(`Successfully updated category to "${editingName}".`);
      setEditingCategory(null);
      setEditingName('');
      setEditingParentId(null);
      setShowEditSymbolPicker(false);
      fetchData('categories');
    } catch (err: any) {
      console.error('Failed to update category:', err);
      showFeedback(null, err.response?.data?.error?.message || 'Failed to update category.');
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (name.toLowerCase() === 'other') {
      showFeedback(null, 'The "Other" category cannot be deleted.');
      return;
    }
    openConfirm(
      'Delete Category',
      `Are you sure you want to delete the category "${name}"? All ads in this category will be reset to "Other".`,
      async () => {
        try {
          await deleteCategory(id);
          showFeedback(`Successfully deleted category "${name}".`);
          fetchData('categories');
        } catch (err: any) {
          console.error('Failed to delete category:', err);
          showFeedback(null, err.response?.data?.error?.message || 'Failed to delete category.');
        }
      },
      true
    );
  };



  const handleSaveFeaturedAds = async () => {
    const homePage = pages.find((p) => p.slug === 'home');
    if (!homePage) {
      showFeedback(null, 'Home page not found.');
      return;
    }
    setFeaturedSaving(true);
    try {
      await updatePage(homePage.id, homePage.slug, homePage.title, homePage.content, featuredAdIds);
      showFeedback('Featured ads updated successfully.');
    } catch (err: any) {
      console.error('Failed to save featured ads:', err);
      showFeedback(null, err.response?.data?.error?.message || 'Failed to save featured ads.');
    } finally {
      setFeaturedSaving(false);
    }
  };

  const handleUpdatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage || !editingPageSlug.trim() || !editingPageTitle.trim() || !editingPageContent.trim()) {
      showFeedback(null, 'Slug, title, and content are required.');
      return;
    }
    try {
      const featuredIds = editingPageSlug === 'home' 
        ? editingFeaturedAdIds.filter(id => id > 0) 
        : null;
      await updatePage(editingPage.id, editingPageSlug, editingPageTitle, editingPageContent, featuredIds);
      showFeedback(`Successfully updated page "${editingPageTitle}".`);
      setEditingPage(null);
      setEditingPageSlug('');
      setEditingPageTitle('');
      setEditingPageContent('');
      setEditingFeaturedAdIds(Array(8).fill(0));
      fetchData('pages');
    } catch (err: any) {
      console.error('Failed to update page:', err);
      showFeedback(null, err.response?.data?.error?.message || 'Failed to update page.');
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
    openConfirm(
      'Delete Advertisement',
      `Are you sure you want to delete the advertisement "${title}"? This cannot be undone.`,
      async () => {
        try {
          await adminDeleteAd(id);
          showFeedback(`Successfully deleted advertisement "${title}".`);
          fetchData(activeTab);
        } catch (err: any) {
          console.error('Admin delete ad failed:', err);
          showFeedback(null, err.response?.data?.error?.message || 'Failed to delete advertisement.');
        }
      },
      true
    );
  };

  const handleDeleteReview = async (id: number, commenter: string) => {
    openConfirm(
      'Delete Comment',
      `Are you sure you want to delete the comment by "${commenter}"?`,
      async () => {
        try {
          await adminDeleteReview(id);
          showFeedback(`Successfully deleted comment by "${commenter}".`);
          fetchData(activeTab);
        } catch (err: any) {
          console.error('Admin delete comment failed:', err);
          showFeedback(null, 'Failed to delete comment.');
        }
      },
      true
    );
  };

  const handleDeleteProfileReview = async (id: number, reviewer: string, target: string) => {
    openConfirm(
      'Delete Profile Review',
      `Are you sure you want to delete the profile review by "${reviewer}" on "${target}"?`,
      async () => {
        try {
          await adminDeleteUserReview(id);
          showFeedback(`Successfully deleted profile review by "${reviewer}".`);
          fetchData(activeTab);
        } catch (err: any) {
          console.error('Admin delete profile review failed:', err);
          showFeedback(null, 'Failed to delete profile review.');
        }
      },
      true
    );
  };

  const handleBanToggle = async (userId: number, username: string, currentBanStatus: boolean) => {
    const actionWord = currentBanStatus ? 'unban' : 'ban';
    openConfirm(
      `${currentBanStatus ? 'Unban' : 'Ban'} User Account`,
      `Are you sure you want to ${actionWord} the user "${username}"?`,
      async () => {
        try {
          await adminBanUser(userId, !currentBanStatus);
          showFeedback(`Successfully updated ban status for "${username}".`);
          fetchData(activeTab);
        } catch (err: any) {
          console.error('Admin ban user toggle failed:', err);
          showFeedback(null, err.response?.data?.error?.message || `Failed to ${actionWord} user.`);
        }
      },
      !currentBanStatus
    );
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
            Manage active advertisements, user comments, and configure account access bans.
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

              {/* COMMENTS TAB */}
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
                          {reviewsSearch.trim() ? `No comments match "${reviewsSearch}".` : 'No comments exist on the platform.'}
                        </div>
                      ) : (
                        <table className="w-full text-left font-body-md border-collapse">
                          <thead>
                            <tr className="border-b border-outline-variant/20 text-secondary text-label-sm font-label-sm uppercase tracking-wider">
                              <th className="pb-md">Commenter</th>
                              <th className="pb-md">Ad Title</th>
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
                                <td className="py-md text-secondary max-w-[250px] truncate">
                                  {rev.review_text}
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
                                <span className="font-semibold text-on-surface">Comment</span>
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

              {/* CATEGORIES TAB */}
              {activeTab === 'categories' && (
                <div className="flex flex-col gap-lg animate-fade-in-up">
                  {/* Inline creation form */}
                  <form onSubmit={handleCreateCategory} className="flex gap-md items-end max-w-2xl bg-surface-container/30 p-md rounded-2xl border border-outline-variant/20 flex-wrap">
                    {/* Symbol Picker on the left */}
                    <div className="flex flex-col gap-xs relative">
                      <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block">
                        Symbol
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowSymbolPicker(!showSymbolPicker)}
                        className="flex items-center justify-center w-[44px] h-[44px] rounded-xl border border-outline-variant/30 bg-surface-bright text-on-surface hover:border-primary/45 hover:bg-surface-container-low transition shadow-sm"
                        title="Choose symbol"
                      >
                        <span className="material-symbols-outlined text-[24px]">
                          {newCategorySymbol}
                        </span>
                      </button>
                      
                      {showSymbolPicker && (
                        <>
                          <div 
                            className="fixed inset-0 z-40 cursor-default" 
                            onClick={() => setShowSymbolPicker(false)}
                          />
                          <div className="absolute left-0 top-[76px] z-50 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-md shadow-xl w-[260px] max-h-[220px] overflow-y-auto grid grid-cols-5 gap-sm animate-fade-in">
                            {AVAILABLE_SYMBOLS.map(sym => (
                              <button
                                key={sym}
                                type="button"
                                onClick={() => {
                                  setNewCategorySymbol(sym);
                                  setShowSymbolPicker(false);
                                }}
                                className={`flex items-center justify-center p-xs rounded-lg text-secondary hover:text-primary hover:bg-surface-container-low transition ${
                                  newCategorySymbol === sym ? 'bg-primary-fixed text-primary font-bold border border-primary/20' : ''
                                }`}
                                title={sym}
                              >
                                <span className="material-symbols-outlined text-[20px]">{sym}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex flex-col gap-xs flex-grow min-w-[200px]">
                      <label htmlFor="new-category" className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                        Add New Category
                      </label>
                      <input
                        id="new-category"
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g. Books, Clothing..."
                        className="w-full px-md py-[10px] rounded-xl border border-outline-variant/30 bg-surface-bright text-on-surface text-body-sm font-body-sm placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                      />
                    </div>

                    {/* Parent Category Selector */}
                    <div className="flex flex-col gap-xs min-w-[150px]">
                      <label htmlFor="new-category-parent" className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                        Parent Category
                      </label>
                      <div className="relative">
                        <select
                          id="new-category-parent"
                          value={newCategoryParentId}
                          onChange={(e) => setNewCategoryParentId(e.target.value)}
                          className="w-full pl-md pr-lg py-[10px] rounded-xl border border-outline-variant/30 bg-surface-bright text-on-surface text-body-sm font-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition appearance-none cursor-pointer"
                        >
                          <option value="">None (Root)</option>
                          {flattenCategoryTree(buildCategoryTree(categories)).map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {'\u00A0'.repeat(cat.depth * 2)}{cat.depth > 0 ? '↳ ' : ''}{cat.name}
                            </option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[18px]">expand_more</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!newCategoryName.trim()}
                      className="bg-primary text-on-primary font-label-md text-label-md px-md py-[10px] rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-xs shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      Add
                    </button>
                  </form>

                  {/* List Table */}
                  <div className="overflow-x-auto">
                    {categories.length === 0 ? (
                      <div className="py-xl text-center text-secondary font-body-md">
                        No categories found.
                      </div>
                    ) : (
                      <table className="w-full text-left font-body-md border-collapse">
                        <thead>
                          <tr className="border-b border-outline-variant/20 text-secondary text-label-sm font-label-sm uppercase tracking-wider">
                            <th className="pb-md">ID</th>
                            <th className="pb-md">Category Name</th>
                            <th className="pb-md">Created Date</th>
                            <th className="pb-md text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                          {flattenCategoryTree(buildCategoryTree(categories)).map((cat) => {
                            const isEditing = editingCategory?.id === cat.id;
                            const isOther = cat.name.toLowerCase() === 'other';
                            return (
                              <tr key={cat.id} className="hover:bg-surface-container-low/20 transition-colors">
                                <td className="py-md text-secondary font-mono text-body-sm">#{cat.id}</td>
                                <td className="py-md font-semibold text-on-surface">
                                  {isEditing ? (
                                    <form onSubmit={handleUpdateCategory} className="flex gap-xs items-center max-w-sm relative">
                                      {/* Mini symbol picker for editing */}
                                      <div className="relative">
                                        <button
                                          type="button"
                                          onClick={() => setShowEditSymbolPicker(!showEditSymbolPicker)}
                                          className="flex items-center justify-center p-[6px] rounded-lg border border-outline-variant/30 bg-surface-bright text-on-surface hover:border-primary/45 transition shadow-sm min-w-[34px] min-h-[34px]"
                                          title="Choose symbol"
                                        >
                                          <span className="material-symbols-outlined text-[18px]">
                                            {editingSymbol}
                                          </span>
                                        </button>
                                        
                                        {showEditSymbolPicker && (
                                          <>
                                            <div 
                                              className="fixed inset-0 z-40 cursor-default" 
                                              onClick={() => setShowEditSymbolPicker(false)}
                                            />
                                            <div className="absolute left-0 top-[38px] z-50 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-md shadow-xl w-[260px] max-h-[220px] overflow-y-auto grid grid-cols-5 gap-sm animate-fade-in">
                                              {AVAILABLE_SYMBOLS.map(sym => (
                                                <button
                                                  key={sym}
                                                  type="button"
                                                  onClick={() => {
                                                    setEditingSymbol(sym);
                                                    setShowEditSymbolPicker(false);
                                                  }}
                                                  className={`flex items-center justify-center p-xs rounded-lg text-secondary hover:text-primary hover:bg-surface-container-low transition ${
                                                    editingSymbol === sym ? 'bg-primary-fixed text-primary font-bold border border-primary/20' : ''
                                                  }`}
                                                  title={sym}
                                                >
                                                  <span className="material-symbols-outlined text-[18px]">{sym}</span>
                                                </button>
                                              ))}
                                            </div>
                                          </>
                                        )}
                                      </div>

                                      <input
                                        type="text"
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        className="w-full min-w-[120px] px-xs py-[4px] rounded-lg border border-outline-variant bg-surface-bright text-on-surface text-body-sm font-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        required
                                        autoFocus
                                      />

                                      {/* Parent Category Selector */}
                                      <select
                                        value={editingParentId === null ? '' : editingParentId}
                                        onChange={(e) => setEditingParentId(e.target.value ? parseInt(e.target.value) : null)}
                                        className="px-xs py-[4px] rounded-lg border border-outline-variant bg-surface-bright text-on-surface text-body-sm font-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                      >
                                        <option value="">None (Root)</option>
                                        {flattenCategoryTree(buildCategoryTree(categories))
                                          .filter(c => c.id !== cat.id && !isDescendantOf(c.id, cat.id, categories))
                                          .map(c => (
                                            <option key={c.id} value={c.id}>
                                              {'\u00A0'.repeat(c.depth * 2)}{c.depth > 0 ? '↳ ' : ''}{c.name}
                                            </option>
                                          ))}
                                      </select>

                                      <button
                                        type="submit"
                                        className="p-[6px] rounded-lg bg-primary text-on-primary hover:brightness-115 active:scale-95 transition-all flex items-center justify-center shadow-sm"
                                        title="Save category details"
                                      >
                                        <span className="material-symbols-outlined text-[16px]">check</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingCategory(null);
                                          setEditingName('');
                                          setEditingParentId(null);
                                          setShowEditSymbolPicker(false);
                                        }}
                                        className="p-[6px] rounded-lg bg-surface-container-highest text-secondary border border-outline-variant hover:brightness-95 active:scale-95 transition-all flex items-center justify-center"
                                        title="Cancel editing"
                                      >
                                        <span className="material-symbols-outlined text-[16px]">close</span>
                                      </button>
                                    </form>
                                  ) : (
                                    <span className="flex items-center gap-sm" style={{ paddingLeft: `${cat.depth * 20}px` }}>
                                      {cat.depth > 0 && <span className="text-secondary/50 font-mono">↳</span>}
                                      <span className="material-symbols-outlined text-[18px] text-secondary/70">
                                        {cat.symbol || 'category'}
                                      </span>
                                      {cat.name}
                                      {isOther && (
                                        <span className="bg-surface-container-highest text-on-surface-variant text-[10px] font-bold px-sm py-[2px] rounded-full uppercase tracking-wider font-normal">
                                          Default Fallback
                                        </span>
                                      )}
                                    </span>
                                  )}
                                </td>
                                <td className="py-md text-secondary text-body-sm">
                                  {new Date(cat.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                </td>
                                <td className="py-md text-right">
                                  {!isEditing && (
                                    <div className="flex items-center gap-xs justify-end">
                                      <button
                                        onClick={() => {
                                          setEditingCategory(cat);
                                          setEditingName(cat.name);
                                          setEditingSymbol(cat.symbol || 'category');
                                          setEditingParentId(cat.parent_id);
                                          setShowEditSymbolPicker(false);
                                        }}
                                        disabled={isOther}
                                        className={`py-[6px] px-md rounded-lg text-label-sm font-label-sm border hover:brightness-95 active:scale-95 transition-all inline-flex items-center gap-xs ${
                                          isOther
                                            ? 'opacity-40 cursor-not-allowed bg-surface-container-low text-secondary/50 border-outline-variant/10'
                                            : 'bg-surface-bright text-secondary border-outline-variant/40 hover:text-primary hover:border-primary/45 shadow-sm'
                                        }`}
                                        title={isOther ? 'Fallback category cannot be edited' : 'Edit category name'}
                                      >
                                        <span className="material-symbols-outlined text-[16px]">edit</span>
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                        disabled={isOther}
                                        className={`py-[6px] px-md rounded-lg text-label-sm font-label-sm border hover:brightness-95 active:scale-95 transition-all inline-flex items-center gap-xs ${
                                          isOther
                                            ? 'opacity-40 cursor-not-allowed bg-surface-container-low text-secondary/50 border-outline-variant/10'
                                            : 'bg-error-container text-on-error-container border-error/15 font-semibold'
                                        }`}
                                        title={isOther ? 'Fallback category cannot be deleted' : 'Delete category'}
                                      >
                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* PROFILE REVIEWS TAB */}
              {activeTab === 'profile_reviews' && (
                <div className="flex flex-col gap-md animate-fade-in">
                  {/* Search bar */}
                  <div className="relative max-w-sm">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-secondary pointer-events-none">search</span>
                    <input
                      id="admin-profile-reviews-search"
                      type="text"
                      value={profileReviewsSearch}
                      onChange={(e) => setProfileReviewsSearch(e.target.value)}
                      placeholder="Search by commenter or target…"
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-outline-variant/30 bg-surface-container text-on-surface text-body-sm font-body-sm placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                    />
                    {profileReviewsSearch && (
                      <button
                        onClick={() => setProfileReviewsSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition"
                        aria-label="Clear search"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    {(() => {
                      const filtered = profileReviewsSearch.trim()
                        ? profileReviews.filter(
                            (r) =>
                              (r.reviewer_name || '').toLowerCase().includes(profileReviewsSearch.toLowerCase()) ||
                              (r.target_username || '').toLowerCase().includes(profileReviewsSearch.toLowerCase()) ||
                              (r.review_text || '').toLowerCase().includes(profileReviewsSearch.toLowerCase())
                          )
                        : profileReviews;
                      return filtered.length === 0 ? (
                        <div className="py-xl text-center text-secondary font-body-md">
                          {profileReviewsSearch.trim()
                            ? `No profile reviews match "${profileReviewsSearch}".`
                            : 'No profile reviews exist on the platform.'}
                        </div>
                      ) : (
                        <table className="w-full text-left font-body-md border-collapse">
                          <thead>
                            <tr className="border-b border-outline-variant/20 text-secondary text-label-sm font-label-sm uppercase tracking-wider">
                              <th className="pb-md">Reviewer</th>
                              <th className="pb-md">Target User</th>
                              <th className="pb-md">Rating</th>
                              <th className="pb-md">Comment</th>
                              <th className="pb-md text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant/10">
                            {filtered.map((rev) => (
                              <tr key={rev.id} className="hover:bg-surface-container-low/20 transition-colors">
                                <td className="py-md font-semibold text-on-surface">{rev.reviewer_name}</td>
                                <td className="py-md text-secondary">@{rev.target_username}</td>
                                <td className="py-md">
                                  <div className="flex items-center gap-[1px]">
                                    {[1, 2, 3, 4, 5].map((s) => (
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
                                  {rev.review_text}
                                </td>
                                <td className="py-md text-right">
                                  <button
                                    onClick={() => handleDeleteProfileReview(rev.id, rev.reviewer_name || 'Anonymous', rev.target_username || 'User')}
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

              {/* PAGES TAB */}
              {activeTab === 'pages' && (
                <div className="flex flex-col gap-lg animate-fade-in">
                  
                  {/* Edit Page Form */}
                  {editingPage && (
                    <div className="bg-surface-container-low/35 p-md md:p-lg rounded-2xl border border-outline-variant/15 flex flex-col gap-md">
                      <h3 className="font-headline-md text-[18px] font-semibold text-on-surface flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[20px] text-primary">
                          edit_document
                        </span>
                        Edit Page: {editingPage.title}
                      </h3>
                      
                      <form onSubmit={handleUpdatePage} className="grid grid-cols-1 md:grid-cols-12 gap-md items-start">
                        <div className="md:col-span-4 flex flex-col gap-xs">
                          <label htmlFor="page-slug" className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                            Page Slug
                          </label>
                          <input
                            id="page-slug"
                            type="text"
                            value={editingPageSlug}
                            onChange={(e) => setEditingPageSlug(e.target.value)}
                            placeholder="e.g. home, about, policy..."
                            disabled={editingPage.slug === 'home' || editingPage.slug === 'about'}
                            className={`w-full px-md py-[10px] rounded-xl border border-outline-variant/30 bg-surface-bright text-on-surface text-body-sm font-body-sm placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition ${
                              editingPage.slug === 'home' || editingPage.slug === 'about' ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          />
                        </div>
                        
                        <div className="md:col-span-8 flex flex-col gap-xs">
                          <label htmlFor="page-title" className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                            Page Title
                          </label>
                          <input
                            id="page-title"
                            type="text"
                            value={editingPageTitle}
                            onChange={(e) => setEditingPageTitle(e.target.value)}
                            placeholder="e.g. Discover & Promote Advertisements Instantly..."
                            className="w-full px-md py-[10px] rounded-xl border border-outline-variant/30 bg-surface-bright text-on-surface text-body-sm font-body-sm placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                          />
                        </div>
                        
                        <div className="md:col-span-12 flex flex-col gap-xs">
                          <label htmlFor="page-content" className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                            Page Content
                          </label>
                          <textarea
                            id="page-content"
                            rows={4}
                            value={editingPageContent}
                            onChange={(e) => setEditingPageContent(e.target.value)}
                            placeholder="Provide descriptive page copywriting or markdown..."
                            className="w-full px-md py-[10px] rounded-xl border border-outline-variant/30 bg-surface-bright text-on-surface text-body-sm font-body-sm placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-y"
                          />
                        </div>
                        
                        {editingPageSlug === 'home' && (
                          <div className="md:col-span-12 flex flex-col gap-sm border-t border-outline-variant/20 pt-md mt-xs">
                            <h4 className="font-label-sm text-[12px] font-semibold text-secondary uppercase tracking-wider">
                              Select Featured Ads (Up to 8)
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-md">
                              {Array.from({ length: 8 }).map((_, index) => (
                                <div key={index} className="flex flex-col gap-xs">
                                  <label className="font-label-sm text-secondary text-[12px]">
                                    Slot {index + 1}
                                  </label>
                                  <select
                                    value={editingFeaturedAdIds[index] || 0}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value, 10);
                                      setEditingFeaturedAdIds((prev) => {
                                        const next = [...prev];
                                        next[index] = val;
                                        return next;
                                      });
                                    }}
                                    className="w-full px-md py-[10px] rounded-xl border border-outline-variant/30 bg-surface-bright text-on-surface text-body-sm font-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                                  >
                                    <option value={0}>-- None --</option>
                                    {ads.map((ad) => (
                                      <option key={ad.id} value={ad.id}>
                                        {ad.title} (₹{ad.price})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="md:col-span-12 flex items-center gap-sm justify-end mt-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPage(null);
                              setEditingPageSlug('');
                              setEditingPageTitle('');
                              setEditingPageContent('');
                            }}
                            className="py-[10px] px-lg rounded-xl text-label-md font-label-md bg-surface-container-highest text-secondary border border-outline-variant hover:brightness-95 active:scale-95 transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="py-[10px] px-lg rounded-xl text-label-md font-label-md bg-primary text-on-primary hover:brightness-110 active:scale-95 transition-all shadow-sm"
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Two Square Box Pages Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg max-w-2xl mt-md">
                    {['home', 'about'].map((slug) => {
                      const p = pages.find((page) => page.slug === slug);
                      if (!p) return null;
                      const isHome = slug === 'home';
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setEditingPage(p);
                            setEditingPageSlug(p.slug);
                            setEditingPageTitle(p.title);
                            setEditingPageContent(p.content);
                            if (p.slug === 'home') {
                              const ids = p.featured_ad_ids || [];
                              setEditingFeaturedAdIds(
                                Array.from({ length: 8 }, (_, i) => ids[i] || 0)
                              );
                            } else {
                              setEditingFeaturedAdIds(Array(8).fill(0));
                            }
                          }}
                          className={`aspect-square flex flex-col justify-between p-lg rounded-2xl border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container-high/85 cursor-pointer transition-all shadow-sm active:scale-[0.98] select-none ${
                            editingPage?.id === p.id ? 'ring-2 ring-primary border-primary bg-surface-container-high' : ''
                          }`}
                        >
                          <div className="flex flex-col gap-md">
                            <div className="flex items-center justify-between">
                              <span className={`material-symbols-outlined text-[36px] ${isHome ? 'text-primary' : 'text-tertiary'}`}>
                                {isHome ? 'home' : 'info'}
                              </span>
                              <span className="material-symbols-outlined text-secondary hover:text-primary transition text-[20px]">
                                edit
                              </span>
                            </div>
                            <div>
                              <h4 className="font-headline-sm text-[18px] font-bold text-on-surface capitalize">
                                {slug} Page
                              </h4>
                              <p className="text-secondary text-body-sm line-clamp-3 mt-xs">
                                {p.title || 'No title set'}
                              </p>
                            </div>
                          </div>
                          <div className="border-t border-outline-variant/20 pt-sm mt-md flex justify-between items-center">
                            <span className="text-secondary text-[11px] font-mono uppercase">
                              /{slug}
                            </span>
                            <span className="text-secondary text-[11px] font-body-sm">
                              Updated: {new Date(p.updated_at || p.created_at).toLocaleDateString(undefined, { dateStyle: 'short' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* FEATURED ADS TAB */}
              {activeTab === 'featured' && (
                <div className="flex flex-col gap-lg animate-fade-in">

                  {/* Header + Save */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md border-b border-outline-variant/20 pb-md">
                    <div>
                      <h3 className="font-headline-md text-[18px] font-semibold text-on-surface flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[20px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        Featured Ads — Home Page
                      </h3>
                      <p className="text-secondary text-body-sm mt-xs">
                        Select up to <span className="font-semibold text-primary">8 ads</span> to showcase in the Featured Listings section on the home page.
                      </p>
                    </div>
                    <button
                      onClick={handleSaveFeaturedAds}
                      disabled={featuredSaving}
                      className="py-[10px] px-lg rounded-xl text-label-md font-label-md bg-primary text-on-primary hover:brightness-110 active:scale-95 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-xs shrink-0"
                    >
                      {featuredSaving ? (
                        <>
                          <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                          Saving…
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">save</span>
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>

                  {/* Current Featured Slots */}
                  <div className="flex flex-col gap-sm">
                    <h4 className="font-label-sm text-[12px] font-semibold text-secondary uppercase tracking-wider flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[14px]">format_list_numbered</span>
                      Current Featured Slots ({featuredAdIds.length}/8)
                    </h4>

                    {featuredAdIds.length === 0 ? (
                      <div className="py-lg text-center text-secondary text-body-sm border border-dashed border-outline-variant/40 rounded-2xl bg-surface-container-low/30">
                        <span className="material-symbols-outlined text-[32px] block mb-xs text-outline-variant">star_border</span>
                        No featured ads selected yet. Pick ads from the list below.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-sm">
                        {featuredAdIds.map((id, idx) => {
                          const ad = ads.find((a) => a.id === id);
                          if (!ad) return null;
                          const thumb = ad.images?.[0]?.cloudinary_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200&auto=format&fit=crop';
                          return (
                            <div
                              key={id}
                              className="flex items-center gap-sm p-sm rounded-xl border border-primary/20 bg-primary-fixed/10 relative group"
                            >
                              <span className="absolute top-xs left-xs bg-primary text-on-primary text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center z-10 shrink-0">
                                {idx + 1}
                              </span>
                              <div className="w-14 h-12 rounded-lg overflow-hidden border border-outline-variant/20 shrink-0 mt-[2px]">
                                <img src={thumb} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="font-semibold text-on-surface text-[13px] truncate block">{ad.title}</span>
                                <span className="text-primary text-[12px] font-semibold">₹{ad.price.toLocaleString()}</span>
                                <span className="text-secondary text-[11px] truncate">{ad.category}</span>
                              </div>
                              <button
                                onClick={() => setFeaturedAdIds((prev) => prev.filter((fid) => fid !== id))}
                                className="shrink-0 w-7 h-7 rounded-full bg-error-container text-on-error-container flex items-center justify-center hover:brightness-95 active:scale-95 transition-all opacity-70 group-hover:opacity-100"
                                title="Remove from featured"
                              >
                                <span className="material-symbols-outlined text-[14px]">close</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Ad Picker */}
                  <div className="flex flex-col gap-sm">
                    <h4 className="font-label-sm text-[12px] font-semibold text-secondary uppercase tracking-wider flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[14px]">add_circle</span>
                      All Ads — Click to Add / Remove
                    </h4>

                    {/* Search */}
                    <div className="relative max-w-sm">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-secondary pointer-events-none">search</span>
                      <input
                        id="admin-featured-search"
                        type="text"
                        value={featuredSearch}
                        onChange={(e) => setFeaturedSearch(e.target.value)}
                        placeholder="Search ads by title or category…"
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-outline-variant/30 bg-surface-container text-on-surface text-body-sm font-body-sm placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                      />
                      {featuredSearch && (
                        <button
                          onClick={() => setFeaturedSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition"
                          aria-label="Clear search"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      )}
                    </div>

                    {/* Ad Grid */}
                    {(() => {
                      const filtered = featuredSearch.trim()
                        ? ads.filter(
                            (a) =>
                              a.title.toLowerCase().includes(featuredSearch.toLowerCase()) ||
                              a.category.toLowerCase().includes(featuredSearch.toLowerCase())
                          )
                        : ads;
                      return filtered.length === 0 ? (
                        <div className="py-xl text-center text-secondary font-body-md">
                          {featuredSearch.trim() ? `No ads match "${featuredSearch}".` : 'No advertisements found.'}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-sm max-h-[520px] overflow-y-auto pr-xs">
                          {filtered.map((ad) => {
                            const isFeatured = featuredAdIds.includes(ad.id);
                            const atLimit = featuredAdIds.length >= 8 && !isFeatured;
                            const thumb = ad.images?.[0]?.cloudinary_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200&auto=format&fit=crop';
                            const slotNumber = featuredAdIds.indexOf(ad.id) + 1;
                            return (
                              <button
                                key={ad.id}
                                disabled={atLimit}
                                onClick={() => {
                                  if (isFeatured) {
                                    setFeaturedAdIds((prev) => prev.filter((id) => id !== ad.id));
                                  } else if (featuredAdIds.length < 8) {
                                    setFeaturedAdIds((prev) => [...prev, ad.id]);
                                  }
                                }}
                                className={`text-left rounded-xl border p-sm flex flex-col gap-xs transition-all duration-200 relative group ${
                                  isFeatured
                                    ? 'border-primary bg-primary-fixed/15 shadow-sm ring-2 ring-primary/10'
                                    : atLimit
                                    ? 'border-outline-variant/20 bg-surface-container-low/30 opacity-40 cursor-not-allowed'
                                    : 'border-outline-variant/20 bg-surface-container-lowest hover:border-primary/40 hover:bg-primary-fixed/5 hover:shadow-sm active:scale-[0.99]'
                                }`}
                                title={atLimit ? 'Maximum 8 featured ads reached' : isFeatured ? 'Click to remove from featured' : 'Click to add to featured'}
                              >
                                {/* Featured badge / slot number */}
                                {isFeatured && (
                                  <span className="absolute top-xs right-xs bg-primary text-on-primary text-[9px] font-bold px-xs py-[1px] rounded-full flex items-center gap-[2px] z-10">
                                    <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    #{slotNumber}
                                  </span>
                                )}

                                {/* Thumbnail */}
                                <div className="relative aspect-video rounded-lg overflow-hidden bg-surface-container">
                                  <img src={thumb} alt="" className="w-full h-full object-cover" />
                                  {/* Overlay on hover for non-featured */}
                                  {!isFeatured && !atLimit && (
                                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                                    </div>
                                  )}
                                  {isFeatured && (
                                    <div className="absolute inset-0 bg-error/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <span className="material-symbols-outlined text-error text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>remove_circle</span>
                                    </div>
                                  )}
                                </div>

                                {/* Info */}
                                <div className="flex flex-col min-w-0 px-[2px]">
                                  <span className="text-[12px] font-bold text-on-surface truncate block leading-tight">{ad.title}</span>
                                  <div className="flex items-center justify-between mt-[2px]">
                                    <span className="text-[11px] text-secondary truncate">{ad.category}</span>
                                    <span className="text-[11px] font-semibold text-primary shrink-0 ml-xs">₹{ad.price.toLocaleString()}</span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}
                    {featuredAdIds.length >= 8 && (
                      <p className="text-[12px] text-secondary text-center bg-surface-container-low border border-outline-variant/20 rounded-lg px-md py-sm">
                        Maximum of 8 featured ads reached. Remove a slot above to add a different ad.
                      </p>
                    )}
                  </div>

                </div>
              )}

            </>
          )}

        </div>

      </main>

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        isDestructive={confirmConfig.isDestructive}
        onConfirm={confirmConfig.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar.js';
import { createAd } from '../api/ads.js';
import { compressImage } from '../utils/imageCompressor.js';
import { getCategories, type Category } from '../api/categories.js';
import { buildCategoryTree, flattenCategoryTree } from '../utils/categoryTree.js';


export const CreateAdPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Image states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Listen to message events from the map-picker iframe
  useEffect(() => {
    const handleMapMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'LOCATION_PICKED') {
        const { lat, lng } = e.data;
        setLatitude(lat);
        setLongitude(lng);
        reverseGeocode(lat, lng);
      }
    };
    window.addEventListener('message', handleMapMessage);
    return () => window.removeEventListener('message', handleMapMessage);
  }, []);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const list = await getCategories();
        setCategories(list);
      } catch (err) {
        console.error('Failed to load categories in CreateAdPage', err);
        setCategories([
          { id: 1, name: 'Electronics', symbol: 'devices', parent_id: null, created_at: '' },
          { id: 2, name: 'Furniture', symbol: 'chair', parent_id: null, created_at: '' },
          { id: 3, name: 'Vehicles', symbol: 'directions_car', parent_id: null, created_at: '' },
          { id: 4, name: 'Services', symbol: 'build', parent_id: null, created_at: '' },
          { id: 5, name: 'Other', symbol: 'category', parent_id: null, created_at: '' }
        ]);
      }
    };
    fetchCats();
  }, []);

  const iframeSrc = useRef(
    latitude !== null && longitude !== null
      ? `/map-picker.html?lat=${latitude}&lng=${longitude}`
      : '/map-picker.html'
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    setErrorMsg(null);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      setErrorMsg('Please upload image files only.');
      return;
    }

    const totalCount = selectedFiles.length + imageFiles.length;
    if (totalCount > 5) {
      setErrorMsg('You can upload a maximum of 5 images per advertisement.');
      return;
    }

    // Check size limit (10MB per image)
    const overSized = imageFiles.some(file => file.size > 10 * 1024 * 1024);
    if (overSized) {
      setErrorMsg('Each image must be smaller than 10MB.');
      return;
    }

    const newFiles = [...selectedFiles, ...imageFiles];
    const newPreviews = [...imagePreviews, ...imageFiles.map(file => URL.createObjectURL(file))];

    setSelectedFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const removeImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      if (data.display_name) {
        setLocation(data.display_name);
      }
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validations
    if (!title.trim() || !description.trim() || !category || !price || !location.trim() || !contactInfo.trim()) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (parseFloat(price) <= 0) {
      setErrorMsg('Price must be a positive value.');
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('price', price);
      formData.append('location', location.trim());
      formData.append('contact_info', contactInfo.trim());

      if (latitude !== null) formData.append('latitude', String(latitude));
      if (longitude !== null) formData.append('longitude', String(longitude));

      // Compress images before uploading
      const compressedFilesPromises = selectedFiles.map((file) => compressImage(file, 1200, 0.8));
      const compressedFiles = await Promise.all(compressedFilesPromises);

      // Append all compressed images
      compressedFiles.forEach((file) => {
        formData.append('images', file);
      });

      await createAd(formData);
      console.log('Ad published successfully! Redirecting to dashboard...');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error creating advertisement:', err);
      const apiError = err.response?.data?.error?.message || 'Failed to create advertisement. Please check fields and try again.';
      setErrorMsg(apiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow w-full max-w-container-max mx-auto px-md md:px-xl py-xl md:py-xxl flex flex-col gap-xl">

        {/* Page Header */}
        <div className="flex flex-col gap-xs">
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Create Advertisement</h1>
          <p className="font-body-md text-body-md text-secondary">Fill in the details below to publish a new advertisement to the marketplace.</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-md bg-error-container text-on-error-container rounded-lg border border-error/10 text-body-sm font-body-sm">
            {errorMsg}
          </div>
        )}

        {/* Bento Grid Form Layout */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">

          {/* Left Column: Primary Details (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-xl">
            <div className="bg-surface-container-lowest rounded-2xl elevation-1 p-xl flex flex-col gap-lg border border-outline-variant/30">

              {/* Title */}
              <div className="flex flex-col gap-sm">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="ad-title">Advertisement Title</label>
                <div className="relative input-glow rounded-md transition-shadow duration-200">
                  <input
                    className="w-full bg-surface-bright border border-outline-variant rounded-md px-md py-[10px] font-body-md text-body-md text-on-surface placeholder:text-secondary/60 focus:border-primary focus:outline-none transition-colors"
                    id="ad-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Vintage Leather Sofa"
                    type="text"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                {/* Category Dropdown */}
                <div className="flex flex-col gap-sm">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="ad-category">Category</label>
                  <div className="relative input-glow rounded-md transition-shadow duration-200">
                    <select
                      className="w-full bg-surface-bright border border-outline-variant rounded-md px-md py-[10px] font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none transition-colors appearance-none cursor-pointer"
                      id="ad-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    >
                      <option value="" disabled>Select a category...</option>
                      {flattenCategoryTree(buildCategoryTree(categories)).map((cat) => {
                        const prefix = '\u00A0'.repeat(cat.depth * 3);
                        const arrow = cat.depth > 0 ? '↳ ' : '';
                        return (
                          <option key={cat.id} value={cat.name}>
                            {prefix}{arrow}{cat.name}
                          </option>
                        );
                      })}
                    </select>
                    <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-secondary pointer-events-none">expand_more</span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex flex-col gap-sm">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="ad-price">Price</label>
                  <div className="relative input-glow rounded-md transition-shadow duration-200 flex items-center bg-surface-bright border border-outline-variant focus-within:border-primary overflow-hidden">
                    <span className="pl-md pr-sm font-body-md text-body-md text-secondary border-r border-outline-variant/50 bg-surface-container-low h-full flex items-center">₹</span>
                    <input
                      className="w-full bg-transparent border-none px-sm py-[10px] font-body-md text-body-md text-on-surface placeholder:text-secondary/60 focus:ring-0 focus:outline-none"
                      id="ad-price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Location — Leaflet Map Picker */}
              <div className="flex flex-col gap-sm">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="ad-location">
                  Location
                </label>

                {/* Interactive map iframe */}
                <div
                  className="w-full rounded-xl overflow-hidden border border-outline-variant bg-surface-container"
                  style={{ height: '280px' }}
                >
                  <iframe
                    title="Location Picker Map"
                    src={iframeSrc.current}
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                </div>

                <p className="font-body-sm text-body-sm text-secondary">
                  Click anywhere on the map to pin your location. The address will fill automatically.
                </p>

                {/* Address input — auto-filled but still manually editable */}
                <div className="relative input-glow rounded-md transition-shadow duration-200">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-secondary">
                    {isGeocoding ? 'sync' : 'location_on'}
                  </span>
                  <input
                    className="w-full bg-surface-bright border border-outline-variant rounded-md pl-[44px] pr-md py-[10px] font-body-md text-body-md text-on-surface placeholder:text-secondary/60 focus:border-primary focus:outline-none transition-colors"
                    id="ad-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Click the map or type an address manually..."
                    type="text"
                    required
                  />
                </div>

                {/* Coordinates badge — shows after pin */}
                {latitude !== null && longitude !== null && (
                  <span className="font-label-sm text-label-sm text-secondary bg-surface-container-low px-sm py-xs rounded-full self-start">
                    📍 {latitude.toFixed(5)}, {longitude.toFixed(5)}
                  </span>
                )}
              </div>

              {/* Contact Information */}
              <div className="flex flex-col gap-sm">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="ad-contact">Contact Information</label>
                <div className="relative input-glow rounded-md transition-shadow duration-200">
                  <textarea
                    className="w-full bg-surface-bright border border-outline-variant rounded-md px-md py-sm font-body-md text-body-md text-on-surface placeholder:text-secondary/60 focus:border-primary focus:outline-none transition-colors resize-y"
                    id="ad-contact"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="Provide phone number, email or pickup instructions..."
                    rows={3}
                    required
                  ></textarea>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-sm">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="ad-desc">Description</label>
                <div className="relative input-glow rounded-md transition-shadow duration-200">
                  <textarea
                    className="w-full bg-surface-bright border border-outline-variant rounded-md px-md py-sm font-body-md text-body-md text-on-surface placeholder:text-secondary/60 focus:border-primary focus:outline-none transition-colors resize-y"
                    id="ad-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide detailed information about your item or service..."
                    rows={6}
                    required
                  ></textarea>
                </div>
                <span className="text-right font-body-sm text-body-sm text-secondary">{description.length} / 2000 characters</span>
              </div>
            </div>
          </div>

          {/* Right Column: Media & Actions (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-xl">

            {/* Image Upload Area */}
            <div className="bg-surface-container-lowest rounded-2xl elevation-1 p-xl flex flex-col gap-md border border-outline-variant/30">
              <div className="flex justify-between items-center">
                <h2 className="font-headline-md text-[20px] leading-tight font-semibold text-on-surface">Media</h2>
                <span className="font-label-sm text-label-sm text-secondary bg-surface-container-low px-sm py-xs rounded-full">
                  {selectedFiles.length} / 5
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-secondary">Upload up to 5 images. The first image will be the cover photo.</p>

              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="mt-sm border-2 border-dashed border-outline-variant rounded-xl p-xl flex flex-col items-center justify-center text-center gap-md bg-surface-bright hover:bg-surface-container-low transition-colors cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-primary-fixed/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[28px]">cloud_upload</span>
                </div>
                <div>
                  <span className="font-label-md text-label-md text-primary font-semibold">Click to upload</span>
                  <span className="font-body-md text-body-md text-secondary"> or drag and drop</span>
                </div>
                <span className="font-body-sm text-body-sm text-secondary/70">PNG, JPG, WEBP up to 10MB</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
              </div>

              {/* Image Slots Preview */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-sm mt-sm">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className={`relative aspect-square rounded-lg border border-outline-variant bg-surface-container-lowest overflow-hidden group ${index === 0 ? 'col-span-2 row-span-2' : ''
                        }`}
                    >
                      <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />

                      {/* Cover label for first image */}
                      {index === 0 && (
                        <div className="absolute bottom-xs left-xs bg-surface-container-highest/80 backdrop-blur-sm px-[6px] py-[2px] rounded text-[10px] font-semibold text-on-surface uppercase tracking-wider">
                          Cover
                        </div>
                      )}

                      {/* Delete button on hover */}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-xs right-xs bg-error text-on-error hover:bg-error-container hover:text-on-error-container rounded-full p-[4px] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions Card */}
            <div className="bg-surface-container-lowest rounded-2xl elevation-1 p-xl border border-outline-variant/30 flex flex-col gap-md">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-on-primary font-label-md text-label-md px-xl py-md rounded-lg elevation-1 btn-primary-inner hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-sm">send</span>
                {isSubmitting ? 'Optimizing & Publishing...' : 'Publish Advertisement'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-full bg-surface-bright text-secondary border border-outline-variant font-label-md text-label-md px-xl py-md rounded-lg hover:bg-surface-container-low active:scale-[0.98] transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

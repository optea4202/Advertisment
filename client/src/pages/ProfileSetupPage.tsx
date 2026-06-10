import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { updateProfile } from '../api/users.js';

export const ProfileSetupPage: React.FC = () => {
  const { user, syncUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  
  // Image states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Prepopulate form fields with synced database values from Clerk
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
      if (user.photo_url) {
        setImagePreview(user.photo_url);
      }
    }
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Image size must be less than 10MB.');
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrorMsg(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (username.trim().length < 3) {
      setErrorMsg('Username must be at least 3 characters long.');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setErrorMsg('Username can only contain letters, numbers, and underscores.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Phone number is required to complete profile setup.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append('username', username.trim());
      formData.append('phone', phone.trim());
      formData.append('bio', bio.trim());
      
      if (selectedFile) {
        formData.append('photo', selectedFile);
      }

      await updateProfile(formData);
      console.log('Profile setup complete. Re-syncing user auth state...');
      await syncUser(); // Refresh state so route guard redirects to home
    } catch (err: any) {
      console.error('Error during profile setup:', err);
      const apiError = err.response?.data?.error?.message || 'Failed to save profile. Please try again.';
      setErrorMsg(apiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-md md:p-xl relative overflow-hidden">
      {/* Ambient Background Element */}
      <div className="absolute top-0 left-0 w-full h-[409px] bg-gradient-to-b from-surface-container-low to-background -z-10"></div>
      <div className="absolute -top-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-[100px] -z-10 pointer-events-none"></div>

      {/* Main Container */}
      <main className="w-full max-w-[600px] bg-surface-container-lowest rounded-2xl shadow-1 p-lg md:p-xl flex flex-col relative z-10 border border-outline-variant/30">
        
        {/* Header Section */}
        <header className="flex flex-col items-center mb-xl">
          <div className="mb-lg">
            <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">AdHub</span>
          </div>
          
          <div className="w-full max-w-[300px] mb-lg">
            <div className="flex justify-between items-center mb-sm">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Profile Setup</span>
              <span className="font-label-sm text-label-sm text-primary font-bold">Step 1 of 1</span>
            </div>
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
              <div className="w-full h-full bg-primary rounded-full transition-all duration-500 ease-out"></div>
            </div>
          </div>

          <div className="text-center">
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-xs">Personal Details</h1>
            <p className="font-body-md text-body-md text-secondary">Let's build your identity on the marketplace.</p>
          </div>
        </header>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-lg p-md bg-error-container text-on-error-container rounded-lg border border-error/10 text-body-sm font-body-sm">
            {errorMsg}
          </div>
        )}

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
          
          {/* Profile Photo Upload */}
          <div className="flex flex-col items-center justify-center gap-sm mb-md">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <div className="w-24 h-24 rounded-full bg-surface-container border-2 border-dashed border-outline-variant flex items-center justify-center overflow-hidden transition-all duration-200 group-hover:border-primary group-hover:bg-surface-container-low">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-secondary group-hover:text-primary text-[32px] transition-colors">add_a_photo</span>
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-primary/0 group-hover:bg-primary/5 transition-colors duration-200 pointer-events-none"></div>
            </div>
            <span className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors cursor-pointer" onClick={handleAvatarClick}>
              {imagePreview ? 'Change Photo' : 'Upload Photo'}
            </span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            {/* Username */}
            <div className="flex flex-col gap-xs md:col-span-2">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="username">Username</label>
              <input
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md text-on-surface placeholder:text-secondary-fixed-dim focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all duration-200"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. ad_maverick"
                type="text"
                required
              />
            </div>

            {/* Email (Read-only) */}
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="email">Email Address</label>
              <input
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md text-secondary cursor-not-allowed opacity-80"
                id="email"
                value={email}
                disabled
                type="email"
              />
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="phone">Phone Number</label>
              <input
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md text-on-surface placeholder:text-secondary-fixed-dim focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all duration-200"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                type="tel"
                required
              />
            </div>

            {/* Short Bio */}
            <div className="flex flex-col gap-xs md:col-span-2">
              <label className="font-label-md text-label-md text-on-surface flex justify-between" htmlFor="bio">
                <span>Short Bio</span>
                <span className="text-secondary font-normal font-body-sm text-body-sm">Optional</span>
              </label>
              <textarea
                className="w-full h-24 resize-none bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md text-on-surface placeholder:text-secondary-fixed-dim focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all duration-200"
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a brief story about your advertising focus..."
              ></textarea>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-md pt-lg border-t border-surface-container flex justify-end">
            <button
              className="w-full md:w-auto bg-primary text-on-primary border-t border-white/20 rounded-lg px-xl py-sm font-label-md text-label-md shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-all duration-200 flex items-center justify-center gap-sm disabled:opacity-55 disabled:cursor-not-allowed"
              type="submit"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? 'Saving Profile...' : 'Save Profile & Continue'}</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

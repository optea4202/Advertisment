import React, { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigate('/');
      } else {
        console.warn('Unhandled sign in status:', result.status);
        setErrorMsg('Sign in could not be completed. Please check your credentials.');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setErrorMsg(err.errors?.[0]?.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setErrorMsg(err.errors?.[0]?.message || 'Google authentication failed.');
    }
  };

  return (
    <div className="bg-surface-container-lowest min-h-screen flex flex-col md:flex-row antialiased text-on-background selection:bg-primary-container selection:text-on-primary-container">
      {/* Left Panel: Branding & Hero (Hidden on Mobile) */}
      <div className="hidden md:flex md:w-[45%] lg:w-1/2 bg-surface-container-low flex-col justify-between p-xxl relative overflow-hidden border-r border-outline-variant">
        {/* Background Decor */}
        <div className="absolute inset-0 z-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(var(--color-outline-variant) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-fixed/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 z-0 pointer-events-none"></div>
        
        {/* Branding Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-[-12px] shrink-0 select-none">
            <img
              src="/Project.png"
              alt="ZoBazar logo"
              width="70"
              height="70"
              className="flex-shrink-0 w-[70px] h-[70px] object-contain ml-3"
            />
            <span className="flex flex-col leading-tight">
              <span
                className="font-black tracking-widest text-[15px] md:text-[17px]"
                style={{ letterSpacing: '0.12em' }}
              >
                <span style={{ color: '#00685f' }}>Zo</span>
                <span style={{ color: '#1A3E8C' }}>Bazar</span>
              </span>
              <span
                className="font-semibold tracking-wider text-[8px] md:text-[9px] uppercase"
                style={{ color: '#1A6FAB', letterSpacing: '0.1em' }}
              >
                Mizoram Marketplace
              </span>
            </span>
          </div>
          <p className="font-body-lg text-body-lg text-secondary mt-sm max-w-sm">
            The high-performance marketplace for premium digital advertising inventory.
          </p>
        </div>

        {/* Hero Illustration */}
        <div className="relative z-10 flex-grow flex items-center justify-center my-xl">
          <div className="w-full max-w-[480px] aspect-square rounded-2xl bg-surface-container-highest shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] overflow-hidden relative border border-outline-variant/50">
            <img 
              alt="ZoBazar Interface" 
              className="w-full h-full object-cover opacity-90 mix-blend-multiply" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGqEgEEyCJ1buKkgNxQQovVL6RzIlYh5edZP0tYOoUgNWOtEZTJy5mB_HmZFPHdBWUjCDDANbk1SK1RxGbr2aIOCDk6YJOr9QWlU0NV5KPyBoDNWfiOdhZdy-6Gm7GSjcW0fSDoHDhJtw-siqQPLrmc46lJEoNdQlCDoK3dt4I_CHvejFaka6nE04KP9yv0REBHtH_Se7CgfVyKfJVPXvr8hUh3rb0H2ZKKE0C4tYereWHguXeDCUP0f8bkuwDDd_TJYaa6z040oo"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-surface-container-low/80 to-transparent"></div>
          </div>
        </div>

        {/* Footer badges */}
        <div className="relative z-10 flex items-center gap-gutter text-secondary font-label-sm text-label-sm uppercase tracking-wider">
          <span>Enterprise Grade</span>
          <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
          <span>Secure Ecosystem</span>
          <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
          <span>Real-time Analytics</span>
        </div>
      </div>

      {/* Right Panel: Form Area */}
      <div className="w-full md:w-[55%] lg:w-1/2 flex items-center justify-center p-gutter md:p-xl bg-surface-container-lowest relative z-10 min-h-screen overflow-y-auto">
        {/* Mobile Header & Back to Home */}
        <div className="absolute top-0 left-0 w-full p-gutter flex items-center justify-between md:hidden">
          <Link 
            to="/" 
            className="inline-flex items-center gap-xs text-secondary hover:text-primary transition-colors font-label-sm text-label-sm"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Home
          </Link>
          <div className="flex items-center gap-[-10px] shrink-0 select-none">
            <img
              src="/Project.png"
              alt="ZoBazar logo"
              width="50"
              height="50"
              className="flex-shrink-0 w-[50px] h-[50px] object-contain ml-2"
            />
            <span className="flex flex-col leading-tight">
              <span
                className="font-black tracking-widest text-[14px]"
                style={{ letterSpacing: '0.12em' }}
              >
                <span style={{ color: '#00685f' }}>Zo</span>
                <span style={{ color: '#1A3E8C' }}>Bazar</span>
              </span>
              <span
                className="font-semibold tracking-wider text-[8px] uppercase"
                style={{ color: '#1A6FAB', letterSpacing: '0.1em' }}
              >
                Mizoram Marketplace
              </span>
            </span>
          </div>
        </div>

        {/* Desktop Back to Home Link */}
        <div className="absolute top-6 left-6 hidden md:block">
          <Link 
            to="/" 
            className="inline-flex items-center gap-xs text-secondary hover:text-primary transition-colors font-label-md text-label-md"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Home
          </Link>
        </div>

        <div className="w-full max-w-[420px] flex flex-col gap-xl fade-in-up mt-16 md:mt-0">
          {/* Welcome Text */}
          <div className="flex flex-col gap-xs">
            <h2 className="font-display-lg text-headline-lg md:text-display-lg text-on-surface">Welcome back</h2>
            <p className="font-body-md text-body-md text-secondary">Enter your details to access your dashboard.</p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-md bg-error-container text-on-error-container rounded-lg border border-error/10 text-body-sm font-body-sm">
              {errorMsg}
            </div>
          )}

          {/* Tabs */}
          <div className="flex p-[4px] bg-surface-container-low rounded-lg border border-outline-variant/50">
            <button className="flex-1 py-sm text-center bg-surface-container-lowest text-primary font-label-md text-label-md rounded shadow-sm border border-outline-variant/20 transition-all">
              Login
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="flex-1 py-sm text-center text-secondary hover:text-on-surface font-label-md text-label-md rounded transition-colors"
            >
              Sign Up
            </button>
          </div>

          {/* Google SSO Button */}
          <button 
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-md px-md flex items-center justify-center gap-md bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container-low transition-colors duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)] focus:outline-none focus:ring-[3px] focus:ring-primary/10"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-md">
            <div className="h-px bg-outline-variant flex-1"></div>
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wide">Or email</span>
            <div className="h-px bg-outline-variant flex-1"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
            <div className="flex flex-col gap-sm">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="email">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-secondary text-[20px]">mail</span>
                </div>
                <input 
                  className="w-full pl-10 pr-md py-[10px] bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface font-body-md placeholder-secondary focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all shadow-sm" 
                  id="email" 
                  placeholder="name@company.com" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-sm">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="password">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-secondary text-[20px]">lock</span>
                </div>
                <input 
                  className="w-full pl-10 pr-10 py-[10px] bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface font-body-md placeholder-secondary focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all shadow-sm" 
                  id="password" 
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  className="absolute inset-y-0 right-0 pr-md flex items-center text-secondary hover:text-on-surface transition-colors" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility" : "visibility_off"}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-[-8px]">
              <label className="flex items-center gap-sm cursor-pointer group">
                <input 
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 bg-surface-container-lowest cursor-pointer transition-colors" 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="font-body-sm text-body-sm text-secondary group-hover:text-on-surface transition-colors">Remember me</span>
              </label>
              <a className="font-label-md text-label-md text-primary hover:text-surface-tint transition-colors" href="#">Forgot password?</a>
            </div>

            <button 
              className="w-full mt-sm py-[12px] px-md bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.05)] border-t border-white/20 hover:bg-surface-tint hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-sm disabled:opacity-50" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </form>

          <p className="text-center font-body-sm text-body-sm text-secondary mt-xl">
            By continuing, you agree to zobazar's &nbsp;
            <a className="text-primary hover:underline" href="#">Terms of Service</a> &nbsp;and &nbsp;
            <a className="text-primary hover:underline" href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

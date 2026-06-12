import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import { AuthProvider } from './context/AuthContext.js';
import { ChatProvider } from './context/ChatContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import { LoginPage } from './pages/LoginPage.js';
import { SignUpPage } from './pages/SignUpPage.js';
import { ProfileSetupPage } from './pages/ProfileSetupPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { UserProfilePage } from './pages/UserProfilePage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { CreateAdPage } from './pages/CreateAdPage.js';
import { EditAdPage } from './pages/EditAdPage.js';
import { FeedPage } from './pages/FeedPage.js';
import { AdDetailPage } from './pages/AdDetailPage.js';
import { AdminPage } from './pages/AdminPage.js';
import { AdminHomePage } from './pages/AdminHomePage.js';
import { AdminRoute } from './components/AdminRoute.js';
import { InboxPage } from './pages/InboxPage.js';
import { WishlistProvider } from './context/WishlistContext.js';

// Get publishable key from environment
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error('Missing Clerk Publishable Key in environment configuration (VITE_CLERK_PUBLISHABLE_KEY).');
}

function App() {
  return (
    <ThemeProvider>
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <AuthProvider>
          <WishlistProvider>
            <BrowserRouter>
              <ChatProvider>
              <Routes>
              {/* Public Auth Routes */}
              <Route path="/login/*" element={<LoginPage />} />
              <Route path="/signup/*" element={<SignUpPage />} />
              <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={<DashboardPage />}
              />

              <Route
                path="/ads/create"
                element={
                  <ProtectedRoute>
                    <CreateAdPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/ads/edit/:id"
                element={
                  <ProtectedRoute>
                    <EditAdPage />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/ads/:id"
                element={<AdDetailPage />}
              />
              
              <Route
                path="/setup"
                element={
                  <ProtectedRoute>
                    <ProfileSetupPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile/:id"
                element={<UserProfilePage />}
              />

              <Route
                path="/inbox"
                element={
                  <ProtectedRoute>
                    <InboxPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/home"
                element={
                  <AdminRoute>
                    <AdminHomePage />
                  </AdminRoute>
                }
              />

              {/* Main Landing Page (Ad Feed) */}
              <Route
                path="/"
                element={<FeedPage />}
              />

              {/* Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
              </ChatProvider>
            </BrowserRouter>
          </WishlistProvider>
        </AuthProvider>
      </ClerkProvider>
    </ThemeProvider>
  );
}

export default App;

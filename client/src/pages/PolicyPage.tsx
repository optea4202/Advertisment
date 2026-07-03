import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';

export const PolicyPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <Navbar />

      <main className="flex-grow max-w-[800px] w-full mx-auto px-md py-xl md:py-xxl">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-lg inline-flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md px-sm py-xs -ml-sm"
          aria-label="Go back"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span className="font-label-md text-label-md">Back</span>
        </button>

        {/* Page Header */}
        <div className="mb-xl">
          <div className="flex items-center gap-sm mb-xs">
            <span className="material-symbols-outlined text-primary text-[32px]">policy</span>
            <h1 className="text-headline-lg-mobile md:text-headline-lg font-bold tracking-tight m-0">
              Privacy Policy
            </h1>
          </div>
          <p className="text-on-surface-variant text-body-sm m-0">
            Last Updated: July 3, 2026
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg md:p-xl shadow-1 flex flex-col gap-lg leading-relaxed">
          <p className="text-body-md m-0">
            We value your privacy and aim to be transparent about how data is handled on zobazar (the "Platform"). This Privacy Policy explains what information is collected, how it is used, and what control you have over it.
          </p>

          <hr className="border-t border-outline-variant/15 my-xs m-0" />

          {/* Section 1 */}
          <section className="flex flex-col gap-xs">
            <h2 className="text-headline-md text-on-surface font-semibold m-0 flex items-center gap-xs">
              <span className="text-primary text-[20px] font-bold">1.</span> Personal Data Disclaimer
            </h2>
            <p className="text-body-md text-on-surface-variant m-0">
              zobazar is a public classifieds platform. We are not responsible for the security, exposure, misuse, or unauthorized access of any phone numbers, email addresses, photos, or other personal details you publish on your profile or listings. All information is shared at your own risk.
            </p>
          </section>

          {/* Section 2 */}
          <section className="flex flex-col gap-xs">
            <h2 className="text-headline-md text-on-surface font-semibold m-0 flex items-center gap-xs">
              <span className="text-primary text-[20px] font-bold">2.</span> Public Information
            </h2>
            <div className="flex flex-col gap-sm text-body-md text-on-surface-variant">
              <p className="m-0">
                <strong>Advertisements:</strong> Any details you include in your advertisements (title, description, price, location coordinates, contact details, and images) are immediately public and searchable by all guests and users of the Platform.
              </p>
              <p className="m-0">
                <strong>Seller Profiles:</strong> Your username, bio, profile photo, and public comments/reviews are publicly visible. Private contact details (like your login email and internal Clerk IDs) are kept secure and are not exposed.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="flex flex-col gap-xs">
            <h2 className="text-headline-md text-on-surface font-semibold m-0 flex items-center gap-xs">
              <span className="text-primary text-[20px] font-bold">3.</span> Third-Party Service Providers
            </h2>
            <div className="flex flex-col gap-sm text-body-md text-on-surface-variant">
              <p className="m-0">
                We integrate with external services to power the Platform:
              </p>
              <ul className="list-disc pl-md m-0 flex flex-col gap-xs font-body-md text-on-surface-variant">
                <li><strong>Clerk:</strong> Manages accounts, credentials, signs ups, and session tokens.</li>
                <li><strong>Cloudinary:</strong> Stores and delivers uploaded images for profiles and ads.</li>
                <li><strong>Resend:</strong> Handles transactional emails sent to ad owners when new reviews/comments are posted.</li>
                <li><strong>Algolia:</strong> Indexes listings to provide instant client-side autocomplete and searches.</li>
              </ul>
              <p className="m-0">
                These third-party platforms apply their own privacy policies to data passed to them.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="flex flex-col gap-xs">
            <h2 className="text-headline-md text-on-surface font-semibold m-0 flex items-center gap-xs">
              <span className="text-primary text-[20px] font-bold">4.</span> Data Retention and Deletion
            </h2>
            <div className="flex flex-col gap-sm text-body-md text-on-surface-variant">
              <p className="m-0">
                You retain control over your data. You can edit your profile details or delete your advertisements at any time. When an advertisement is deleted, the corresponding images are purged from Cloudinary, and all database records are permanently deleted.
              </p>
              <p className="m-0">
                <strong>Account Termination:</strong> You can choose to permanently terminate your account at any time through the Account Settings page. Upon confirmation, your profile data, Clerk credentials, published ads (including ad images on Cloudinary), chat conversations, messages, reviews, comments, and local database entries will be immediately and permanently deleted. This action is irreversible.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="flex flex-col gap-xs">
            <h2 className="text-headline-md text-on-surface font-semibold m-0 flex items-center gap-xs">
              <span className="text-primary text-[20px] font-bold">5.</span> Terms &amp; Conditions
            </h2>
            <p className="text-body-md text-on-surface-variant m-0">
              For rules and guidelines regarding the usage of the Platform, transaction liabilities, disputes, and moderation policies, please refer to our{' '}
              <Link to="/terms" className="text-primary hover:underline font-semibold">
                Terms &amp; Conditions
              </Link>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

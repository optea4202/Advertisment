import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';

export const TermsPage: React.FC = () => {
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
            <span className="material-symbols-outlined text-primary text-[32px]">gavel</span>
            <h1 className="text-headline-lg-mobile md:text-headline-lg font-bold tracking-tight m-0">
              Terms & Conditions
            </h1>
          </div>
          <p className="text-on-surface-variant text-body-sm m-0">
            Last Updated: July 3, 2026
          </p>
        </div>

        {/* Main T&C Content Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg md:p-xl shadow-1 flex flex-col gap-lg leading-relaxed">
          <p className="text-body-md m-0">
            By accessing or using zobazar (the "Platform"), you agree to these Terms. If you do not agree, do not use the Platform.
          </p>

          <hr className="border-t border-outline-variant/15 my-xs m-0" />

          {/* Section 1 */}
          <section className="flex flex-col gap-xs">
            <h2 className="text-headline-md text-on-surface font-semibold m-0 flex items-center gap-xs">
              <span className="text-primary text-[20px] font-bold">1.</span> Nature of the Platform
            </h2>
            <p className="text-body-md text-on-surface-variant m-0">
              zobazar is a peer-to-peer advertising and classifieds venue. We facilitate connections between buyers and sellers, but do not participate in any actual transactions, payments, or logistics.
            </p>
          </section>

          {/* Section 2 */}
          <section className="flex flex-col gap-xs">
            <h2 className="text-headline-md text-on-surface font-semibold m-0 flex items-center gap-xs">
              <span className="text-primary text-[20px] font-bold">2.</span> Transactions, Scams, and Disputes
            </h2>
            <div className="flex flex-col gap-sm text-body-md text-on-surface-variant">
              <p className="m-0">
                <strong>No Transaction Liability:</strong> zobazar takes no responsibility or liability for scams, fraud, financial losses, payment issues, or damaged/defective goods.
              </p>
              <p className="m-0">
                <strong>No Dispute Resolution:</strong> Any transaction or agreement is strictly between the buyer and seller. zobazar is not a party to, and will not mediate or be held liable for, disputes between users.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="flex flex-col gap-xs">
            <h2 className="text-headline-md text-on-surface font-semibold m-0 flex items-center gap-xs">
              <span className="text-primary text-[20px] font-bold">3.</span> Platform Moderation
            </h2>
            <p className="text-body-md text-on-surface-variant m-0">
              We reserve the right to delete advertisements, reviews, comments, or ban accounts at our sole discretion, without notice or liability.
            </p>
          </section>

          {/* Section 4 */}
          <section className="flex flex-col gap-xs">
            <h2 className="text-headline-md text-on-surface font-semibold m-0 flex items-center gap-xs">
              <span className="text-primary text-[20px] font-bold">4.</span> Limitation of Liability
            </h2>
            <p className="text-body-md text-on-surface-variant m-0">
              To the maximum extent permitted by law, zobazar and its creators shall not be liable for any indirect, incidental, or consequential damages, or any financial or data losses arising from your use of the Platform.
            </p>
          </section>

          {/* Section 5 */}
          <section className="flex flex-col gap-xs">
            <h2 className="text-headline-md text-on-surface font-semibold m-0 flex items-center gap-xs">
              <span className="text-primary text-[20px] font-bold">5.</span> Privacy Policy
            </h2>
            <p className="text-body-md text-on-surface-variant m-0">
              Your privacy is important to us. Please read our detailed{' '}
              <Link to="/policy" className="text-primary hover:underline font-semibold">
                Privacy Policy
              </Link>{' '}
              to learn how we handle personal data and disclaimer guidelines.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

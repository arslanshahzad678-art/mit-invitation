import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Shield, FileText, ArrowLeft } from 'lucide-react';

export const TermsPrivacyPage: React.FC<{ type: 'terms' | 'privacy' }> = ({ type }) => {
  const { designSettings, navigate } = useStore();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-10">
      <button
        onClick={() => navigate('home')}
        className="inline-flex items-center gap-2 text-xs font-medium text-[#26343C]/70 hover:text-[#5E8C84] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5E8C84]">
          {type === 'terms' ? <FileText className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
          <span>Legal & Policy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif-brand text-[#26343C]">
          {type === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
        </h1>
        <p className="text-xs text-[#26343C]/60">
          Last revised: October 2026 · {designSettings.brandName} Atelier
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#DCE8E4] p-8 sm:p-12 space-y-8 text-xs sm:text-sm text-[#26343C]/80 leading-relaxed shadow-xs">
        {type === 'terms' ? (
          <>
            <section className="space-y-3">
              <h2 className="text-lg font-serif-brand font-semibold text-[#26343C]">
                1. Digital Products & Deliverables
              </h2>
              <p>
                All invitation suites sold by {designSettings.brandName} are digital design assets delivered as Full High Definition (1080x1920) MP4 video files, accompanied by interactive web preview links and optional PDF/JPEG static backups. No physical paper stationery is printed or shipped.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif-brand font-semibold text-[#26343C]">
                2. Customization & Turnaround
              </h2>
              <p>
                Standard customization turnaround is guaranteed within 24 hours of receiving all required event information (couple or host names, event date, venue, dress code, and musical preference). Every order includes up to three (3) rounds of complimentary revisions for timing, venue, or typographical updates.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif-brand font-semibold text-[#26343C]">
                3. Personal Use License & Distribution
              </h2>
              <p>
                Purchasers receive a perpetual, non-exclusive license to share the delivered files with their personal wedding or event guest list via WhatsApp, SMS, iMessage, email, or private messaging platforms. Commercial resale, redistribution as blank templates, or unauthorized reproduction is strictly prohibited.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif-brand font-semibold text-[#26343C]">
                4. Refunds & Revisions Policy
              </h2>
              <p>
                Because digital goods are delivered in permanent file formats, refunds cannot be issued once the final customized proof is delivered. If you are unsatisfied with any aspect of your invitation proof, our atelier is committed to working with you until your expectations are met within the 3-round revision scope.
              </p>
            </section>
          </>
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="text-lg font-serif-brand font-semibold text-[#26343C]">
                1. Information We Collect
              </h2>
              <p>
                We only collect information directly provided by you during the ordering process: your name, phone number, email address, and event details (such as venue names, dates, and couple names). We do not collect or store credit card details directly; all purchases are managed through authorized invoice or direct WhatsApp consultation.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif-brand font-semibold text-[#26343C]">
                2. Use of Your Event Details
              </h2>
              <p>
                Your celebration information is used exclusively to produce your bespoke invitation video and configure your interactive RSVP link. We treat personal event schedules and family details with strict confidentiality.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif-brand font-semibold text-[#26343C]">
                3. Local Storage & Cookies
              </h2>
              <p>
                This application utilizes browser localStorage to maintain your cart contents and order history within your current session. No invasive third-party advertising tracking cookies are employed.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif-brand font-semibold text-[#26343C]">
                4. Data Protection & Contact
              </h2>
              <p>
                If you ever wish for your past event details or contact records to be permanently deleted from our database, please message our atelier through WhatsApp or email and we will fulfill your request immediately.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

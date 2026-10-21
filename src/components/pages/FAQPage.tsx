import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ChevronDown, Search, MessageCircle, HelpCircle } from 'lucide-react';

export const FAQPage: React.FC = () => {
  const { faqs, storeSettings } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  const cleanPhone = storeSettings.whatsAppNumber.replace(/[^0-9]/g, '');

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.category && f.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#5E8C84]">
          Help & Support
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif-brand text-[#26343C]">
          Frequently Asked Questions
        </h1>
        <p className="text-sm sm:text-base text-[#26343C]/70 max-w-lg mx-auto">
          Learn about our delivery process, file formats, RSVP setups, and complimentary revisions.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md mx-auto">
        <Search className="w-4 h-4 text-[#26343C]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search questions (e.g. revisions, delivery, music, RSVP)..."
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl text-xs text-[#26343C] border border-[#DCE8E4] focus:outline-none focus:border-[#5E8C84] shadow-xs"
        />
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-[#DCE8E4]">
            <p className="text-sm text-[#26343C]/70">No questions found matching your query.</p>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-[#DCE8E4] overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm font-semibold text-[#26343C] hover:text-[#5E8C84] transition-colors"
                >
                  <span className="flex-1">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#5E8C84] transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-[#26343C]/75 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Still need help box */}
      <div className="p-8 bg-white rounded-3xl border border-[#DCE8E4] text-center space-y-4 shadow-xs">
        <HelpCircle className="w-8 h-8 text-[#5E8C84] mx-auto" />
        <h3 className="text-xl font-serif-brand text-[#26343C]">
          Still have a question?
        </h3>
        <p className="text-xs sm:text-sm text-[#26343C]/70 max-w-md mx-auto">
          Our team is available 7 days a week on WhatsApp to assist with wording advice, format recommendations, and custom design requests.
        </p>
        <div>
          <a
            href={`https://wa.me/${cleanPhone}?text=Hi!%20I%20have%20a%20question%20about%20an%20invitation.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Ask Us on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};

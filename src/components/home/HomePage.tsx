import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { IphoneMockup } from '../common/IphoneMockup';
import { ProductCard } from '../common/ProductCard';
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  Eye, 
  ShoppingBag, 
  MessageCircle, 
  Check, 
  Star, 
  ChevronDown, 
  Heart, 
  Leaf, 
  Clock, 
  Smartphone, 
  Compass, 
  Music,
  Share2
} from 'lucide-react';
import { Product } from '../../types';

export const HomePage: React.FC = () => {
  const {
    products,
    categories,
    sections,
    reviews,
    faqs,
    designSettings,
    storeSettings,
    navigate,
    setQuickPreviewProduct,
    setCheckoutItem,
    setIsCheckoutOpen,
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openFaqId, setOpenFaqId] = useState<string | null>(faqs[0]?.id || null);

  const cleanPhone = storeSettings.whatsAppNumber.replace(/[^0-9]/g, '');

  // Filtered products for gallery
  const publishedProducts = products.filter((p) => p.status === 'published');
  const filteredProducts = selectedCategory === 'all'
    ? publishedProducts
    : publishedProducts.filter((p) => p.categoryId === selectedCategory);

  const handlePreview = (product: Product) => {
    setQuickPreviewProduct(product);
  };

  const handleDirectOrder = (product: Product) => {
    setCheckoutItem({
      product,
      quantity: 1,
      eventDetails: '',
    });
    setIsCheckoutOpen(true);
  };

  // Render sections dynamically in the order specified in settings
  const visibleSections = sections.filter((s) => s.isVisible);

  return (
    <div className="space-y-24 sm:space-y-32 pb-24">
      {visibleSections.map((section) => {
        switch (section.type) {
          
          // ==========================================
          // 1. HERO SECTION
          // ==========================================
          case 'hero':
            return (
              <section key={section.id} className="pt-8 sm:pt-14 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    
                    {/* Left Copy */}
                    <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                      {section.badge && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCE8E4] text-[#26343C] text-xs font-medium tracking-wide">
                          <Sparkles className="w-3.5 h-3.5 text-[#5E8C84]" />
                          <span>{section.badge}</span>
                        </div>
                      )}

                      <h1 className="font-serif-brand text-4xl sm:text-5xl lg:text-6xl text-[#26343C] font-normal leading-[1.12] tracking-tight">
                        {section.title || designSettings.heroTitle}
                      </h1>

                      <p className="text-base sm:text-lg text-[#26343C]/80 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                        {section.subtitle || designSettings.heroSubtitle}
                      </p>

                      {/* CTA Buttons */}
                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                        <button
                          onClick={() => navigate('shop')}
                          className="w-full sm:w-auto px-8 py-3.5 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group"
                        >
                          <span>Explore Invitation Shop</span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>

                        <a
                          href={`https://wa.me/${cleanPhone}?text=Hello!%20I'd%20like%20to%20learn%20more%20about%20a%20bespoke%20invitation.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto px-6 py-3.5 bg-white border border-[#DCE8E4] hover:border-[#5E8C84] text-[#26343C] text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4 text-[#5E8C84]" />
                          <span>Chat on WhatsApp</span>
                        </a>
                      </div>

                      {/* Micro proof points */}
                      <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#DCE8E4]/80 text-left max-w-lg mx-auto lg:mx-0">
                        <div>
                          <p className="font-serif-brand text-xl sm:text-2xl font-bold text-[#26343C]">24h</p>
                          <p className="text-[11px] text-[#26343C]/70">Express proof delivery</p>
                        </div>
                        <div>
                          <p className="font-serif-brand text-xl sm:text-2xl font-bold text-[#26343C]">1-Tap</p>
                          <p className="text-[11px] text-[#26343C]/70">Instant WhatsApp RSVP</p>
                        </div>
                        <div>
                          <p className="font-serif-brand text-xl sm:text-2xl font-bold text-[#26343C]">100%</p>
                          <p className="text-[11px] text-[#26343C]/70">Eco-friendly digital</p>
                        </div>
                      </div>
                    </div>

                    {/* Right: CSS-built iPhone 17 Mockup with Video */}
                    <div className="lg:col-span-5 flex justify-center relative">
                      {/* Decorative ambient backdrop glow */}
                      <div className="absolute inset-0 bg-radial from-[#DCE8E4]/80 to-transparent blur-3xl -z-10 rounded-full scale-125" />
                      
                      <div className="relative">
                        <IphoneMockup
                          videoUrl={designSettings.heroVideoUrl}
                          posterUrl={designSettings.heroPosterUrl}
                          productTitle="MIT Signature Wedding Suite"
                        />
                      </div>
                    </div>

                  </div>
                </div>
              </section>
            );

          // ==========================================
          // 2. WHY CHOOSE US
          // ==========================================
          case 'why_choose_us':
            return (
              <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#5E8C84]">
                    The Modern Standard
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-serif-brand text-[#26343C]">
                    {section.title}
                  </h2>
                  <p className="text-sm sm:text-base text-[#26343C]/70">
                    {section.subtitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                    {
                      icon: Smartphone,
                      title: 'Built Specifically for Mobile',
                      description: '94% of wedding & party guests open invitations on mobile phones. Our suites are tailored for vertical iPhone and Android screens with crystal clarity.',
                    },
                    {
                      icon: Leaf,
                      title: 'Zero Waste & Zero Stress',
                      description: 'No paper shortages, expensive postal stamps, or delayed deliveries. Send your invites instantly to 10 or 500 guests with a single tap.',
                    },
                    {
                      icon: Music,
                      title: 'Cinematic Motion & Sound',
                      description: 'Enchant your guests with animated typography, swaying florals, gentle light sparkles, and a handpicked romantic or festive audio track.',
                    },
                    {
                      icon: Compass,
                      title: 'Interactive Google Maps & RSVP',
                      description: 'Guests tap once to navigate to your ceremony venue, add the date to their Apple or Google Calendar, and send attendance confirmations directly.',
                    },
                    {
                      icon: Clock,
                      title: 'Guaranteed 24-Hour Turnaround',
                      description: 'Need to get invitations out swiftly? Once you submit your wording, your high-definition video suite is delivered within 24 hours.',
                    },
                    {
                      icon: Share2,
                      title: 'Unlimited Free Guest Sharing',
                      description: 'You own your video file permanently. Send it via WhatsApp, iMessage, Instagram DMs, Telegram, or email as many times as you wish.',
                    },
                  ].map((card, idx) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={idx}
                        className="p-8 rounded-3xl bg-white border border-[#DCE8E4] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                      >
                        <div className="space-y-4">
                          <div className="w-12 h-12 rounded-2xl bg-[#DCE8E4] text-[#5E8C84] flex items-center justify-center">
                            <Icon className="w-6 h-6" />
                          </div>
                          <h3 className="text-lg font-serif-brand font-semibold text-[#26343C]">
                            {card.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-[#26343C]/70 leading-relaxed">
                            {card.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );

          // ==========================================
          // 3. TEMPLATE GALLERY
          // ==========================================
          case 'product_grid':
            return (
              <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#5E8C84]">
                      Boutique Collection
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-serif-brand text-[#26343C]">
                      {section.title}
                    </h2>
                    <p className="text-sm text-[#26343C]/70 max-w-xl">
                      {section.subtitle}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate('shop')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5E8C84] hover:underline"
                  >
                    <span>View all templates</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                      selectedCategory === 'all'
                        ? 'bg-[#5E8C84] text-white shadow-xs'
                        : 'bg-white text-[#26343C]/80 border border-[#DCE8E4] hover:border-[#5E8C84]'
                    }`}
                  >
                    All Suites ({publishedProducts.length})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                        selectedCategory === cat.id
                          ? 'bg-[#5E8C84] text-white shadow-xs'
                          : 'bg-white text-[#26343C]/80 border border-[#DCE8E4] hover:border-[#5E8C84]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Product Grid - 1 col mobile, 2 col tablet, 3 col desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onPreview={handlePreview}
                      onOrder={handleDirectOrder}
                    />
                  ))}
                </div>
              </section>
            );

          // ==========================================
          // 4. WHAT'S INCLUDED
          // ==========================================
          case 'whats_included':
            return (
              <section key={section.id} className="bg-[#E7EFEA] py-20 border-y border-[#DCE8E4]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#5E8C84]">
                      Complete Digital Suite
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-serif-brand text-[#26343C]">
                      {section.title}
                    </h2>
                    <p className="text-sm sm:text-base text-[#26343C]/70">
                      {section.subtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      {
                        step: '01',
                        title: '1080x1920 HD Motion Video',
                        desc: 'Formatted perfectly for WhatsApp status, direct messages, and Instagram. Crisp typography and smooth motion.',
                      },
                      {
                        step: '02',
                        title: 'Interactive Guest RSVP Link',
                        desc: 'A seamless button connecting directly to your WhatsApp or Google Form with your customized guest headcount questionnaire.',
                      },
                      {
                        step: '03',
                        title: 'Venue Navigation Pin',
                        desc: 'One-tap Google Maps directions configured to your exact wedding or event venue so no guest gets lost.',
                      },
                      {
                        step: '04',
                        title: 'Complimentary Revisions',
                        desc: 'Time or date change? Up to 3 free revisions included with every order up until 14 days before your celebration.',
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="p-6 bg-white rounded-3xl border border-[#DCE8E4] shadow-xs space-y-3"
                      >
                        <span className="font-serif-brand text-2xl font-bold text-[#5E8C84]/60">
                          {item.step}
                        </span>
                        <h4 className="text-base font-serif-brand font-semibold text-[#26343C]">
                          {item.title}
                        </h4>
                        <p className="text-xs text-[#26343C]/70 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          // ==========================================
          // 5. REVIEWS SECTION
          // ==========================================
          case 'reviews':
            return (
              <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#5E8C84]">
                    Real Testimonials
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-serif-brand text-[#26343C]">
                    {section.title}
                  </h2>
                  <p className="text-sm sm:text-base text-[#26343C]/70">
                    {section.subtitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-6 rounded-3xl bg-white border border-[#DCE8E4] shadow-xs flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <p className="text-xs sm:text-sm text-[#26343C]/80 italic leading-relaxed">
                          "{rev.comment}"
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-[#26343C]">{rev.author}</p>
                          <p className="text-[11px] text-[#5E8C84]">{rev.eventType}</p>
                        </div>
                        <span className="text-[10px] text-[#26343C]/50">{rev.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );

          // ==========================================
          // 6. HOW IT WORKS IN 3 STEPS
          // ==========================================
          case 'steps':
            return (
              <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#5E8C84]">
                    Effortless Process
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-serif-brand text-[#26343C]">
                    {section.title}
                  </h2>
                  <p className="text-sm sm:text-base text-[#26343C]/70">
                    {section.subtitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                  {[
                    {
                      num: '1',
                      title: 'Choose Your Template',
                      desc: 'Browse our curated collection of romantic weddings, modern save-the-dates, and chic milestones. Watch the live mobile preview.',
                    },
                    {
                      num: '2',
                      title: 'Send Event Details',
                      desc: 'Submit your couple names, date, venue, dress code, and musical taste directly through our order form or on WhatsApp.',
                    },
                    {
                      num: '3',
                      title: 'Receive & Share',
                      desc: 'Within 24 hours, receive your Full HD animated MP4 file and interactive RSVP links ready to forward to all your guests.',
                    },
                  ].map((step, idx) => (
                    <div
                      key={idx}
                      className="p-8 rounded-3xl bg-white border border-[#DCE8E4] shadow-xs relative flex flex-col justify-between"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#5E8C84] text-white font-serif-brand text-xl font-bold flex items-center justify-center mb-6 shadow-xs">
                        {step.num}
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-serif-brand font-semibold text-[#26343C]">
                          {step.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#26343C]/70 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );

          // ==========================================
          // 7. FAQ SECTION
          // ==========================================
          case 'faq':
            return (
              <section key={section.id} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#5E8C84]">
                    Got Questions?
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-serif-brand text-[#26343C]">
                    {section.title}
                  </h2>
                  <p className="text-sm text-[#26343C]/70">
                    {section.subtitle}
                  </p>
                </div>

                <div className="space-y-4">
                  {faqs.map((faq) => {
                    const isOpen = openFaqId === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className="bg-white rounded-2xl border border-[#DCE8E4] overflow-hidden transition-all shadow-xs"
                      >
                        <button
                          onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                          className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm font-semibold text-[#26343C] hover:text-[#5E8C84] transition-colors"
                        >
                          <span>{faq.question}</span>
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
                  })}
                </div>
              </section>
            );

          // ==========================================
          // 8. FINAL CALL TO ACTION
          // ==========================================
          case 'cta':
            return (
              <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-[#DCE8E4] via-[#E7EFEA] to-[#EEDDE0] rounded-3xl p-10 sm:p-16 border border-[#DCE8E4] text-center max-w-5xl mx-auto space-y-6 shadow-sm">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#5E8C84]">
                    Begin Your Story
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-serif-brand text-[#26343C] font-normal leading-tight">
                    {section.title}
                  </h2>
                  <p className="text-sm sm:text-base text-[#26343C]/80 max-w-xl mx-auto leading-relaxed">
                    {section.subtitle}
                  </p>
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      onClick={() => navigate('shop')}
                      className="w-full sm:w-auto px-8 py-3.5 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <span>Browse All Templates</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <a
                      href={`https://wa.me/${cleanPhone}?text=Hello%20MIT%20Invitations!%20I%20would%20love%20to%20order%20an%20invitation.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-7 py-3.5 bg-white text-[#26343C] text-sm font-medium rounded-xl border border-[#DCE8E4] hover:border-[#5E8C84] transition-all flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4 text-[#5E8C84]" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>
                </div>
              </section>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};

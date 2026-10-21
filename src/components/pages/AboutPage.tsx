import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Sparkles, Heart, Leaf, ShieldCheck, Clock, MessageCircle, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { designSettings, storeSettings, navigate } = useStore();
  const cleanPhone = storeSettings.whatsAppNumber.replace(/[^0-9]/g, '');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#5E8C84]">
          Our Atelier Story
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif-brand text-[#26343C] leading-tight">
          Crafting First Impressions for Life’s Greatest Milestones
        </h1>
        <p className="text-sm sm:text-base text-[#26343C]/75 leading-relaxed">
          {designSettings.brandName} was born from a simple belief: the moment your guests learn about your celebration should feel just as enchanting as the day itself.
        </p>
      </div>

      {/* Main Philosophy Image & Story */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center bg-white rounded-3xl border border-[#DCE8E4] p-6 sm:p-10 shadow-xs">
        <div className="rounded-2xl overflow-hidden aspect-[4/5] bg-slate-100">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
            alt="MIT Design Studio"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-5">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#5E8C84]">
            Why Digital Invitations?
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-brand text-[#26343C]">
            Modern Elegance Meets Zero Waste
          </h2>
          <p className="text-xs sm:text-sm text-[#26343C]/80 leading-relaxed">
            Traditional stationery is timeless, but weeks of printing delays, costly overseas postage, and lost RSVP cards create unwanted stress for modern couples and hosts.
          </p>
          <p className="text-xs sm:text-sm text-[#26343C]/80 leading-relaxed">
            We reimagined the wedding and event invitation as a cinematic mobile keepsake. Crisp typography, ambient instrumental melodies, and one-tap guest navigation transform a simple notification into an unforgettable moment of delight.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('shop')}
              className="px-6 py-3 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-2"
            >
              <span>Explore The Collection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-white rounded-3xl border border-[#DCE8E4] shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#DCE8E4] text-[#5E8C84] flex items-center justify-center">
            <Leaf className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif-brand font-semibold text-[#26343C]">
            Eco-Conscious
          </h3>
          <p className="text-xs text-[#26343C]/70 leading-relaxed">
            Eliminating paper waste and international shipping emissions while delivering high-fashion aesthetic standards.
          </p>
        </div>

        <div className="p-8 bg-white rounded-3xl border border-[#DCE8E4] shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#DCE8E4] text-[#5E8C84] flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif-brand font-semibold text-[#26343C]">
            24h Turnaround
          </h3>
          <p className="text-xs text-[#26343C]/70 leading-relaxed">
            Your celebration shouldn’t wait on 6-week print houses. Receive your customized proof and final video file in 24 hours.
          </p>
        </div>

        <div className="p-8 bg-white rounded-3xl border border-[#DCE8E4] shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#DCE8E4] text-[#5E8C84] flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif-brand font-semibold text-[#26343C]">
            Personal Concierge
          </h3>
          <p className="text-xs text-[#26343C]/70 leading-relaxed">
            Work directly with our design atelier over WhatsApp. Request changes, test different songs, and verify proofs with real humans.
          </p>
        </div>
      </div>

      {/* Concierge Callout */}
      <div className="p-8 sm:p-12 bg-[#DCE8E4]/50 rounded-3xl border border-[#DCE8E4] text-center space-y-4">
        <h3 className="text-2xl font-serif-brand text-[#26343C]">
          Have a bespoke wedding theme or custom vision?
        </h3>
        <p className="text-xs sm:text-sm text-[#26343C]/80 max-w-lg mx-auto">
          We frequently create custom commissioned motion designs tailored to unique floral arrangements, venue architecture, and cultural traditions.
        </p>
        <div className="pt-2">
          <a
            href={`https://wa.me/${cleanPhone}?text=Hello!%20I'd%20like%20to%20discuss%20a%20bespoke%20commission.`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat Directly on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};

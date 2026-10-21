import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Sparkles, MessageCircle, Mail, MapPin, Clock, Instagram, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { designSettings, storeSettings, categories, navigate } = useStore();
  const cleanPhone = storeSettings.whatsAppNumber.replace(/[^0-9]/g, '');

  return (
    <footer className="bg-[#E7EFEA] border-t border-[#DCE8E4] text-[#26343C]">
      {/* Brand Value Banner */}
      <div className="border-b border-[#DCE8E4]/80 py-8 bg-[#DCE8E4]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#5E8C84] shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">100% Eco-Friendly</h4>
              <p className="text-xs text-[#26343C]/70">Zero paper waste, zero carbon shipping footprint</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#5E8C84] shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">24-Hour Turnaround</h4>
              <p className="text-xs text-[#26343C]/70">Fast review and direct delivery to your WhatsApp</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#5E8C84] shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">Unlimited Free Revisions</h4>
              <p className="text-xs text-[#26343C]/70">Up to 3 rounds of text, timing & venue updates</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info (col-span-2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#5E8C84] text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4 text-[#DCE8E4]" />
              </div>
              <span className="font-serif-brand text-2xl tracking-tight text-[#26343C]">
                {designSettings.brandName}
              </span>
            </div>
            <p className="text-sm text-[#26343C]/80 leading-relaxed max-w-sm">
              We design cinematic animated invitations and luxury digital keepsakes tailored for modern mobile screens. Make your celebration unforgettable before the day begins.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href={storeSettings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white border border-[#DCE8E4] flex items-center justify-center text-[#26343C] hover:text-[#5E8C84] hover:border-[#5E8C84] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white border border-[#DCE8E4] flex items-center justify-center text-[#26343C] hover:text-[#5E8C84] hover:border-[#5E8C84] transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-[#5E8C84]">
              Collections
            </h5>
            <ul className="space-y-2 text-sm text-[#26343C]/80">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => navigate('shop')}
                    className="hover:text-[#5E8C84] transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Information Links */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-[#5E8C84]">
              Atelier
            </h5>
            <ul className="space-y-2 text-sm text-[#26343C]/80">
              <li>
                <button onClick={() => navigate('about')} className="hover:text-[#5E8C84] transition-colors">
                  Our Story & Ethos
                </button>
              </li>
              <li>
                <button onClick={() => navigate('faq')} className="hover:text-[#5E8C84] transition-colors">
                  FAQ & Guide
                </button>
              </li>
              <li>
                <button onClick={() => navigate('contact')} className="hover:text-[#5E8C84] transition-colors">
                  Contact Studio
                </button>
              </li>
              <li>
                <button onClick={() => navigate('terms')} className="hover:text-[#5E8C84] transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => navigate('privacy')} className="hover:text-[#5E8C84] transition-colors">
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Studio */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-[#5E8C84]">
              Concierge
            </h5>
            <div className="space-y-2.5 text-xs text-[#26343C]/80">
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#5E8C84] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#5E8C84] shrink-0" />
                <span>WhatsApp: {storeSettings.phone}</span>
              </a>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#5E8C84] shrink-0" />
                <span>{storeSettings.email}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#5E8C84] shrink-0 mt-0.5" />
                <span>{storeSettings.address}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#26343C]/60 pt-1">
                <Clock className="w-3 h-3 text-[#5E8C84] shrink-0" />
                <span>{storeSettings.workingHours}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[#DCE8E4] flex flex-col sm:flex-row items-center justify-between text-xs text-[#26343C]/60 gap-4">
          <p className="flex items-center gap-1">
            © {new Date().getFullYear()} {designSettings.brandName}. Designed with
            <Heart className="w-3 h-3 text-[#5E8C84] inline" /> for unforgettable celebrations.
          </p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('terms')}
              className="hover:underline text-[#26343C]/70"
            >
              Terms
            </button>
            <button
              onClick={() => navigate('privacy')}
              className="hover:underline text-[#26343C]/70"
            >
              Privacy
            </button>
            <button
              onClick={() => navigate('admin')}
              className="hover:text-[#5E8C84] flex items-center gap-1 font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

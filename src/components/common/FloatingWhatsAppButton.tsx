import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { MessageCircle, X } from 'lucide-react';

export const FloatingWhatsAppButton: React.FC = () => {
  const { storeSettings, currentView } = useStore();
  const [isDismissed, setIsDismissed] = useState(false);

  // Do not render in admin studio to keep admin workspace clear
  if (currentView === 'admin' || isDismissed) {
    return null;
  }

  const cleanPhone = (storeSettings.whatsAppNumber || '923425364018').replace(/[^0-9]/g, '');
  const displayPhone = storeSettings.phone || '+92 342 5364018';
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    "Hello MIT Invitations! I would like to inquire about your bespoke digital invitation suites."
  )}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
      {/* Subtle tooltip / label visible on desktop or hover */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:flex items-center gap-2 py-2 px-3.5 bg-white/95 backdrop-blur-md rounded-2xl border border-[#DCE8E4] shadow-lg text-[#26343C] hover:text-[#5E8C84] transition-all group"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <div className="text-left">
          <p className="text-[11px] font-semibold leading-tight group-hover:text-[#5E8C84] transition-colors">
            Chat on WhatsApp
          </p>
          <p className="text-[10px] text-[#26343C]/60 font-medium">
            {displayPhone}
          </p>
        </div>
      </a>

      {/* Main Circular WhatsApp Floating Action Button */}
      <div className="relative group">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Chat on WhatsApp at ${displayPhone}`}
          title={`Chat with Atelier on WhatsApp: ${displayPhone}`}
          className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-white focus:outline-none focus:ring-4 focus:ring-emerald-200"
        >
          {/* Subtle pulse ring */}
          <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-pulse pointer-events-none" />
          <MessageCircle className="w-7 h-7 fill-white stroke-none relative z-10" />
        </a>

        {/* Small dismiss button on top right of the button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDismissed(true);
          }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#26343C]/80 hover:bg-[#26343C] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs text-[10px]"
          title="Dismiss floating button"
          aria-label="Dismiss"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

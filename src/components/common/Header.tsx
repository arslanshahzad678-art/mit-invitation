import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, Menu, X, Shield, Sparkles, MessageCircle } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    designSettings,
    storeSettings,
    cartCount,
    setIsCartOpen,
    currentView,
    navigate,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', view: 'home' as const },
    { label: 'Shop Templates', view: 'shop' as const },
    { label: 'About', view: 'about' as const },
    { label: 'FAQ', view: 'faq' as const },
    { label: 'Contact', view: 'contact' as const },
  ];

  const handleNavClick = (view: any) => {
    navigate(view);
    setMobileMenuOpen(false);
  };

  const cleanPhone = storeSettings.whatsAppNumber.replace(/[^0-9]/g, '');

  return (
    <header className="sticky top-0 z-40 bg-[#F2F6F6]/90 backdrop-blur-md border-b border-[#DCE8E4]">
      {/* Top Announcement Bar */}
      {storeSettings.showAnnouncement && storeSettings.announcementText && (
        <div className="bg-[#DCE8E4] text-[#26343C] px-4 py-1.5 text-xs text-center font-medium tracking-wide flex items-center justify-center gap-2">
          <span>{storeSettings.announcementText}</span>
          <a
            href={`https://wa.me/${cleanPhone}?text=Hi%20MIT%20Invitations!%20I'd%20like%20to%20ask%20a%20question.`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1 text-[#5E8C84] hover:underline font-semibold ml-2"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Name */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {designSettings.logoUrl ? (
              <img
                src={designSettings.logoUrl}
                alt={designSettings.brandName}
                className="h-10 w-auto object-contain rounded-md"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#5E8C84] text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
                <Sparkles className="w-5 h-5 text-[#DCE8E4]" />
              </div>
            )}
            <div>
              <span className="font-serif-brand text-2xl tracking-tight text-[#26343C] font-normal block leading-none">
                {designSettings.brandName}
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#5E8C84] font-medium block mt-1">
                Atelier Numérique
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.view)}
                className={`text-sm tracking-wide transition-colors relative py-1 ${
                  currentView === item.view
                    ? 'text-[#5E8C84] font-semibold'
                    : 'text-[#26343C]/80 hover:text-[#26343C]'
                }`}
              >
                {item.label}
                {currentView === item.view && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5E8C84] rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Action Buttons (Cart, Admin Link, WhatsApp) */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* WhatsApp Quick Chat */}
            <a
              href={`https://wa.me/${cleanPhone}?text=Hello%20MIT%20Invitations,%20I'm%20interested%20in%20an%20invitation%20suite.`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#26343C] bg-white border border-[#DCE8E4] rounded-lg hover:border-[#5E8C84] hover:text-[#5E8C84] transition-colors shadow-2xs"
              title={`Chat with our invitation designer on WhatsApp (${storeSettings.phone})`}
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#5E8C84]" />
              <span>WhatsApp: {storeSettings.phone}</span>
            </a>

            {/* Client Portal Button */}
            <button
              onClick={() => handleNavClick('portal')}
              className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#5E8C84] bg-[#5E8C84]/10 hover:bg-[#5E8C84]/20 border border-[#5E8C84]/30 rounded-lg transition-colors cursor-pointer"
            >
              <span>Guest Portal</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="View Cart"
              className="relative p-2.5 rounded-xl text-[#26343C] hover:bg-[#DCE8E4]/50 transition-colors"
            >
              <ShoppingBag className="w-5 h-5 text-[#26343C]" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-[#5E8C84] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin Portal Shortcut */}
            <button
              onClick={() => handleNavClick('admin')}
              className={`p-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors ${
                currentView === 'admin'
                  ? 'bg-[#5E8C84] text-white'
                  : 'text-[#26343C]/70 hover:text-[#26343C] hover:bg-[#DCE8E4]/50'
              }`}
              title="Admin Management Panel"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden md:inline font-medium">Admin</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#26343C] hover:bg-[#DCE8E4]/50"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#F2F6F6] border-b border-[#DCE8E4] px-4 pt-2 pb-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.view)}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-sm ${
                currentView === item.view
                  ? 'bg-[#DCE8E4] text-[#26343C] font-semibold'
                  : 'text-[#26343C]/80 hover:bg-[#DCE8E4]/40'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-3 border-t border-[#DCE8E4] flex flex-col gap-2">
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full text-left py-2.5 px-3 rounded-lg text-sm text-[#26343C] font-medium flex items-center gap-2 hover:bg-[#DCE8E4]/40"
            >
              <Shield className="w-4 h-4 text-[#5E8C84]" />
              <span>Admin Management Studio</span>
            </button>
            <a
              href={`https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-lg text-sm bg-[#5E8C84] hover:bg-[#4d756e] text-white font-medium flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp: {storeSettings.phone}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

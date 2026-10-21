/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HomePage } from './components/home/HomePage';
import { ShopPage } from './components/shop/ShopPage';
import { ProductDetailPage } from './components/shop/ProductDetailPage';
import { AboutPage } from './components/pages/AboutPage';
import { FAQPage } from './components/pages/FAQPage';
import { ContactPage } from './components/pages/ContactPage';
import { TermsPrivacyPage } from './components/pages/TermsPrivacyPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { PublicInvitationViewer } from './components/invite/PublicInvitationViewer';
import { TemplatePersonalizer } from './components/personalizer/TemplatePersonalizer';
import { ClientPortal } from './components/portal/ClientPortal';
import { ClientLogin } from './components/portal/ClientLogin';
import { CartDrawer } from './components/cart/CartDrawer';
import { OrderModal } from './components/cart/OrderModal';
import { QuickPreviewModal } from './components/common/QuickPreviewModal';
import { FloatingWhatsAppButton } from './components/common/FloatingWhatsAppButton';
import { X, CheckCircle, Info, AlertTriangle } from 'lucide-react';

function AppContent() {
  const { currentView, toasts, removeToast } = useStore();

  // If in public invitation link mode (/i/:slug), render pure full-screen luxury invitation
  if (currentView === 'invite') {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#26343C]">
        <PublicInvitationViewer />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  // If in template personalizer mode, render the customizer studio
  if (currentView === 'customize') {
    return (
      <div className="min-h-screen bg-[#F2F6F6] text-[#26343C]">
        <TemplatePersonalizer />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  // If in admin mode, render the Admin Portal
  if (currentView === 'admin') {
    return (
      <div className="min-h-screen flex flex-col bg-[#F2F6F6] text-[#26343C]">
        <AdminLayout />
        <QuickPreviewModal />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F6F6] text-[#26343C]">
      <Header />

      <main className="flex-1">
        {currentView === 'home' && <HomePage />}
        {currentView === 'shop' && <ShopPage />}
        {currentView === 'product-detail' && <ProductDetailPage />}
        {currentView === 'portal' && <ClientPortal />}
        {currentView === 'portal-login' && <ClientLogin />}
        {currentView === 'cart' && <ShopPage />}
        {currentView === 'about' && <AboutPage />}
        {currentView === 'faq' && <FAQPage />}
        {currentView === 'contact' && <ContactPage />}
        {currentView === 'terms' && <TermsPrivacyPage type="terms" />}
        {currentView === 'privacy' && <TermsPrivacyPage type="privacy" />}
      </main>

      <Footer />

      {/* Global Floating WhatsApp Contact Button */}
      <FloatingWhatsAppButton />

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <OrderModal />
      <QuickPreviewModal />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

function ToastContainer({ toasts, removeToast }: { toasts: any[]; removeToast: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-200'
              : toast.type === 'info'
              ? 'bg-[#DCE8E4] text-[#26343C] border-[#5E8C84]/30'
              : 'bg-white text-[#26343C] border-[#DCE8E4]'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : toast.type === 'info' ? (
            <Info className="w-5 h-5 text-[#5E8C84] shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 text-[#5E8C84] shrink-0" />
          )}

          <p className="text-xs font-medium flex-1">{toast.text}</p>

          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 text-[#26343C]/40 hover:text-[#26343C] rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

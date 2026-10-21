import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminSections } from './AdminSections';
import { AdminDesignEditor } from './AdminDesignEditor';
import { AdminOrders } from './AdminOrders';
import { AdminReviewsFaqs } from './AdminReviewsFaqs';
import { AdminSettings } from './AdminSettings';
import { AdminBackup } from './AdminBackup';
import { TemplateList } from './editor/TemplateList';
import { AdminInvitations } from './AdminInvitations';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Layers, 
  Palette, 
  ShoppingBag, 
  Star, 
  Settings, 
  Database, 
  LogOut, 
  ExternalLink, 
  AlertCircle,
  Menu,
  X,
  Sparkles,
  Heart,
  FileCheck
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const {
    adminUser,
    isAdminLoggedIn,
    authLoading,
    logoutAdmin,
    navigate,
    designSettings,
    orders,
  } = useStore();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // If loading auth state, show calm spinner
  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 space-y-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#5E8C84] border-t-transparent animate-spin" />
        <p className="text-xs text-[#26343C]/70">Checking authorization...</p>
      </div>
    );
  }

  // If not authenticated, show Firebase login screen
  if (!isAdminLoggedIn) {
    return <AdminLogin />;
  }

  const newOrdersCount = orders.filter((o) => o.status === 'new').length;

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'templates', label: 'Canva Template Suites', icon: Sparkles },
    { id: 'invitations', label: 'Client Suites & RSVPs', icon: Heart },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'sections', label: 'Page Sections', icon: Layers },
    { id: 'design', label: 'Design Editor', icon: Palette },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: newOrdersCount },
    { id: 'reviews_faqs', label: 'Reviews & FAQs', icon: Star },
    { id: 'settings', label: 'Store Settings', icon: Settings },
    { id: 'backup', label: 'Backup & Restore', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-[#F2F6F6] text-[#26343C] flex flex-col">
      {/* Top Admin Bar with Verified Firebase User */}
      <div className="bg-[#26343C] text-white px-4 sm:px-8 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold tracking-wide">MIT Admin Studio</span>
          <span className="text-white/40 hidden sm:inline">|</span>
          <span className="text-emerald-300 text-[11px] hidden sm:inline flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
            <span>Authorized:</span>
            <span className="font-mono text-white font-medium">{adminUser?.email}</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('home')}
            className="text-white/80 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View Public Boutique</span>
            <ExternalLink className="w-3 h-3" />
          </button>
          <button
            onClick={logoutAdmin}
            className="text-rose-300 hover:text-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-white/10"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full flex flex-col md:flex-row gap-8">
        
        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center justify-between bg-white p-4 rounded-2xl border border-[#DCE8E4]">
          <span className="font-serif-brand font-semibold text-sm">
            Admin Navigation
          </span>
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="p-1.5 rounded-lg text-[#26343C]"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Sidebar Nav */}
        <aside className={`w-full md:w-64 shrink-0 space-y-2 ${mobileNavOpen ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white rounded-3xl border border-[#DCE8E4] p-3 shadow-xs space-y-1">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#5E8C84] text-white shadow-xs'
                      : 'text-[#26343C]/80 hover:bg-[#DCE8E4]/40 hover:text-[#26343C]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && tab.badge > 0 ? (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-[#5E8C84]' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="p-4 bg-white/70 rounded-2xl border border-[#DCE8E4] text-[11px] text-[#26343C]/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-[#26343C]">{designSettings.brandName}</p>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Cloud Live" />
            </div>
            <p className="text-[10px] text-[#5E8C84] font-medium">Cloud Firestore Synchronized</p>
            <p className="text-[10px] text-[#26343C]/60 truncate">DB: mit-invitations</p>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && <AdminDashboard setActiveTab={setActiveTab} />}
          {activeTab === 'templates' && <TemplateList />}
          {activeTab === 'invitations' && <AdminInvitations />}
          {activeTab === 'products' && <AdminProducts />}
          {activeTab === 'categories' && <AdminCategories />}
          {activeTab === 'sections' && <AdminSections />}
          {activeTab === 'design' && <AdminDesignEditor />}
          {activeTab === 'orders' && <AdminOrders />}
          {activeTab === 'reviews_faqs' && <AdminReviewsFaqs />}
          {activeTab === 'settings' && <AdminSettings />}
          {activeTab === 'backup' && <AdminBackup />}
        </main>

      </div>
    </div>
  );
};

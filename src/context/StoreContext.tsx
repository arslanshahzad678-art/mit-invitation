import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Product,
  Category,
  PageSection,
  Review,
  FAQItem,
  Order,
  DesignSettings,
  StoreSettings,
  CartItem,
  AppView,
} from '../types';
import * as dataService from '../services/dataService';
import * as firestoreService from '../services/firestoreService';
import { exportAllMedia, importSerializedMedia } from '../services/mediaStorage';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, testConnection } from '../config/firebase';
import { isAuthorizedEmail, logoutAdminFirebase } from '../services/firebaseAuth';
import { migrateLegacyPaymentSettings } from '../services/paymentService';

interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'info' | 'error';
}

interface StoreContextType {
  // Data
  products: Product[];
  categories: Category[];
  sections: PageSection[];
  reviews: Review[];
  faqs: FAQItem[];
  orders: Order[];
  designSettings: DesignSettings;
  storeSettings: StoreSettings;
  isCloudConnected: boolean;

  // View & Nav
  currentView: AppView;
  selectedProductId: string | null;
  quickPreviewProduct: Product | null;
  inviteSlug: string | null;
  customizeTemplateId: string | null;
  navigate: (view: AppView, param?: string) => void;
  setQuickPreviewProduct: (product: Product | null) => void;
  setInviteSlug: (slug: string | null) => void;
  setCustomizeTemplateId: (id: string | null) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, eventDetails?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Direct checkout
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  checkoutItem: CartItem | null;
  setCheckoutItem: (item: CartItem | null) => void;
  submitOrder: (orderData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    notes: string;
    eventDate?: string;
    items: { productId: string; productName: string; price: number; quantity: number; eventDetails?: string; image?: string }[];
  }) => Promise<{ order: Order; whatsAppUrl: string }>;

  // CRUD actions for admin
  saveProduct: (prod: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  duplicateProduct: (id: string) => Promise<void>;
  reorderProducts: (ids: string[]) => Promise<void>;

  saveCategory: (cat: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  saveSection: (sec: PageSection) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;
  reorderSections: (ids: string[]) => Promise<void>;

  saveReview: (rev: Review) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;

  saveFAQ: (faq: FAQItem) => Promise<void>;
  deleteFAQ: (id: string) => Promise<void>;

  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;

  updateDesignSettings: (settings: DesignSettings) => Promise<void>;
  resetDesignSettings: () => Promise<void>;
  updateStoreSettings: (settings: StoreSettings) => Promise<void>;

  syncAllToCloud: () => Promise<void>;
  exportBackup: () => Promise<void>;
  importBackup: (jsonStr: string) => Promise<boolean>;
  resetAllData: () => Promise<void>;

  // Toasts
  toasts: ToastMessage[];
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;

  // Admin Auth (Firebase Authentication)
  adminUser: User | null;
  isAdminLoggedIn: boolean;
  authLoading: boolean;
  logoutAdmin: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_KEY = 'mit_cart_v1';

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize local fallback storage on boot
  useEffect(() => {
    dataService.initializeDataLayer();
  }, []);

  const [products, setProducts] = useState<Product[]>(() => dataService.getProducts());
  const [categories, setCategories] = useState<Category[]>(() => dataService.getCategories());
  const [sections, setSections] = useState<PageSection[]>(() => dataService.getPageSections());
  const [reviews, setReviews] = useState<Review[]>(() => dataService.getReviews());
  const [faqs, setFaqs] = useState<FAQItem[]>(() => dataService.getFAQs());
  const [orders, setOrders] = useState<Order[]>(() => dataService.getOrders());
  const [designSettings, setDesignSettings] = useState<DesignSettings>(() => dataService.getDesignSettings());
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => dataService.getStoreSettings());
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

  // Route state
  const [inviteSlug, setInviteSlug] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const match = window.location.pathname.match(/^\/i\/([a-zA-Z0-9_-]+)/);
    if (match) return match[1];
    const hashMatch = window.location.hash.match(/^#?i\/([a-zA-Z0-9_-]+)/);
    return hashMatch ? hashMatch[1] : null;
  });

  const [customizeTemplateId, setCustomizeTemplateId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const match = window.location.pathname.match(/^\/customize\/([a-zA-Z0-9_-]+)/);
    if (match) return match[1];
    const hashMatch = window.location.hash.match(/^#?customize\/([a-zA-Z0-9_-]+)/);
    return hashMatch ? hashMatch[1] : null;
  });

  // Views
  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash.replace('#', '');
      if (path.startsWith('/i/') || hash.startsWith('i/')) return 'invite';
      if (path.startsWith('/customize/') || hash.startsWith('customize/')) return 'customize';
      if (path === '/portal/login' || hash === 'portal/login') return 'portal-login';
      if (path === '/portal' || hash === 'portal') return 'portal';
      if (path === '/admin' || hash === 'admin') return 'admin';
      if (path === '/shop' || hash === 'shop') return 'shop';
      if (path === '/about' || hash === 'about') return 'about';
      if (path === '/faq' || hash === 'faq') return 'faq';
      if (path === '/contact' || hash === 'contact') return 'contact';
      if (path === '/cart' || hash === 'cart') return 'cart';
      if (path === '/checkout' || hash === 'checkout') return 'checkout';
      if (path === '/terms' || hash === 'terms') return 'terms';
      if (path === '/privacy' || hash === 'privacy') return 'privacy';
    }
    return 'home';
  });

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [quickPreviewProduct, setQuickPreviewProduct] = useState<Product | null>(null);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState<CartItem | null>(null);

  // Admin Auth (Firebase Authentication)
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Monitor Firebase Auth state with persistence
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (isAuthorizedEmail(user.email)) {
          setAdminUser(user);
          // When authorized admin signs in, ensure initial Cloud Firestore data is seeded
          firestoreService.seedFirestoreIfEmpty().then((res) => {
            if (res.seeded) {
              showToast(`Synchronized ${res.count} items to Cloud Firestore!`, 'success');
            }
          }).catch((err) => {
            console.warn('Initial seed check:', err);
          });
        } else {
          // Unauthorized email signed in via Google: immediately sign out
          await signOut(auth);
          setAdminUser(null);
          showToast('This account is not authorized.', 'error');
        }
      } else {
        setAdminUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdminLoggedIn = Boolean(adminUser && isAuthorizedEmail(adminUser.email));

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (err) {
      console.error('Error saving cart:', err);
    }
  }, [cart]);

  // Apply design variables dynamically
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-bg', designSettings.backgroundColor);
    root.style.setProperty('--color-accent-sage', designSettings.primaryColor);
    root.style.setProperty('--color-blush', designSettings.blushColor);
    root.style.setProperty('--color-light-sage', designSettings.secondaryColor);
    root.style.setProperty('--color-slate-text', designSettings.textColor);
    root.style.setProperty('--font-heading', `'${designSettings.headingFont}', Georgia, serif`);
    root.style.setProperty('--font-body', `'${designSettings.bodyFont}', system-ui, sans-serif`);
  }, [designSettings]);

  // View Navigation with HTML5 history API & hash compatibility
  const navigate = (view: AppView, param?: string) => {
    setCurrentView(view);
    if (view === 'product-detail' && param) {
      setSelectedProductId(param);
    } else if (view === 'invite' && param) {
      setInviteSlug(param);
    } else if (view === 'customize' && param) {
      setCustomizeTemplateId(param);
    }

    if (typeof window !== 'undefined') {
      let targetPath = '/';
      if (view === 'invite' && param) {
        targetPath = `/i/${param}`;
      } else if (view === 'customize' && param) {
        targetPath = `/customize/${param}`;
      } else if (view === 'portal-login') {
        targetPath = '/portal/login';
      } else if (view === 'portal') {
        targetPath = '/portal';
      } else if (view === 'admin') {
        targetPath = '/admin';
      } else if (view === 'home') {
        targetPath = '/';
      } else {
        targetPath = `/#${view}`;
      }

      try {
        if (window.location.pathname !== targetPath && !targetPath.startsWith('/#')) {
          window.history.pushState({ view, param }, '', targetPath);
        } else if (targetPath.startsWith('/#')) {
          window.location.hash = view;
        }
      } catch (e) {
        window.location.hash = view;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Listen to browser forward/back (popstate) & hash changes
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash.replace('#', '');
      
      const inviteMatch = path.match(/^\/i\/([a-zA-Z0-9_-]+)/) || hash.match(/^i\/([a-zA-Z0-9_-]+)/);
      if (inviteMatch) {
        setInviteSlug(inviteMatch[1]);
        setCurrentView('invite');
        return;
      }

      const customizeMatch = path.match(/^\/customize\/([a-zA-Z0-9_-]+)/) || hash.match(/^customize\/([a-zA-Z0-9_-]+)/);
      if (customizeMatch) {
        setCustomizeTemplateId(customizeMatch[1]);
        setCurrentView('customize');
        return;
      }

      if (path === '/portal/login' || hash === 'portal/login') {
        setCurrentView('portal-login');
        return;
      }
      if (path === '/portal' || hash === 'portal') {
        setCurrentView('portal');
        return;
      }
      if (path === '/admin' || hash === 'admin') {
        setCurrentView('admin');
        return;
      }
      if (hash && ['home', 'shop', 'product-detail', 'cart', 'checkout', 'about', 'faq', 'contact', 'terms', 'privacy'].includes(hash)) {
        setCurrentView(hash as AppView);
      } else if (!hash && path === '/') {
        setCurrentView('home');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // =========================================================================
  // CLOUD FIRESTORE REAL-TIME SYNCHRONIZATION
  // Subscribes all browsers and devices to live updates from Google Cloud Firestore
  // =========================================================================
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    async function initFirestoreSync() {
      const connected = await testConnection();
      setIsCloudConnected(connected);

      // 1. Subscribe to Products
      const unsubProducts = firestoreService.subscribeProducts((cloudProducts) => {
        if (cloudProducts.length > 0) {
          const rebranded = dataService.rebrandDeep(cloudProducts);
          setProducts(rebranded);
          // Update local mirror
          rebranded.forEach((p) => dataService.saveProduct(p));
        }
      });
      unsubs.push(unsubProducts);

      // 2. Subscribe to Categories
      const unsubCategories = firestoreService.subscribeCategories((cloudCategories) => {
        if (cloudCategories.length > 0) {
          const rebranded = dataService.rebrandDeep(cloudCategories);
          setCategories(rebranded);
          rebranded.forEach((c) => dataService.saveCategory(c));
        }
      });
      unsubs.push(unsubCategories);

      // 3. Subscribe to Page Sections
      const unsubSections = firestoreService.subscribeSections((cloudSections) => {
        if (cloudSections.length > 0) {
          const rebranded = dataService.rebrandDeep(cloudSections);
          setSections(rebranded);
          rebranded.forEach((s) => dataService.savePageSection(s));
        }
      });
      unsubs.push(unsubSections);

      // 4. Subscribe to Reviews
      const unsubReviews = firestoreService.subscribeReviews((cloudReviews) => {
        if (cloudReviews.length > 0) {
          const rebranded = dataService.rebrandDeep(cloudReviews);
          setReviews(rebranded);
          rebranded.forEach((r) => dataService.saveReview(r));
        }
      });
      unsubs.push(unsubReviews);

      // 5. Subscribe to FAQs
      const unsubFAQs = firestoreService.subscribeFAQs((cloudFAQs) => {
        if (cloudFAQs.length > 0) {
          const rebranded = dataService.rebrandDeep(cloudFAQs);
          setFaqs(rebranded);
          rebranded.forEach((f) => dataService.saveFAQ(f));
        }
      });
      unsubs.push(unsubFAQs);

      // 6. Subscribe to Design Settings
      const unsubDesign = firestoreService.subscribeDesignSettings((cloudDesign) => {
        if (cloudDesign) {
          const rebranded = dataService.rebrandDeep(cloudDesign);
          setDesignSettings(rebranded);
          dataService.saveDesignSettings(rebranded);
        }
      });
      unsubs.push(unsubDesign);

      // 7. Subscribe to Store Settings
      const unsubStore = firestoreService.subscribeStoreSettings((cloudStore) => {
        if (cloudStore) {
          const rebranded = dataService.rebrandDeep(cloudStore);
          if (!rebranded.paymentMethods || rebranded.paymentMethods.length === 0) {
            rebranded.paymentMethods = migrateLegacyPaymentSettings(rebranded);
          }
          setStoreSettings(rebranded);
          dataService.saveStoreSettings(rebranded);
        }
      });
      unsubs.push(unsubStore);

      // Check if Firestore needs initial seeding
      await firestoreService.seedFirestoreIfEmpty();
    }

    initFirestoreSync();

    return () => {
      unsubs.forEach((unsub) => {
        try {
          unsub();
        } catch {
          // ignore
        }
      });
    };
  }, []);

  // Real-time Orders listener (only active when admin is logged in)
  useEffect(() => {
    if (!isAdminLoggedIn) return;

    const unsubOrders = firestoreService.subscribeOrders((cloudOrders) => {
      setOrders(cloudOrders);
      cloudOrders.forEach((o) => dataService.saveOrder(o));
    });

    return () => {
      try {
        unsubOrders();
      } catch {
        // ignore
      }
    };
  }, [isAdminLoggedIn]);

  // Cart operations
  const addToCart = (product: Product, quantity = 1, eventDetails?: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity, eventDetails: eventDetails || item.eventDetails }
            : item
        );
      }
      return [...prev, { product, quantity, eventDetails }];
    });
    showToast(`Added "${product.name}" to cart`);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from cart', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => {
    const price = item.product.salePrice ?? item.product.regularPrice;
    return sum + price * item.quantity;
  }, 0);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Submit Order & save to Cloud Firestore + WhatsApp URL
  const submitOrder = async (orderData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    notes: string;
    eventDate?: string;
    items: { productId: string; productName: string; price: number; quantity: number; eventDetails?: string; image?: string }[];
  }) => {
    const orderNum = 'AUR-' + Math.floor(1000 + Math.random() * 9000);
    const totalAmount = orderData.items.reduce((s, i) => s + i.price * i.quantity, 0);

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      orderNumber: orderNum,
      createdAt: new Date().toISOString(),
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      eventDate: orderData.eventDate,
      notes: orderData.notes,
      items: orderData.items,
      total: totalAmount,
      status: 'new',
    };

    // Save to Firestore (Shared Cloud Database)
    try {
      await firestoreService.saveOrderToFirestore(newOrder);
      setIsCloudConnected(true);
    } catch (cloudErr) {
      console.warn('Direct Firestore order write error, saving locally:', cloudErr);
    }

    // Local mirror
    dataService.saveOrder(newOrder);
    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);

    // Generate formatted WhatsApp message
    const cleanPhone = (storeSettings.whatsAppNumber || '923425364018').replace(/[^0-9]/g, '');
    const itemsSummary = orderData.items
      .map((item) => `• *${item.productName}* (Qty: ${item.quantity}) - ${storeSettings.currencySymbol}${item.price * item.quantity}${item.eventDetails ? `\n  Details: ${item.eventDetails}` : ''}`)
      .join('\n');

    const message = `✨ *NEW ORDER REQUEST: ${orderNum}*
Brand: ${designSettings.brandName}

👤 *Customer Details:*
• Name: ${orderData.customerName}
• Phone: ${orderData.customerPhone}
• Email: ${orderData.customerEmail}
${orderData.eventDate ? `• Event Date: ${orderData.eventDate}` : ''}

📦 *Items Ordered:*
${itemsSummary}

💰 *Total Amount:* ${storeSettings.currencySymbol}${totalAmount}

📝 *Event Details & Notes:*
${orderData.notes || 'No extra notes provided.'}

---
_Sent via ${designSettings.brandName} Online Atelier_`;

    const whatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    // Clear cart if items matched cart
    clearCart();
    showToast(`Order #${orderNum} created successfully!`, 'success');

    return { order: newOrder, whatsAppUrl };
  };

  // Admin Auth functions (Firebase Authentication)
  const logoutAdmin = async () => {
    try {
      await logoutAdminFirebase();
      setAdminUser(null);
      showToast('Logged out of Admin Studio', 'info');
    } catch (err) {
      console.error('Logout error:', err);
      setAdminUser(null);
    }
  };

  // ==========================================
  // CLOUD PERSISTENT CRUD ACTIONS
  // ==========================================

  const saveProduct = async (prod: Product) => {
    // 1. Optimistic state
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === prod.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = prod;
        return copy;
      }
      return [...prev, prod];
    });
    dataService.saveProduct(prod);

    // 2. Cloud Firestore write
    try {
      await firestoreService.saveProductToFirestore(prod);
      showToast(`Saved "${prod.name}" to Cloud Firestore`);
    } catch (err: any) {
      console.error('Error saving product to Firestore:', err);
      showToast(`Saved locally. (Cloud write failed: ${err.message || 'Permissions'})`, 'info');
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    dataService.deleteProduct(id);

    try {
      await firestoreService.deleteProductFromFirestore(id);
      showToast('Product deleted from Cloud', 'info');
    } catch (err) {
      console.error('Error deleting product from Firestore:', err);
      showToast('Product removed locally', 'info');
    }
  };

  const duplicateProduct = async (id: string) => {
    const copy = dataService.duplicateProduct(id);
    if (copy) {
      setProducts((prev) => [...prev, copy]);
      try {
        await firestoreService.saveProductToFirestore(copy);
        showToast(`Duplicated as "${copy.name}" in Cloud`);
      } catch (err) {
        showToast(`Duplicated as "${copy.name}"`, 'info');
      }
    }
  };

  const reorderProducts = async (ids: string[]) => {
    const reordered = dataService.reorderProducts(ids);
    setProducts(reordered);
    showToast('Product order updated');

    // Batch update order fields in Cloud
    for (const prod of reordered) {
      try {
        await firestoreService.saveProductToFirestore(prod);
      } catch {
        // ignore
      }
    }
  };

  const saveCategory = async (cat: Category) => {
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === cat.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = cat;
        return copy;
      }
      return [...prev, cat];
    });
    dataService.saveCategory(cat);

    try {
      await firestoreService.saveCategoryToFirestore(cat);
      showToast(`Category "${cat.name}" saved to Cloud`);
    } catch (err) {
      showToast(`Category "${cat.name}" saved`);
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    dataService.deleteCategory(id);

    try {
      await firestoreService.deleteCategoryFromFirestore(id);
      showToast('Category deleted from Cloud', 'info');
    } catch {
      showToast('Category deleted', 'info');
    }
  };

  const saveSection = async (sec: PageSection) => {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === sec.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = sec;
        return copy;
      }
      return [...prev, sec];
    });
    dataService.savePageSection(sec);

    try {
      await firestoreService.saveSectionToFirestore(sec);
      showToast(`Section "${sec.title}" saved to Cloud`);
    } catch {
      showToast(`Section "${sec.title}" saved`);
    }
  };

  const deleteSection = async (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    dataService.deletePageSection(id);

    try {
      await firestoreService.deleteSectionFromFirestore(id);
      showToast('Section removed from Cloud', 'info');
    } catch {
      showToast('Section removed', 'info');
    }
  };

  const reorderSections = async (ids: string[]) => {
    const reordered = dataService.reorderPageSections(ids);
    setSections(reordered);
    showToast('Sections reordered');

    for (const sec of reordered) {
      try {
        await firestoreService.saveSectionToFirestore(sec);
      } catch {
        // ignore
      }
    }
  };

  const saveReview = async (rev: Review) => {
    setReviews((prev) => {
      const idx = prev.findIndex((r) => r.id === rev.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = rev;
        return copy;
      }
      return [...prev, rev];
    });
    dataService.saveReview(rev);

    try {
      await firestoreService.saveReviewToFirestore(rev);
      showToast('Review saved to Cloud');
    } catch {
      showToast('Review saved');
    }
  };

  const deleteReview = async (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    dataService.deleteReview(id);

    try {
      await firestoreService.deleteReviewFromFirestore(id);
      showToast('Review deleted from Cloud', 'info');
    } catch {
      showToast('Review deleted', 'info');
    }
  };

  const saveFAQ = async (faq: FAQItem) => {
    setFaqs((prev) => {
      const idx = prev.findIndex((f) => f.id === faq.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = faq;
        return copy;
      }
      return [...prev, faq];
    });
    dataService.saveFAQ(faq);

    try {
      await firestoreService.saveFAQToFirestore(faq);
      showToast('FAQ saved to Cloud');
    } catch {
      showToast('FAQ saved');
    }
  };

  const deleteFAQ = async (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    dataService.deleteFAQ(id);

    try {
      await firestoreService.deleteFAQFromFirestore(id);
      showToast('FAQ deleted from Cloud', 'info');
    } catch {
      showToast('FAQ deleted', 'info');
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    dataService.updateOrderStatus(id, status);

    try {
      await firestoreService.updateOrderStatusInFirestore(id, status);
      showToast(`Order status updated to ${status} in Cloud`);
    } catch {
      showToast(`Order status updated to ${status}`);
    }
  };

  const deleteOrder = async (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    dataService.deleteOrder(id);

    try {
      await firestoreService.deleteOrderFromFirestore(id);
      showToast('Order removed from Cloud', 'info');
    } catch {
      showToast('Order removed', 'info');
    }
  };

  const updateDesignSettings = async (settings: DesignSettings) => {
    setDesignSettings(settings);
    dataService.saveDesignSettings(settings);

    try {
      await firestoreService.saveDesignSettingsToFirestore(settings);
      showToast('Design settings saved to Cloud Firestore');
    } catch (err: any) {
      console.warn('Error updating design settings in Firestore:', err);
      showToast('Design settings updated locally');
    }
  };

  const resetDesignSettings = async () => {
    const reset = dataService.resetDesignSettings();
    setDesignSettings(reset);
    try {
      await firestoreService.saveDesignSettingsToFirestore(reset);
    } catch {
      // ignore
    }
    showToast('Design reset to default palette & typography');
  };

  const updateStoreSettings = async (settings: StoreSettings) => {
    setStoreSettings(settings);
    dataService.saveStoreSettings(settings);

    try {
      await firestoreService.saveStoreSettingsToFirestore(settings);
      showToast('Store & WhatsApp settings saved to Cloud Firestore');
    } catch (err: any) {
      console.warn('Error updating store settings in Firestore:', err);
      showToast('Store settings saved locally');
    }
  };

  // Explicit sync of all local records to Cloud Firestore
  const syncAllToCloud = async () => {
    showToast('Syncing all catalog items, sections, and settings to Cloud Firestore...', 'info');
    const result = await firestoreService.seedFirestoreIfEmpty();
    if (result.seeded) {
      showToast(`Successfully synced ${result.count} items to Cloud Firestore!`, 'success');
      setIsCloudConnected(true);
    } else {
      // Push each item to ensure synchronization
      const currentProducts = dataService.getProducts();
      for (const p of currentProducts) {
        await firestoreService.saveProductToFirestore(p).catch(() => {});
      }
      const currentCats = dataService.getCategories();
      for (const c of currentCats) {
        await firestoreService.saveCategoryToFirestore(c).catch(() => {});
      }
      await firestoreService.saveDesignSettingsToFirestore(designSettings).catch(() => {});
      await firestoreService.saveStoreSettingsToFirestore(storeSettings).catch(() => {});
      showToast('Cloud Firestore catalog verified and synchronized!', 'success');
      setIsCloudConnected(true);
    }
  };

  const exportBackup = async () => {
    try {
      showToast('Packaging data and media files...', 'info');
      const data = dataService.exportAllData();
      
      // Export all media files from IndexedDB
      const mediaFiles = await exportAllMedia();
      data.mediaFiles = mediaFiles;

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mit-invitations-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Backup downloaded with ${mediaFiles.length} media file(s)!`, 'success');
    } catch (err) {
      console.error('Export failed:', err);
      showToast('Export failed. Please try again.', 'error');
    }
  };

  const importBackup = async (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      showToast('Importing store data and restoring media files...', 'info');

      // Restore media files to IndexedDB if present
      let restoredCount = 0;
      if (parsed.mediaFiles && Array.isArray(parsed.mediaFiles)) {
        restoredCount = await importSerializedMedia(parsed.mediaFiles);
      }

      const success = dataService.importAllData(parsed);
      if (success) {
        setProducts(dataService.getProducts());
        setCategories(dataService.getCategories());
        setSections(dataService.getPageSections());
        setReviews(dataService.getReviews());
        setFaqs(dataService.getFAQs());
        setOrders(dataService.getOrders());
        setDesignSettings(dataService.getDesignSettings());
        setStoreSettings(dataService.getStoreSettings());

        // Also push imported data to Cloud Firestore
        for (const p of dataService.getProducts()) {
          await firestoreService.saveProductToFirestore(p).catch(() => {});
        }
        await firestoreService.saveDesignSettingsToFirestore(dataService.getDesignSettings()).catch(() => {});
        await firestoreService.saveStoreSettingsToFirestore(dataService.getStoreSettings()).catch(() => {});

        showToast(`Backup imported and synced to Cloud (${restoredCount} media restored)!`, 'success');
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      showToast('Invalid JSON file format', 'error');
      return false;
    }
  };

  const resetAllData = async () => {
    dataService.resetAllDataToDefault();
    const defProds = dataService.getProducts();
    const defCats = dataService.getCategories();
    const defSecs = dataService.getPageSections();
    const defRevs = dataService.getReviews();
    const defFaqs = dataService.getFAQs();
    const defOrders = dataService.getOrders();
    const defDesign = dataService.getDesignSettings();
    const defStore = dataService.getStoreSettings();

    setProducts(defProds);
    setCategories(defCats);
    setSections(defSecs);
    setReviews(defRevs);
    setFaqs(defFaqs);
    setOrders(defOrders);
    setDesignSettings(defDesign);
    setStoreSettings(defStore);

    // Sync to Cloud
    for (const p of defProds) {
      await firestoreService.saveProductToFirestore(p).catch(() => {});
    }
    await firestoreService.saveDesignSettingsToFirestore(defDesign).catch(() => {});
    await firestoreService.saveStoreSettingsToFirestore(defStore).catch(() => {});

    showToast('All store data reset to factory template and synced to Cloud', 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        sections,
        reviews,
        faqs,
        orders,
        designSettings,
        storeSettings,
        isCloudConnected,
        currentView,
        selectedProductId,
        quickPreviewProduct,
        inviteSlug,
        customizeTemplateId,
        navigate,
        setQuickPreviewProduct,
        setInviteSlug,
        setCustomizeTemplateId,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        checkoutItem,
        setCheckoutItem,
        submitOrder,
        saveProduct,
        deleteProduct,
        duplicateProduct,
        reorderProducts,
        saveCategory,
        deleteCategory,
        saveSection,
        deleteSection,
        reorderSections,
        saveReview,
        deleteReview,
        saveFAQ,
        deleteFAQ,
        updateOrderStatus,
        deleteOrder,
        updateDesignSettings,
        resetDesignSettings,
        updateStoreSettings,
        syncAllToCloud,
        exportBackup,
        importBackup,
        resetAllData,
        toasts,
        showToast,
        removeToast,
        adminUser,
        isAdminLoggedIn,
        authLoading,
        logoutAdmin,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

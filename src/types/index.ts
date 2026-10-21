export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  tags: string[];
  image: string;
  previewVideo: string; // Video URL or base64 data URL
  previewPoster?: string;
  regularPrice: number;
  salePrice?: number | null;
  featured: boolean;
  isNew: boolean;
  bestseller: boolean;
  customBadge?: string; // "New", "Popular", "Bestseller", or custom
  hasSecondScreen?: boolean; // Dual phone display (e.g. Dolce Vita style)
  secondScreenImage?: string;
  secondScreenVideo?: string;
  secondScreenTitle?: string;
  status: 'published' | 'draft';
  order: number;
  features: string[];
  templateId?: string; // Links product to interactive InvitationTemplate
  eventSample?: {
    coupleOrHost: string;
    eventType: string;
    date: string;
    time: string;
    venue: string;
    city: string;
    rsvpDeadline: string;
    colorTheme?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName?: string;
}

export type SectionType = 
  | 'hero' 
  | 'why_choose_us' 
  | 'product_grid' 
  | 'whats_included' 
  | 'reviews' 
  | 'steps' 
  | 'faq' 
  | 'cta' 
  | 'banner' 
  | 'text' 
  | 'image';

export interface PageSection {
  id: string;
  type: SectionType;
  title: string;
  subtitle?: string;
  badge?: string;
  content?: string;
  imageUrl?: string;
  isVisible: boolean;
  order: number;
  customData?: Record<string, any>;
}

export interface Review {
  id: string;
  author: string;
  location?: string;
  eventType: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  eventDetails?: string;
  image?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate?: string;
  notes: string;
  items: OrderItem[];
  total: number;
  status: 'new' | 'confirmed' | 'completed' | 'cancelled';
}

export interface DesignSettings {
  brandName: string;
  tagline: string;
  logoUrl?: string;
  primaryColor: string; // sage #5E8C84
  secondaryColor: string; // light sage #DCE8E4
  blushColor: string; // blush #EEDDE0
  backgroundColor: string; // #F2F6F6
  textColor: string; // slate #26343C
  headingFont: 'Fraunces' | 'Playfair Display' | 'Cormorant Garamond' | 'Cinzel';
  bodyFont: 'Figtree' | 'Plus Jakarta Sans' | 'DM Sans' | 'Manrope';
  buttonRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  buttonStyle: 'solid' | 'soft' | 'outline';
  heroVideoUrl: string;
  heroPosterUrl: string;
  heroBadgeText: string;
  heroTitle: string;
  heroSubtitle: string;
}

export type PaymentMethodType = 
  | 'easypaisa' 
  | 'jazzcash' 
  | 'nayapay' 
  | 'sadapay' 
  | 'bank' 
  | 'other';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  customTypeName?: string;
  accountTitle: string;
  accountNumber: string;
  bankName?: string;
  iban?: string;
  note?: string;
  enabled: boolean;
  order: number;
}

export interface StoreSettings {
  whatsAppNumber: string; // e.g. "923425364018"
  email: string;
  phone: string;
  address: string;
  workingHours: string;
  instagram: string;
  pinterest: string;
  tiktok: string;
  facebook: string;
  currencySymbol: string;
  announcementText: string;
  showAnnouncement: boolean;
  // Flexible Payment Methods
  paymentMethods?: PaymentMethod[];
  // Legacy Manual Payment Settings (JazzCash, Easypaisa, Bank Transfer)
  jazzcashNumber?: string;
  jazzcashTitle?: string;
  easypaisaNumber?: string;
  easypaisaTitle?: string;
  bankName?: string;
  bankAccountTitle?: string;
  bankAccountNumber?: string;
  bankIban?: string;
  paymentInstructions?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  eventDetails?: string;
}

export type AppView = 
  | 'home' 
  | 'shop' 
  | 'product-detail' 
  | 'cart' 
  | 'checkout' 
  | 'about' 
  | 'faq' 
  | 'contact' 
  | 'terms' 
  | 'privacy' 
  | 'admin'
  | 'customize'
  | 'invite'
  | 'portal'
  | 'portal-login';

export * from './invitation';

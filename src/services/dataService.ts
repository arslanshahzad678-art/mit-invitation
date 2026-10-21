import { 
  Product, 
  Category, 
  PageSection, 
  Review, 
  FAQItem, 
  Order, 
  DesignSettings, 
  StoreSettings 
} from '../types';
import { DEFAULT_PAYMENT_METHODS, migrateLegacyPaymentSettings } from './paymentService';

export const STORAGE_KEYS = {
  PRODUCTS: 'mit_products_v1',
  CATEGORIES: 'mit_categories_v1',
  SECTIONS: 'mit_sections_v1',
  REVIEWS: 'mit_reviews_v1',
  FAQS: 'mit_faqs_v1',
  ORDERS: 'mit_orders_v1',
  DESIGN_SETTINGS: 'mit_design_settings_v1',
  STORE_SETTINGS: 'mit_store_settings_v1',
  INITIALIZED: 'mit_data_initialized_v1',
};

// Rebrand text helper: safely replaces any legacy "Aura" references with "MIT Invitations"
export function rebrandText(text: string): string {
  if (typeof text !== 'string') return text;
  return text
    .replace(/Aura\s*Invitations/gi, 'MIT Invitations')
    .replace(/Aura\s*Signature/gi, 'MIT Signature')
    .replace(/Aura\s*Management/gi, 'MIT Management')
    .replace(/Aura\s*Admin/gi, 'MIT Admin')
    .replace(/Aura\s*Design/gi, 'MIT Design')
    .replace(/\bAura\b/gi, 'MIT Invitations')
    .replace(/aurainvitations/gi, 'mitinvitations');
}

// Deep rebranding helper for loaded objects, arrays, and strings
export function rebrandDeep<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return rebrandText(obj) as unknown as T;
  if (Array.isArray(obj)) return obj.map((item) => rebrandDeep(item)) as unknown as T;
  if (typeof obj === 'object') {
    const res: any = {};
    for (const key of Object.keys(obj)) {
      res[key] = rebrandDeep((obj as any)[key]);
    }
    return res;
  }
  return obj;
}

export const DEFAULT_DESIGN_SETTINGS: DesignSettings = {
  brandName: 'MIT Invitations',
  tagline: 'Animated Digital Invitations & Bespoke Mobile Keepsakes',
  logoUrl: '',
  primaryColor: '#5E8C84',     // Soft Sage
  secondaryColor: '#DCE8E4',   // Light Sage
  blushColor: '#EEDDE0',       // Soft Blush
  backgroundColor: '#F2F6F6',  // Crisp Soft Pearl
  textColor: '#26343C',        // Deep Slate
  headingFont: 'Fraunces',
  bodyFont: 'Figtree',
  buttonRadius: 'lg',
  buttonStyle: 'solid',
  heroBadgeText: 'Digital Keepsakes for the Modern Host',
  heroTitle: 'Send Invitations They Will Never Forget.',
  heroSubtitle: 'Bespoke animated invitations crafted for mobile screens. One tap to RSVP, view map directions, and add to calendar — delivered in 24 hours.',
  heroVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-bride-holding-a-bouquet-of-flowers-43187-large.mp4',
  heroPosterUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
};

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  whatsAppNumber: '923425364018', // International format without +
  email: 'hello@mitinvitations.com',
  phone: '+92 342 5364018',
  address: 'Studio 402, 742 Evergreen Atelier, Portland, OR',
  workingHours: 'Mon – Fri: 9:00 AM – 6:00 PM EST',
  instagram: 'https://instagram.com/mitinvitations',
  pinterest: 'https://pinterest.com/mitinvitations',
  tiktok: 'https://tiktok.com/@mitinvitations',
  facebook: 'https://facebook.com/mitinvitations',
  currencySymbol: '$',
  announcementText: '✨ Complimentary 24-Hour Express Delivery on all Digital Wedding Suites',
  showAnnouncement: true,
  paymentMethods: DEFAULT_PAYMENT_METHODS,
};

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-weddings',
    name: 'Weddings & Elopements',
    slug: 'weddings',
    description: 'Ethereal, romantic animated invitations with RSVP buttons, dress codes, and venue maps.',
    iconName: 'HeartHandshake',
  },
  {
    id: 'cat-save-the-date',
    name: 'Save the Dates',
    slug: 'save-the-dates',
    description: 'Bite-sized mobile videos to announce your date before formal stationery.',
    iconName: 'CalendarHeart',
  },
  {
    id: 'cat-birthdays',
    name: 'Birthdays & Milestones',
    slug: 'birthdays',
    description: 'Celebratory motion designs for 30th, 40th, 50th, and milestone soirees.',
    iconName: 'PartyPopper',
  },
  {
    id: 'cat-bridal-baby',
    name: 'Bridal & Baby Showers',
    slug: 'bridal-baby',
    description: 'Delicate floral and pastel digital suites with gift registry links.',
    iconName: 'Sparkles',
  },
  {
    id: 'cat-dinners-parties',
    name: 'Cocktails & Dinners',
    slug: 'dinners-parties',
    description: 'Sophisticated typography and ambient motion for rehearsal dinners and dinner parties.',
    iconName: 'Wine',
  },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-seraphina',
    name: 'The Seraphina Botanical Suite',
    slug: 'seraphina-botanical-suite',
    description: 'Gentle swaying olive branches, hand-lettered gold foil accents, and soft acoustic piano ambience. Includes interactive Google Maps pin and instant WhatsApp RSVP link.',
    categoryId: 'cat-weddings',
    tags: ['Wedding', 'Botanical', 'Romantic', 'Eucalyptus'],
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    previewVideo: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-bride-holding-a-bouquet-of-flowers-43187-large.mp4',
    previewPoster: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    regularPrice: 48,
    salePrice: 38,
    featured: true,
    isNew: false,
    bestseller: true,
    customBadge: 'Bestseller',
    hasSecondScreen: true,
    secondScreenImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    secondScreenTitle: 'RSVP & Map Details',
    status: 'published',
    order: 1,
    features: [
      'HD 1080x1920 MP4 Video for WhatsApp & iMessage',
      'Interactive Web RSVP Link with guest counter',
      'Direct Google Maps Venue Navigation Pin',
      'Complimentary text and photo customization',
      'Delivered in less than 24 hours',
    ],
    eventSample: {
      coupleOrHost: 'Camilla & Harrison',
      eventType: 'Wedding Celebration',
      date: 'Saturday, October 18, 2026',
      time: '4:30 PM Onwards',
      venue: 'Villa San Michele, Tuscan Hills',
      city: 'Florence, Italy',
      rsvpDeadline: 'September 10, 2026',
      colorTheme: 'Sage, Warm Cream & Gold',
    },
  },
  {
    id: 'prod-celeste-modern',
    name: 'Celeste Minimalist Monogram',
    slug: 'celeste-minimalist-monogram',
    description: 'Architectural minimalism featuring modern editorial serif typography, embossed blind deboss effect, and sleek slide transitions tailored for contemporary city weddings.',
    categoryId: 'cat-weddings',
    tags: ['Modern', 'Black Tie', 'Minimalist', 'Editorial'],
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    previewVideo: 'https://assets.mixkit.co/videos/preview/mixkit-wedding-rings-in-a-box-43189-large.mp4',
    previewPoster: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    regularPrice: 42,
    salePrice: 35,
    featured: true,
    isNew: true,
    bestseller: false,
    status: 'published',
    order: 2,
    features: [
      'Cinematic motion design with monogram lockup',
      'Includes matching Save-the-Date video short',
      'Dress code & registry buttons',
      'Up to 3 revisions included',
    ],
    eventSample: {
      coupleOrHost: 'Genevieve & Julian',
      eventType: 'Modern Black Tie Wedding',
      date: 'Friday, November 20, 2026',
      time: '6:00 PM',
      venue: 'The Glass Pavilion at Highline',
      city: 'New York, NY',
      rsvpDeadline: 'October 15, 2026',
      colorTheme: 'Charcoal Slate & Pearl Cream',
    },
  },
  {
    id: 'prod-aurelia-gold',
    name: 'Aurelia Champagne & Gilded Arch',
    slug: 'aurelia-champagne-gilded-arch',
    description: 'Glistening gold foil dust particles gently drifting across a warm travertine stone texture. Perfect for opulent ballroom galas and destination weddings.',
    categoryId: 'cat-weddings',
    tags: ['Luxury', 'Gold Foil', 'Destination', 'Elegant'],
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
    previewVideo: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-bride-holding-a-bouquet-of-flowers-43187-large.mp4',
    previewPoster: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
    regularPrice: 52,
    salePrice: 44,
    featured: true,
    isNew: false,
    bestseller: true,
    status: 'published',
    order: 3,
    features: [
      'Gilded motion particle loop with custom soundtrack',
      'Countdown timer graphic for social sharing',
      'Multi-day itinerary layout for destination events',
      'High-resolution PDF version included for print',
    ],
    eventSample: {
      coupleOrHost: 'Isabella & Rafael',
      eventType: 'Destination Wedding Weekend',
      date: 'September 24 - 26, 2026',
      time: 'Welcome Drinks at 7:00 PM',
      venue: 'Palazzo Ducale Courtyard',
      city: 'Venice, Italy',
      rsvpDeadline: 'August 1, 2026',
      colorTheme: 'Champagne, Gold & Blush',
    },
  },
  {
    id: 'prod-solene-save-date',
    name: 'Solène Film Strip Save the Date',
    slug: 'solene-film-strip-save-the-date',
    description: 'Chic 35mm film reel animation that displays 3 of your favorite couple photos with nostalgic grain, gentle light leaks, and smooth calendar highlighting.',
    categoryId: 'cat-save-the-date',
    tags: ['Save the Date', 'Photo Video', 'Vintage', '35mm Film'],
    image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
    previewVideo: 'https://assets.mixkit.co/videos/preview/mixkit-wedding-rings-in-a-box-43189-large.mp4',
    previewPoster: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
    regularPrice: 35,
    salePrice: 28,
    featured: false,
    isNew: true,
    bestseller: true,
    status: 'published',
    order: 4,
    features: [
      'Include up to 3 high-resolution couple photos',
      'Warm analog 35mm film border and gentle motion',
      'Calendar day pulsing animation',
      'Formal invitation notice note',
    ],
    eventSample: {
      coupleOrHost: 'Elena & Marcus',
      eventType: 'Save Our Date',
      date: 'Saturday, July 11, 2026',
      time: 'Invitation to follow',
      venue: 'Sonoma Valley Vineyards',
      city: 'Sonoma, California',
      rsvpDeadline: 'Stay Tuned',
      colorTheme: 'Warm Sepia & Olive',
    },
  },
  {
    id: 'prod-flora-baby',
    name: 'Petite Fleur Baby Shower Suite',
    slug: 'petite-fleur-baby-shower-suite',
    description: 'Soft watercolor blush ranunculus, delicate fluttering butterflies, and whimsical script. Direct buttons to Babylist and Amazon baby registries.',
    categoryId: 'cat-bridal-baby',
    tags: ['Baby Shower', 'Floral', 'Pastel', 'Watercolor'],
    image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
    previewVideo: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-bride-holding-a-bouquet-of-flowers-43187-large.mp4',
    previewPoster: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
    regularPrice: 36,
    salePrice: 29,
    featured: false,
    isNew: false,
    bestseller: false,
    status: 'published',
    order: 5,
    features: [
      'Instant baby registry links (Babylist, Target, Amazon)',
      'Host contact details & RSVP date',
      'Diaper raffle or book request card slide',
      'Fast 12-hour turnaround available',
    ],
    eventSample: {
      coupleOrHost: 'Honoring Sophia Vance',
      eventType: 'A Sweet Baby Shower',
      date: 'Sunday, August 9, 2026',
      time: '1:00 PM - 4:00 PM',
      venue: 'The Conservatory Garden Room',
      city: 'Austin, Texas',
      rsvpDeadline: 'July 25, 2026',
      colorTheme: 'Powder Blush & Light Sage',
    },
  },
  {
    id: 'prod-lumiere-milestone',
    name: 'Lumière Milestone Birthday Soiree',
    slug: 'lumiere-milestone-birthday-soiree',
    description: 'Dramatic moody emerald and obsidian hues with golden bokeh light bursts. Ideal for 30th, 40th, or 50th celebrations and intimate rooftop gatherings.',
    categoryId: 'cat-birthdays',
    tags: ['Birthday', 'Milestone', 'Cocktail', 'Glamour'],
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    previewVideo: 'https://assets.mixkit.co/videos/preview/mixkit-wedding-rings-in-a-box-43189-large.mp4',
    previewPoster: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    regularPrice: 38,
    salePrice: 32,
    featured: false,
    isNew: true,
    bestseller: false,
    status: 'published',
    order: 6,
    features: [
      'Custom age & milestone callout',
      'Attire moodboard link and music playlist teaser',
      'RSVP by WhatsApp button configured with host number',
      'Personalized music selection',
    ],
    eventSample: {
      coupleOrHost: 'Alexander turns 40',
      eventType: 'Cocktail & Jazz Soirée',
      date: 'Saturday, December 5, 2026',
      time: '8:00 PM Till Late',
      venue: 'The Velvet Lounge & Terrace',
      city: 'Chicago, IL',
      rsvpDeadline: 'November 22, 2026',
      colorTheme: 'Emerald Green & Amber Gold',
    },
  },
  {
    id: 'prod-botanica-rehearsal',
    name: 'Verdant Rehearsal & Welcome Dinner',
    slug: 'verdant-rehearsal-welcome-dinner',
    description: 'Earthy herbs, linen textures, and warm candlelight glow. Keeps wedding guests informed about dinner timings, transport shuttles, and toasts.',
    categoryId: 'cat-dinners-parties',
    tags: ['Rehearsal Dinner', 'Welcome Party', 'Earthy', 'Rustic'],
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
    previewVideo: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-bride-holding-a-bouquet-of-flowers-43187-large.mp4',
    previewPoster: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
    regularPrice: 34,
    salePrice: null,
    featured: false,
    isNew: false,
    bestseller: false,
    status: 'published',
    order: 7,
    features: [
      'Shuttle schedule and parking directions',
      'Dietary restrictions RSVP form',
      'Warm acoustic audio track',
      'Ready to send in 24 hours',
    ],
    eventSample: {
      coupleOrHost: 'Maya & Oliver',
      eventType: 'Rehearsal Dinner & Welcome Toasts',
      date: 'Friday, October 23, 2026',
      time: '6:30 PM',
      venue: 'Heritage Barn & Orchard',
      city: 'Charlottesville, VA',
      rsvpDeadline: 'October 1, 2026',
      colorTheme: 'Linen, Sage & Warm Terracotta',
    },
  },
];

const DEFAULT_SECTIONS: PageSection[] = [
  {
    id: 'sec-hero',
    type: 'hero',
    title: 'Send Invitations They Will Never Forget.',
    subtitle: 'Bespoke animated invitations crafted for mobile screens. One tap to RSVP, view map directions, and add to calendar — delivered in 24 hours.',
    badge: 'Digital Keepsakes for the Modern Host',
    isVisible: true,
    order: 1,
  },
  {
    id: 'sec-why-us',
    type: 'why_choose_us',
    title: 'Why Modern Hosts Choose MIT Invitations',
    subtitle: 'Elevate your event experience from the very first notification. Say goodbye to lost envelopes and weeks of waiting.',
    isVisible: true,
    order: 2,
  },
  {
    id: 'sec-gallery',
    type: 'product_grid',
    title: 'Curated Template Gallery',
    subtitle: 'Browse our signature animated invitation suites. Each design is meticulously customized with your event details.',
    isVisible: true,
    order: 3,
  },
  {
    id: 'sec-whats-included',
    type: 'whats_included',
    title: 'What’s Included in Every Suite',
    subtitle: 'More than a pretty video — a complete digital guest communication toolkit designed to make RSVPs effortless.',
    isVisible: true,
    order: 4,
  },
  {
    id: 'sec-reviews',
    type: 'reviews',
    title: 'Loved by Over 1,200 Couples & Hosts',
    subtitle: 'Real stories from hosts who wanted their invitations to feel as special as their celebration.',
    isVisible: true,
    order: 5,
  },
  {
    id: 'sec-steps',
    type: 'steps',
    title: 'How It Works in 3 Simple Steps',
    subtitle: 'From browsing to sending out your invitations in three stress-free steps.',
    isVisible: true,
    order: 6,
  },
  {
    id: 'sec-faq',
    type: 'faq',
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about delivery, formatting, music choices, and customization.',
    isVisible: true,
    order: 7,
  },
  {
    id: 'sec-cta',
    type: 'cta',
    title: 'Ready to Impress Your Guests?',
    subtitle: 'Choose your favorite template today or message our atelier for a bespoke custom commission.',
    isVisible: true,
    order: 8,
  },
];

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    author: 'Claire & Thomas Vance',
    location: 'Charleston, SC',
    eventType: 'Tuscan Wedding Celebration',
    rating: 5,
    comment: 'Our guests could not stop messaging us! Everyone said it was the most elegant invitation they had ever received on WhatsApp. The music and map pin made it so easy for out-of-town guests.',
    date: 'October 12, 2026',
    verified: true,
  },
  {
    id: 'rev-2',
    author: 'Serena K.',
    location: 'London, UK',
    eventType: '30th Birthday Soirée',
    rating: 5,
    comment: 'Turnaround was literally 14 hours. The team changed the song to my favourite French jazz track without hesitation. Super friendly and professional.',
    date: 'September 28, 2026',
    verified: true,
  },
  {
    id: 'rev-3',
    author: 'Maya & Devan Patel',
    location: 'Toronto, Canada',
    eventType: 'Save the Date Video',
    rating: 5,
    comment: 'Saved us hundreds of dollars on postage and paper printing, and it arrived instantly to our friends in 4 different countries. Eco-friendly and stunning quality.',
    date: 'August 19, 2026',
    verified: true,
  },
  {
    id: 'rev-4',
    author: 'Elena Gomez',
    location: 'Miami, FL',
    eventType: 'Baby Shower Suite',
    rating: 5,
    comment: 'The Babylist registry button worked like a charm right from the phone screen. All our guests RSVP’d within 48 hours!',
    date: 'July 30, 2026',
    verified: true,
  },
];

const DEFAULT_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Delivery & Formats',
    question: 'How do I receive and send the invitation to my guests?',
    answer: 'Once customized, we deliver a pristine 1080x1920 Full HD MP4 video file and a private interactive web link directly to your WhatsApp or email. You can forward it with one tap to individual guests or group chats on WhatsApp, iMessage, Telegram, Instagram DMs, or email.',
    order: 1,
  },
  {
    id: 'faq-2',
    category: 'Customization',
    question: 'Can I change the wording, colors, and background music?',
    answer: 'Yes! All text, names, dates, venues, dress codes, and details are 100% customizable. You can also specify your preferred font style, choose from our curated audio library, or send us your own royalty-free track.',
    order: 2,
  },
  {
    id: 'faq-3',
    category: 'Turnaround Time',
    question: 'How long does customization take?',
    answer: 'Our standard delivery is guaranteed within 24 hours of receiving your completed event details. If you need urgent delivery, let us know via WhatsApp and we can often deliver within 4 to 8 hours.',
    order: 3,
  },
  {
    id: 'faq-4',
    category: 'RSVP Tracking',
    question: 'How do guests RSVP?',
    answer: 'We configure your invitation with direct interactive RSVP links: guests can tap to reply directly to your personal WhatsApp number with an automated confirmation message, or tap into your Google Form or wedding website.',
    order: 4,
  },
  {
    id: 'faq-5',
    category: 'Revisions',
    question: 'What if my venue or timings change?',
    answer: 'Every order includes up to 3 complimentary revisions. If your ceremony time or location details shift before the big day, simply message us on WhatsApp and we will promptly update your file.',
    order: 5,
  },
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'AUR-8291',
    createdAt: '2026-10-18T14:22:00.000Z',
    customerName: 'Aria Montgomery',
    customerEmail: 'aria.m@example.com',
    customerPhone: '+1 (555) 392-1084',
    eventDate: '2026-11-14',
    notes: 'Bride & Groom: Aria & Ezra. Venue: Rosewood Conservatory. RSVP by Oct 30 please.',
    items: [
      {
        productId: 'prod-seraphina',
        productName: 'The Seraphina Botanical Suite',
        price: 38,
        quantity: 1,
        eventDetails: 'Aria & Ezra Wedding, Nov 14 2026, Rosewood Conservatory',
      },
    ],
    total: 38,
    status: 'completed',
  },
  {
    id: 'ord-1002',
    orderNumber: 'AUR-8292',
    createdAt: '2026-10-19T09:15:00.000Z',
    customerName: 'Marcus Bennett',
    customerEmail: 'm.bennett@example.com',
    customerPhone: '+1 (555) 749-3321',
    eventDate: '2026-12-05',
    notes: 'Marcus 40th Birthday bash. Dress code: Cocktail chic. Preferred song: Smooth jazz.',
    items: [
      {
        productId: 'prod-lumiere-milestone',
        productName: 'Lumière Milestone Birthday Soiree',
        price: 32,
        quantity: 1,
        eventDetails: 'Marcus Bennett 40th Birthday, Dec 5 2026',
      },
    ],
    total: 32,
    status: 'confirmed',
  },
];

// Helper to safely parse JSON from localStorage
function readStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

// Helper to safely write JSON to localStorage
function writeStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

// Initialize seed data on first run
export function initializeDataLayer(): void {
  if (typeof window === 'undefined') return;

  // 1. One-time legacy migration from aura_* to mit_*
  const keyPairs: [string, string][] = [
    ['aura_products_v1', STORAGE_KEYS.PRODUCTS],
    ['aura_categories_v1', STORAGE_KEYS.CATEGORIES],
    ['aura_sections_v1', STORAGE_KEYS.SECTIONS],
    ['aura_reviews_v1', STORAGE_KEYS.REVIEWS],
    ['aura_faqs_v1', STORAGE_KEYS.FAQS],
    ['aura_orders_v1', STORAGE_KEYS.ORDERS],
    ['aura_design_settings_v1', STORAGE_KEYS.DESIGN_SETTINGS],
    ['aura_store_settings_v1', STORAGE_KEYS.STORE_SETTINGS],
    ['aura_data_initialized_v1', STORAGE_KEYS.INITIALIZED],
    ['aura_cart_v1', 'mit_cart_v1'],
  ];

  keyPairs.forEach(([oldKey, newKey]) => {
    try {
      const oldVal = localStorage.getItem(oldKey);
      if (oldVal !== null) {
        const newVal = localStorage.getItem(newKey);
        if (!newVal) {
          try {
            const parsed = JSON.parse(oldVal);
            localStorage.setItem(newKey, JSON.stringify(rebrandDeep(parsed)));
          } catch {
            localStorage.setItem(newKey, oldVal);
          }
        }
        localStorage.removeItem(oldKey);
      }
    } catch (e) {
      console.warn('Migration error for key', oldKey, e);
    }
  });

  const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (!isInit) {
    writeStorage(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    writeStorage(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    writeStorage(STORAGE_KEYS.SECTIONS, DEFAULT_SECTIONS);
    writeStorage(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS);
    writeStorage(STORAGE_KEYS.FAQS, DEFAULT_FAQS);
    writeStorage(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
    writeStorage(STORAGE_KEYS.DESIGN_SETTINGS, DEFAULT_DESIGN_SETTINGS);
    writeStorage(STORAGE_KEYS.STORE_SETTINGS, DEFAULT_STORE_SETTINGS);
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  } else {
    // If existing localStorage has the old placeholder number, migrate to the configured WhatsApp number
    const currentSettings = readStorage<StoreSettings>(STORAGE_KEYS.STORE_SETTINGS, DEFAULT_STORE_SETTINGS);
    let changed = false;
    if (currentSettings.whatsAppNumber === '15550198234' || !currentSettings.whatsAppNumber) {
      currentSettings.whatsAppNumber = '923425364018';
      currentSettings.phone = '+92 342 5364018';
      changed = true;
    }
    // Rebrand saved settings if they contain Aura
    if (currentSettings.email && currentSettings.email.includes('aurainvitations')) {
      currentSettings.email = 'hello@mitinvitations.com';
      currentSettings.instagram = 'https://instagram.com/mitinvitations';
      currentSettings.pinterest = 'https://pinterest.com/mitinvitations';
      currentSettings.tiktok = 'https://tiktok.com/@mitinvitations';
      currentSettings.facebook = 'https://facebook.com/mitinvitations';
      changed = true;
    }
    // Migrate legacy payment fields to flexible paymentMethods
    if (!currentSettings.paymentMethods || currentSettings.paymentMethods.length === 0) {
      currentSettings.paymentMethods = migrateLegacyPaymentSettings(currentSettings);
      changed = true;
    }
    if (changed) {
      writeStorage(STORAGE_KEYS.STORE_SETTINGS, currentSettings);
    }

    // Rebrand design settings if legacy brand is stored
    const design = readStorage<DesignSettings>(STORAGE_KEYS.DESIGN_SETTINGS, DEFAULT_DESIGN_SETTINGS);
    if (design.brandName === 'Aura Invitations' || design.brandName === 'Aura') {
      design.brandName = 'MIT Invitations';
      writeStorage(STORAGE_KEYS.DESIGN_SETTINGS, design);
    }
  }
}

// ==========================================
// 1. PRODUCTS CRUD
// ==========================================
export function getProducts(): Product[] {
  initializeDataLayer();
  const prods = readStorage<Product[]>(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
  return prods.sort((a, b) => a.order - b.order);
}

export function saveProduct(product: Product): Product {
  const products = getProducts();
  const existingIdx = products.findIndex((p) => p.id === product.id);
  
  if (existingIdx >= 0) {
    products[existingIdx] = product;
  } else {
    // New product
    if (!product.order) {
      product.order = products.length + 1;
    }
    products.push(product);
  }
  writeStorage(STORAGE_KEYS.PRODUCTS, products);
  return product;
}

export function deleteProduct(productId: string): boolean {
  const products = getProducts();
  const filtered = products.filter((p) => p.id !== productId);
  writeStorage(STORAGE_KEYS.PRODUCTS, filtered);
  return true;
}

export function reorderProducts(productIds: string[]): Product[] {
  const products = getProducts();
  const map = new Map(products.map((p) => [p.id, p]));
  const reordered: Product[] = [];
  
  productIds.forEach((id, index) => {
    const item = map.get(id);
    if (item) {
      item.order = index + 1;
      reordered.push(item);
      map.delete(id);
    }
  });
  // Append any remainder
  map.forEach((item) => {
    item.order = reordered.length + 1;
    reordered.push(item);
  });
  writeStorage(STORAGE_KEYS.PRODUCTS, reordered);
  return reordered;
}

export function duplicateProduct(productId: string): Product | null {
  const products = getProducts();
  const target = products.find((p) => p.id === productId);
  if (!target) return null;

  const newId = 'prod-' + Date.now();
  const copy: Product = {
    ...target,
    id: newId,
    name: `${target.name} (Copy)`,
    slug: `${target.slug}-copy-${Date.now().toString().slice(-4)}`,
    order: products.length + 1,
    status: 'draft',
  };
  products.push(copy);
  writeStorage(STORAGE_KEYS.PRODUCTS, products);
  return copy;
}

// ==========================================
// 2. CATEGORIES CRUD
// ==========================================
export function getCategories(): Category[] {
  initializeDataLayer();
  return readStorage<Category[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
}

export function saveCategory(category: Category): Category {
  const categories = getCategories();
  const idx = categories.findIndex((c) => c.id === category.id);
  if (idx >= 0) {
    categories[idx] = category;
  } else {
    categories.push(category);
  }
  writeStorage(STORAGE_KEYS.CATEGORIES, categories);
  return category;
}

export function deleteCategory(categoryId: string): boolean {
  const categories = getCategories();
  const filtered = categories.filter((c) => c.id !== categoryId);
  writeStorage(STORAGE_KEYS.CATEGORIES, filtered);
  return true;
}

// ==========================================
// 3. PAGE SECTIONS CRUD & REORDER
// ==========================================
export function getPageSections(): PageSection[] {
  initializeDataLayer();
  const sections = readStorage<PageSection[]>(STORAGE_KEYS.SECTIONS, DEFAULT_SECTIONS);
  return sections.sort((a, b) => a.order - b.order);
}

export function savePageSection(section: PageSection): PageSection {
  const sections = getPageSections();
  const idx = sections.findIndex((s) => s.id === section.id);
  if (idx >= 0) {
    sections[idx] = section;
  } else {
    if (!section.order) {
      section.order = sections.length + 1;
    }
    sections.push(section);
  }
  writeStorage(STORAGE_KEYS.SECTIONS, sections);
  return section;
}

export function deletePageSection(sectionId: string): boolean {
  const sections = getPageSections();
  const filtered = sections.filter((s) => s.id !== sectionId);
  writeStorage(STORAGE_KEYS.SECTIONS, filtered);
  return true;
}

export function reorderPageSections(sectionIds: string[]): PageSection[] {
  const sections = getPageSections();
  const map = new Map(sections.map((s) => [s.id, s]));
  const reordered: PageSection[] = [];
  
  sectionIds.forEach((id, index) => {
    const item = map.get(id);
    if (item) {
      item.order = index + 1;
      reordered.push(item);
      map.delete(id);
    }
  });
  map.forEach((item) => {
    item.order = reordered.length + 1;
    reordered.push(item);
  });
  writeStorage(STORAGE_KEYS.SECTIONS, reordered);
  return reordered;
}

// ==========================================
// 4. REVIEWS CRUD
// ==========================================
export function getReviews(): Review[] {
  initializeDataLayer();
  return readStorage<Review[]>(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS);
}

export function saveReview(review: Review): Review {
  const reviews = getReviews();
  const idx = reviews.findIndex((r) => r.id === review.id);
  if (idx >= 0) {
    reviews[idx] = review;
  } else {
    reviews.unshift(review);
  }
  writeStorage(STORAGE_KEYS.REVIEWS, reviews);
  return review;
}

export function deleteReview(reviewId: string): boolean {
  const reviews = getReviews();
  const filtered = reviews.filter((r) => r.id !== reviewId);
  writeStorage(STORAGE_KEYS.REVIEWS, filtered);
  return true;
}

// ==========================================
// 5. FAQS CRUD
// ==========================================
export function getFAQs(): FAQItem[] {
  initializeDataLayer();
  const faqs = readStorage<FAQItem[]>(STORAGE_KEYS.FAQS, DEFAULT_FAQS);
  return faqs.sort((a, b) => a.order - b.order);
}

export function saveFAQ(faq: FAQItem): FAQItem {
  const faqs = getFAQs();
  const idx = faqs.findIndex((f) => f.id === faq.id);
  if (idx >= 0) {
    faqs[idx] = faq;
  } else {
    if (!faq.order) faq.order = faqs.length + 1;
    faqs.push(faq);
  }
  writeStorage(STORAGE_KEYS.FAQS, faqs);
  return faq;
}

export function deleteFAQ(faqId: string): boolean {
  const faqs = getFAQs();
  const filtered = faqs.filter((f) => f.id !== faqId);
  writeStorage(STORAGE_KEYS.FAQS, filtered);
  return true;
}

// ==========================================
// 6. ORDERS CRUD
// ==========================================
export function getOrders(): Order[] {
  initializeDataLayer();
  const orders = readStorage<Order[]>(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function saveOrder(order: Order): Order {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === order.id);
  if (idx >= 0) {
    orders[idx] = order;
  } else {
    orders.unshift(order);
  }
  writeStorage(STORAGE_KEYS.ORDERS, orders);
  return order;
}

export function updateOrderStatus(orderId: string, status: Order['status']): Order | null {
  const orders = getOrders();
  const target = orders.find((o) => o.id === orderId);
  if (!target) return null;
  target.status = status;
  writeStorage(STORAGE_KEYS.ORDERS, orders);
  return target;
}

export function deleteOrder(orderId: string): boolean {
  const orders = getOrders();
  const filtered = orders.filter((o) => o.id !== orderId);
  writeStorage(STORAGE_KEYS.ORDERS, filtered);
  return true;
}

// ==========================================
// 7. DESIGN & STORE SETTINGS
// ==========================================
export function getDesignSettings(): DesignSettings {
  initializeDataLayer();
  return readStorage<DesignSettings>(STORAGE_KEYS.DESIGN_SETTINGS, DEFAULT_DESIGN_SETTINGS);
}

export function saveDesignSettings(settings: DesignSettings): DesignSettings {
  writeStorage(STORAGE_KEYS.DESIGN_SETTINGS, settings);
  return settings;
}

export function resetDesignSettings(): DesignSettings {
  writeStorage(STORAGE_KEYS.DESIGN_SETTINGS, DEFAULT_DESIGN_SETTINGS);
  return DEFAULT_DESIGN_SETTINGS;
}

export function getStoreSettings(): StoreSettings {
  initializeDataLayer();
  const settings = readStorage<StoreSettings>(STORAGE_KEYS.STORE_SETTINGS, DEFAULT_STORE_SETTINGS);
  let changed = false;
  if (settings.whatsAppNumber === '15550198234' || !settings.whatsAppNumber) {
    settings.whatsAppNumber = '923425364018';
    settings.phone = '+92 342 5364018';
    changed = true;
  }
  if (!settings.paymentMethods || settings.paymentMethods.length === 0) {
    settings.paymentMethods = migrateLegacyPaymentSettings(settings);
    changed = true;
  }
  if (changed) {
    writeStorage(STORAGE_KEYS.STORE_SETTINGS, settings);
  }
  return settings;
}

export function saveStoreSettings(settings: StoreSettings): StoreSettings {
  writeStorage(STORAGE_KEYS.STORE_SETTINGS, settings);
  return settings;
}

// ==========================================
// 8. BACKUP EXPORT & IMPORT
// ==========================================
export interface BackupData {
  version: string;
  exportedAt: string;
  brand: string;
  products: Product[];
  categories: Category[];
  sections: PageSection[];
  reviews: Review[];
  faqs: FAQItem[];
  orders: Order[];
  designSettings: DesignSettings;
  storeSettings: StoreSettings;
  mediaFiles?: any[];
}

export function exportAllData(): BackupData {
  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    brand: 'MIT Invitations',
    products: getProducts(),
    categories: getCategories(),
    sections: getPageSections(),
    reviews: getReviews(),
    faqs: getFAQs(),
    orders: getOrders(),
    designSettings: getDesignSettings(),
    storeSettings: getStoreSettings(),
  };
}

export function importAllData(data: Partial<BackupData>): boolean {
  try {
    if (data.products) writeStorage(STORAGE_KEYS.PRODUCTS, data.products);
    if (data.categories) writeStorage(STORAGE_KEYS.CATEGORIES, data.categories);
    if (data.sections) writeStorage(STORAGE_KEYS.SECTIONS, data.sections);
    if (data.reviews) writeStorage(STORAGE_KEYS.REVIEWS, data.reviews);
    if (data.faqs) writeStorage(STORAGE_KEYS.FAQS, data.faqs);
    if (data.orders) writeStorage(STORAGE_KEYS.ORDERS, data.orders);
    if (data.designSettings) writeStorage(STORAGE_KEYS.DESIGN_SETTINGS, data.designSettings);
    if (data.storeSettings) writeStorage(STORAGE_KEYS.STORE_SETTINGS, data.storeSettings);
    return true;
  } catch (err) {
    console.error('Failed to import backup data:', err);
    return false;
  }
}

export function resetAllDataToDefault(): void {
  writeStorage(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
  writeStorage(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  writeStorage(STORAGE_KEYS.SECTIONS, DEFAULT_SECTIONS);
  writeStorage(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS);
  writeStorage(STORAGE_KEYS.FAQS, DEFAULT_FAQS);
  writeStorage(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
  writeStorage(STORAGE_KEYS.DESIGN_SETTINGS, DEFAULT_DESIGN_SETTINGS);
  writeStorage(STORAGE_KEYS.STORE_SETTINGS, DEFAULT_STORE_SETTINGS);
}

export interface CategoryGroup {
  name: string;
  subcategories: string[];
}

export const CATEGORY_TAXONOMY: {
  groups: CategoryGroup[];
  specialCollections: string[];
} = {
  groups: [
    {
      name: 'DIGITAL PRODUCTS',
      subcategories: [
        'Content Creation',
        'Graphic Design',
        'Business & Marketing',
        'Email Marketing',
        'Software & WordPress',
        'Video & Audio',
        'Courses & Education',
      ],
    },
    {
      name: 'AI RESOURCES',
      subcategories: [
        'ChatGPT Prompts',
        'AI Tools',
        'AI Content',
        'AI Graphics',
      ],
    },
    {
      name: 'TEMPLATES',
      subcategories: [
        'Canva',
        'Photoshop',
        'PowerPoint',
        'Excel',
        'WordPress',
        'Social Media',
      ],
    },
    {
      name: 'PLR / MRR',
      subcategories: [
        'PLR Articles',
        'PLR Ebooks',
        'PLR Templates',
        'Resell Products',
        'Business Resources',
      ],
    },
  ],
  specialCollections: ['MEGA BUNDLES', 'NEW ARRIVALS', 'BEST SELLERS'],
};

// Flattened list of default product categories
export const DEFAULT_CATEGORIES = [
  // DIGITAL PRODUCTS
  'Content Creation',
  'Graphic Design',
  'Business & Marketing',
  'Email Marketing',
  'Software & WordPress',
  'Video & Audio',
  'Courses & Education',
  // AI RESOURCES
  'ChatGPT Prompts',
  'AI Tools',
  'AI Content',
  'AI Graphics',
  // TEMPLATES
  'Canva',
  'Photoshop',
  'PowerPoint',
  'Excel',
  'WordPress',
  'Social Media',
  // PLR / MRR
  'PLR Articles',
  'PLR Ebooks',
  'PLR Templates',
  'Resell Products',
  'Business Resources',
  // SPECIAL
  'MEGA BUNDLES',
] as const;

export type ProductCategory = string;

export type ProductBadge =
  | 'BESTSELLER'
  | 'HOT DEAL'
  | 'LIMITED OFFER'
  | 'MEGA BUNDLE'
  | '70% OFF'
  | 'FLASH SALE'
  | 'NEW RELEASE'
  | 'TRENDING';

export type Currency = 'INR' | 'USD' | 'EUR';

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  description: string;
  features: string[];
  regularPrice: number; // in INR base
  salePrice: number;    // in INR base
  badges: string[];     // e.g. ["BESTSELLER", "70% OFF"]
  deliveryLink: string; // Google Drive, Mega, or Dropbox link
  fileSize: string;     // e.g. "45.2 GB"
  fileFormat: string;   // e.g. "ZIP / PSD / AI / 4K MP4"
  rating: number;       // e.g. 4.9
  reviewCount: number;  // e.g. 348
  salesCount: number;   // e.g. 1820
  mockupTheme: 'obsidian' | 'emerald' | 'amber' | 'cyan' | 'purple' | 'rose';
  imageUrl?: string;    // Custom image URL if provided
  metaKeywords?: string[]; // Custom meta keywords for SEO & discoverability
  isFeatured?: boolean;
  isActive: boolean;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  minSpend?: number;
  isActive: boolean;
  expiryDate?: string;
}

export interface StoreSettings {
  announcementText: string;
  announcementActive: boolean;
  countdownActive: boolean;
  countdownTargetHours: number;
  globalDiscountTag: string;
  supportEmail: string;
  currencyRates: {
    INR: number;
    USD: number;
    EUR: number;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  salePrice: number;
  quantity: number;
  deliveryLink: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  appliedCoupon?: string;
  currency: Currency;
  paymentMethod: 'UPI / GPay' | 'Credit/Debit Card' | 'PayPal';
  status: 'COMPLETED' | 'DELIVERED';
  createdAt: string;
}

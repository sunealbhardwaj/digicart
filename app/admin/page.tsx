'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Product, Coupon, StoreSettings, Order, ProductCategory } from '@/lib/types';
import {
  getStoredProducts,
  saveStoredProducts,
  getStoredCategories,
  saveStoredCategories,
  addStoredCategory,
  deleteStoredCategory,
  getStoredCoupons,
  saveStoredCoupons,
  getStoredSettings,
  saveStoredSettings,
  getStoredOrders,
  formatPrice,
} from '@/lib/store';
import { ALL_CATEGORIES } from '@/components/CategoryFilter';
import { SAMPLE_IMAGE_PRESETS } from '@/lib/initialData';
import {
  Lock,
  LogOut,
  Package,
  Tag,
  Megaphone,
  ShoppingBag,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ExternalLink,
  Search,
  HardDriveDownload,
  AlertCircle,
  Eye,
  Percent,
  Sparkles,
  Layers,
  ImageIcon,
  Filter,
  Database,
  Server,
  CheckCircle2,
  Copy,
  FileCode,
  RefreshCw,
  Upload,
  FolderPlus,
  Folder,
  UploadCloud,
  FileImage,
  ImageUp,
} from 'lucide-react';

const COMMON_BADGES = [
  'BESTSELLER',
  'HOT DEAL',
  'LIMITED OFFER',
  'MEGA BUNDLE',
  '70% OFF',
  '80% OFF',
  '85% OFF',
  'FLASH SALE',
  'HOT SELL',
  'NEW RELEASE',
];

function generateAdminToken(): string {
  return `adm_token_${Date.now()}`;
}

function generateProductId(): string {
  return `prod-${Date.now()}`;
}

function generateCouponId(): string {
  return `coup-${Date.now()}`;
}

export default function AdminDashboardPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(localStorage.getItem('apex_admin_session_v1'));
  });
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'badges' | 'offers' | 'orders' | 'database'>('products');

  // Database Connection Testing State
  const [dbTestResult, setDbTestResult] = useState<any>(null);
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleTestDatabase = async () => {
    setIsTestingDb(true);
    try {
      const res = await fetch('/api/db/test');
      const data = await res.json();
      setDbTestResult(data);
      if (data.connected) {
        showToast('Connected to MySQL successfully!');
      } else {
        showToast('Database test complete - check report');
      }
    } catch (err: any) {
      setDbTestResult({
        connected: false,
        database: 'u328293805_7R01z',
        user: 'u328293805_mn6Ce',
        host: 'localhost',
        error: err.message || 'Network error calling test endpoint',
        advice: 'Check server network access and configuration.',
      });
    } finally {
      setIsTestingDb(false);
    }
  };

  // Stored Data States
  const [products, setProducts] = useState<Product[]>(() => getStoredProducts());
  const [categories, setCategories] = useState<string[]>(() => getStoredCategories());
  const [coupons, setCoupons] = useState<Coupon[]>(() => getStoredCoupons());
  const [settings, setSettings] = useState<StoreSettings | null>(() => getStoredSettings());
  const [orders, setOrders] = useState<Order[]>(() => getStoredOrders());

  // Category Management Draft State
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [isAddingCategoryInline, setIsAddingCategoryInline] = useState<boolean>(false);
  const [inlineCategoryName, setInlineCategoryName] = useState<string>('');

  // Image Upload & Source Mode in Product Modal
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'presets' | 'url'>('upload');
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Search & Filter in Admin
  const [productSearch, setProductSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Product Add / Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [presetCategoryFilter, setPresetCategoryFilter] = useState<string>('ALL');

  // Announcement bar draft state
  const [bannerText, setBannerText] = useState(() => getStoredSettings().announcementText);
  const [bannerActive, setBannerActive] = useState(() => getStoredSettings().announcementActive);
  const [countdownActive, setCountdownActive] = useState(() => getStoredSettings().countdownActive);

  // New Coupon Draft state
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState<number>(25);

  // Notification Toast
  const [adminToast, setAdminToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(null), 3000);
  };

  const loadAllData = () => {
    const p = getStoredProducts();
    const cats = getStoredCategories();
    const c = getStoredCoupons();
    const s = getStoredSettings();
    const o = getStoredOrders();

    setProducts(p);
    setCategories(cats);
    setCoupons(c);
    setSettings(s);
    setOrders(o);

    if (s) {
      setBannerText(s.announcementText);
      setBannerActive(s.announcementActive);
      setCountdownActive(s.countdownActive);
    }
  };

  useEffect(() => {
    const handleUpdate = () => {
      loadAllData();
    };

    window.addEventListener('apex_products_updated', handleUpdate);
    window.addEventListener('apex_categories_updated', handleUpdate);
    window.addEventListener('apex_coupons_updated', handleUpdate);
    window.addEventListener('apex_settings_updated', handleUpdate);
    window.addEventListener('apex_orders_updated', handleUpdate);

    return () => {
      window.removeEventListener('apex_products_updated', handleUpdate);
      window.removeEventListener('apex_categories_updated', handleUpdate);
      window.removeEventListener('apex_coupons_updated', handleUpdate);
      window.removeEventListener('apex_settings_updated', handleUpdate);
      window.removeEventListener('apex_orders_updated', handleUpdate);
    };
  }, []);

  // Category Handlers
  const handleCreateCategory = (nameToCreate: string, selectForProduct = false) => {
    const res = addStoredCategory(nameToCreate);
    if (res.success && res.category) {
      const updated = getStoredCategories();
      setCategories(updated);
      showToast(res.message);
      if (selectForProduct && editingProduct) {
        setEditingProduct({ ...editingProduct, category: res.category });
        setIsAddingCategoryInline(false);
        setInlineCategoryName('');
      } else {
        setNewCategoryName('');
      }
    } else {
      showToast(res.message);
    }
  };

  const handleDeleteCategory = (catName: string) => {
    const assigned = products.filter((p) => p.category === catName);
    if (assigned.length > 0) {
      if (!confirm(`Warning: Category "${catName}" has ${assigned.length} product(s) assigned to it. Are you sure you want to delete this category?`)) {
        return;
      }
    }
    const res = deleteStoredCategory(catName);
    if (res.success) {
      const updated = getStoredCategories();
      setCategories(updated);
      showToast(res.message);
      if (filterCategory === catName) setFilterCategory('ALL');
      if (editingProduct?.category === catName && updated[0]) {
        setEditingProduct({ ...editingProduct, category: updated[0] });
      }
    } else {
      showToast(res.message);
    }
  };

  // Image Upload File Handler (Optimized canvas compression to max 1280px WebP/JPEG)
  const processAndSetImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP, SVG, etc.)');
      return;
    }

    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxDim = 1280;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const optimized = canvas.toDataURL('image/webp', 0.88);
          setEditingProduct((prev) => (prev ? { ...prev, imageUrl: optimized } : null));
          showToast(`Image "${file.name}" uploaded successfully!`);
        } else {
          setEditingProduct((prev) => (prev ? { ...prev, imageUrl: rawDataUrl } : null));
          showToast(`Image "${file.name}" attached!`);
        }
        setIsProcessingImage(false);
      };
      img.onerror = () => {
        setEditingProduct((prev) => (prev ? { ...prev, imageUrl: rawDataUrl } : null));
        setIsProcessingImage(false);
        showToast(`Image "${file.name}" attached!`);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndSetImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAndSetImageFile(file);
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('apex_admin_session_v1', data.token);
        setIsAuthenticated(true);
        loadAllData();
        showToast('Logged in successfully as Admin');
      } else {
        setLoginError(data.error || 'Invalid username or password');
      }
    } catch {
      // Local fallback for client-side auth
      if (username === 'admin' && password === 'admin123') {
        const token = generateAdminToken();
        localStorage.setItem('apex_admin_session_v1', token);
        setIsAuthenticated(true);
        loadAllData();
        showToast('Logged in successfully as Admin');
      } else {
        setLoginError('Invalid username or password');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('apex_admin_session_v1');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    showToast('Logged out of admin session');
  };

  // ----------------------------------------------------
  // PRODUCT CRUD OPERATIONS
  // ----------------------------------------------------
  const handleOpenAddProduct = () => {
    const defaultSample = SAMPLE_IMAGE_PRESETS[0]?.url || '';
    setEditingProduct({
      id: generateProductId(),
      name: '',
      category: 'CONTENT CREATION & MEDIA ASSETS',
      description: '',
      features: ['Commercial License Included', 'Instant Google Drive / Mega Access'],
      regularPrice: 1999,
      salePrice: 149,
      badges: ['HOT DEAL'],
      deliveryLink: 'https://drive.google.com/drive/folders/sample-instant-access',
      fileSize: '12.5 GB',
      fileFormat: 'ZIP / PSD / 4K MP4',
      rating: 4.9,
      reviewCount: 120,
      salesCount: 450,
      mockupTheme: 'amber',
      imageUrl: defaultSample,
      isActive: true,
    });
    setPresetCategoryFilter('CONTENT CREATION & MEDIA ASSETS');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct({ ...prod });
    setPresetCategoryFilter(prod.category || 'ALL');
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;

    const currentList = getStoredProducts();
    const existingIndex = currentList.findIndex((p) => p.id === editingProduct.id);

    const updatedProduct: Product = {
      id: editingProduct.id || generateProductId(),
      name: editingProduct.name,
      slug:
        editingProduct.slug ||
        editingProduct.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      category: editingProduct.category || 'CONTENT CREATION & MEDIA ASSETS',
      description: editingProduct.description || '',
      features:
        Array.isArray(editingProduct.features) && editingProduct.features.length > 0
          ? editingProduct.features
          : ['Full Commercial Rights', 'Instant Cloud Download'],
      regularPrice: Number(editingProduct.regularPrice) || 1999,
      salePrice: Number(editingProduct.salePrice) || 149,
      badges: editingProduct.badges || ['HOT DEAL'],
      deliveryLink:
        editingProduct.deliveryLink ||
        'https://drive.google.com/drive/folders/instant-access',
      fileSize: editingProduct.fileSize || '10.0 GB',
      fileFormat: editingProduct.fileFormat || 'ZIP / PSD',
      rating: Number(editingProduct.rating) || 4.9,
      reviewCount: Number(editingProduct.reviewCount) || 100,
      salesCount: Number(editingProduct.salesCount) || 250,
      mockupTheme: editingProduct.mockupTheme || 'amber',
      imageUrl: editingProduct.imageUrl || '',
      isFeatured: editingProduct.isFeatured ?? false,
      isActive: editingProduct.isActive ?? true,
      updatedAt: new Date().toISOString(),
    };

    let nextList: Product[];
    if (existingIndex >= 0) {
      nextList = [...currentList];
      nextList[existingIndex] = updatedProduct;
      showToast(`Updated product: ${updatedProduct.name}`);
    } else {
      nextList = [updatedProduct, ...currentList];
      showToast(`Added new product: ${updatedProduct.name}`);
    }

    saveStoredProducts(nextList);
    setProducts(nextList);
    setIsProductModalOpen(false);
    setEditingProduct(null);

    // Sync with server API
    fetch('/api/products', {
      method: existingIndex >= 0 ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProduct),
    }).catch(console.error);
  };

  const handleDeleteProduct = (productId: string) => {
    if (!confirm('Are you sure you want to permanently delete this digital product bundle?')) return;

    const currentList = getStoredProducts();
    const nextList = currentList.filter((p) => p.id !== productId);
    saveStoredProducts(nextList);
    setProducts(nextList);
    showToast('Product successfully deleted');

    fetch(`/api/products?id=${productId}`, {
      method: 'DELETE',
    }).catch(console.error);
  };

  const handleToggleProductStatus = (productId: string) => {
    const currentList = getStoredProducts();
    const nextList = currentList.map((p) => {
      if (p.id === productId) {
        return { ...p, isActive: !p.isActive };
      }
      return p;
    });
    saveStoredProducts(nextList);
    setProducts(nextList);
    showToast('Product status updated');
  };

  // Toggle badge on editing product
  const handleToggleBadgeOnEditing = (badge: string) => {
    if (!editingProduct) return;
    const currentBadges = editingProduct.badges || [];
    const exists = currentBadges.includes(badge);
    const updated = exists ? currentBadges.filter((b) => b !== badge) : [...currentBadges, badge];
    setEditingProduct({ ...editingProduct, badges: updated });
  };

  // ----------------------------------------------------
  // ANNOUNCEMENT BAR & OFFERS
  // ----------------------------------------------------
  const handleSaveBanner = () => {
    const current = getStoredSettings();
    const updated: StoreSettings = {
      ...current,
      announcementText: bannerText,
      announcementActive: bannerActive,
      countdownActive: countdownActive,
    };
    saveStoredSettings(updated);
    setSettings(updated);
    showToast('Top announcement settings saved!');

    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(console.error);
  };

  // ----------------------------------------------------
  // COUPONS CRUD
  // ----------------------------------------------------
  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;

    const code = newCouponCode.trim().toUpperCase();
    const current = getStoredCoupons();
    if (current.some((c) => c.code === code)) {
      alert('A coupon with this code already exists!');
      return;
    }

    const newCoupon: Coupon = {
      id: generateCouponId(),
      code,
      discountPercentage: Number(newCouponDiscount) || 20,
      minSpend: 0,
      isActive: true,
    };

    const next = [newCoupon, ...current];
    saveStoredCoupons(next);
    setCoupons(next);
    setNewCouponCode('');
    showToast(`Created coupon code: ${code} (${newCoupon.discountPercentage}% OFF)`);
  };

  const handleToggleCoupon = (couponId: string) => {
    const current = getStoredCoupons();
    const next = current.map((c) => (c.id === couponId ? { ...c, isActive: !c.isActive } : c));
    saveStoredCoupons(next);
    setCoupons(next);
    showToast('Coupon status updated');
  };

  const handleDeleteCoupon = (couponId: string) => {
    const current = getStoredCoupons();
    const next = current.filter((c) => c.id !== couponId);
    saveStoredCoupons(next);
    setCoupons(next);
    showToast('Coupon removed');
  };

  // ----------------------------------------------------
  // FILTERED PRODUCTS
  // ----------------------------------------------------
  const displayedProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = filterCategory === 'ALL' || p.category === filterCategory;
      const matchSearch =
        !productSearch ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(productSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, filterCategory, productSearch]);

  const filteredSamplePresets = useMemo(() => {
    if (presetCategoryFilter === 'ALL') return SAMPLE_IMAGE_PRESETS;
    return SAMPLE_IMAGE_PRESETS.filter((s) => s.category === presetCategoryFilter);
  }, [presetCategoryFilter]);

  // Analytics Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const activeDealsCount = products.filter(
    (p) => p.regularPrice > p.salePrice || (p.badges && p.badges.length > 0)
  ).length;

  // ----------------------------------------------------
  // LOGIN SCREEN (White and Blue Theme)
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl relative overflow-hidden">
          {/* Subtle top ambient blue glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Admin Portal Access</h1>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Restricted management console. Enter credentials to continue.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 transition-all"
              />
            </div>

            {loginError && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              Sign In to Management Console
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500 font-mono">
              Default credentials configured: <span className="text-blue-700 font-bold">admin</span> /{' '}
              <span className="text-blue-700 font-bold">admin123</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // AUTHENTICATED ADMIN DASHBOARD (White and Blue Theme)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Admin Top Bar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black shadow-xs">
              <Sparkles className="w-4 h-4 fill-white" />
            </span>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                ApexDigital Admin
                <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-mono font-bold">
                  FULL CRUD
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-mono font-bold text-slate-700 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Preview Storefront</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-mono font-bold text-red-600 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Metric Cards Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-mono mb-1">
              <span>TOTAL PRODUCTS</span>
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
              {products.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {products.filter((p) => p.isActive).length} active on store
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-mono mb-1">
              <span>ACTIVE DEALS</span>
              <Tag className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-black text-blue-600 font-mono tabular-nums">
              {activeDealsCount}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Tagged with discounts</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-mono mb-1">
              <span>CUSTOMER ORDERS</span>
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600 font-mono tabular-nums">
              {orders.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">100% delivered to cloud</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-mono mb-1">
              <span>ESTIMATED REVENUE</span>
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
              {formatPrice(totalRevenue, 'INR')}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Live store sales</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                : 'bg-white text-slate-600 hover:text-blue-600 border border-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products Management ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                : 'bg-white text-slate-600 hover:text-blue-600 border border-slate-200'
            }`}
          >
            <FolderPlus className="w-4 h-4 text-blue-500" />
            <span>Categories & Taxonomy ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('badges')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
              activeTab === 'badges'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                : 'bg-white text-slate-600 hover:text-blue-600 border border-slate-200'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Badges & Sell Labels</span>
          </button>

          <button
            onClick={() => setActiveTab('offers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
              activeTab === 'offers'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                : 'bg-white text-slate-600 hover:text-blue-600 border border-slate-200'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Announcements & Coupons</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                : 'bg-white text-slate-600 hover:text-blue-600 border border-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Customer Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
              activeTab === 'database'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                : 'bg-white text-slate-600 hover:text-blue-600 border border-slate-200'
            }`}
          >
            <Database className="w-4 h-4 text-blue-500" />
            <span>MySQL Database & 403 Fix</span>
          </button>
        </div>

        {/* TAB 1: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by product name..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleOpenAddProduct}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product Vault</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 font-mono text-slate-600">
                      <th className="p-3">Product / Mockup</th>
                      <th className="p-3">Pricing (INR)</th>
                      <th className="p-3">Badges</th>
                      <th className="p-3">Delivery Link</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-10 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-2xs">
                              {p.imageUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-mono font-bold text-blue-600 bg-blue-50">
                                  SAMPLE
                                </div>
                              )}
                            </div>
                            <div className="truncate max-w-xs">
                              <p className="font-bold text-slate-900 truncate">{p.name}</p>
                              <span className="text-[10px] font-mono text-blue-600 uppercase font-semibold">
                                {p.category}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-mono">
                          <span className="text-slate-400 line-through mr-1.5 tabular-nums">
                            ₹{p.regularPrice}
                          </span>
                          <span className="font-bold text-blue-600 tabular-nums">
                            ₹{p.salePrice}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {p.badges.map((b, i) => (
                              <span
                                key={i}
                                className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200"
                              >
                                {b}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 font-mono">
                          <a
                            href={p.deliveryLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 truncate max-w-[180px]"
                          >
                            <HardDriveDownload className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{p.deliveryLink}</span>
                          </a>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleProductStatus(p.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer ${
                              p.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {p.isActive ? 'ACTIVE' : 'DRAFT'}
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORIES & TAXONOMY MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            {/* Header & Add Category Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
                    <FolderPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      Storefront Categories & Taxonomy
                      <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full font-mono font-bold">
                        {categories.length} Active Categories
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Create custom product categories. Any category added here immediately appears on your public storefront and in the product editor.
                    </p>
                  </div>
                </div>
              </div>

              {/* Add Category Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newCategoryName.trim()) {
                    handleCreateCategory(newCategoryName);
                  }
                }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200"
              >
                <div className="relative flex-1">
                  <Folder className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                  <input
                    type="text"
                    required
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter new category name (e.g. AI PROMPT PACKS & AUTOMATION)..."
                    className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 font-mono uppercase placeholder-slate-400 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Category</span>
                </button>
              </form>
            </div>

            {/* Existing Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat, idx) => {
                const count = products.filter((p) => p.category === cat).length;
                return (
                  <div
                    key={cat}
                    className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {count} {count === 1 ? 'Product' : 'Products'}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 font-mono leading-snug">
                        {cat}
                      </h3>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setFilterCategory(cat);
                          setActiveTab('products');
                        }}
                        className="text-[11px] font-mono font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Filter Products</span>
                      </button>

                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        title="Delete Category"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: BADGES & LABELS */}
        {activeTab === 'badges' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                Dynamic Sell Badges & Tags Configuration
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                Click any product to quickly toggle promotional tags like 70% OFF, MEGA BUNDLE, or HOT DEAL.
              </p>
            </div>

            <div className="space-y-4">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="max-w-md">
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">{p.name}</p>
                    <span className="text-[10px] font-mono text-blue-600 uppercase font-semibold">
                      {p.category} · ₹{p.salePrice}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_BADGES.map((badge) => {
                      const isAssigned = p.badges.includes(badge);
                      return (
                        <button
                          key={badge}
                          onClick={() => {
                            const updatedBadges = isAssigned
                              ? p.badges.filter((b) => b !== badge)
                              : [...p.badges, badge];
                            const updated = products.map((item) =>
                              item.id === p.id ? { ...item, badges: updatedBadges } : item
                            );
                            saveStoredProducts(updated);
                            setProducts(updated);
                            showToast(`Updated badges for: ${p.name}`);
                          }}
                          className={`text-[10px] font-mono px-2 py-1 rounded transition-all cursor-pointer font-bold ${
                            isAssigned
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-400'
                          }`}
                        >
                          {badge}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: OFFERS & ANNOUNCEMENTS */}
        {activeTab === 'offers' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Announcement Bar Manager */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-blue-600" />
                  Top Announcement Bar
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  Display a dynamic headline bar across the top of the storefront.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                  Announcement Text
                </label>
                <textarea
                  rows={3}
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  placeholder="e.g. ⚡ Flash Sale: Flat ₹149 Today Only! Use code CREATOR70"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-6 text-xs font-mono text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={bannerActive}
                    onChange={(e) => setBannerActive(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span>Show Announcement Bar</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={countdownActive}
                    onChange={(e) => setCountdownActive(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span>Show Countdown Timer</span>
                </label>
              </div>

              <button
                onClick={handleSaveBanner}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Save Announcement Settings
              </button>
            </div>

            {/* Coupons Management */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-blue-600" />
                  Coupon Codes & Discounts
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  Create and toggle active promo codes for buyers.
                </p>
              </div>

              {/* Add Coupon Form */}
              <form onSubmit={handleAddCoupon} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="CODE (e.g. SUMMER50)"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 uppercase font-mono placeholder:normal-case focus:outline-none focus:border-blue-600 focus:bg-white"
                />
                <input
                  type="number"
                  required
                  min={5}
                  max={95}
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                  placeholder="% OFF"
                  className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
                >
                  Add Code
                </button>
              </form>

              {/* Existing Coupons list */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {coupons.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900">{c.code}</span>
                      <span className="text-blue-600 font-mono font-bold ml-2">
                        {c.discountPercentage}% Discount
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleCoupon(c.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer ${
                          c.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {c.isActive ? 'ACTIVE' : 'OFF'}
                      </button>

                      <button
                        onClick={() => handleDeleteCoupon(c.id)}
                        className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RECENT ORDERS */}
        {activeTab === 'orders' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                Customer Purchase & Fulfillment Log
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                Real-time tracking of all buyers, transaction amounts, and delivery links sent.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 font-mono text-slate-600">
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Customer & Email</th>
                    <th className="p-3">Purchased Vaults</th>
                    <th className="p-3">Total Paid</th>
                    <th className="p-3">Payment Mode</th>
                    <th className="p-3">Cloud Link Dispatched</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-blue-600">{o.id}</td>
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{o.customerName}</p>
                        <span className="text-[11px] font-mono text-slate-500">
                          {o.customerEmail}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="space-y-0.5">
                          {o.items.map((it, i) => (
                            <p key={i} className="text-slate-700 truncate max-w-xs text-[11px]">
                              {it.quantity}x {it.name}
                            </p>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {formatPrice(o.total, o.currency || 'INR')}
                      </td>
                      <td className="p-3 font-mono text-slate-600 text-[11px]">
                        {o.paymentMethod}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-mono text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 font-semibold">
                          <Check className="w-3 h-3" /> Sent to Buyer
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: MYSQL DATABASE CONFIGURATION & 403 FORBIDDEN FIX */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            {/* Database Status Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      MySQL Database Status & Configuration
                      <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-mono font-bold">
                        Hostinger / cPanel
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Target Database: <span className="text-blue-700 font-bold">u328293805_7R01z</span> · User: <span className="text-blue-700 font-bold">u328293805_mn6Ce</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleTestDatabase}
                  disabled={isTestingDb}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingDb ? 'animate-spin' : ''}`} />
                  <span>{isTestingDb ? 'Testing Connection...' : 'Test MySQL Connection'}</span>
                </button>
              </div>

              {/* Active Credentials Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
                    MySQL Database
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                    u328293805_7R01z
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
                    MySQL Username
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                    u328293805_mn6Ce
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
                    Default Port & Engine
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                    Port 3306 · InnoDB (utf8mb4)
                  </p>
                </div>
              </div>

              {/* Live Test Diagnostic Output */}
              {dbTestResult && (
                <div
                  className={`mt-4 p-4 rounded-xl border ${
                    dbTestResult.connected
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {dbTestResult.connected ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 text-xs space-y-1">
                      <div className="font-bold flex items-center justify-between">
                        <span>
                          {dbTestResult.connected
                            ? '✅ MySQL Connected Successfully!'
                            : '⚠️ Connection Notice / Fallback Active'}
                        </span>
                        <span className="font-mono text-[11px] opacity-80">
                          Host: {dbTestResult.host} · DB: {dbTestResult.database}
                        </span>
                      </div>
                      {dbTestResult.error && (
                        <p className="font-mono text-[11px] bg-white/70 p-2 rounded border border-amber-200">
                          Error Detail: {dbTestResult.error}
                        </p>
                      )}
                      {dbTestResult.advice && (
                        <p className="font-semibold text-[11px] mt-1 text-amber-900">
                          👉 Next Step: {dbTestResult.advice}
                        </p>
                      )}
                      <p className="text-[10px] opacity-80 mt-1 font-mono">
                        Note: The web app uses a fault-tolerant hybrid architecture. When MySQL is unreachable or password is empty, all products, orders, and cart features continue operating seamlessly using local & in-memory caches without 403 or 500 errors!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 403 Forbidden Comprehensive Fix Guide */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  How to Fix &ldquo;403 Forbidden: Access to this resource on the server is denied!&rdquo;
                </h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                This error is the default security screen displayed by <strong>Hostinger / LiteSpeed / Apache</strong>. Here is the exact checklist to permanently resolve it for your database and website:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* Step 1 */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs mb-3 shadow-xs">
                      1
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mb-1.5">
                      Enable Hostinger &ldquo;Remote MySQL&rdquo;
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      By default, Hostinger blocks outside connections to database <strong>u328293805_7R01z</strong>.
                    </p>
                    <div className="mt-2 text-[10px] font-mono bg-white p-2 rounded border border-slate-200 space-y-1 text-slate-700">
                      <p>1. Open Hostinger hPanel.</p>
                      <p>2. Go to <strong>Databases</strong> &rarr; <strong>Remote MySQL</strong>.</p>
                      <p>3. Select DB: <strong>u328293805_7R01z</strong>.</p>
                      <p>4. In IP field, enter <code className="bg-blue-50 text-blue-700 px-1 font-bold">%</code> (allows remote connections).</p>
                      <p>5. Click <strong>Create</strong>.</p>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs mb-3 shadow-xs">
                      2
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mb-1.5">
                      Fix Missing Index or Permissions
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      If you see 403 when opening your website domain, LiteSpeed blocks directory browsing when no index file is present.
                    </p>
                    <div className="mt-2 text-[10px] font-mono bg-white p-2 rounded border border-slate-200 space-y-1 text-slate-700">
                      <p>1. In Hostinger File Manager, check <code className="text-blue-700">public_html/</code>.</p>
                      <p>2. Ensure an <code className="text-blue-700">index.html</code> or <code className="text-blue-700">index.php</code> is present.</p>
                      <p>3. Set permissions: Folders = <code className="text-emerald-700 font-bold">755</code>, Files = <code className="text-emerald-700 font-bold">644</code>.</p>
                      <p>4. Use the provided <code className="text-blue-700">.htaccess</code> file to allow DirectoryIndex.</p>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs mb-3 shadow-xs">
                      3
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mb-1.5">
                      Set Password & Remote Host
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      In Hostinger, user <strong>u328293805_mn6Ce</strong> has its own secure password.
                    </p>
                    <div className="mt-2 text-[10px] font-mono bg-white p-2 rounded border border-slate-200 space-y-1 text-slate-700">
                      <p>1. In hPanel, go to <strong>MySQL Databases</strong>.</p>
                      <p>2. For user <code className="text-blue-700">u328293805_mn6Ce</code>, click <strong>Change Password</strong> if needed.</p>
                      <p>3. Set in your environment:</p>
                      <p className="bg-slate-100 p-1 rounded font-bold text-blue-700">MYSQL_PASSWORD=&quot;your_pass&quot;</p>
                      <p>4. Use Hostinger&apos;s Remote Host IP instead of localhost.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SQL Schema Viewer & 1-Click phpMyAdmin Import */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Database Tables Schema (<code className="font-mono text-blue-600">schema.sql</code>)
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Ready to import directly into Hostinger phpMyAdmin for 1-click table creation.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const sql = `-- ApexDigital Schema for Hostinger: u328293805_7R01z
CREATE TABLE IF NOT EXISTS \`products\` (
  \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
  \`name\` VARCHAR(255) NOT NULL,
  \`slug\` VARCHAR(255) DEFAULT NULL,
  \`category\` VARCHAR(120) NOT NULL,
  \`description\` TEXT DEFAULT NULL,
  \`features\` TEXT DEFAULT NULL,
  \`regular_price\` DECIMAL(10, 2) NOT NULL DEFAULT 1999.00,
  \`sale_price\` DECIMAL(10, 2) NOT NULL DEFAULT 149.00,
  \`badges\` TEXT DEFAULT NULL,
  \`delivery_link\` VARCHAR(500) NOT NULL DEFAULT '',
  \`file_size\` VARCHAR(50) DEFAULT '10.0 GB',
  \`file_format\` VARCHAR(100) DEFAULT 'ZIP / PSD',
  \`rating\` DECIMAL(3, 1) DEFAULT 4.9,
  \`review_count\` INT DEFAULT 120,
  \`sales_count\` INT DEFAULT 500,
  \`mockup_theme\` VARCHAR(50) DEFAULT 'amber',
  \`image_url\` TEXT DEFAULT NULL,
  \`is_featured\` TINYINT(1) DEFAULT 0,
  \`is_active\` TINYINT(1) DEFAULT 1,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`orders\` (
  \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
  \`customer_name\` VARCHAR(255) NOT NULL,
  \`customer_email\` VARCHAR(255) NOT NULL,
  \`items\` TEXT NOT NULL,
  \`subtotal\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  \`discount_amount\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  \`total\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  \`applied_coupon\` VARCHAR(64) DEFAULT NULL,
  \`currency\` VARCHAR(10) DEFAULT 'INR',
  \`payment_method\` VARCHAR(100) DEFAULT 'UPI / GPay',
  \`status\` VARCHAR(50) DEFAULT 'DELIVERED',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`coupons\` (
  \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
  \`code\` VARCHAR(64) NOT NULL UNIQUE,
  \`discount_percentage\` INT NOT NULL DEFAULT 20,
  \`min_spend\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  \`is_active\` TINYINT(1) DEFAULT 1,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`store_settings\` (
  \`id\` INT NOT NULL PRIMARY KEY DEFAULT 1,
  \`announcement_text\` VARCHAR(500) NOT NULL DEFAULT '⚡ Flash Sale: Flat ₹149 All Mega Bundles Today Only!',
  \`announcement_active\` TINYINT(1) DEFAULT 1,
  \`countdown_active\` TINYINT(1) DEFAULT 1,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;
                      navigator.clipboard.writeText(sql);
                      setCopiedSql(true);
                      showToast('Copied schema.sql to clipboard!');
                      setTimeout(() => setCopiedSql(false), 2500);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-200"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}</span>
                  </button>

                  <a
                    href="/schema.sql"
                    download="schema.sql"
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <HardDriveDownload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Download .sql</span>
                  </a>
                </div>
              </div>

              {/* Instructions to import in Hostinger phpMyAdmin */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-700 space-y-1.5">
                <p className="font-bold text-blue-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Quick phpMyAdmin Import Steps:
                </p>
                <ol className="list-decimal list-inside space-y-1 font-mono text-[11px] text-slate-600 pl-1">
                  <li>In Hostinger hPanel, go to <strong>Databases</strong> &rarr; Click <strong>Enter phpMyAdmin</strong> next to <code className="text-blue-700">u328293805_7R01z</code>.</li>
                  <li>Click on the <strong>SQL</strong> tab at the top.</li>
                  <li>Paste the copied SQL Script and click <strong>Go</strong>.</li>
                  <li>All 4 tables (<code className="text-slate-800">products</code>, <code className="text-slate-800">orders</code>, <code className="text-slate-800">coupons</code>, <code className="text-slate-800">store_settings</code>) will be created instantly!</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PRODUCT CREATE / EDIT MODAL (White and Blue Theme with Rich Sample Image Gallery) */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                {editingProduct.id?.startsWith('prod-') && editingProduct.name
                  ? 'Edit Digital Product Vault'
                  : 'Add New Digital Product Vault'}
              </h2>

              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="e.g. Mega Creator Asset Vault (5,000+ Files)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-mono font-bold text-slate-700">
                      Product Category
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddingCategoryInline(!isAddingCategoryInline)}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-mono font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{isAddingCategoryInline ? 'Close' : '+ Add New Category'}</span>
                    </button>
                  </div>

                  {isAddingCategoryInline && (
                    <div className="mb-2 p-2 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-2">
                      <input
                        type="text"
                        value={inlineCategoryName}
                        onChange={(e) => setInlineCategoryName(e.target.value)}
                        placeholder="Type new category..."
                        className="flex-1 bg-white border border-blue-300 rounded px-2.5 py-1 text-xs text-slate-900 font-mono uppercase focus:outline-none focus:border-blue-600"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (inlineCategoryName.trim()) {
                            handleCreateCategory(inlineCategoryName, true);
                          }
                        }}
                        className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold text-xs shadow-xs cursor-pointer shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  )}

                  <select
                    value={editingProduct.category || categories[0] || 'CONTENT CREATION & MEDIA ASSETS'}
                    onChange={(e) => {
                      const newCat = e.target.value as ProductCategory;
                      setEditingProduct({
                        ...editingProduct,
                        category: newCat,
                      });
                      setPresetCategoryFilter(newCat);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                    Mockup Theme Color
                  </label>
                  <select
                    value={editingProduct.mockupTheme || 'amber'}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        mockupTheme: e.target.value as any,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="amber">Sapphire Blue / Amber</option>
                    <option value="cyan">Cyan Tech</option>
                    <option value="purple">Royal Purple</option>
                    <option value="emerald">Emerald Studio</option>
                    <option value="rose">Rose Cinema</option>
                    <option value="obsidian">Obsidian Titanium</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                    Regular Price (₹ INR)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.regularPrice || 1999}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        regularPrice: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                    Discounted Sale Price (₹ INR)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.salePrice || 149}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        salePrice: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-blue-600 font-bold font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                  Direct Delivery Cloud Link (Google Drive / Mega / Dropbox)
                </label>
                <input
                  type="url"
                  required
                  value={editingProduct.deliveryLink || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, deliveryLink: e.target.value })
                  }
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-blue-700 font-mono placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 mb-1">Download Size</label>
                  <input
                    type="text"
                    value={editingProduct.fileSize || '25.0 GB'}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, fileSize: e.target.value })
                    }
                    placeholder="e.g. 45.2 GB"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 mb-1">File Formats</label>
                  <input
                    type="text"
                    value={editingProduct.fileFormat || 'ZIP / PSD / 4K MP4'}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, fileFormat: e.target.value })
                    }
                    placeholder="e.g. Canva / Figma / PSD"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* PRODUCT IMAGE (UPLOAD FROM DEVICE / PRESETS GALLERY / CUSTOM URL) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    Product Mockup Image
                  </label>
                  {editingProduct.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setEditingProduct({ ...editingProduct, imageUrl: '' })}
                      className="text-[11px] text-red-600 hover:underline font-mono font-semibold cursor-pointer"
                    >
                      Clear Image
                    </button>
                  )}
                </div>

                {/* 3 Source Modes Tab Switcher */}
                <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setImageInputMode('upload')}
                    className={`flex-1 py-1.5 px-2 rounded-md text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      imageInputMode === 'upload'
                        ? 'bg-white text-blue-700 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload from Device</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageInputMode('presets')}
                    className={`flex-1 py-1.5 px-2 rounded-md text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      imageInputMode === 'presets'
                        ? 'bg-white text-blue-700 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Preset Mockups ({SAMPLE_IMAGE_PRESETS.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageInputMode('url')}
                    className={`flex-1 py-1.5 px-2 rounded-md text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      imageInputMode === 'url'
                        ? 'bg-white text-blue-700 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Direct URL</span>
                  </button>
                </div>

                {/* MODE 1: UPLOAD FROM DEVICE */}
                {imageInputMode === 'upload' && (
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />

                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDropFile}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                        dragActive
                          ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20'
                          : 'border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/30'
                      }`}
                    >
                      {isProcessingImage ? (
                        <div className="flex flex-col items-center gap-2 py-2">
                          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                          <span className="text-xs font-mono font-bold text-blue-700">
                            Optimizing and uploading image...
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-slate-800">
                              Click to choose image or drag &amp; drop file here
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono">
                              PNG, JPG, WEBP, SVG, GIF (auto-resized for instant loading)
                            </p>
                          </div>
                          <button
                            type="button"
                            className="mt-1 px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-mono font-bold shadow-xs transition-colors"
                          >
                            Browse from Computer / Phone
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* MODE 2: PRESET SAMPLES GALLERY */}
                {imageInputMode === 'presets' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-slate-600 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        Click any mockup to attach:
                      </span>
                      <select
                        value={presetCategoryFilter}
                        onChange={(e) => setPresetCategoryFilter(e.target.value)}
                        className="text-[10px] bg-white border border-slate-200 rounded px-2 py-1 text-slate-700 font-mono font-semibold"
                      >
                        <option value="ALL">All Categories ({SAMPLE_IMAGE_PRESETS.length})</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                      {filteredSamplePresets.map((sample, sIdx) => {
                        const isSelected = editingProduct.imageUrl === sample.url;
                        return (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() =>
                              setEditingProduct({ ...editingProduct, imageUrl: sample.url })
                            }
                            className={`group/samp relative aspect-video rounded-lg overflow-hidden border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-blue-600 ring-2 ring-blue-500/40 shadow-xs'
                                : 'border-slate-200 hover:border-blue-400 bg-white'
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={sample.url}
                              alt={sample.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform group-hover/samp:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent p-1.5 flex flex-col justify-end">
                              <span className="text-[9px] font-bold text-white leading-tight line-clamp-1">
                                {sample.title}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5 shadow-xs">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* MODE 3: DIRECT URL */}
                {imageInputMode === 'url' && (
                  <div className="space-y-1">
                    <input
                      type="url"
                      value={editingProduct.imageUrl || ''}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, imageUrl: e.target.value })
                      }
                      placeholder="https://images.unsplash.com/... or direct image link"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-blue-600"
                    />
                    <p className="text-[10px] text-slate-500 font-mono">
                      Paste direct URL from Google Drive, Unsplash, Imgur, or CDN.
                    </p>
                  </div>
                )}

                {/* Attached Image Live Preview */}
                {editingProduct.imageUrl && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50/80 border border-blue-200">
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-white shrink-0 border border-blue-300 shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editingProduct.imageUrl}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-[11px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="text-blue-800 font-bold truncate">Image Attached to Product</span>
                      </div>
                      <p className="truncate text-slate-600 text-[10px] mt-0.5">
                        {editingProduct.imageUrl.startsWith('data:')
                          ? 'Uploaded File (Optimized Base64 Data)'
                          : editingProduct.imageUrl}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 text-[10px] font-mono font-bold rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer shrink-0"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  placeholder="Detailed bundle overview..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                  Features / What&apos;s Included (One per line)
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.features?.join('\n') || ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      features: e.target.value.split('\n').filter(Boolean),
                    })
                  }
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              {/* Badges Selector */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5">
                  Promotional Badges
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_BADGES.map((b) => {
                    const isSelected = editingProduct.badges?.includes(b);
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => handleToggleBadgeOnEditing(b)}
                        className={`text-[10px] font-mono px-2 py-1 rounded transition-all cursor-pointer font-bold ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:border-blue-400'
                        }`}
                      >
                        {b}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-extrabold text-white transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Save Product Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Admin Toast */}
      {adminToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white border border-slate-700 text-xs font-mono font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{adminToast}</span>
        </div>
      )}
    </div>
  );
}

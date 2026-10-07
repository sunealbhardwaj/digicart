'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Product, Coupon, StoreSettings, Order, ProductCategory } from '@/lib/types';
import {
  getStoredProducts,
  saveStoredProducts,
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
  const [activeTab, setActiveTab] = useState<'products' | 'badges' | 'offers' | 'orders'>('products');

  // Stored Data States
  const [products, setProducts] = useState<Product[]>(() => getStoredProducts());
  const [coupons, setCoupons] = useState<Coupon[]>(() => getStoredCoupons());
  const [settings, setSettings] = useState<StoreSettings | null>(() => getStoredSettings());
  const [orders, setOrders] = useState<Order[]>(() => getStoredOrders());

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
    const c = getStoredCoupons();
    const s = getStoredSettings();
    const o = getStoredOrders();

    setProducts(p);
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
    window.addEventListener('apex_coupons_updated', handleUpdate);
    window.addEventListener('apex_settings_updated', handleUpdate);
    window.addEventListener('apex_orders_updated', handleUpdate);

    return () => {
      window.removeEventListener('apex_products_updated', handleUpdate);
      window.removeEventListener('apex_coupons_updated', handleUpdate);
      window.removeEventListener('apex_settings_updated', handleUpdate);
      window.removeEventListener('apex_orders_updated', handleUpdate);
    };
  }, []);

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
        const token = `adm_token_${Date.now()}`;
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
      id: `prod-${Date.now()}`,
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
      id: editingProduct.id || `prod-${Date.now()}`,
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
      id: `coup-${Date.now()}`,
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
                  {ALL_CATEGORIES.map((c) => (
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

        {/* TAB 2: BADGES & LABELS */}
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
                  <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                    Category (7 Core Categories)
                  </label>
                  <select
                    value={editingProduct.category || 'CONTENT CREATION & MEDIA ASSETS'}
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
                    {ALL_CATEGORIES.map((c) => (
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

              {/* PRODUCT IMAGE SAMPLE GALLERY & CUSTOM URL */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    Product Mockup Image Sample
                  </label>
                  {editingProduct.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setEditingProduct({ ...editingProduct, imageUrl: '' })}
                      className="text-[11px] text-red-600 hover:underline font-mono font-semibold"
                    >
                      Clear Image
                    </button>
                  )}
                </div>

                <input
                  type="url"
                  value={editingProduct.imageUrl || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, imageUrl: e.target.value })
                  }
                  placeholder="Paste custom image URL or select from sample presets below..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />

                {/* Sample Presets Category Filter */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-mono font-bold text-slate-600 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Click Any Sample Image to Apply:
                  </span>
                  <select
                    value={presetCategoryFilter}
                    onChange={(e) => setPresetCategoryFilter(e.target.value)}
                    className="text-[10px] bg-white border border-slate-200 rounded px-2 py-1 text-slate-700 font-mono font-semibold"
                  >
                    <option value="ALL">All Categories ({SAMPLE_IMAGE_PRESETS.length})</option>
                    {ALL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Presets Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
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

                {/* Live Preview of Selected Image */}
                {editingProduct.imageUrl && (
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-blue-50/80 border border-blue-200">
                    <div className="w-16 h-12 rounded overflow-hidden bg-slate-100 shrink-0 border border-blue-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editingProduct.imageUrl}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-[11px] font-mono truncate">
                      <span className="text-blue-700 font-bold">Image Sample Attached:</span>
                      <p className="truncate text-slate-600">{editingProduct.imageUrl}</p>
                    </div>
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

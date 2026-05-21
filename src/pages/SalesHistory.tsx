import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { TravelerProfile, Product, Order } from '../types/api';

// ==========================================
// CUSTOM SLEEK SVG ICONS (INLINE COMPONENT)
// ==========================================
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
    </svg>
  ),
  Package: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  ShoppingCart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  History: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Star: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.25.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.175 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.883c-.773-.56-.374-1.81.588-1.81h4.906a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  Chat: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  User: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Wallet: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  ),
  CompletedCart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.116 60.116 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.2 0 .75.75 0 011.2 0zm12.75 0a.75.75 0 11-1.2 0 .75.75 0 011.2 0z" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Close: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  TotalRevenue: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

export default function SalesHistory() {
  const { user } = useAuth();

  // State Management
  const [profile, setProfile] = useState<TravelerProfile | null>(null);
  const [catalogueProducts, setCatalogueProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Mobile sidebar view state
  const [showMobileSidebar, setShowMobileSidebar] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch all related information
  const fetchSalesData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);

      const [profileRes, productsRes, ordersRes] = await Promise.all([
        api.get(`/api/travelers/${user.id}`),
        api.get('/api/products'),
        api.get('/api/orders')
      ]);

      setProfile(profileRes.data.data);
      setCatalogueProducts(productsRes.data.data || []);
      setOrders(ordersRes.data.data || []);
    } catch (err: any) {
      console.error('Fetch Sales History Error:', err);
      setError(err.response?.data?.message || 'Failed to sync data with the backend microservices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [user]);

  // Format Currency matching Rp100.000 format
  const formatMockupIDR = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    const rounded = Math.round(num || 0);
    return `Rp${new Intl.NumberFormat('id-ID').format(rounded)}`;
  };

  // Helper: Resolve Buyer Name
  const getBuyerName = (buyerId: number) => {
    const names: Record<number, string> = {
      1: 'Budi Santoso',
      2: 'Dewi Putri',
      3: 'Ahmad Fauzi',
      4: 'Joe'
    };
    return names[buyerId] || `Buyer #${buyerId}`;
  };

  // Helper: Resolve Product Details
  const getProductDetails = (productId: number) => {
    const product = catalogueProducts.find((p) => p.id === productId);
    if (product) {
      return {
        name: product.product_name,
        photoUrl: product.photo_url || undefined,
        price: Number(product.price)
      };
    }
    const fallbackCatalog: Record<number, { name: string; photoUrl: string; price: number }> = {
      1: {
        name: 'Kyoto Uji Matcha Powder (Premium Grade)',
        photoUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=200&fit=crop&q=80',
        price: 85000
      },
      3: {
        name: 'Tokyo Banana Premium Cake (12 Pcs)',
        photoUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=200&fit=crop&q=80',
        price: 320000
      },
      11: {
        name: 'Chocolate',
        photoUrl: 'https://images.unsplash.com/photo-1548907040-4d42b52145ea?w=200&fit=crop&q=80',
        price: 100000
      }
    };
    return fallbackCatalog[productId] || {
      name: `Product #${productId}`,
      photoUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&fit=crop&q=80',
      price: 150000
    };
  };

  // Filter completed orders
  const completedOrders = orders.filter(o => o.status === 'completed');

  // Stats cards values (Real API values)
  const completedCount = completedOrders.length;
  const walletBalance = profile?.balance || 0;
  
  // Calculate Grand Total Revenue
  const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.total_price || 0), 0);

  // Format Date to standard human readable string
  const formatTransactionDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // Transaction row logic (real API values filtered dynamically by query)
  const displayRows = completedOrders
    .map(o => ({
      id: o.id,
      buyer: getBuyerName(o.buyer_id),
      product: getProductDetails(o.product_id).name,
      quantity: o.quantity,
      amount: o.total_price,
      completedAt: o.updated_at || o.created_at
    }))
    .filter(row => {
      const search = searchQuery.toLowerCase();
      return (
        row.buyer.toLowerCase().includes(search) ||
        row.product.toLowerCase().includes(search) ||
        row.id.toString().includes(search)
      );
    });

  const renderSidebarLinks = () => (
    <nav className="space-y-1 mt-4">
      <Link to="/dashboard" className="text-white hover:bg-white/10 px-4 py-2.5 rounded-lg flex items-center gap-3 transition-all text-sm font-medium">
        <Icons.Dashboard />
        <span>Dashboard</span>
      </Link>
      <Link to="/catalogue" className="text-white hover:bg-white/10 px-4 py-2.5 rounded-lg flex items-center gap-3 transition-all text-sm font-medium">
        <Icons.Package />
        <span>My Catalogue</span>
      </Link>
      <Link to="/orders" className="text-white hover:bg-white/10 px-4 py-2.5 rounded-lg flex items-center gap-3 transition-all text-sm font-medium">
        <Icons.ShoppingCart />
        <span>Orders</span>
      </Link>
      <Link to="/sales-history" className="bg-white text-[#1e53e6] font-semibold px-4 py-2.5 rounded-lg flex items-center gap-3 shadow-sm text-sm">
        <Icons.History />
        <span>Sales History</span>
      </Link>
      <Link to="#" className="text-white hover:bg-white/10 px-4 py-2.5 rounded-lg flex items-center gap-3 transition-all text-sm font-medium">
        <Icons.Star />
        <span>My Reviews</span>
      </Link>
      <Link to="#" className="text-white hover:bg-white/10 px-4 py-2.5 rounded-lg flex items-center gap-3 transition-all text-sm font-medium">
        <Icons.Chat />
        <span>Chats</span>
      </Link>
    </nav>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 font-sans">

      {/* ==========================================
         A. SIDEBAR NAVIGATION (ROYAL BLUE)
         ========================================== */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1e53e6] text-white shrink-0 justify-between p-4 shadow-xl">
        <div>
          {/* Logo */}
          <div className="px-2 py-4">
            <h1 className="text-2xl font-bold tracking-tight text-white leading-none">Nitipin</h1>
            <p className="text-xs text-blue-200/80 mt-1 font-medium">Traveler Dashboard</p>
            <hr className="border-white/10 mt-4" />
          </div>

          {/* Links */}
          {renderSidebarLinks()}
        </div>

        {/* User Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 mx-1 flex items-center gap-3 border border-white/10 shrink-0">
          <div className="w-9 h-9 rounded-full border border-white/40 flex items-center justify-center text-white shrink-0">
            <Icons.User />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm leading-none text-white truncate">
              {profile?.name || user?.name || 'Sarah'}
            </h4>
            <p className="text-blue-200/70 text-[11px] mt-1 truncate">
              {profile?.email || user?.email || 'sarah@email.com'}
            </p>
          </div>
        </div>
      </aside>

      {/* ==========================================
         B. MOBILE SIDEBAR OVERLAY
         ========================================== */}
      {showMobileSidebar && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowMobileSidebar(false)} />
          
          <aside className="relative flex flex-col w-64 bg-[#1e53e6] text-white p-4 shadow-2xl animate-slide-right h-full justify-between">
            <button
              onClick={() => setShowMobileSidebar(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-white/80 hover:text-white"
            >
              <Icons.Close />
            </button>

            <div>
              <div className="px-2 py-4">
                <h1 className="text-2xl font-bold text-white leading-none">Nitipin</h1>
                <p className="text-xs text-blue-200/80 mt-1 font-medium">Traveler Dashboard</p>
                <hr className="border-white/10 mt-4" />
              </div>
              {renderSidebarLinks()}
            </div>

            <div className="bg-white/10 rounded-xl p-3.5 flex items-center gap-3 border border-white/10">
              <div className="w-9 h-9 rounded-full border border-white/40 flex items-center justify-center text-white shrink-0">
                <Icons.User />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-sm leading-none text-white truncate">
                  {profile?.name || user?.name || 'Sarah'}
                </h4>
                <p className="text-blue-200/70 text-[11px] mt-1 truncate">
                  {profile?.email || user?.email || 'sarah@email.com'}
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ==========================================
         C. MAIN CONTENT AREA
         ========================================== */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Mobile Header Bar */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-150 flex items-center justify-between px-6 shrink-0 shadow-sm">
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 transition duration-150 cursor-pointer"
          >
            <Icons.Menu />
          </button>
          <span className="font-black text-[#1e53e6] text-lg tracking-tight">Nitipin</span>
          <div className="w-8 h-8 rounded-full bg-[#1e53e6]/10 text-[#1e53e6] flex items-center justify-center font-bold text-xs">
            {profile?.name?.[0].toUpperCase() || user?.name?.[0].toUpperCase() || 'S'}
          </div>
        </header>

        {/* Scrollable sales dashboard viewport */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
          
          {/* Header Title section */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-[#1e53e6] tracking-tight">Sale History</h2>
            <p className="text-sm text-gray-400 mt-1 font-medium">
              Welcome back, {profile?.name || user?.name || 'Sarah'}!
            </p>
            <hr className="border-gray-200 mt-6" />
          </div>

          {/* ERROR STATUS */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm font-semibold">{error}</div>
              </div>
              <button onClick={fetchSalesData} className="px-3 py-1 bg-rose-200 hover:bg-rose-300 text-rose-900 rounded-lg text-xs font-bold transition-all">Reload</button>
            </div>
          )}

          {/* LOADING SPINNER */}
          {loading && (
            <div className="mb-6 flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* THREE METRICS STATS CARDS BLOCK */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* CARD 1: Order Completed */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-between shadow-sm relative overflow-hidden group">
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Order Completed</span>
                <span className="text-3xl lg:text-4xl font-extrabold text-gray-900 block leading-tight">
                  {completedCount}
                </span>
              </div>
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-150 shrink-0">
                <Icons.CompletedCart />
              </div>
            </div>

            {/* CARD 2: Total Revenue */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-between shadow-sm relative overflow-hidden group">
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Revenue</span>
                <span className="text-3xl lg:text-4xl font-extrabold text-gray-900 block leading-tight">
                  {formatMockupIDR(totalRevenue)}
                </span>
              </div>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-150 shrink-0">
                <Icons.TotalRevenue />
              </div>
            </div>

            {/* CARD 3: Wallet Balance */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-between shadow-sm relative overflow-hidden group">
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Balance</span>
                <span className="text-3xl lg:text-4xl font-extrabold text-gray-900 block leading-tight">
                  {formatMockupIDR(walletBalance)}
                </span>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-150 shrink-0">
                <Icons.Wallet />
              </div>
            </div>

          </div>

          {/* SEARCH BAR (Accented - Positioned directly above table) */}
          <div className="mb-6 relative w-full shrink-0">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by ID, Buyer name, or Product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-gray-800 placeholder-gray-400/80 shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* TABLE CONTAINER BLOCK */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                
                {/* Table Header with premium blue background */}
                <thead>
                  <tr className="bg-[#5b87f9] text-white">
                    <th className="py-4 px-6 font-bold text-sm tracking-wide">ID</th>
                    <th className="py-4 px-6 font-bold text-sm tracking-wide">Transaction Date</th>
                    <th className="py-4 px-6 font-bold text-sm tracking-wide">Buyer</th>
                    <th className="py-4 px-6 font-bold text-sm tracking-wide">Product</th>
                    <th className="py-4 px-6 font-bold text-sm tracking-wide">Status</th>
                    <th className="py-4 px-6 font-bold text-sm tracking-wide">Amount</th>
                  </tr>
                </thead>

                {/* Table Body rows */}
                <tbody className="divide-y divide-gray-100">
                  {displayRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sm font-semibold text-gray-400">
                        {searchQuery ? 'No matching transactions found.' : 'No completed sales transactions found.'}
                      </td>
                    </tr>
                  ) : (
                    displayRows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/55 transition duration-100 group">
                        
                        {/* ID */}
                        <td className="py-4.5 px-6 text-sm font-semibold text-gray-800">
                          {row.id}
                        </td>

                        {/* Transaction Date */}
                        <td className="py-4.5 px-6 text-xs font-semibold text-gray-500">
                          {formatTransactionDate(row.completedAt)}
                        </td>

                        {/* Buyer */}
                        <td className="py-4.5 px-6 text-sm font-extrabold text-gray-900">
                          {row.buyer}
                        </td>

                        {/* Product with dynamic Qty badge */}
                        <td className="py-4.5 px-6 text-sm font-bold text-gray-700">
                          <div className="flex items-center gap-2">
                            <span>{row.product}</span>
                            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-extrabold text-blue-600 bg-blue-50/70 border border-blue-100 rounded">
                              x{row.quantity}
                            </span>
                          </div>
                        </td>

                        {/* Status Completed pill */}
                        <td className="py-4.5 px-6">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-emerald-600 bg-emerald-50/70 border border-emerald-100 uppercase tracking-wide">
                            Completed
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-4.5 px-6 text-sm font-black text-gray-900">
                          {formatMockupIDR(row.amount)}
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>

              </table>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

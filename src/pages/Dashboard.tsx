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
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  UserCheck: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

export default function Dashboard() {
  const { user } = useAuth();

  // State Management
  const [profile, setProfile] = useState<TravelerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Withdraw Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [withdrawBankName, setWithdrawBankName] = useState<string>('');
  const [withdrawAccountNumber, setWithdrawAccountNumber] = useState<string>('');
  const [withdrawAccountHolder, setWithdrawAccountHolder] = useState<string>('');
  const [withdrawing, setWithdrawing] = useState<boolean>(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch all dashboard data in parallel
  const fetchDashboardData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);

      const [profileRes, productsRes, ordersRes] = await Promise.all([
        api.get(`/api/travelers/${user.id}`),
        api.get(`/api/products?traveler_id=${user.id}`),
        api.get('/api/orders')
      ]);

      setProfile(profileRes.data.data);
      setProducts(productsRes.data.data || []);
      setOrders(ordersRes.data.data || []);
    } catch (err: any) {
      console.error('Fetch Dashboard Error:', err);
      setError(err.response?.data?.message || 'Failed to sync data with the backend microservices.');
    } finally {
      setLoading(false);
    }
  };

  // Open Withdraw Modal
  const handleOpenWithdrawModal = () => {
    if (!profile?.balance || Number(profile.balance) <= 0) {
      showToast('You do not have any balance to withdraw.', 'error');
      return;
    }
    setWithdrawBankName('');
    setWithdrawAccountNumber('');
    setWithdrawAccountHolder(profile?.name || '');
    setWithdrawError(null);
    setShowWithdrawModal(true);
  };

  // Submit Withdraw API Request
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (!withdrawBankName.trim() || !withdrawAccountNumber.trim() || !withdrawAccountHolder.trim()) {
      setWithdrawError('All bank details are required.');
      return;
    }

    try {
      setWithdrawing(true);
      setWithdrawError(null);

      const res = await api.post(`/api/travelers/${user.id}/withdraw`, {
        bank_name: withdrawBankName.trim(),
        account_number: withdrawAccountNumber.trim(),
        account_holder: withdrawAccountHolder.trim()
      });

      if (res.data.status === 'success') {
        showToast('Balance withdrawn successfully!');
        setShowWithdrawModal(false);
        fetchDashboardData();
      }
    } catch (err: any) {
      console.error('Withdraw submit error:', err);
      setWithdrawError(err.response?.data?.message || 'Failed to complete balance withdrawal.');
    } finally {
      setWithdrawing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Format Currency (matching the exact mockup format: e.g., Rp200.000, Rp100.000 without spaces)
  const formatMockupIDR = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    const rounded = Math.round(num || 0);
    return `Rp${new Intl.NumberFormat('id-ID').format(rounded)}`;
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 font-sans">
      
      {/* ==========================================
         A. SIDEBAR NAVIGASI (ROYAL BLUE PANEL)
         ========================================== */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1e53e6] text-white shrink-0 justify-between p-4 shadow-xl">
        <div>
          {/* Logo & Subtitle */}
          <div className="px-2 py-4">
            <h1 className="text-2xl font-bold tracking-tight text-white leading-none">Nitipin</h1>
            <p className="text-xs text-blue-200/80 mt-1 font-medium">Traveler Dashboard</p>
            <hr className="border-white/10 mt-4" />
          </div>
          
          {/* Menu Links (6 Clean Navigation links) */}
          <nav className="space-y-1 mt-4">
            <Link to="/dashboard" className="bg-white text-[#1e53e6] font-semibold px-4 py-2.5 rounded-lg flex items-center gap-3 shadow-sm text-sm">
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
            <Link to="/sales-history" className="text-white hover:bg-white/10 px-4 py-2.5 rounded-lg flex items-center gap-3 transition-all text-sm font-medium">
              <Icons.History />
              <span>Sales History</span>
            </Link>
            <Link to="/reviews" className="text-white hover:bg-white/10 px-4 py-2.5 rounded-lg flex items-center gap-3 transition-all text-sm font-medium">
              <Icons.Star />
              <span>My Reviews</span>
            </Link>
            <Link to="/chats" className="text-white hover:bg-white/10 px-4 py-2.5 rounded-lg flex items-center gap-3 transition-all text-sm font-medium">
              <Icons.Chat />
              <span>Chats</span>
            </Link>
          </nav>
        </div>

        {/* User Card bottom section */}
        <div className="space-y-2">
          {/* Interactive User profile widget */}
          <Link to="/profile" className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 mx-1 flex items-center gap-3 border border-white/10 hover:bg-white/20 transition-all shrink-0 cursor-pointer block">
            <div className="w-9 h-9 rounded-full border border-white/40 overflow-hidden flex items-center justify-center text-white shrink-0 bg-blue-600/30">
              {profile?.profile_photo ? (
                <img src={profile.profile_photo} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <Icons.User />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-sm leading-none text-white truncate">
                {profile?.name || user?.name || 'Sarah'}
              </h4>
              <p className="text-blue-200/70 text-[11px] mt-1 truncate">
                {profile?.email || user?.email || 'sarah@email.com'}
              </p>
            </div>
          </Link>
        </div>
      </aside>

      {/* ==========================================
         B. CONTENT AREA
         ========================================== */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Core Scroll Content container */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-10">
          
          {/* HEADER MAIN */}
          <div className="mb-6">
            <h2 className="text-3xl font-semibold text-[#1e53e6] tracking-tight">Dashboard</h2>
            <p className="text-sm text-gray-400 mt-1 font-medium">
              Welcome back, {profile?.name || user?.name || 'Sarah'}!
            </p>
            <hr className="border-gray-200 mt-5" />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm font-semibold">{error}</div>
              </div>
              <button onClick={fetchDashboardData} className="px-3 py-1 bg-rose-200 hover:bg-rose-300 text-rose-900 rounded-lg text-xs font-bold transition-all">Reload</button>
            </div>
          )}

          {loading ? (
            /* ==========================================
               LOADING PLACEHOLDERS (SKELETONS)
               ========================================== */
            <div className="space-y-8 animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
                ))}
              </div>
              <div className="h-96 bg-slate-200 rounded-2xl" />
            </div>
          ) : (
            /* ==========================================
               REAL CONTENT RENDERED (PIXEL-PERFECT)
               ========================================== */
            <>
              {/* 1. STATISTICS GRID CARD ROW (4 Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                
                {/* CARD 1: Total Product */}
                <div className="bg-white rounded-2xl p-6 shadow-md shadow-gray-200/50 flex justify-between items-start border border-gray-100 hover:scale-[1.01] transition-all">
                  <div>
                    <p className="text-gray-600 text-sm font-normal uppercase tracking-wider">Total Product</p>
                    <h3 className="text-3xl font-semibold text-gray-900 mt-1.5">{products.length}</h3>
                  </div>
                  <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                    <Icons.Package />
                  </div>
                </div>

                {/* CARD 2: Order Received */}
                <div className="bg-white rounded-2xl p-6 shadow-md shadow-gray-200/50 flex justify-between items-start border border-gray-100 hover:scale-[1.01] transition-all">
                  <div>
                    <p className="text-gray-600 text-sm font-normal uppercase tracking-wider">Order Received</p>
                    <h3 className="text-3xl font-semibold text-gray-900 mt-1.5">{orders.length}</h3>
                  </div>
                  <div className="bg-amber-50 p-2.5 rounded-xl text-amber-600">
                    <Icons.ShoppingCart />
                  </div>
                </div>

                {/* CARD 3: Balance */}
                <div className="bg-white rounded-2xl p-6 shadow-md shadow-gray-200/50 flex flex-col justify-between border border-gray-100 hover:scale-[1.01] transition-all">
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <p className="text-gray-600 text-sm font-normal uppercase tracking-wider">Balance</p>
                      <h3 className="text-3xl font-semibold text-gray-900 mt-1.5">
                        {formatMockupIDR(profile?.balance || 0)}
                      </h3>
                    </div>
                    <div className="bg-green-50 p-2.5 rounded-xl text-green-600 shrink-0">
                      <Icons.Wallet />
                    </div>
                  </div>
                  <button 
                    onClick={handleOpenWithdrawModal}
                    disabled={!profile?.balance || Number(profile.balance) <= 0}
                    className="mt-3 pt-2.5 border-t border-gray-50 text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400 text-[#1e53e6] hover:text-blue-700 cursor-pointer"
                  >
                    <span>Withdraw Funds</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                  </button>
                </div>

                {/* CARD 4: Account Status */}
                <div className="bg-white rounded-2xl p-6 shadow-md shadow-gray-200/50 flex justify-between items-start border border-gray-100 hover:scale-[1.01] transition-all">
                  <div>
                    <p className="text-gray-600 text-sm font-normal uppercase tracking-wider">Account Status</p>
                    <h3 className="text-3xl font-semibold text-gray-900 mt-1.5 capitalize">
                      {profile?.account_status || 'Active'}
                    </h3>
                  </div>
                  <div className="bg-purple-50 p-2.5 rounded-xl text-purple-600">
                    <Icons.UserCheck />
                  </div>
                </div>

              </div>

              {/* 2. ORDER LIST TABLE (PIXEL-PERFECT MOCKUP THEME) */}
              <div className="bg-white rounded-2xl shadow-md shadow-gray-200/50 overflow-hidden border border-gray-100">
                {/* Header Row (Solid Royal Blue banner) */}
                <div className="bg-[#1e53e6] text-white py-4 px-6 font-semibold text-sm">
                  <div className="grid grid-cols-5 w-full tracking-wide">
                    <span>ID</span>
                    <span>Buyer</span>
                    <span>Product</span>
                    <span className="text-center">Status</span>
                    <span className="text-right">Amount</span>
                  </div>
                </div>

                {/* Body Rows */}
                <div className="divide-y divide-gray-100">
                  {orders.length === 0 ? (
                    <div className="py-12 text-center text-gray-600 font-normal text-sm">
                      No order data available currently.
                    </div>
                  ) : (
                    orders.map(order => (
                      <div 
                        key={order.id} 
                        className="grid grid-cols-5 items-center py-4.5 px-6 text-sm text-gray-700 hover:bg-slate-50/60 transition-all font-normal"
                      >
                        <span className="text-gray-900 font-semibold">#{order.id}</span>
                        <span className="text-gray-600 font-normal">{order.buyer_name || 'Buyer'}</span>
                        <span className="text-gray-500 font-normal truncate pr-4">
                          {order.product_name || `Product ID #${order.product_id}`}
                        </span>
                        
                        {/* Perfect outline pill status */}
                        <div className="text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                            order.status === 'completed'
                              ? 'bg-green-50 text-green-600 border-green-200'
                              : order.status === 'pending_review'
                              ? 'bg-amber-50 text-amber-600 border-amber-200'
                              : 'bg-blue-50 text-blue-600 border-blue-200'
                          }`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>

                        <span className="text-right font-semibold text-gray-900">
                          {formatMockupIDR(order.total_price)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

        </div>
      </main>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowWithdrawModal(false)}
          />
          
          {/* Modal Container */}
          <div className="relative bg-white rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl border border-gray-150 transform transition-all duration-300 scale-100 flex flex-col gap-6">
            {/* Header */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-none">Withdraw Funds</h3>
              <p className="text-xs text-gray-400 mt-2 font-medium leading-relaxed">
                Withdraw your entire balance to your bank account. The funds will be processed immediately.
              </p>
            </div>

            {/* Current Balance Summary Box */}
            <div className="bg-green-50/50 border border-green-100 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-green-700 font-extrabold uppercase tracking-wider block">Available Balance</span>
                <span className="text-2xl font-bold text-green-900 mt-1 block">
                  {formatMockupIDR(profile?.balance || 0)}
                </span>
              </div>
              <div className="text-green-600">
                <Icons.Wallet />
              </div>
            </div>

            {withdrawError && (
              <div className="bg-red-50 text-red-600 text-xs p-3.5 rounded-xl border border-red-100 font-medium">
                {withdrawError}
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Bank Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bank Central Asia (BCA)"
                  value={withdrawBankName}
                  onChange={(e) => setWithdrawBankName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder-gray-400 text-gray-800 bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Account Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 8012345678"
                  value={withdrawAccountNumber}
                  onChange={(e) => setWithdrawAccountNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder-gray-400 text-gray-800 bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Account Holder Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={withdrawAccountHolder}
                  onChange={(e) => setWithdrawAccountHolder(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder-gray-400 text-gray-800 bg-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl transition duration-150 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={withdrawing}
                  className="px-6 py-2.5 bg-[#1e53e6] hover:bg-blue-700 active:scale-95 text-white text-xs font-extrabold rounded-xl shadow-md transition duration-150 disabled:bg-blue-300 disabled:scale-100 cursor-pointer"
                >
                  {withdrawing ? 'Processing...' : 'Confirm Withdraw'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-xl shadow-lg border transition-all duration-300 transform translate-y-0 ${
          toast.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

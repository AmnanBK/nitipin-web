import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { TravelerProfile, Product, Order, OrderStatus } from '../types/api';

// ==========================================
// CLIENT-SIDE LOOKUPS (TO COMPLY WITH MICROSERVICE ISOLATION)
// ==========================================

// Mock Buyer Names (Traveler cannot query protected buyer profile endpoint)
const getBuyerName = (buyerId: number | string): string => {
  const buyers: Record<number, string> = {
    1: 'Ani Lestari',
    2: 'Budi Santoso',
    3: 'Dewi Putri',
    4: 'Sarah Wibowo',
  };
  return buyers[Number(buyerId)] || `Buyer #${buyerId}`;
};

// Mock Shipping Addresses (Traveler cannot fetch protected address endpoint)
const getShippingAddress = (addressId: number | string): string => {
  const addresses: Record<number, string> = {
    1: 'Jl. Melati Raya No. 12, RT 05 / RW 09, Bandung (40123)',
    2: 'Gedung Cyber 2, Lt. 17, Jl. Gatot Subroto, Jakarta Selatan (12950)',
    3: 'Perumahan Harmoni Indah Blok B4/12, Kota Bekasi (17148)',
    4: 'Jl. Mawar No. 50, RT 02 / RW 03, Sukajadi, Pekanbaru (28124)',
  };
  return addresses[Number(addressId)] || `Alamat Pengiriman #${addressId} (Kota Jakarta)`;
};

// ==========================================
// CUSTOM SLEEK SVG ICONS (INLINE COMPONENTS)
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
  Close: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-10 h-10 text-blue-500 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Location: () => (
    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
};

export default function Orders() {
  const { user } = useAuth();

  // State Management
  const [profile, setProfile] = useState<TravelerProfile | null>(null);
  const [catalogueProducts, setCatalogueProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Detail Modal & Action State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [escrowStatus, setEscrowStatus] = useState<any>(null);
  const [proofs, setProofs] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  // Proof Upload State
  const [showProofModal, setShowProofModal] = useState<boolean>(false);
  const [proofOrderId, setProofOrderId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [proofDescription, setProofDescription] = useState<string>('');
  const [uploadingProof, setUploadingProof] = useState<boolean>(false);

  // Global toast system
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Sync / Fetch Data on Page Load
  const fetchOrdersData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);

      const [profileRes, allProductsRes, ordersRes] = await Promise.all([
        api.get(`/api/travelers/${user.id}`),
        api.get('/api/products'), // Fetch all products to resolve product details
        api.get('/api/orders')
      ]);

      setProfile(profileRes.data.data);
      setCatalogueProducts(allProductsRes.data.data || []);
      setOrders(ordersRes.data.data || []);
    } catch (err: any) {
      console.error('Fetch Orders Data Error:', err);
      setError(err.response?.data?.message || 'Failed to fetch active orders from microservices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersData();
  }, [user]);

  // Format IDR Currency
  const formatMockupIDR = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    const rounded = Math.round(num || 0);
    return `Rp${new Intl.NumberFormat('id-ID').format(rounded)}`;
  };

  // Resolve Product details from client-side catalogue lookup
  const getProductDetails = (productId: number) => {
    const product = catalogueProducts.find((p) => p.id === productId);
    return {
      name: product?.product_name || `Produk #${productId}`,
      photoUrl: product?.photo_url || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&fit=crop&q=80',
      price: product?.price ? Number(product.price) : 0,
      description: product?.description || ''
    };
  };

  // Fetch Escrow Details & Proofs on Order Click
  const handleOpenDetail = async (order: Order) => {
    setSelectedOrder(order);
    setLoadingDetails(true);
    setEscrowStatus(null);
    setProofs([]);

    try {
      const [escrowRes, proofsRes] = await Promise.all([
        api.get(`/api/orders/${order.id}/escrow`),
        api.get(`/api/orders/${order.id}/proofs`)
      ]);
      setEscrowStatus(escrowRes.data.data);
      setProofs(proofsRes.data.data || []);
    } catch (err: any) {
      console.error('Fetch Order details error:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Action: Approve Order
  const handleApproveOrder = async (orderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.patch(`/api/orders/${orderId}/approve`);
      showToast('Order disetujui successfully!');
      fetchOrdersData();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: 'approved' } : null);
      }
    } catch (err: any) {
      console.error('Approve order error:', err);
      showToast(err.response?.data?.message || 'Gagal menyetujui order.', 'error');
    }
  };

  // Action: Reject Order
  const handleRejectOrder = async (orderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Apakah Anda yakin ingin menolak pesanan ini? Saldo pembeli akan segera dikembalikan.')) return;
    try {
      await api.patch(`/api/orders/${orderId}/reject`);
      showToast('Order ditolak & dana dikembalikan ke pembeli!');
      fetchOrdersData();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: 'rejected' } : null);
      }
    } catch (err: any) {
      console.error('Reject order error:', err);
      showToast(err.response?.data?.message || 'Gagal menolak order.', 'error');
    }
  };

  // Action: Ship Product
  const handleShipOrder = async (orderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.patch(`/api/orders/${orderId}/ship`);
      showToast('Order berhasil ditandai telah dikirim!');
      fetchOrdersData();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: 'shipped' } : null);
      }
    } catch (err: any) {
      console.error('Ship order error:', err);
      showToast(err.response?.data?.message || 'Gagal merubah status kirim.', 'error');
    }
  };

  // Action: Trigger Purchase Proof modal
  const handleOpenProofModal = (orderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setProofOrderId(orderId);
    setSelectedFile(null);
    setProofDescription('');
    setShowProofModal(true);
  };

  // Action: Submit Purchase Proof & transition to 'purchased'
  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofOrderId || !selectedFile) {
      showToast('Harap pilih file gambar bukti belanja.', 'error');
      return;
    }

    try {
      setUploadingProof(true);

      // 1. Upload Bukti Foto (multipart/form-data)
      const formData = new FormData();
      formData.append('photo', selectedFile);
      formData.append('proof_type', 'purchase');
      if (proofDescription) {
        formData.append('description', proofDescription);
      }

      await api.post(`/api/orders/${proofOrderId}/proofs`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // 2. Transition Status to Purchased
      await api.patch(`/api/orders/${proofOrderId}/purchased`);

      showToast('Bukti belanja berhasil diunggah & status diperbarui!');
      setShowProofModal(false);
      fetchOrdersData();

      // Update detail view if open
      if (selectedOrder?.id === proofOrderId) {
        handleOpenDetail({ ...selectedOrder, status: 'purchased' });
      }
    } catch (err: any) {
      console.error('Upload proof & purchase error:', err);
      showToast(err.response?.data?.message || 'Gagal mengunggah bukti belanja.', 'error');
    } finally {
      setUploadingProof(false);
    }
  };

  // Filter Orders based on active tab & search query
  const filteredOrders = orders.filter((order) => {
    // 1. Status Filter
    let matchesStatus = true;
    if (activeTab !== 'all') {
      if (activeTab === 'cancelled_rejected') {
        matchesStatus = order.status === 'cancelled' || order.status === 'rejected';
      } else {
        matchesStatus = order.status === activeTab;
      }
    }

    // 2. Search Query Filter
    let matchesSearch = true;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const prodName = getProductDetails(order.product_id).name.toLowerCase();
      const buyerName = getBuyerName(order.buyer_id).toLowerCase();
      const orderIdStr = order.id.toString();
      matchesSearch = prodName.includes(q) || buyerName.includes(q) || orderIdStr.includes(q);
    }

    return matchesStatus && matchesSearch;
  });

  // Get status color styling dynamically
  const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
      case 'pending_review':
        return 'bg-amber-50 text-amber-700 border-amber-100 border';
      case 'approved':
        return 'bg-blue-50 text-[#1e53e6] border-blue-100 border';
      case 'purchased':
        return 'bg-purple-50 text-purple-700 border-purple-100 border';
      case 'shipped':
        return 'bg-orange-50 text-orange-700 border-orange-100 border';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-100 border';
      case 'rejected':
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-100 border';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100 border';
    }
  };

  const getStatusLabelText = (status: OrderStatus) => {
    switch (status) {
      case 'pending_review':
        return 'Pending Review';
      case 'approved':
        return 'Approved';
      case 'purchased':
        return 'Purchased';
      case 'shipped':
        return 'Shipped';
      case 'completed':
        return 'Completed';
      case 'rejected':
        return 'Rejected';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
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
          
          {/* Menu Links */}
          <nav className="space-y-1 mt-4">
            <Link to="/dashboard" className="text-white hover:bg-white/10 px-4 py-2.5 rounded-lg flex items-center gap-3 transition-all text-sm font-medium">
              <Icons.Dashboard />
              <span>Dashboard</span>
            </Link>
            <Link to="/catalogue" className="text-white hover:bg-white/10 px-4 py-2.5 rounded-lg flex items-center gap-3 transition-all text-sm font-medium">
              <Icons.Package />
              <span>My Catalogue</span>
            </Link>
            <Link to="/orders" className="bg-white text-[#1e53e6] font-semibold px-4 py-2.5 rounded-lg flex items-center gap-3 shadow-sm text-sm">
              <Icons.ShoppingCart />
              <span>Orders</span>
            </Link>
            <Link to="#" className="text-white hover:bg-white/10 px-4 py-2.5 rounded-lg flex items-center gap-3 transition-all text-sm font-medium">
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
        </div>

        {/* User Card bottom section */}
        <div className="space-y-2">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 mx-1 flex items-center gap-3 border border-white/10">
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
        </div>
      </aside>

      {/* ==========================================
         B. CONTENT AREA
         ========================================== */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Core Scroll Content container */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-10">
          
          {/* HEADER MAIN */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-extrabold text-[#1e53e6] tracking-tight">Orders</h2>
              <p className="text-sm text-gray-400 mt-1 font-medium">Manage and process traveler orders</p>
            </div>
          </div>

          {/* SEARCH BAR (Highly premium, royal-blue accented - Positioned directly above filters) */}
          <div className="mb-6 relative w-full shrink-0">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search..."
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

          {/* TABS SELECTOR (Horizontal scrollable tab bar for all statuses) */}
          <div className="flex border-b border-gray-200 mb-8 gap-6 overflow-x-auto scrollbar-none shrink-0 pr-4">
            {[
              { id: 'all', label: 'All Orders', count: orders.length },
              { id: 'pending_review', label: 'Pending Review', count: orders.filter(o => o.status === 'pending_review').length },
              { id: 'approved', label: 'Approved', count: orders.filter(o => o.status === 'approved').length },
              { id: 'purchased', label: 'Purchased', count: orders.filter(o => o.status === 'purchased').length },
              { id: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
              { id: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'completed').length },
              { id: 'cancelled_rejected', label: 'Cancelled & Rejected', count: orders.filter(o => o.status === 'cancelled' || o.status === 'rejected').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-[#1e53e6]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-[#1e53e6] text-white'
                      : tab.id === 'pending_review'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1e53e6] rounded-full" />
                )}
              </button>
            ))}
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
              <button onClick={fetchOrdersData} className="px-3 py-1 bg-rose-200 hover:bg-rose-300 text-rose-900 rounded-lg text-xs font-bold transition-all">Reload</button>
            </div>
          )}

          {/* MAIN LOADER */}
          {loading ? (
            <div className="space-y-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            /* EMPTY STATE */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center max-w-md mx-auto mt-12 flex flex-col items-center">
              <div className="bg-blue-50 p-4 rounded-full text-blue-500 mb-4 shrink-0">
                <Icons.ShoppingCart />
              </div>
              <h4 className="text-lg font-bold text-gray-900">Belum Ada Pesanan</h4>
              <p className="text-sm text-gray-400 mt-2">
                {activeTab === 'pending_review'
                  ? 'Saat ini tidak ada pesanan baru yang membutuhkan persetujuan Anda.'
                  : 'Seluruh daftar pesanan masuk Anda akan terlihat di halaman ini.'}
              </p>
            </div>
          ) : (
            /* ORDERS GRID/LIST */
            <div className="space-y-6">
              {filteredOrders.map((order) => {
                const prod = getProductDetails(order.product_id);
                return (
                  <div
                    key={order.id}
                    onClick={() => handleOpenDetail(order)}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200/80 transition-all duration-150 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    {/* Left: Product Image & Basic Info */}
                    <div className="flex gap-4 min-w-0 flex-1">
                      <div className="w-16 h-16 rounded-xl border border-gray-100 overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center">
                        <img
                          src={prod.photoUrl}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&fit=crop&q=80';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusBadgeStyle(order.status)}`}>
                            {getStatusLabelText(order.status)}
                          </span>
                          <span className="text-xs font-semibold text-gray-400">Order #{order.id}</span>
                        </div>
                        <h4 className="text-base font-bold text-gray-900 truncate mt-1">{prod.name}</h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1 font-medium">
                          <span>Pembeli: <strong className="text-gray-700">{getBuyerName(order.buyer_id)}</strong></span>
                          <span className="hidden sm:inline text-gray-300">•</span>
                          <span>Jumlah: <strong className="text-gray-700">{order.quantity} pcs</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Price & Dynamic Action Buttons */}
                    <div className="flex flex-row md:flex-col justify-between items-center md:items-end w-full md:w-auto shrink-0 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0 gap-4">
                      {/* Price breakdown */}
                      <div className="text-left md:text-right">
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider leading-none">Total Payment</p>
                        <h3 className="text-xl font-extrabold text-gray-900 mt-1">{formatMockupIDR(order.total_price)}</h3>
                      </div>

                      {/* Action buttons strictly mapped per status */}
                      <div className="flex items-center gap-2">
                        {order.status === 'pending_review' && (
                          <>
                            <button
                              onClick={(e) => handleRejectOrder(order.id, e)}
                              className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition duration-150 cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              onClick={(e) => handleApproveOrder(order.id, e)}
                              className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xl transition duration-150 shadow-sm shadow-blue-100 cursor-pointer"
                            >
                              Approve
                            </button>
                          </>
                        )}
                        {order.status === 'approved' && (
                          <button
                            onClick={(e) => handleOpenProofModal(order.id, e)}
                            className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xl transition duration-150 shadow-sm cursor-pointer"
                          >
                            Mark as Purchased
                          </button>
                        )}
                        {order.status === 'purchased' && (
                          <button
                            onClick={(e) => handleShipOrder(order.id, e)}
                            className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xl transition duration-150 shadow-sm cursor-pointer"
                          >
                            Ship Product
                          </button>
                        )}
                        {order.status === 'shipped' && (
                          <span className="text-xs text-gray-400 font-semibold italic bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">
                            Menunggu Konfirmasi Penerimaan
                          </span>
                        )}
                        {order.status === 'completed' && (
                          <span className="text-xs text-green-600 font-semibold bg-green-50 border border-green-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
                            Dana Escrow Released
                          </span>
                        )}
                        {(order.status === 'rejected' || order.status === 'cancelled') && (
                          <span className="text-xs text-rose-500 font-semibold bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl">
                            Selesai & Refunded
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ==========================================
         C. ORDER DETAIL DIALOG (DRAWER / PANEL)
         ========================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-slide-in">
            {/* Header Sticky */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Detail Pesanan</h3>
                <p className="text-xs text-gray-400 mt-0.5">Order ID #{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-xl transition duration-150 cursor-pointer"
              >
                <Icons.Close />
              </button>
            </div>

            {/* Scrollable Details */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
              
              {/* Product Info Card */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-200/60 bg-white">
                  <img
                    src={getProductDetails(selectedOrder.product_id).photoUrl}
                    alt={getProductDetails(selectedOrder.product_id).name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{getProductDetails(selectedOrder.product_id).name}</h4>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{getProductDetails(selectedOrder.product_id).description}</p>
                  <p className="text-xs text-gray-700 font-semibold mt-1">
                    {formatMockupIDR(getProductDetails(selectedOrder.product_id).price)} × {selectedOrder.quantity} pcs
                  </p>
                </div>
              </div>

              {/* Status & Escrow Status */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status Transaksi</h4>
                
                <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3.5 shadow-sm">
                  {/* Status Badge */}
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-gray-500">Order Status</span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${getStatusBadgeStyle(selectedOrder.status)}`}>
                      {getStatusLabelText(selectedOrder.status)}
                    </span>
                  </div>

                  {/* Escrow Details */}
                  {loadingDetails ? (
                    <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                  ) : escrowStatus ? (
                    <div className="flex justify-between items-center text-sm font-medium pt-3.5 border-t border-gray-100">
                      <span className="text-gray-500">Escrow Payment</span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        escrowStatus.status === 'released'
                          ? 'bg-green-50 text-green-700 border border-green-100'
                          : escrowStatus.status === 'refunded'
                          ? 'bg-rose-50 text-rose-700 border border-rose-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {escrowStatus.status === 'hold' ? 'Holding (Ditahan)' : escrowStatus.status}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tujuan Pengiriman</h4>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex gap-3 items-start">
                  <Icons.Location />
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 leading-none">{getBuyerName(selectedOrder.buyer_id)}</h5>
                    <p className="text-xs text-gray-500 mt-2 font-medium leading-relaxed">
                      {getShippingAddress(selectedOrder.shipping_address_id)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Proof of Upload section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bukti Foto Transaksi</h4>
                
                {loadingDetails ? (
                  <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                ) : proofs.length === 0 ? (
                  <div className="bg-gray-50 text-center rounded-2xl p-6 border border-gray-100 text-xs font-semibold text-gray-400">
                    Belum ada bukti foto diunggah untuk order ini.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {proofs.map((proof) => (
                      <div key={proof._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:scale-[1.01] transition-all">
                        <div className="h-28 bg-gray-50 overflow-hidden relative">
                          <img
                            src={proof.photo_url}
                            alt={proof.proof_type}
                            className="w-full h-full object-cover"
                            onClick={() => window.open(proof.photo_url, '_blank')}
                          />
                          <span className={`absolute top-2 left-2 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase border tracking-wider bg-white ${
                            proof.proof_type === 'purchase'
                              ? 'text-blue-600 border-blue-100'
                              : 'text-green-600 border-green-100'
                          }`}>
                            {proof.proof_type}
                          </span>
                        </div>
                        <div className="p-2">
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                            By {proof.uploader_type}
                          </p>
                          <p className="text-xs text-gray-700 font-semibold line-clamp-1 mt-0.5">
                            {proof.description || 'Tidak ada catatan.'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="p-5 border-t border-gray-100 shrink-0 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-xl transition duration-150 cursor-pointer"
              >
                Tutup
              </button>
              {selectedOrder.status === 'pending_review' && (
                <>
                  <button
                    onClick={(e) => { handleRejectOrder(selectedOrder.id, e); }}
                    className="px-5 py-2.5 border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-bold rounded-xl transition duration-150 cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={(e) => { handleApproveOrder(selectedOrder.id, e); }}
                    className="px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-bold rounded-xl transition duration-150 shadow-sm cursor-pointer"
                  >
                    Approve
                  </button>
                </>
              )}
              {selectedOrder.status === 'approved' && (
                <button
                  onClick={(e) => { handleOpenProofModal(selectedOrder.id, e); }}
                  className="px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-bold rounded-xl transition duration-150 shadow-sm cursor-pointer"
                >
                  Mark as Purchased
                </button>
              )}
              {selectedOrder.status === 'purchased' && (
                <button
                  onClick={(e) => { handleShipOrder(selectedOrder.id, e); }}
                  className="px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-bold rounded-xl transition duration-150 shadow-sm cursor-pointer"
                >
                  Ship Product
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
         D. UPLOAD PROOF MODAL DIALOG
         ========================================== */}
      {showProofModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f8f9fa] rounded-2xl w-full max-w-sm shadow-xl p-6 flex flex-col overflow-hidden max-h-[90vh]">
            
            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-4 shrink-0">
              Upload Proof of Purchase
            </h3>

            <form onSubmit={handleUploadProof} className="flex flex-col flex-1 overflow-hidden">
              
              {/* Form Content */}
              <div className="space-y-4 overflow-y-auto flex-1 pr-1">
                <p className="text-xs text-gray-400 font-medium">
                  Harap unggah foto struk belanja bukti pembelian barang jastip ini sebelum melanjutkan perubahan status.
                </p>

                {/* Custom File Upload Input */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Receipt Picture</label>
                  
                  <div className="border-2 border-dashed border-gray-200 hover:border-blue-400 bg-white rounded-2xl p-6 text-center transition duration-150 flex flex-col items-center justify-center cursor-pointer relative">
                    <input
                      type="file"
                      required
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Icons.Upload />
                    <span className="text-xs font-bold text-blue-600 hover:text-blue-700">
                      {selectedFile ? 'Change photo' : 'Select receipt picture'}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1 font-medium">
                      {selectedFile ? selectedFile.name : 'PNG, JPG, JPEG up to 5MB'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Catatan Tambahan</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Belanja di supermarket Kyoto Station..."
                    value={proofDescription}
                    onChange={(e) => setProofDescription(e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl py-2 px-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent w-full h-16 resize-none transition duration-150 text-gray-900 font-medium"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-3 mt-5 pt-2 border-t border-gray-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowProofModal(false)}
                  className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-500 font-bold text-xs rounded-xl py-2 px-5 transition duration-150 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingProof}
                  className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs rounded-xl py-2 px-5 transition duration-150 shadow-sm disabled:opacity-75 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {uploadingProof ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Upload Proof</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==========================================
         E. SNAP/TOAST NOTIFICATIONS
         ========================================== */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className={`px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border text-sm font-bold transition-all ${
            toast.type === 'success'
              ? 'bg-[#10b981] border-[#059669] text-white'
              : 'bg-[#ef4444] border-[#dc2626] text-white'
          }`}>
            {toast.type === 'success' ? (
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
}

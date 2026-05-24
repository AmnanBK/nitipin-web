import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { TravelerProfile, Product, Order, OrderStatus } from '../types/api';
import logoImg from '../assets/logo.png';

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
  return addresses[Number(addressId)] || `Shipping Address #${addressId} (Jakarta City)`;
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
  const [proofDescription, setProofDescription] = useState<string>('');
  const [uploadingProof, setUploadingProof] = useState<boolean>(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveFile = () => {
    setProofFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleCloseProofModal = () => {
    setShowProofModal(false);
    setProofOrderId(null);
    setProofDescription('');
    setProofFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

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
      
      const fetchedOrders = ordersRes.data.data || [];
      setOrders(fetchedOrders);
    } catch (err: any) {
      console.error('Fetch Orders Data Error:', err);
      setError(err.response?.data?.message || 'Failed to sync data with the backend microservices.');
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
    
    // Premium Mock catalogue fallback details for dummy order rendering
    const mockCatalog: Record<number, { name: string; photoUrl: string; price: number; description: string }> = {
      1: {
        name: 'Kyoto Uji Matcha Powder (Premium Grade)',
        photoUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&fit=crop&q=80',
        price: 120000,
        description: 'Authentic premium matcha sourced directly from the historic tea fields of Uji, Kyoto.'
      },
      2: {
        name: 'Fujifilm Instax Mini 12 (Pastel Blue)',
        photoUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&fit=crop&q=80',
        price: 850000,
        description: 'A beautiful, compact instant film camera perfect for capturing nostalgic memories.'
      },
      3: {
        name: 'Tokyo Banana Premium Edition (8-Pack)',
        photoUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&fit=crop&q=80',
        price: 120000,
        description: 'Soft sponge cake filled with luscious banana custard cream, Japan\'s #1 souvenir.'
      },
      4: {
        name: 'Sony WH-1000XM5 Noise Cancelling Headphones',
        photoUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&fit=crop&q=80',
        price: 1200000,
        description: 'Industry-leading noise cancelling headphones with exceptional sound and call quality.'
      }
    };

    if (product) {
      return {
        name: product.product_name,
        photoUrl: product.photo_url || undefined,
        price: Number(product.price),
        description: product.description || ''
      };
    }

    return mockCatalog[productId] || {
      name: `Product #${productId}`,
      photoUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&fit=crop&q=80',
      price: 150000,
      description: 'Product details not found.'
    };
  };

  // Fetch Escrow Details & Proofs on Order Click
  const handleOpenDetail = async (order: Order) => {
    setSelectedOrder(order);
    setLoadingDetails(true);
    setEscrowStatus(null);
    setProofs([]);

    if (order.id >= 100) {
      // Simulate escrow status details and uploader proofs instantly for local testing
      setTimeout(() => {
        setEscrowStatus({
          id: order.id,
          order_id: order.id,
          status: order.status === 'completed' ? 'released' : order.status === 'rejected' || order.status === 'cancelled' ? 'refunded' : 'hold',
          amount: order.total_price
        });
        
        if (['purchased', 'shipped', 'completed'].includes(order.status)) {
          setProofs([
            {
              _id: 'mock-proof-1',
              order_id: order.id,
              proof_type: 'purchase',
              photo_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&fit=crop&q=80',
              uploader_type: 'traveler',
              description: 'Official shopping receipt from Yodobashi Camera Kyoto.'
            }
          ]);
        }
        setLoadingDetails(false);
      }, 300);
      return;
    }

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
  // Confirmation Modals State
  const [confirmApproveId, setConfirmApproveId] = useState<number | null>(null);
  const [confirmRejectId, setConfirmRejectId] = useState<number | null>(null);
  const [confirmShipId, setConfirmShipId] = useState<number | null>(null);

  // Trigger Confirmation Modal for Approval
  const handleApproveOrder = (orderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmApproveId(orderId);
  };

  // Trigger Confirmation Modal for Rejection
  const handleRejectOrder = (orderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmRejectId(orderId);
  };

  // Trigger Confirmation Modal for Shipping
  const handleShipOrder = (orderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmShipId(orderId);
  };

  // Action: Execute Approve Order API call
  const executeApproveOrder = async (orderId: number) => {
    try {
      if (orderId >= 100) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'approved' } : o));
        showToast('Order approved successfully!');
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: 'approved' } : null);
        }
        return;
      }
      await api.patch(`/api/orders/${orderId}/approve`);
      showToast('Order approved successfully!');
      fetchOrdersData();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: 'approved' } : null);
      }
    } catch (err: any) {
      console.error('Approve order error:', err);
      showToast(err.response?.data?.message || 'Failed to approve order.', 'error');
    }
  };

  // Action: Execute Reject Order API call
  const executeRejectOrder = async (orderId: number) => {
    try {
      if (orderId >= 100) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'rejected' } : o));
        showToast('Order rejected & buyer refunded successfully!');
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: 'rejected' } : null);
        }
        return;
      }
      await api.patch(`/api/orders/${orderId}/reject`);
      showToast('Order rejected & buyer refunded successfully!');
      fetchOrdersData();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: 'rejected' } : null);
      }
    } catch (err: any) {
      console.error('Reject order error:', err);
      showToast(err.response?.data?.message || 'Failed to reject order.', 'error');
    }
  };

  // Action: Execute Ship Product API call
  const executeShipOrder = async (orderId: number) => {
    try {
      if (orderId >= 100) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'shipped' } : o));
        showToast('Order marked as shipped successfully!');
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: 'shipped' } : null);
        }
        return;
      }
      await api.patch(`/api/orders/${orderId}/ship`);
      showToast('Order marked as shipped successfully!');
      fetchOrdersData();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: 'shipped' } : null);
      }
    } catch (err: any) {
      console.error('Ship order error:', err);
      showToast(err.response?.data?.message || 'Failed to update shipping status.', 'error');
    }
  };

  // Action: Trigger Purchase Proof modal
  const handleOpenProofModal = (orderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setProofOrderId(orderId);
    setProofDescription('');
    setProofFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setShowProofModal(true);
  };

  // Action: Submit Purchase Proof & transition to 'purchased'
  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofOrderId || (!proofFile && proofOrderId < 100)) {
      showToast('Please select a receipt photo file.', 'error');
      return;
    }

    try {
      setUploadingProof(true);

      if (proofOrderId >= 100) {
        setTimeout(() => {
          setOrders(prev => prev.map(o => o.id === proofOrderId ? { ...o, status: 'purchased' } : o));
          const newMockProof = {
            _id: Math.random().toString(),
            order_id: proofOrderId,
            proof_type: 'purchase',
            photo_url: previewUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&fit=crop&q=80',
            uploader_type: 'traveler',
            description: proofDescription || 'Valid purchase receipt.'
          };
          setProofs(prev => [...prev, newMockProof]);
          showToast('Receipt uploaded & status updated successfully!');
          handleCloseProofModal();
          if (selectedOrder?.id === proofOrderId) {
            handleOpenDetail({ ...selectedOrder, status: 'purchased' });
          }
        }, 500);
        return;
      }

      // 1. Upload Bukti Foto (FormData containing the photo file, type, and description)
      const formData = new FormData();
      if (proofFile) {
        formData.append('photo', proofFile);
      }
      formData.append('proof_type', 'purchase');
      formData.append('description', proofDescription || 'Valid purchase receipt.');

      await api.post(`/api/orders/${proofOrderId}/proofs`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // 2. Transition Status to Purchased
      await api.patch(`/api/orders/${proofOrderId}/purchased`);

      showToast('Receipt uploaded & status updated successfully!');
      handleCloseProofModal();
      fetchOrdersData();

      // Update detail view if open
      if (selectedOrder?.id === proofOrderId) {
        handleOpenDetail({ ...selectedOrder, status: 'purchased' });
      }
    } catch (err: any) {
      console.error('Upload proof & purchase error:', err);
      showToast(err.response?.data?.message || 'Failed to upload purchase receipt.', 'error');
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
      const prodName = (order.product_name || getProductDetails(order.product_id).name).toLowerCase();
      const buyerName = (order.buyer_name || getBuyerName(order.buyer_id)).toLowerCase();
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
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="Nitipin Logo" className="h-8 w-auto object-contain" />
              <h1 className="text-2xl font-bold tracking-tight text-white leading-none">Nitipin</h1>
            </div>
            <p className="text-xs text-blue-200/80 mt-1.5 font-medium">Traveler Dashboard</p>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-semibold text-[#1e53e6] tracking-tight">Orders</h2>
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder-gray-400 text-gray-800 bg-white font-normal shadow-sm"
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
                className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-[#1e53e6]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
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
              <h4 className="text-lg font-semibold text-gray-900">No Orders Found</h4>
              <p className="text-sm text-gray-600 mt-2 font-normal">
                {activeTab === 'pending_review'
                  ? 'There are currently no new orders requiring your approval.'
                  : 'All of your incoming orders will be listed on this page.'}
              </p>
            </div>
          ) : (
            /* ORDERS GRID/LIST */
            <div className="space-y-6">
              {filteredOrders.map((order) => {
                const prodName = order.product_name || getProductDetails(order.product_id).name;
                const prodPhotoUrl = order.photo_url || getProductDetails(order.product_id).photoUrl;
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
                          src={prodPhotoUrl}
                          alt={prodName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&fit=crop&q=80';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusBadgeStyle(order.status)}`}>
                            {getStatusLabelText(order.status)}
                          </span>
                          <span className="text-xs font-normal text-gray-400">Order #{order.id}</span>
                        </div>
                        <h4 className="text-base font-semibold text-gray-900 truncate mt-1">{prodName}</h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1 font-normal">
                          <span>Buyer: <strong className="text-gray-700 font-semibold">{order.buyer_name || getBuyerName(order.buyer_id)}</strong></span>
                          <span className="hidden sm:inline text-gray-300">•</span>
                          <span>Qty: <strong className="text-gray-700 font-semibold">{order.quantity} pcs</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Price & Dynamic Action Buttons */}
                    <div className="flex flex-row md:flex-col justify-between items-center md:items-end w-full md:w-auto shrink-0 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0 gap-4">
                      {/* Price breakdown */}
                      <div className="text-left md:text-right">
                        <p className="text-[11px] font-normal text-gray-400 uppercase tracking-wider leading-none">Total Payment</p>
                        <h3 className="text-xl font-semibold text-gray-900 mt-1">{formatMockupIDR(order.total_price)}</h3>
                      </div>

                      {/* Action buttons strictly mapped per status */}
                      <div className="flex items-center gap-2">
                        {order.status === 'pending_review' && (
                          <>
                            <button
                              onClick={(e) => handleRejectOrder(order.id, e)}
                              className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl transition duration-150 cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              onClick={(e) => handleApproveOrder(order.id, e)}
                              className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-xl transition duration-150 shadow-sm shadow-blue-100 cursor-pointer"
                            >
                              Approve
                            </button>
                          </>
                        )}
                        {order.status === 'approved' && (
                          <button
                            onClick={(e) => handleOpenProofModal(order.id, e)}
                            className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-xl transition duration-150 shadow-sm cursor-pointer"
                          >
                            Mark as Purchased
                          </button>
                        )}
                        {order.status === 'purchased' && (
                          <button
                            onClick={(e) => handleShipOrder(order.id, e)}
                            className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-xl transition duration-150 shadow-sm cursor-pointer"
                          >
                            Ship Product
                          </button>
                        )}
                        {order.status === 'shipped' && (
                          <span className="text-xs text-gray-400 font-semibold italic bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">
                            Awaiting Delivery Confirmation
                          </span>
                        )}
                        {order.status === 'completed' && (
                          <span className="text-xs text-green-600 font-semibold bg-green-50 border border-green-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
                            Escrow Funds Released
                          </span>
                        )}
                        {(order.status === 'rejected' || order.status === 'cancelled') && (
                          <span className="text-xs text-rose-500 font-semibold bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl">
                            Completed & Refunded
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-zoom-in my-8 max-h-[90vh]">
            {/* Header Sticky */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-slate-50">
              <div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${getStatusBadgeStyle(selectedOrder.status)}`}>
                    {getStatusLabelText(selectedOrder.status)}
                  </span>
                  <span className="text-xs font-normal text-gray-400">Order ID #{selectedOrder.id}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mt-1">Order Details Summary</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200/50 rounded-xl transition duration-150 cursor-pointer"
              >
                <Icons.Close />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              
              {/* Stepper Progress Timeline (Horizontal stepper modeled exactly after UI) */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-gray-100/80 shadow-sm shrink-0">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: 'Pending Review', key: 'pending_review', num: 1 },
                    { label: 'Approved', key: 'approved', num: 2 },
                    { label: 'Purchased', key: 'purchased', num: 3 },
                    { label: 'Shipped', key: 'shipped', num: 4 },
                    { label: 'Completed', key: 'completed', num: 5 }
                  ].map((step, idx) => {
                    const status = selectedOrder.status;
                    let currentStepIdx = 0;
                    if (status === 'approved') currentStepIdx = 1;
                    else if (status === 'purchased') currentStepIdx = 2;
                    else if (status === 'shipped') currentStepIdx = 3;
                    else if (status === 'completed') currentStepIdx = 4;
                    else if (status === 'rejected' || status === 'cancelled') currentStepIdx = -1;

                    const isCompleted = idx < currentStepIdx;
                    const isActive = idx === currentStepIdx;
                    const isCanceled = currentStepIdx === -1;

                    return (
                      <div key={step.key} className="flex flex-col items-center text-center p-2 rounded-xl bg-white border border-gray-100 shadow-sm relative">
                        {/* Bubble Icon */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs shadow-sm transition-all ${
                          isCanceled
                            ? 'bg-rose-100 text-rose-600 border border-rose-200'
                            : isCompleted
                            ? 'bg-emerald-500 text-white'
                            : isActive
                            ? 'bg-[#1e53e6] text-white shadow-blue-100 shadow-md scale-105'
                            : 'bg-slate-50 text-gray-400'
                        }`}>
                          {isCompleted ? '✓' : step.num}
                        </div>
                        {/* Label text */}
                        <span className={`text-[11px] font-semibold mt-2 ${
                          isCanceled ? 'text-rose-500' : isActive ? 'text-[#1e53e6]' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {step.label}
                        </span>
                        <span className="text-[9px] text-gray-400 mt-0.5 font-normal uppercase tracking-wider">
                          {isActive ? 'Active' : isCompleted ? 'Completed' : 'Queue'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TWO COLUMN GRID FOR HIGH FIDELITY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                
                {/* COLUMN LEFT: Product details, Escrow payment, & receipt proofs */}
                <div className="space-y-6">
                  {/* Product Details Box */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Requested Product Details</h4>
                    <div className="flex gap-4 items-start">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-gray-100 bg-slate-50 flex items-center justify-center shadow-sm">
                        <img
                          src={selectedOrder.photo_url || getProductDetails(selectedOrder.product_id).photoUrl}
                          alt={selectedOrder.product_name || getProductDetails(selectedOrder.product_id).name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-base font-semibold text-gray-900 leading-tight">{selectedOrder.product_name || getProductDetails(selectedOrder.product_id).name}</h4>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2 font-normal">{getProductDetails(selectedOrder.product_id).description}</p>
                        <div className="bg-slate-50 rounded-xl p-2.5 mt-3 flex justify-between items-center border border-slate-100">
                          <span className="text-xs text-gray-500 font-semibold">Product Price:</span>
                          <span className="text-sm font-semibold text-[#1e53e6]">
                            {formatMockupIDR(Number(selectedOrder.total_price) / selectedOrder.quantity || getProductDetails(selectedOrder.product_id).price)} × {selectedOrder.quantity} pcs
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Escrow Details */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Secure Escrow Payment (Rekber)</h4>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="text-[10px] font-normal text-gray-600 uppercase tracking-wider">Total Transaction Value</p>
                        <h3 className="text-2xl font-semibold text-gray-900 mt-1">{formatMockupIDR(selectedOrder.total_price)}</h3>
                      </div>
                      {loadingDetails ? (
                        <div className="h-8 w-24 bg-slate-200 rounded-xl animate-pulse" />
                      ) : escrowStatus ? (
                        <div className="text-right">
                          <span className={`text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border ${
                            escrowStatus.status === 'released'
                              ? 'bg-green-50 text-green-700 border-green-200 shadow-green-50/50'
                              : escrowStatus.status === 'refunded'
                              ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-rose-50/50'
                              : 'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-50/50'
                          }`}>
                            {escrowStatus.status === 'hold' ? 'On Hold' : escrowStatus.status}
                          </span>
                          <p className="text-[9px] text-gray-400 font-normal mt-1.5">ESCROW PROTECTION ACTIVE</p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Bukti Foto Transaksi */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Purchase Receipt Photo</h4>
                    {loadingDetails ? (
                      <div className="h-16 bg-slate-50 rounded-xl animate-pulse" />
                    ) : proofs.length === 0 ? (
                      <div className="bg-slate-50 text-center rounded-2xl p-6 border border-slate-100 text-xs font-normal text-gray-400 flex flex-col items-center gap-2">
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        No purchase receipt uploaded yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {proofs.map((proof) => (
                          <div key={proof._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:scale-[1.02] transition-all">
                            <div className="h-32 bg-gray-50 overflow-hidden relative group">
                              <img
                                src={proof.photo_url}
                                alt={proof.proof_type}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer" onClick={() => window.open(proof.photo_url, '_blank')}>
                                <span className="bg-white/90 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-gray-800 shadow">Zoom Receipt</span>
                              </div>
                              <span className="absolute top-2 left-2 text-[9px] font-semibold px-2 py-0.5 rounded-md uppercase border tracking-wider bg-white text-blue-600 border-blue-100 shadow-sm">
                                {proof.proof_type}
                              </span>
                            </div>
                            <div className="p-3">
                              <p className="text-[9px] text-gray-400 uppercase font-normal tracking-wider">
                                By {proof.uploader_type}
                              </p>
                              <p className="text-xs text-gray-700 font-normal mt-0.5 leading-tight">
                                {proof.description || 'Valid purchase receipt.'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* COLUMN RIGHT: Shipping address, Buyer details, & checklist */}
                <div className="space-y-6">
                  {/* Buyer & Shipping Card */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Buyer Identity & Shipping Info</h4>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-semibold text-lg shrink-0">
                        {(selectedOrder.buyer_name || getBuyerName(selectedOrder.buyer_id)).charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-base font-semibold text-gray-900 leading-none">{selectedOrder.buyer_name || getBuyerName(selectedOrder.buyer_id)}</h5>
                        {selectedOrder.buyer_email && (
                          <p className="text-xs text-gray-500 mt-1 font-normal">{selectedOrder.buyer_email} {selectedOrder.buyer_phone ? `• ${selectedOrder.buyer_phone}` : ''}</p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1 font-normal">ACTIVE BUYER</p>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3 items-start">
                          <Icons.Location />
                          <div className="min-w-0">
                            <p className="text-[11px] font-normal text-gray-600 uppercase tracking-wider">Shipping Address</p>
                            <p className="text-xs text-gray-600 mt-1.5 font-normal leading-relaxed">
                              {selectedOrder.shipping_address 
                                ? `${selectedOrder.shipping_address}, ${selectedOrder.shipping_city || ''} (${selectedOrder.shipping_postal_code || ''})` 
                                : getShippingAddress(selectedOrder.shipping_address_id)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Traveler Checklist Card */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Processing Steps Checklist</h4>
                    
                    <div className="space-y-3.5">
                      {[
                        { label: 'Confirm Order Approval', done: selectedOrder.status !== 'pending_review' },
                        { label: 'Purchase & Upload Original Receipt', done: ['purchased', 'shipped', 'completed'].includes(selectedOrder.status) },
                        { label: 'Ship Product via Logistics Courier', done: ['shipped', 'completed'].includes(selectedOrder.status) },
                        { label: 'Escrow Funds Disbursed to Wallet', done: selectedOrder.status === 'completed' }
                      ].map((task, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            task.done 
                              ? 'bg-emerald-500 border-emerald-500 text-white text-[10px] font-semibold' 
                              : 'border-gray-200 bg-slate-50'
                          }`}>
                            {task.done && '✓'}
                          </div>
                          <span className={`text-xs font-normal ${task.done ? 'text-gray-900 line-through decoration-gray-300' : 'text-gray-500'}`}>
                            {task.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pro-Tip Box */}
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-3">
                    <span className="text-blue-500 text-xl font-semibold shrink-0">💡</span>
                    <div>
                      <h5 className="text-xs font-semibold text-blue-900">Tips for Travelers</h5>
                      <p className="text-[11px] text-blue-800/80 leading-relaxed font-normal mt-1">
                        Ensure you photograph the shopping receipt in clear lighting conditions. A valid receipt speeds up the Escrow verification process by Nitipin.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Sticky Action Footer */}
            <div className="px-8 py-5 border-t border-gray-100 shrink-0 bg-slate-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition duration-150 cursor-pointer shadow-sm"
              >
                Close Details
              </button>
              {selectedOrder.status === 'pending_review' && (
                <>
                  <button
                    onClick={(e) => { handleRejectOrder(selectedOrder.id, e); }}
                    className="px-6 py-3 border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-semibold rounded-xl transition duration-150 cursor-pointer shadow-sm"
                  >
                    Reject Order
                  </button>
                  <button
                    onClick={(e) => { handleApproveOrder(selectedOrder.id, e); }}
                    className="px-6 py-3 bg-[#1e53e6] hover:bg-[#1541b8] text-white text-sm font-semibold rounded-xl transition duration-150 shadow-md shadow-blue-100 cursor-pointer"
                  >
                    Approve Order
                  </button>
                </>
              )}
              {selectedOrder.status === 'approved' && (
                <button
                  onClick={(e) => { handleOpenProofModal(selectedOrder.id, e); }}
                  className="px-6 py-3 bg-[#1e53e6] hover:bg-[#1541b8] text-white text-sm font-semibold rounded-xl transition duration-150 shadow-md shadow-blue-100 cursor-pointer"
                >
                  Mark as Purchased & Upload Receipt
                </button>
              )}
              {selectedOrder.status === 'purchased' && (
                <button
                  onClick={(e) => { handleShipOrder(selectedOrder.id, e); }}
                  className="px-6 py-3 bg-[#1e53e6] hover:bg-[#1541b8] text-white text-sm font-semibold rounded-xl transition duration-150 shadow-md shadow-blue-100 cursor-pointer"
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
            <h3 className="text-lg font-semibold text-gray-900 tracking-tight mb-4 shrink-0">
              Upload Proof of Purchase
            </h3>

            <form onSubmit={handleUploadProof} className="flex flex-col flex-1 overflow-hidden">
              
              {/* Form Content */}
              <div className="space-y-4 overflow-y-auto flex-1 pr-1">
                <p className="text-xs text-gray-400 font-normal">
                  Please upload a photo of the purchase receipt for this item to update the status.
                </p>

                {/* Drag & Drop File Upload Area */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Receipt Photo</label>
                  
                  {!previewUrl ? (
                    <label
                      htmlFor="proof-file"
                      className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-blue-500 rounded-2xl p-6 cursor-pointer bg-white transition-all hover:bg-blue-50/20 group"
                    >
                      <div className="flex flex-col items-center justify-center text-center">
                        <svg
                          className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-colors duration-150 mb-2"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                          />
                        </svg>
                        <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600 transition-colors duration-150">
                          Upload receipt image
                        </span>
                        <span className="text-[10px] text-gray-400 mt-1">
                          Drag and drop or click to browse
                        </span>
                      </div>
                      <input
                        type="file"
                        id="proof-file"
                        accept="image/*"
                        required
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-inner group">
                      <img
                        src={previewUrl}
                        alt="Receipt Preview"
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="bg-red-600 hover:bg-red-700 text-white rounded-lg p-2 transition duration-150 cursor-pointer shadow"
                          title="Remove photo"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-500 truncate max-w-[200px]">
                          {proofFile?.name}
                        </span>
                        <span className="text-[9px] font-extrabold text-gray-400 bg-white border border-gray-100 px-1.5 py-0.5 rounded">
                          {proofFile ? (proofFile.size / 1024).toFixed(1) : 0} KB
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-normal text-gray-600 mb-1">Additional Notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Purchased at Kyoto Station supermarket..."
                    value={proofDescription}
                    onChange={(e) => setProofDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder-gray-400 text-gray-900 font-normal bg-white h-16 resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-3 mt-5 pt-2 border-t border-gray-100 shrink-0">
                <button
                  type="button"
                  onClick={handleCloseProofModal}
                  className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-500 font-bold text-xs rounded-xl py-2 px-5 transition duration-150 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingProof}
                  className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-xs rounded-xl py-2 px-5 transition duration-150 shadow-sm disabled:opacity-75 flex items-center justify-center gap-2 cursor-pointer"
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
         CONFIRMATION MODALS SYSTEM
         ========================================== */}
      {/* 1. APPROVE CONFIRMATION MODAL */}
      {confirmApproveId !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 flex flex-col items-center text-center animate-zoom-in">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 shrink-0 shadow-sm shadow-blue-50">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Approve Order</h3>
            <p className="text-xs text-gray-600 font-normal leading-relaxed mt-2">
              Are you sure you want to approve this order? Once approved, the buyer will lock their escrow payment.
            </p>
            <div className="flex items-center gap-3 w-full mt-6">
              <button
                onClick={() => setConfirmApproveId(null)}
                className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold text-xs py-3 rounded-xl transition duration-150 cursor-pointer shadow-sm animate-click"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  executeApproveOrder(confirmApproveId);
                  setConfirmApproveId(null);
                }}
                className="flex-1 bg-[#1e53e6] hover:bg-[#1541b8] text-white font-semibold text-xs py-3 rounded-xl transition duration-150 shadow-md shadow-blue-100 cursor-pointer"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. REJECT CONFIRMATION MODAL */}
      {confirmRejectId !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 flex flex-col items-center text-center animate-zoom-in">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-4 shrink-0 shadow-sm shadow-rose-50">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Reject Order</h3>
            <p className="text-xs text-gray-600 font-normal leading-relaxed mt-2">
              Are you sure you want to reject this order? The buyer will receive a full refund of their funds immediately.
            </p>
            <div className="flex items-center gap-3 w-full mt-6">
              <button
                onClick={() => setConfirmRejectId(null)}
                className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold text-xs py-3 rounded-xl transition duration-150 cursor-pointer shadow-sm animate-click"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  executeRejectOrder(confirmRejectId);
                  setConfirmRejectId(null);
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs py-3 rounded-xl transition duration-150 shadow-md shadow-rose-100 cursor-pointer"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. SHIP CONFIRMATION MODAL */}
      {confirmShipId !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 flex flex-col items-center text-center animate-zoom-in">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4 shrink-0 shadow-sm shadow-amber-50">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177V3.75A1.5 1.5 0 0012.75 2.25h-1.5a1.5 1.5 0 00-1.5 1.5v4.877m4.5 0A2.25 2.25 0 0013.5 6h-3a2.25 2.25 0 00-2.25 2.25m7.5 0h-7.5" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Mark as Shipped</h3>
            <p className="text-xs text-gray-600 font-normal leading-relaxed mt-2">
              Are you sure you want to mark this product as shipped? Please ensure tracking details are shared with the buyer.
            </p>
            <div className="flex items-center gap-3 w-full mt-6">
              <button
                onClick={() => setConfirmShipId(null)}
                className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold text-xs py-3 rounded-xl transition duration-150 cursor-pointer shadow-sm animate-click"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  executeShipOrder(confirmShipId);
                  setConfirmShipId(null);
                }}
                className="flex-1 bg-[#1e53e6] hover:bg-[#1541b8] text-white font-semibold text-xs py-3 rounded-xl transition duration-150 shadow-md shadow-blue-100 cursor-pointer"
              >
                Ship
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
         E. TOAST NOTIFICATIONS (CRUD DESIGN ALIGNED)
         ========================================== */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg border ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'} animate-fade-in flex items-center gap-3 transition-all`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="font-semibold text-sm">{toast.message}</span>
        </div>
      )}

    </div>
  );
}

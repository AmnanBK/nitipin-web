import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { TravelerProfile, Product } from '../types/api';

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
  Tag: () => (
    <svg className="w-4 h-4 mr-1 text-[#1e53e6] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Close: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
};

export default function Catalogue() {
  const { user } = useAuth();

  // State Management
  const [profile, setProfile] = useState<TravelerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Form Inputs State
  const [formName, setFormName] = useState<string>('');
  const [formPrice, setFormPrice] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formPhotoUrl, setFormPhotoUrl] = useState<string>('');
  const [selectedProductFile, setSelectedProductFile] = useState<File | null>(null);

  // Fetch Catalogue and Profile
  const fetchCatalogueData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);

      const [profileRes, productsRes] = await Promise.all([
        api.get(`/api/travelers/${user.id}`),
        api.get(`/api/products?traveler_id=${user.id}`)
      ]);

      setProfile(profileRes.data.data);
      setProducts(productsRes.data.data || []);
    } catch (err: any) {
      console.error('Fetch Catalogue Error:', err);
      setError(err.response?.data?.message || 'Failed to sync catalogue with the backend service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogueData();
  }, [user]);

  // Open Modal for Create
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormName('');
    setFormPrice('');
    setFormDescription('');
    setFormPhotoUrl('');
    setSelectedProductFile(null);
    setModalError(null);
    setShowModal(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.product_name);
    // Parse price to string
    const rawPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    setFormPrice(String(Math.round(rawPrice || 0)));
    setFormDescription(product.description || '');
    setFormPhotoUrl(product.photo_url || '');
    setSelectedProductFile(null);
    setModalError(null);
    setShowModal(true);
  };

  // Handle Create or Update Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrice) {
      setModalError('Nama produk dan harga wajib diisi');
      return;
    }

    try {
      setModalLoading(true);
      setModalError(null);

      const payload = {
        product_name: formName,
        price: Number(formPrice),
        description: formDescription || null,
        photo_url: formPhotoUrl || null
      };

      if (editingProduct) {
        // UPDATE (PUT /api/products/:id)
        await api.put(`/api/products/${editingProduct.id}`, payload);
        showToast('Product updated successfully!');
      } else {
        // CREATE (POST /api/products)
        await api.post('/api/products', payload);
        showToast('Product added successfully!');
      }

      // Success, close modal and reload list
      setShowModal(false);
      fetchCatalogueData();
    } catch (err: any) {
      console.error('Form Submit Error:', err);
      setModalError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setModalLoading(false);
    }
  };

  // Trigger Delete Confirmation Modal
  const handleDeleteProduct = (id: number) => {
    setDeleteProductId(id);
  };

  // Confirm Delete Product (DELETE /api/products/:id)
  const confirmDeleteProduct = async () => {
    if (!deleteProductId) return;
    try {
      setModalLoading(true);
      setError(null);
      await api.delete(`/api/products/${deleteProductId}`);
      setDeleteProductId(null);
      fetchCatalogueData();
      showToast('Product deleted successfully!');
    } catch (err: any) {
      console.error('Delete Product Error:', err);
      setError(err.response?.data?.message || 'Failed to delete product. Please check if there are any active orders for this product.');
      setDeleteProductId(null);
    } finally {
      setModalLoading(false);
    }
  };

  // Format Currency (mockup format: e.g., Rp200.000, Rp100.000 without spaces)
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
          
          {/* Menu Links (6 Clean Navigation links - My Catalogue Active!) */}
          <nav className="space-y-1 mt-4">
            <Link to="/dashboard" className="text-white hover:bg-white/10 px-4 py-2.5 rounded-lg flex items-center gap-3 transition-all text-sm font-medium">
              <Icons.Dashboard />
              <span>Dashboard</span>
            </Link>
            <Link to="/catalogue" className="bg-white text-[#1e53e6] font-semibold px-4 py-2.5 rounded-lg flex items-center gap-3 shadow-sm text-sm">
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
          
          {/* HEADER MAIN WITH ADD PRODUCT BUTTON */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-semibold text-[#1e53e6] tracking-tight">My Catalogue</h2>
              <p className="text-sm text-gray-400 mt-1 font-medium">Manage your product</p>
            </div>
            
            <button
              onClick={handleOpenCreate}
              className="bg-[#1e53e6] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Icons.Plus />
              <span>New Product</span>
            </button>
          </div>

          <hr className="border-gray-200 mb-8" />

          {/* Action error feedback banner */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm font-semibold">{error}</div>
              </div>
              <button onClick={fetchCatalogueData} className="px-3 py-1 bg-rose-200 hover:bg-rose-300 text-rose-900 rounded-lg text-xs font-bold transition-all">Reload</button>
            </div>
          )}

          {loading ? (
            /* ==========================================
               LOADING PLACEHOLDERS (SKELETONS)
               ========================================== */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 space-y-4">
                  <div className="h-44 bg-slate-200 rounded-xl w-full" />
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="flex gap-2">
                    <div className="h-10 bg-slate-200 rounded-lg flex-1" />
                    <div className="h-10 bg-slate-200 rounded-lg w-10" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* ==========================================
               EMPTY STATE
               ========================================== */
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-xl mx-auto mt-12">
              <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-6">
                <Icons.Package />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Katalog Anda Masih Kosong</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Mulai pasang barang belanjaan luar negeri Anda agar pembeli dapat melakukan jastip dengan mudah!
              </p>
              <button
                onClick={handleOpenCreate}
                className="bg-[#1e53e6] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all"
              >
                Tambah Produk Pertama
              </button>
            </div>
          ) : (
            /* ==========================================
               PRODUCT CATALOG GRID
               ========================================== */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {products.map(product => {
                const displayPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;

                return (
                  <div 
                    key={product.id}
                    className="bg-white rounded-2xl shadow-md shadow-gray-200/40 border border-gray-100/80 overflow-hidden flex flex-col justify-between hover:scale-[1.01] transition-all"
                  >
                    {/* Image top container */}
                    <div className="relative h-48 w-full bg-slate-100 shrink-0">
                      {product.photo_url ? (
                        <img 
                          src={product.photo_url} 
                          alt={product.product_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback default visual on image error
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-300">
                          <Icons.Package />
                        </div>
                      )}
                    </div>

                    {/* Details content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="mb-4">
                        <h4 className="text-gray-900 font-semibold text-lg leading-tight line-clamp-2" title={product.product_name}>
                          {product.product_name}
                        </h4>
                        
                        {product.description && (
                          <p className="text-gray-600 text-sm font-normal mt-1.5 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>

                      <div>
                        {/* Price wrapper with Tag Icon */}
                        <div className="flex items-center text-sm font-semibold text-[#1e53e6] mb-4 bg-blue-50/50 p-2 rounded-lg inline-flex w-full">
                          <Icons.Tag />
                          <span>{formatMockupIDR(displayPrice)}</span>
                        </div>

                        {/* Card actions: Edit (80%) and Delete (20%) */}
                        <div className="flex items-center gap-2 w-full">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="bg-blue-50 hover:bg-blue-100 text-[#1e53e6] py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all flex-1 cursor-pointer"
                          >
                            <Icons.Edit />
                            <span>Edit</span>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                            title="Delete Product"
                          >
                            <Icons.Trash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
}

        </div>
      </main>

      {/* ==========================================
         C. MODAL DIALOG FORM (CREATE / EDIT)
         ========================================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#f8f9fa] rounded-2xl w-full max-w-[440px] max-h-[90vh] shadow-xl p-6 flex flex-col overflow-hidden">
            
            {/* Modal Title (Sticky) */}
            <h3 className="text-lg font-semibold text-gray-900 tracking-tight mb-4 shrink-0">
              {editingProduct ? 'Edit Product' : 'New Product'}
            </h3>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
              
              {/* Scrollable Form Content */}
              <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                {modalError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{modalError}</span>
                  </div>
                )}

                {/* Input: Product Name */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-normal text-gray-600 mb-1">Product Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Matcha KitKat Premium"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150 text-gray-900 placeholder-gray-400 font-normal bg-white"
                  />
                </div>

                {/* Input: Price */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-normal text-gray-600 mb-1">Price</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 120000"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150 text-gray-900 placeholder-gray-400 font-normal bg-white"
                  />
                </div>

                {/* Input: Description */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-normal text-gray-600 mb-1">Description</label>
                  <textarea 
                    rows={2}
                    placeholder="Detail description of product..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150 text-gray-900 placeholder-gray-400 font-normal bg-white h-20 resize-none"
                  />
                </div>

                {/* Input: Attach Picture File */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-normal text-gray-600 mb-1">Product Image</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-5 text-center hover:border-blue-500 hover:bg-blue-50/20 transition-all relative cursor-pointer">
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedProductFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormPhotoUrl(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-[#1e53e6]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 3.75 0 11-.75 0 .375 3.75 0 01.75 0z" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-gray-700">
                        {selectedProductFile ? selectedProductFile.name : 'Attach a product image file'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        Supports JPG, PNG, WEBP
                      </span>
                    </div>
                  </div>

                  {formPhotoUrl && (
                    <div className="mt-2 relative h-16 w-28 border border-gray-100 rounded-lg overflow-hidden bg-white shrink-0 shadow-sm">
                      <img 
                        src={formPhotoUrl} 
                        alt="Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons (Sticky Bottom) */}
              <div className="flex justify-end items-center gap-3 mt-4 pt-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-white hover:bg-gray-50 border border-gray-200 text-blue-600 hover:text-blue-700 font-bold text-sm rounded-xl py-2.5 px-8 transition duration-150 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white font-bold text-sm rounded-xl py-2.5 px-8 transition duration-150 shadow-sm disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {modalLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>{editingProduct ? 'Update Product' : 'Add Product'}</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==========================================
         D. CUSTOM CUSTOM DELETE CONFIRMATION MODAL
         ========================================== */}
      {deleteProductId !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#f8f9fa] rounded-2xl w-full max-w-[380px] shadow-xl p-8 flex flex-col items-center text-center">
            
            {/* Trash Can Outlined Icon (crimson color #c22d2d) */}
            <svg className="w-20 h-20 text-[#c22d2d] mb-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>

            {/* Modal Body Warning Text */}
            <p className="text-gray-600 font-normal text-lg leading-relaxed mb-8 max-w-[280px]">
              Are you sure you want to delete this data?
            </p>

            {/* Modal Actions */}
            <div className="flex justify-center items-center gap-4 w-full">
              <button
                type="button"
                onClick={() => setDeleteProductId(null)}
                className="bg-white hover:bg-gray-50 border border-gray-200 w-[120px] text-gray-900 font-bold text-sm rounded-xl py-3 text-center transition duration-150 cursor-pointer"
              >
                No
              </button>
              <button
                type="button"
                disabled={modalLoading}
                onClick={confirmDeleteProduct}
                className="bg-[#b02a2a] hover:bg-[#962121] active:bg-[#7f1d1d] w-[120px] text-white font-bold text-sm rounded-xl py-3 text-center transition duration-150 shadow-sm cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {modalLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Yes</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==========================================
         E. TOAST NOTIFICATION
         ========================================== */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg border ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'} animate-fade-in flex items-center gap-3 transition-all`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

    </div>
  );
}

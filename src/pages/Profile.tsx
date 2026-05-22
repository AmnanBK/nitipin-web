import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { TravelerProfile, Country } from '../types/api';

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
  EditPencil: () => (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  )
};

export default function Profile() {
  const { user, logout, updateUser } = useAuth();

  // Profile data & loading states
  const [profile, setProfile] = useState<TravelerProfile | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>('');
  const [countryId, setCountryId] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  // Profile Photo URL Modal states
  const [showPhotoModal, setShowPhotoModal] = useState<boolean>(false);
  const [tempPhotoUrl, setTempPhotoUrl] = useState<string>('');
  const [savingPhotoUrl, setSavingPhotoUrl] = useState<boolean>(false);

  // Mobile sidebar view state
  const [showMobileSidebar, setShowMobileSidebar] = useState<boolean>(false);

  // Toast system
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch traveler details & countries
  const fetchProfileData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);

      const [profileRes, countriesRes] = await Promise.all([
        api.get(`/api/travelers/${user.id}`),
        api.get('/api/countries')
      ]);

      const profData: TravelerProfile = profileRes.data.data;
      setProfile(profData);
      setCountries(countriesRes.data.data || []);

      // Populate form values
      setName(profData.name || '');
      setPhone(profData.phone || '');
      setBio(profData.bio || '');
      setProfilePhotoUrl(profData.profile_photo || '');
      setCountryId(profData.country_id ? profData.country_id.toString() : '');
    } catch (err: any) {
      console.error('Fetch Profile Data Error:', err);
      setError(err.response?.data?.message || 'Failed to sync data with the backend microservices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  // Handle Account Status toggle (active / inactive)
  const handleStatusToggle = async () => {
    if (!profile || !user?.id) return;
    const nextStatus = profile.account_status === 'active' ? 'inactive' : 'active';

    // Enforce business rule: new accounts are inactive and must select/save a country (region) before activating
    if (nextStatus === 'active' && !profile.country_id) {
      showToast('You must select and save a country (region) under Personal Information first to activate your account!', 'error');
      return;
    }

    try {
      const res = await api.patch(`/api/travelers/${user.id}/status`, {
        account_status: nextStatus
      });
      if (res.data.status === 'success') {
        setProfile(prev => prev ? { ...prev, account_status: nextStatus } : null);
        showToast(`Account status updated to ${nextStatus} successfully!`);
      }
    } catch (err: any) {
      console.error('Toggle status error:', err);
      showToast(err.response?.data?.message || 'Failed to update account status.', 'error');
    }
  };

  // Handle Avatar Click - Open Modal
  const handleAvatarClick = () => {
    setTempPhotoUrl(profilePhotoUrl || '');
    setShowPhotoModal(true);
  };

  // Save/Apply Profile Photo Link via PUT API
  const handleApplyPhotoUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    try {
      setSavingPhotoUrl(true);
      const res = await api.put(`/api/travelers/${user.id}`, {
        profile_photo: tempPhotoUrl.trim() || null
      });
      if (res.data.status === 'success') {
        const updatedProf: TravelerProfile = res.data.data;
        setProfile(updatedProf);
        setProfilePhotoUrl(updatedProf.profile_photo || '');
        showToast('Profile photo updated successfully!');
        setShowPhotoModal(false);
      }
    } catch (err: any) {
      console.error('Update photo URL error:', err);
      showToast(err.response?.data?.message || 'Failed to update profile photo.', 'error');
    } finally {
      setSavingPhotoUrl(false);
    }
  };

  // Save Text Fields (Name, Phone, Country, Bio, Photo URL)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    try {
      setSaving(true);
      const body = {
        name,
        phone,
        bio,
        profile_photo: profilePhotoUrl || null,
        country_id: countryId ? Number(countryId) : null
      };

      const res = await api.put(`/api/travelers/${user.id}`, body);
      if (res.data.status === 'success') {
        const updatedProf: TravelerProfile = res.data.data;
        setProfile(updatedProf);
        setBio(updatedProf.bio || '');
        setProfilePhotoUrl(updatedProf.profile_photo || '');
        updateUser({ name: updatedProf.name });
        showToast('Personal information updated successfully!');
      }
    } catch (err: any) {
      console.error('Save profile error:', err);
      showToast(err.response?.data?.message || 'Failed to update personal information.', 'error');
    } finally {
      setSaving(false);
    }
  };

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
      <Link to="/sales-history" className="text-white hover:bg-white/10 px-4 py-2.5 rounded-lg flex items-center gap-3 transition-all text-sm font-medium">
        <Icons.History />
        <span>Sales History</span>
      </Link>
      <Link to="/reviews" className="text-white hover:bg-white/10 px-4 py-2.5 rounded-lg flex items-center gap-3 transition-all text-sm font-medium">
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

        {/* User Card - ACTIVE White Highlight on Profile Page */}
        <Link 
          to="/profile" 
          className="bg-white rounded-xl p-3.5 mx-1 flex items-center gap-3 shadow-md border border-white shrink-0 hover:scale-[1.01] transition-all cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full border border-blue-200 overflow-hidden flex items-center justify-center shrink-0 bg-blue-50 text-[#1e53e6]">
            {profile?.profile_photo ? (
              <img src={profile.profile_photo} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <Icons.User />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-extrabold text-sm leading-none text-[#1e53e6] truncate">
              {profile?.name || user?.name || 'Sarah'}
            </h4>
            <p className="text-gray-400 text-[11px] mt-1 truncate">
              {profile?.email || user?.email || 'sarah@email.com'}
            </p>
          </div>
        </Link>
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

            <Link 
              to="/profile"
              onClick={() => setShowMobileSidebar(false)}
              className="bg-white rounded-xl p-3.5 flex items-center gap-3 border border-white shadow-md cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full border border-blue-200 overflow-hidden flex items-center justify-center shrink-0 bg-blue-50 text-[#1e53e6]">
                {profile?.profile_photo ? (
                  <img src={profile.profile_photo} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Icons.User />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-sm leading-none text-[#1e53e6] truncate">
                  {profile?.name || user?.name || 'Sarah'}
                </h4>
                <p className="text-gray-400 text-[11px] mt-1 truncate">
                  {profile?.email || user?.email || 'sarah@email.com'}
                </p>
              </div>
            </Link>
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

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
          
          {/* Header Title Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-[#1e53e6] tracking-tight">Profile</h2>
            <p className="text-sm text-gray-400 mt-1 font-semibold">Manage your profile</p>
            <hr className="border-gray-200 mt-6" />
          </div>

          {/* Sync Errors */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm font-semibold">{error}</div>
              </div>
              <button onClick={fetchProfileData} className="px-3 py-1 bg-rose-200 hover:bg-rose-300 text-rose-900 rounded-lg text-xs font-bold transition-all">Reload</button>
            </div>
          )}

          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-40 bg-slate-200 rounded-2xl" />
              <div className="h-72 bg-slate-200 rounded-2xl" />
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* CARD 1: QUICK STATUS & AVATAR EDIT PANEL */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:scale-[1.002] transition-transform duration-100">
                
                <div className="flex items-center gap-6">
                  {/* Circle Avatar with Blue Pencil Overlay */}
                  <div className="relative group shrink-0">
                    <div 
                      onClick={handleAvatarClick}
                      className="w-24 h-24 rounded-full border border-gray-100 overflow-hidden shadow-sm bg-gray-50 flex items-center justify-center cursor-pointer relative animate-fade-in"
                    >
                      {profile?.profile_photo ? (
                        <img 
                          src={profile.profile_photo} 
                          alt="Avatar" 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-200" 
                        />
                      ) : (
                        <span className="text-gray-300"><Icons.User /></span>
                      )}
                    </div>
                    
                    {/* Floating blue circular pencil edit button */}
                    <button
                      onClick={handleAvatarClick}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-[#1e53e6] hover:bg-blue-700 active:scale-95 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white transition-all cursor-pointer animate-fade-in"
                      title="Edit Photo URL"
                    >
                      <Icons.EditPencil />
                    </button>
                  </div>
 
                  {/* Name and green toggle status */}
                  <div className="space-y-2.5">
                    <h3 className="text-2xl font-black text-gray-900 leading-none">
                      {profile?.name || user?.name || 'Sarah'}
                    </h3>
                    
                    {/* Green status toggle switch with clear status indicator labels */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Status:</span>
                      
                      <button
                        onClick={handleStatusToggle}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          profile?.account_status === 'active' ? 'bg-[#22c55e]' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            profile?.account_status === 'active' ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      <span className={`text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-md transition-all duration-150 ${
                        profile?.account_status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {profile?.account_status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Log Out Button */}
                <button
                  onClick={logout}
                  className="px-6 py-2.5 text-sm font-extrabold text-red-500 bg-transparent border border-red-250 hover:bg-red-50 rounded-xl transition duration-150 cursor-pointer shrink-0 md:self-center"
                >
                  Log Out
                </button>

              </div>

              {/* CARD 2: PERSONAL INFORMATION FORM PANEL */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
                
                <h3 className="text-lg font-black text-gray-900 mb-6 tracking-wide">
                  Personal Information
                </h3>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  
                  {/* 2x2 Grid for Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Name field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Sarah"
                        className="w-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl py-3 px-4 text-sm font-semibold text-gray-800 transition-all placeholder-gray-400"
                      />
                    </div>

                    {/* Email field (Disabled read-only) */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">E-mail</label>
                      <input
                        type="email"
                        disabled
                        value={profile?.email || user?.email || 'sarah@email.com'}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-semibold text-gray-400 cursor-not-allowed"
                      />
                    </div>

                    {/* Phone field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">Phone</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g., +6281234567890"
                        className="w-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl py-3 px-4 text-sm font-semibold text-gray-800 transition-all placeholder-gray-400"
                      />
                    </div>

                    {/* Country dropdown picker */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">Country</label>
                      <select
                        value={countryId}
                        onChange={(e) => setCountryId(e.target.value)}
                        className="w-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl py-3 px-4 text-sm font-semibold text-gray-800 transition-all cursor-pointer"
                      >
                        <option value="" disabled className="text-gray-400">Select target country</option>
                        {countries.map((c) => (
                          <option key={c.id} value={c.id.toString()}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Bio field */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700">Biography (Bio)</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Describe your travel frequency, targeted countries, and shopping services..."
                        rows={3}
                        className="w-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl py-3 px-4 text-sm font-semibold text-gray-800 transition-all placeholder-gray-400 resize-none"
                      />
                    </div>

                  </div>

                  {/* Save button row */}
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-8 py-3 bg-[#1e53e6] hover:bg-blue-700 active:scale-95 text-white text-sm font-bold rounded-xl shadow-md transition duration-150 cursor-pointer disabled:bg-blue-300 disabled:scale-100 shrink-0"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>

                </form>

              </div>

            </div>
          )}

        </div>

      </main>

      {/* Global sleek toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
          <div className={`px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {toast.type === 'success' ? (
              <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            <span className="text-xs font-bold leading-none">{toast.message}</span>
          </div>
        </div>
      )}

      {/* ==========================================
         D. UPDATE PROFILE PHOTO URL MODAL
         ========================================== */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop blur overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowPhotoModal(false)}
          />
          
          {/* Modal Container */}
          <div className="relative bg-white rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl border border-gray-150 transform transition-all duration-300 scale-100 flex flex-col gap-6 animate-scale-in">
            {/* Header */}
            <div>
              <h3 className="text-xl font-black text-gray-900 leading-none">Update Profile Photo Link</h3>
              <p className="text-xs text-gray-400 mt-2 font-semibold leading-relaxed">
                Provide a direct URL to your new profile image. It will update instantly across your dashboard.
              </p>
            </div>

            {/* Visual Real-Time Preview */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="w-24 h-24 rounded-full border border-gray-200 overflow-hidden shadow-inner bg-slate-50 flex items-center justify-center relative">
                {tempPhotoUrl.trim() ? (
                  <img 
                    src={tempPhotoUrl.trim()} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150';
                    }}
                  />
                ) : (
                  <span className="text-gray-300">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </span>
                )}
              </div>
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mt-2.5">
                Image Preview
              </span>
            </div>

            {/* Input Form */}
            <form onSubmit={handleApplyPhotoUrl} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Profile Photo URL</label>
                <input
                  type="url"
                  required
                  value={tempPhotoUrl}
                  onChange={(e) => setTempPhotoUrl(e.target.value)}
                  placeholder="e.g., https://example.com/photo.jpg"
                  className="w-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl py-3 px-4 text-sm font-semibold text-gray-800 transition-all placeholder-gray-400"
                />
                <span className="text-[10px] text-gray-400 block font-semibold leading-relaxed">
                  Tip: Paste direct link ending in JPG, PNG, WEBP, or any hosted cloud storage URL.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl transition duration-150 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPhotoUrl}
                  className="px-6 py-2.5 bg-[#1e53e6] hover:bg-blue-700 active:scale-95 text-white text-xs font-extrabold rounded-xl shadow-md transition duration-150 disabled:bg-blue-300 disabled:scale-100 cursor-pointer"
                >
                  {savingPhotoUrl ? 'Applying...' : 'Apply URL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

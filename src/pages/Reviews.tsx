import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { TravelerReview } from '../types/api';

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
  )
};

export default function Reviews() {
  const { user } = useAuth();

  // Profile metadata for bottom-left display (GCS photo)
  const [profilePhoto, setProfilePhoto] = useState<string>('');

  // Reviews page state
  const [reviews, setReviews] = useState<TravelerReview[]>([]);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sorting & Filtering
  const ratingFilter = 'all';

  // Mobile drawer state
  const [showMobileSidebar, setShowMobileSidebar] = useState<boolean>(false);

  // Fetch traveler reviews & profile photo link
  useEffect(() => {
    const fetchReviewsAndProfile = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch traveler profile photo link
        try {
          const profileRes = await api.get(`/api/travelers/${user.id}`);
          if (profileRes.data.status === 'success') {
            setProfilePhoto(profileRes.data.data.profile_photo || '');
          }
        } catch (profileErr) {
          console.warn('Failed to fetch profile details, using defaults.', profileErr);
        }

        // 2. Fetch traveler reviews
        const reviewsRes = await api.get(`/api/travelers/${user.id}/reviews`);
        if (reviewsRes.data.status === 'success') {
          const fetchedData = reviewsRes.data.data;
          setReviews(fetchedData.reviews || []);
          setTotalReviews(fetchedData.summary?.total_reviews || 0);
          setAverageRating(fetchedData.summary?.average_rating || 0);
        }
      } catch (err: any) {
        console.error('Fetch traveler reviews error:', err);
        setError(err.response?.data?.message || 'Failed to load reviews.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviewsAndProfile();
  }, [user]);

  // Dynamic filter logic
  const filteredReviews = reviews.filter((r) => {
    if (ratingFilter === 'all') return true;
    if (ratingFilter === '5') return r.rating === 5;
    if (ratingFilter === '4') return r.rating === 4;
    if (ratingFilter === '3') return r.rating <= 3;
    return true;
  });

  // Calculate local breakdown for Suggestion 1 (Rating breakdown list)
  const calculateStarsBreakdown = () => {
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const rating = Math.min(5, Math.max(1, r.rating)) as 1 | 2 | 3 | 4 | 5;
      breakdown[rating] += 1;
    });
    return breakdown;
  };
  const breakdown = calculateStarsBreakdown();

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
      <Link to="/reviews" className="bg-white text-[#1e53e6] px-4 py-2.5 rounded-lg flex items-center gap-3 transition-all text-sm font-semibold shadow-sm">
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
        <Link 
          to="/profile" 
          className="bg-white/10 rounded-xl p-3.5 mx-1 flex items-center gap-3 border border-white/5 shrink-0 hover:bg-white/15 hover:scale-[1.01] transition-all cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full border border-white/20 overflow-hidden flex items-center justify-center shrink-0 bg-white/10 text-white">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <Icons.User />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-extrabold text-sm leading-none text-white truncate">
              {user?.name || 'Sarah'}
            </h4>
            <p className="text-blue-200/80 text-[11px] mt-1 truncate">
              {user?.email || 'sarah@email.com'}
            </p>
          </div>
        </Link>
      </aside>

      {/* ==========================================
         B. MOBILE SIDEBAR OVERLAY
         ========================================== */}
      {showMobileSidebar && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowMobileSidebar(false)} />
          
          <aside className="relative flex flex-col w-64 bg-[#1e53e6] text-white p-4 shadow-2xl animate-slide-right h-full justify-between shrink-0">
            <button
              onClick={() => setShowMobileSidebar(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-white/80 hover:text-white"
            >
              <Icons.Close />
            </button>

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
            <Link 
              to="/profile" 
              onClick={() => setShowMobileSidebar(false)}
              className="bg-white/10 rounded-xl p-3.5 flex items-center gap-3 border border-white/5 cursor-pointer hover:bg-white/15 transition-all"
            >
              <div className="w-9 h-9 rounded-full border border-white/20 overflow-hidden flex items-center justify-center shrink-0 bg-white/10 text-white">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Icons.User />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-sm leading-none text-white truncate">
                  {user?.name || 'Sarah'}
                </h4>
                <p className="text-blue-200/80 text-[11px] mt-1 truncate">
                  {user?.email || 'sarah@email.com'}
                </p>
              </div>
            </Link>
          </aside>
        </div>
      )}

      {/* ==========================================
         C. MAIN DASHBOARD CONTENT AREA
         ========================================== */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
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
            {user?.name?.[0].toUpperCase() || 'S'}
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 p-6 md:p-8 lg:p-10 space-y-8 max-w-7xl w-full mx-auto">
          
          {/* Header Title Block */}
          <div>
            <h2 className="text-3xl font-extrabold text-[#1e53e6] tracking-tight">My Reviews</h2>
            <p className="text-sm text-gray-400 mt-1 font-semibold">Feedback and ratings from your customers</p>
          </div>

          {/* Loader or Error State */}
          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                <div className="h-32 bg-slate-200 rounded-3xl" />
                <div className="h-32 bg-slate-200 rounded-3xl col-span-2" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-48 bg-slate-200 rounded-3xl" />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm font-bold">{error}</div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* SUGGESTION 1: SUMMARY STATISTICS PANEL */}
              {totalReviews > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                  
                  {/* Total Reviews Card */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm flex flex-col justify-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Reviews</span>
                    <h3 className="text-4xl font-black text-gray-900 mt-2">{totalReviews}</h3>
                  </div>

                  {/* Average Rating Card */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm flex flex-col justify-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Average Score</span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <h3 className="text-4xl font-black text-gray-900">{averageRating.toFixed(1)}</h3>
                      <span className="text-yellow-400 text-2xl">★</span>
                    </div>
                    <div className="flex items-center gap-0.5 mt-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>

                  {/* Clean Visual Breakdown Display (Simple, Not Advance) */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm flex flex-col justify-center space-y-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Rating Breakdown</span>
                    
                    {[5, 4, 3].map((star) => {
                      const count = (breakdown as any)[star] || 0;
                      const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-xs font-semibold">
                          <span className="w-12 text-gray-500 font-bold shrink-0">{star} Stars</span>
                          <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-yellow-400 h-full rounded-full transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="w-6 text-right text-gray-400 font-bold shrink-0">{count}</span>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* Reviews Card Grid */}
              {filteredReviews.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredReviews.map((review) => (
                    <div 
                      key={review._id} 
                      className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm flex flex-col justify-between gap-4 hover:scale-[1.01] transition-all duration-100"
                    >
                      <div className="space-y-3">
                        {/* Rating Stars (Row of Gold Stars) */}
                        <div className="flex items-center gap-0.5 text-yellow-400">
                          {Array.from({ length: 5 }).map((_, starIdx) => (
                            <svg 
                              key={starIdx} 
                              className={`w-5 h-5 ${
                                starIdx < review.rating ? 'fill-yellow-400 stroke-yellow-400' : 'text-gray-200 fill-transparent'
                              }`} 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.25.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.175 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.883c-.773-.56-.374-1.81.588-1.81h4.906a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          ))}
                        </div>

                        {/* Comment Text */}
                        <p className="text-sm font-semibold text-gray-800 leading-relaxed italic">
                          "{review.comment}"
                        </p>
                      </div>

                      {/* Shaded bottom information box */}
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 flex items-center gap-3 shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1e53e6] border border-blue-200 flex items-center justify-center shrink-0">
                          <Icons.User />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="font-extrabold text-sm text-[#1e53e6] leading-none truncate">
                            {review.buyer_name || 'Anonymous Buyer'}
                          </h5>
                          <span className="text-[10px] text-gray-400 block font-bold tracking-wide mt-1.5 truncate">
                            Order - #{review.order_id}
                          </span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 border border-gray-150 shadow-sm flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-6 animate-fade-in">
                  <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-sm">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-gray-900 leading-none">No Reviews Found</h4>
                    <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-wider">
                      {ratingFilter === 'all' 
                        ? 'Complete sales orders to get rated by your buyers!' 
                        : 'No reviews found matching the selected star filter.'}
                    </p>
                  </div>
                  
                  {ratingFilter === 'all' && (
                    <Link
                      to="/orders"
                      className="px-6 py-2.5 bg-[#1e53e6] hover:bg-blue-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-md transition inline-block cursor-pointer"
                    >
                      View Active Orders
                    </Link>
                  )}
                </div>

              )}

            </div>
          )}

        </div>

      </main>

    </div>
  );
}

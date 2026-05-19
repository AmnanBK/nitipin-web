import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-6 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white rounded-3xl p-8 shadow-sm border border-gray-100 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Traveler Panel</span>
            <h1 className="text-3xl font-bold text-gray-900">
              Selamat datang kembali, {user?.name || 'Traveler'}!
            </h1>
            <p className="text-sm text-gray-500">
              Email Anda: <span className="font-semibold text-gray-700">{user?.email}</span> | Role: <span className="font-semibold text-blue-600 uppercase text-xs bg-blue-50 px-2 py-0.5 rounded-full">{user?.role}</span>
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            className="self-start md:self-center bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-full transition-all shadow-sm hover:shadow-md text-sm cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* Mock Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-3">
            <span className="text-sm text-gray-400 font-medium">Saldo Dompet Escrow</span>
            <h3 className="text-3xl font-bold text-gray-900">Rp 1.500.000</h3>
            <span className="inline-block text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">
              Aktif & Terverifikasi
            </span>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-3">
            <span className="text-sm text-gray-400 font-medium">Negara Tujuan Saat Ini</span>
            <h3 className="text-3xl font-bold text-gray-900">Jepang (Japan)</h3>
            <span className="inline-block text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
              Rute Aktif
            </span>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-3">
            <span className="text-sm text-gray-400 font-medium">Katalog Produk Jastip</span>
            <h3 className="text-3xl font-bold text-gray-900">12 Barang</h3>
            <span className="inline-block text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-medium">
              Dipublikasikan
            </span>
          </div>
        </div>

        {/* Placeholder Info Box */}
        <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
          <div className="max-w-xl space-y-4 relative z-10">
            <h2 className="text-2xl font-bold">Siap Menitipkan Barang Belanjaan Baru?</h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              Tambahkan produk dari toko luar negeri yang sedang Anda kunjungi agar pembeli di Indonesia dapat langsung memesan jastip dari Anda. Semua pembayaran dijamin aman menggunakan escrow system.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-30 -mr-16 -mt-16"></div>
        </div>

      </div>
    </div>
  );
}

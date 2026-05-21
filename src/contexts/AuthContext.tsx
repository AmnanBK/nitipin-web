import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginResponse } from '../types/api';

// Antarmuka untuk context autentikasi
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (authData: LoginResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (updatedUser: Partial<User>) => void;
}

// Inisialisasi Context
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Memuat sesi pengguna saat inisialisasi awal
  useEffect(() => {
    const loadSession = () => {
      try {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');

        if (savedUser && token) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Failed to load auth session from localStorage:', error);
        localStorage.clear();
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();

    // 2. Event Listener untuk menangkap sinyal logout dari Axios interceptor (Silent Refresh gagal)
    const handleGlobalLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth_logout', handleGlobalLogout);

    return () => {
      window.removeEventListener('auth_logout', handleGlobalLogout);
    };
  }, []);

  // 3. Fungsi Login
  const login = (authData: LoginResponse) => {
    const { accessToken, refreshToken, user: loggedUser } = authData;

    // Proteksi: Hanya pengguna dengan role 'traveler' yang diizinkan masuk ke Web ini
    if (loggedUser.role !== 'traveler') {
      throw new Error('Akses Ditolak: Platform web ini hanya dikhususkan untuk Travelers.');
    }

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(loggedUser));

    setUser(loggedUser);
  };

  // 4. Fungsi Logout
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  // 5. Fungsi Update Profil Pengguna secara Lokal
  const updateUser = (updatedFields: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom Hook useAuth untuk kemudahan akses Context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

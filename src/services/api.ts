import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

// Buat instance Axios dengan base URL dari environment variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag untuk melacak status refreshing token
let isRefreshing = false;
// Antrean untuk menampung request yang gagal saat token sedang diperbarui
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}> = [];

// Fungsi untuk memproses antrean request yang tertunda
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ==========================================
// 1. REQUEST INTERCEPTOR
// ==========================================
// Menyisipkan token akses di setiap request HTTP ke endpoint terproteksi
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Rute permintaan secara dinamis ke masing-masing layanan mikro untuk melewati gateway yang bermasalah
    if (config.url) {
      if (config.url.startsWith('/api/auth') || config.url.startsWith('/auth')) {
        config.baseURL = 'http://localhost:8081';
      } else if (
        config.url.startsWith('/api/travelers') ||
        config.url.startsWith('/travelers') ||
        config.url.startsWith('/api/buyers') ||
        config.url.startsWith('/buyers') ||
        config.url.startsWith('/api/countries') ||
        config.url.startsWith('/countries')
      ) {
        config.baseURL = 'http://localhost:8082';
      } else {
        config.baseURL = 'http://localhost:8083';
      }
    }

    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ==========================================
// 2. RESPONSE INTERCEPTOR
// ==========================================
// Menangani respon sukses, serta menangkap status 401 secara global untuk Silent Refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Jika response tidak ada atau status bukan 401, lempar error ke pemanggil
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Jika error terjadi pada request refresh token itu sendiri, bersihkan sesi dan redirect
    if (originalRequest.url === '/api/auth/refresh') {
      localStorage.clear();
      window.dispatchEvent(new Event('auth_logout'));
      return Promise.reject(error);
    }

    // Jika request belum ditandai untuk di-retry
    if (!originalRequest._retry) {
      originalRequest._retry = true;

      // Jika proses refreshing sedang berlangsung oleh request lain, antre request ini
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem('refreshToken');

      // Jika tidak ada refresh token, langsung force logout
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.clear();
        window.dispatchEvent(new Event('auth_logout'));
        return Promise.reject(error);
      }

      try {
        // Lakukan pemanggilan API refresh token secara terpisah (jangan pakai instance api utama)
        const response = await axios.post(
          'http://localhost:8081/api/auth/refresh',
          { refreshToken }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

        // Simpan token baru ke storage
        localStorage.setItem('accessToken', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        // Proses antrean dengan token baru
        processQueue(null, newAccessToken);

        // Ulangi request asli yang sempat gagal
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        // Jika pembaruan token gagal (misal refresh token kedaluwarsa)
        processQueue(refreshError, null);
        isRefreshing = false;
        localStorage.clear();
        window.dispatchEvent(new Event('auth_logout'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

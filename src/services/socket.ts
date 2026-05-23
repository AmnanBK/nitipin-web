import { io, Socket } from 'socket.io-client';

// URL langsung ke product-order service (bukan gateway)
// karena Gateway tidak mendukung WebSocket upgrade
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  || (import.meta.env.DEV
    ? 'http://localhost:8083'
    : 'https://product-order-6yhkiifpoq-uc.a.run.app');

let socket: Socket | null = null;

/**
 * Mengembalikan instance socket yang sudah terkoneksi.
 * Jika belum ada, membuat koneksi baru menggunakan JWT dari localStorage.
 */
export const getSocket = (): Socket => {
  if (socket && socket.connected) {
    return socket;
  }

  const token = localStorage.getItem('accessToken') || '';

  socket = io(SOCKET_URL, {
    // Kirim token JWT untuk autentikasi di backend
    auth: { token },
    // Gunakan WebSocket dahulu, fallback ke polling jika perlu
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
};

/**
 * Disconnect dan bersihkan instance socket (dipanggil saat logout atau unmount).
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// src/types/api.d.ts

export type UserRole = 'traveler' | 'buyer';

export interface ApiResponse<T> {
  status?: 'success' | 'error';
  message?: string;
  data: T;
}

// ==========================================
// AUTH SERVICE TYPES
// ==========================================

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterTravelerRequest {
  name: string;
  email: string;
  password?: string;
  phone?: string;
}

export interface RegisterBuyerRequest {
  name: string;
  email: string;
  password?: string;
  phone?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterResponse {
  userId: number;
  name: string;
  email: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// ==========================================
// USER SERVICE TYPES (TRAVELER & BUYER)
// ==========================================

export interface TravelerProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  profile_photo: string | null;
  bio: string | null;
  country_id: number | null;
  country_name: string | null;
  account_status: 'active' | 'inactive';
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface TravelerStatusUpdate {
  account_status: 'active' | 'inactive';
}

export interface TravelerCountryUpdate {
  country_id: number;
}

export interface TravelerBalance {
  id: number;
  name: string;
  email: string;
  balance: number;
}

export interface TravelerReview {
  _id: string;
  order_id: number;
  traveler_id: number;
  buyer_id: number;
  buyer_name: string;
  buyer_photo?: string | null;
  rating: number;
  comment: string;
  created_at: string;
}

export interface TravelerReviewSummary {
  traveler_id: number;
  traveler_name: string;
  summary: {
    total_reviews: number;
    average_rating: number;
  };
  reviews: TravelerReview[];
}

export interface BuyerProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  profile_photo: string | null;
  balance: number;
}

export interface BuyerAddress {
  id: number;
  buyer_id: number;
  label: string;
  full_address: string;
  city: string;
  postal_code: string | null;
  is_default: number; // 0 or 1
  created_at: string;
}

export interface CreateAddressRequest {
  label: string;
  full_address: string;
  city: string;
  postal_code?: string;
  is_default?: number;
}

export interface UpdateAddressRequest {
  label?: string;
  full_address?: string;
  city?: string;
  postal_code?: string;
  is_default?: number;
}

export interface Country {
  id: number;
  name: string;
}

// ==========================================
// PRODUCT CATALOG SERVICE TYPES
// ==========================================

export interface Product {
  id: number;
  traveler_id: number;
  product_name: string;
  description: string | null;
  price: number | string; // sometimes returned as double string like "120000.00"
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  traveler_name?: string;
  country_id?: number;
}

export interface ProductData {
  product_name: string;
  description?: string | null;
  price: number;
  photo_url?: string | null;
}

export interface ProductFilters {
  search?: string;
  traveler_id?: number | string;
  minPrice?: number;
  maxPrice?: number;
}

// ==========================================
// ORDER SERVICE TYPES
// ==========================================

export type OrderStatus = 'pending_review' | 'approved' | 'rejected' | 'cancelled' | 'purchased' | 'shipped' | 'completed';

export interface Order {
  id: number;
  buyer_id: number;
  traveler_id: number;
  product_id: number;
  quantity: number;
  total_price: number | string;
  shipping_address_id: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  product_name?: string;
  buyer_name?: string;
  photo_url?: string | null;
  buyer_email?: string;
  buyer_phone?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_postal_code?: string;
  shipping_label?: string;
}

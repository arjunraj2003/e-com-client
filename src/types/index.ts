// ── Auth ─────────────────────────────────────
export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}
export interface LoginPayload { email: string; password: string; }
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; firstName: string; lastName: string; role: 'user' | 'admin'; };
}

// ── Product ──────────────────────────────────
export interface ProductImage {
  id: string; url: string; isPrimary: boolean; sortOrder: number;
}
export interface ProductVariant {
  id: string; sku: string; attributes: Record<string, string>;
  price: number; imageUrl?: string; isActive: boolean;
  inventory?: { quantity: number; reservedQuantity: number; };
}
export interface Product {
  id: string; name: string; slug: string; description: string;
  basePrice: number; brand?: string; averageRating: number;
  reviewCount: number; isActive: boolean; isFeatured: boolean;
  category?: { id: string; name: string; slug: string; };
  images: ProductImage[];
  variants: ProductVariant[];
  specifications?: Record<string, string>;
}
export interface ProductListResponse {
  products: Product[];
  pagination: { total: number; page: number; limit: number; totalPages: number; };
}

// ── Cart ─────────────────────────────────────
export interface CartItem {
  id: string; variantId: string; quantity: number;
  variant: ProductVariant & { product: Product };
}
export interface Cart { id: string; items: CartItem[]; }

// ── Order ────────────────────────────────────
export type OrderStatus =
  | 'pending' | 'confirmed' | 'processing' | 'shipped'
  | 'delivered' | 'cancelled' | 'return_requested' | 'returned';

export interface OrderItem {
  id: string; productName: string; variantAttributes: Record<string, string>;
  price: number; quantity: number; subtotal: number;
}
export interface Order {
  id: string; orderNumber: string; status: OrderStatus;
  subtotal: number; discountAmount: number; taxAmount: number;
  shippingCharge: number; total: number;
  items: OrderItem[];
  payment?: { status: string; gateway: string; };
  shipment?: { status: string; trackingNumber?: string; carrier?: string; };
  createdAt: string;
}

// ── Address ──────────────────────────────────
export interface Address {
  id: string; fullName: string; phone: string;
  addressLine1: string; addressLine2?: string;
  city: string; state: string; pincode: string;
  country: string; isDefault: boolean; type: string;
}

// ── Review ───────────────────────────────────
export interface Review {
  id: string; rating: number; title?: string; comment?: string;
  isVerifiedPurchase: boolean; createdAt: string;
  user: { id: string; firstName: string; lastName: string; avatar?: string; };
}

// ── Category ─────────────────────────────────
export interface Category {
  id: string; name: string; slug: string;
  description?: string; imageUrl?: string;
  children?: Category[];
}

// ── Admin & Analytics ────────────────────────
export interface AdminStats {
  orders: { total: number; pending: number; delivered: number; revenue: number; };
  users: { total: number; active: number; verified: number; };
  products: { total: number; outOfStock: number; };
}

// ── Shipment ─────────────────────────────────
export interface Shipment {
  id: string; orderId: string; status: 'preparing' | 'shipped' | 'delivered' | 'failed';
  trackingNumber?: string; carrier?: string; shippedAt?: string; deliveredAt?: string;
}

// ── Refund ───────────────────────────────────
export interface Refund {
  id: string; orderId: string; amount: number; reason: string;
  status: 'pending' | 'processed' | 'failed'; processedAt?: string;
}

// ── API Response wrapper ──────────────────────
export interface ApiResponse<T> { success: boolean; data: T; message?: string; }
export interface PaginatedApiResponse<T> extends ApiResponse<T> {}

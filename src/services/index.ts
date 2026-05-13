import api from '@/lib/axios';

export const cartApi = {
  getCart: (sessionId?: string) =>
    api.get('/cart', { params: sessionId ? { sessionId } : {} }),

  addItem: (variantId: string, quantity: number, sessionId?: string) =>
    api.post('/cart/items', { variantId, quantity, sessionId }),

  updateItem: (itemId: string, quantity: number, sessionId?: string) =>
    api.put(`/cart/items/${itemId}`, { quantity }, {
      params: sessionId ? { sessionId } : {},
    }),

  removeItem: (itemId: string, sessionId?: string) =>
    api.delete(`/cart/items/${itemId}`, {
      params: sessionId ? { sessionId } : {},
    }),

  mergeCarts: (sessionId: string) =>
    api.post('/cart/merge', { sessionId }),
};

export const wishlistApi = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (variantId: string) => api.post('/wishlist', { variantId }),
  removeFromWishlist: (id: string) => api.delete(`/wishlist/${id}`),
  moveToCart: (id: string) => api.post(`/wishlist/${id}/move-to-cart`),
};

export const orderApi = {
  placeOrder: (data: { shippingAddressId: string; couponCode?: string; sessionId?: string }) =>
    api.post('/orders', data),

  getOrders: () => api.get('/orders'),

  getOrder: (id: string) => api.get(`/orders/${id}`),

  cancelOrder: (id: string) => api.put(`/orders/${id}/cancel`),
};

export const paymentApi = {
  createRazorpayOrder: (orderId: string) =>
    api.post('/payments/create-order', { orderId }),

  verifyPayment: (data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    orderId: string;
  }) => api.post('/payments/verify', data),
};

export const couponApi = {
  validateCoupon: (code: string, orderAmount: number) =>
    api.post('/coupons/validate', { code, orderAmount }),
};

export const userApi = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string }) =>
    api.put('/users/me', data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data: object) => api.post('/users/addresses', data),
  updateAddress: (id: string, data: object) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete(`/users/addresses/${id}`),
};

export const adminApi = {
  getStats: () => api.get('/admin/dashboard'),
  getUsers: (page = 1) => api.get(`/admin/users?page=${page}`),
  toggleUser: (id: string) => api.put(`/admin/users/${id}/toggle`),
  getOrders: (params?: object) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id: string, status: string) => api.put(`/admin/orders/${id}/status`, { status }),
  getInventoryAlerts: () => api.get('/admin/inventory-alerts'),
};

export const shipmentApi = {
  create: (data: { orderId: string; trackingNumber?: string; carrier?: string }) =>
    api.post('/admin/shipments', data),
  update: (id: string, data: { trackingNumber?: string; carrier?: string; status?: string }) =>
    api.put(`/admin/shipments/${id}`, data),
};

export const refundApi = {
  request: (orderId: string, reason: string) =>
    api.post('/admin/refunds/request', { orderId, reason }),
  process: (refundId: string) =>
    api.post(`/admin/refunds/${refundId}/process`),
};

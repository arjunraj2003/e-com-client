import api from '@/lib/axios';
import type { Product, ProductListResponse } from '@/types';

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
  featured?: boolean;
}

export const productApi = {
  getProducts: (params: ProductQueryParams = {}) =>
    api.get<{ success: boolean; data: ProductListResponse }>('/products', { params }),

  getProductBySlug: (slug: string) =>
    api.get<{ success: boolean; data: Product }>(`/products/${slug}`),

  getProductById: (id: string) =>
    api.get<{ success: boolean; data: Product }>(`/products/id/${id}`),

  getCategories: () =>
    api.get('/categories'),

  getFeatured: () =>
    api.get<{ success: boolean; data: ProductListResponse }>('/products', {
      params: { featured: true, limit: 8 },
    }),

  getReviews: (productId: string) =>
    api.get(`/reviews/${productId}`),

  submitReview: (data: { productId: string; rating: number; title?: string; comment?: string }) =>
    api.post('/reviews', data),

  uploadImages: (productId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return api.post(`/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  createVariant: (productId: string, data: any) =>
    api.post(`/products/${productId}/variants`, data),

  updateVariant: (variantId: string, data: any) =>
    api.put(`/products/variants/${variantId}`, data),

  deleteVariant: (variantId: string) =>
    api.delete(`/products/variants/${variantId}`),

  deleteImage: (productId: string, imageId: string) =>
    api.delete(`/products/${productId}/images/${imageId}`),
};

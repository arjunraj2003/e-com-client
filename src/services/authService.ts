import api from '@/lib/axios';
import type { RegisterPayload, LoginPayload, AuthResponse } from '@/types';

export const authApi = {
  register: (data: RegisterPayload) =>
    api.post<{ success: boolean; message: string }>('/auth/register', data),

  verifyEmail: (email: string, otp: string) =>
    api.post('/auth/verify-email', { email, otp }),

  login: (data: LoginPayload) =>
    api.post<{ success: boolean; data: AuthResponse }>('/auth/login', data),

  refresh: (refreshToken: string) =>
    api.post<{ success: boolean; data: { accessToken: string; refreshToken: string } }>(
      '/auth/refresh', { refreshToken }
    ),

  logout: () => api.post('/auth/logout'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),

  resendOtp: (email: string) =>
    api.post('/auth/resend-otp', { email }),
};

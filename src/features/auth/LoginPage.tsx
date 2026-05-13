import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/services/authService';
import { cartApi } from '@/services';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const sessionId = useCartStore((s) => s.sessionId);
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login(data);
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken);
      // Merge guest cart
      try { await cartApi.mergeCarts(sessionId); } catch {}
      toast.success(`Welcome back, ${user.firstName}!`);
      navigate('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass p-8 rounded-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold text-white mb-2">Welcome back</h1>
            <p className="text-slate-400 text-sm">Sign in to your ShopHub account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input {...register('email')} type="email" placeholder="you@example.com"
                  className={`input pl-9 ${errors.email ? 'error' : ''}`} />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <Link to="/auth/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input {...register('password')} type={showPass ? 'text' : 'password'}
                  placeholder="••••••••" className={`input pl-9 pr-10 ${errors.password ? 'error' : ''}`} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full py-2.5">
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/auth/register" className="text-indigo-400 hover:text-indigo-300 font-medium">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

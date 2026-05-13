import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/services/authService';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const schema = z.object({
  firstName: z.string().min(2, 'Min 2 chars'),
  lastName: z.string().min(2, 'Min 2 chars'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 chars').regex(/^(?=.*[A-Z])(?=.*[0-9])/, 'Need uppercase & number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match", path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.register({ firstName: data.firstName, lastName: data.lastName, email: data.email, password: data.password });
      toast.success('Account created! Check your email for verification OTP.');
      navigate(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        <div className="glass p-8 rounded-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold text-white mb-2">Create account</h1>
            <p className="text-slate-400 text-sm">Join ShopHub today — it's free</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">First Name</label>
                <input {...register('firstName')} placeholder="John" className={`input ${errors.firstName ? 'error' : ''}`} />
                {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Last Name</label>
                <input {...register('lastName')} placeholder="Doe" className={`input ${errors.lastName ? 'error' : ''}`} />
                {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input {...register('email')} type="email" placeholder="you@example.com" className={`input ${errors.email ? 'error' : ''}`} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="Min 8 chars, 1 uppercase, 1 number"
                  className={`input pr-10 ${errors.password ? 'error' : ''}`} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
              <input {...register('confirmPassword')} type="password" placeholder="Repeat password" className={`input ${errors.confirmPassword ? 'error' : ''}`} />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full py-2.5 mt-2">
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

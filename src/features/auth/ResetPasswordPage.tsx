import { useForm } from 'react-hook-form';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '@/services/authService';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  password: z.string().min(8).regex(/^(?=.*[A-Z])(?=.*[0-9])/, 'Need uppercase & number'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ['confirm'] });
type F = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ password }: F) => {
    try {
      await authApi.resetPassword(token, password);
      toast.success('Password reset! Please login.');
      navigate('/auth/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass p-8 rounded-2xl">
          <h1 className="text-2xl font-display font-bold text-white mb-2">Reset password</h1>
          <p className="text-slate-400 text-sm mb-6">Choose a new secure password.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
              <input {...register('password')} type="password" className={`input ${errors.password ? 'error' : ''}`} />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
              <input {...register('confirm')} type="password" className={`input ${errors.confirm ? 'error' : ''}`} />
              {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full py-2.5">
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

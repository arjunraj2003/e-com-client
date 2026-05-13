import { useForm } from 'react-hook-form';
import { authApi } from '@/services/authService';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{ email: string }>();

  const onSubmit = async ({ email }: { email: string }) => {
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Failed to send reset email');
    }
  };

  if (sent) return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center p-4">
      <div className="glass p-8 rounded-2xl text-center max-w-md w-full">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
        <p className="text-slate-400 text-sm">If that email exists, a reset link has been sent.</p>
        <Link to="/auth/login" className="btn btn-primary mt-6 w-full py-2.5">Back to Login</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass p-8 rounded-2xl">
          <h1 className="text-2xl font-display font-bold text-white mb-2">Forgot password?</h1>
          <p className="text-slate-400 text-sm mb-6">Enter your email to receive a reset link.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input {...register('email', { required: true })} type="email" placeholder="you@example.com" className="input" />
            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full py-2.5">
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
          <Link to="/auth/login" className="block text-center text-sm text-slate-400 hover:text-white mt-4">← Back to login</Link>
        </div>
      </div>
    </div>
  );
}

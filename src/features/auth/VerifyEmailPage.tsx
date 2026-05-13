import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '@/services/authService';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const email = params.get('email') || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Enter 6-digit OTP');
    setLoading(true);
    try {
      await authApi.verifyEmail(email, otp);
      toast.success('Email verified! You can now login.');
      navigate('/auth/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Verification failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass p-8 rounded-2xl text-center">
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-2xl font-display font-bold text-white mb-2">Verify your email</h1>
          <p className="text-slate-400 text-sm mb-6">We sent a 6-digit OTP to <strong className="text-white">{email}</strong></p>
          <form onSubmit={handleVerify} className="space-y-4">
            <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP" maxLength={6}
              className="input text-center text-2xl tracking-[0.5em] font-mono py-4" />
            <button type="submit" disabled={loading || otp.length !== 6} className="btn btn-primary w-full py-2.5">
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
          <div className="mt-6 border-t border-white/5 pt-6">
            <p className="text-slate-500 text-xs mb-3">Didn't receive the code?</p>
            <button
              onClick={async () => {
                try {
                  await authApi.resendOtp(email);
                  toast.success('New OTP sent!');
                } catch (err: any) {
                  toast.error(err?.response?.data?.message || 'Failed to resend');
                }
              }}
              className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors"
            >
              Resend Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const isNewUserStr = searchParams.get('isNewUser');
    const authError = searchParams.get('error');

    if (authError) {
      setError('Google login failed. Please try again or use another method.');
      setTimeout(() => navigate('/checkout'), 3000);
      return;
    }

    if (!accessToken || !refreshToken) {
      setError('Invalid authentication response from Google.');
      setTimeout(() => navigate('/checkout'), 3000);
      return;
    }

    const processLogin = async () => {
      try {
        // Fetch full user profile with the new token
        const res = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        setAuth(res.data.data, accessToken, refreshToken);
        const isNewUser = isNewUserStr === 'true';

        toast.success(`Successfully logged in${isNewUser ? '!' : ' back!'}`);
        navigate('/checkout', { replace: true });
        
      } catch (err) {
        setError('Failed to fetch user profile after Google Login.');
        setTimeout(() => navigate('/checkout'), 3000);
      }
    };

    processLogin();
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="glass p-8 rounded-2xl max-w-sm w-full text-center border border-white/5 shadow-xl animate-fade-in">
        {error ? (
          <div>
            <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-display font-semibold text-white mb-2">Login Failed</h2>
            <p className="text-slate-400 text-sm mb-4">{error}</p>
            <p className="text-xs text-slate-500">Redirecting back...</p>
          </div>
        ) : (
          <div>
            <div className="w-16 h-16 bg-[#534AB7]/20 text-[#534AB7] rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-xl font-display font-semibold text-white mb-2">Securing your account...</h2>
            <p className="text-slate-400 text-sm">Please wait while we log you in via Google.</p>
          </div>
        )}
      </div>
    </div>
  );
}

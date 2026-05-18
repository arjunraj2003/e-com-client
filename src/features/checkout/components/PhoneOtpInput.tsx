import { useState, useRef, useEffect } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface PhoneOtpInputProps {
  onSuccess: (data: { accessToken: string; refreshToken?: string; isNewUser?: boolean; user: any }) => void;
  isGuestUpgrade?: boolean; 
}

export default function PhoneOtpInput({ onSuccess, isGuestUpgrade = false }: PhoneOtpInputProps) {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/phone/send-otp', { phone });
      setStep('OTP');
      setCountdown(30);
      setOtp(['', '', '', '']);
      setTimeout(() => inputRefs[0].current?.focus(), 100);
      toast.success('OTP sent successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (currentOtp: string) => {
    if (currentOtp.length !== 4) return;
    
    setLoading(true);
    try {
      const endpoint = isGuestUpgrade ? '/auth/guest/upgrade' : '/auth/phone/verify-otp';
      const res = await api.post(endpoint, { phone, otp: currentOtp });
      toast.success('Verified successfully');
      onSuccess(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid Request');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    // Auto focus next
    if (val && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    const otpStr = newOtp.join('');
    if (otpStr.length === 4) {
      handleVerifyOtp(otpStr);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  if (step === 'PHONE') {
    return (
      <form onSubmit={handleSendOtp} className="space-y-4 animate-fade-in">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Mobile Number</label>
          <div className="flex gap-2">
            <span className="input flex items-center px-4 bg-white/5 text-slate-400 shrink-0 select-none">+91</span>
            <input
              type="tel"
              maxLength={10}
              autoFocus
              className="input flex-1 text-lg tracking-widest font-medium"
              placeholder="98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || phone.length !== 10}
          className="btn btn-primary w-full h-12 text-[15px] group"
        >
          {loading ? <Loader2 className="animate-spin" /> : (
            <>Send OTP <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
          )}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-center">
      <div>
        <p className="text-slate-300 mb-1">Enter code sent to</p>
        <div className="flex items-center justify-center gap-2">
          <p className="font-semibold text-white tracking-wide">+91 {phone.replace(/(\d{5})(\d{5})/, '$1 $2')}</p>
          <button onClick={() => setStep('PHONE')} className="text-xs text-[#534AB7] hover:text-indigo-300 underline underline-offset-2">
            Edit
          </button>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={inputRefs[i]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-white/5 border border-white/10 rounded-xl text-white focus:bg-white/10 focus:border-[#534AB7] focus:ring-2 focus:ring-[#534AB7]/30 transition-all outline-none"
          />
        ))}
      </div>

      <div className="mt-4">
        {countdown > 0 ? (
          <p className="text-sm text-slate-500">Resend code in {countdown}s</p>
        ) : (
          <button 
            type="button" 
            disabled={loading} 
            onClick={handleSendOtp} 
            className="text-sm text-[#534AB7] hover:text-indigo-300 font-medium disabled:opacity-50"
          >
            Resend OTP
          </button>
        )}
      </div>
    </div>
  );
}

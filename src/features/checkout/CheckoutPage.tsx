import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useCheckoutStore } from '@/store/checkoutStore';
import { useCartStore } from '@/store/cartStore';
import StepIndicator from './components/StepIndicator';
import PhoneOtpInput from './components/PhoneOtpInput';
import AddressForm from './components/AddressForm';
import PaymentSelector from './components/PaymentSelector';
import { LogIn, UserCircle, Phone, ArrowLeft, Loader2, CheckCircle2, MapPin } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

function AuthStep() {
  const { setStep, setAuthMethod } = useCheckoutStore();
  const setAuth = useAuthStore((s) => s.setAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  const [mode, setMode] = useState<'SELECT' | 'PHONE' | 'GUEST' | 'LOGIN'>('SELECT');
  const [guestData, setGuestData] = useState({ name: '', phone: '', email: '' });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Auto-skip if authenticated
    if (isAuthenticated) {
      setAuthMethod('existing');
      setStep(1);
    }
  }, [isAuthenticated, setStep, setAuthMethod]);

  const handleGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestData.name || !guestData.phone) return toast.error('Name and phone are required');
    
    setLoading(true);
    try {
      const res = await api.post('/auth/guest', guestData);
      setAuth(res.data.data.user, res.data.data.accessToken, '');
      setAuthMethod('guest');
      toast.success('Continuing as guest');
      setStep(1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create guest session');
    } finally { setLoading(false); }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', loginData);
      setAuth(res.data.data.user, res.data.data.accessToken, res.data.data.refreshToken);
      setAuthMethod('existing');
      toast.success('Logged in successfully');
      setStep(1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  const handlePhoneSuccess = (data: any) => {
    setAuth(data.user, data.accessToken, data.refreshToken);
    setAuthMethod('phone');
    setStep(1);
  };

  if (mode === 'SELECT') {
    return (
      <div className="space-y-4 animate-fade-in max-w-sm mx-auto">
        <h2 className="text-xl font-display font-semibold text-white mb-6 text-center">How would you like to checkout?</h2>
        
        <button onClick={handleGoogle} className="w-full flex items-center justify-between p-4 rounded-xl glass hover:bg-white/10 transition-colors border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full p-1.5 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-full h-full"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            </div>
            <span className="font-medium text-white">Continue with Google</span>
          </div>
        </button>

        <button onClick={() => setMode('PHONE')} className="w-full flex items-center gap-3 p-4 rounded-xl glass hover:bg-white/10 transition-colors border border-white/5">
          <div className="w-8 h-8 bg-[#534AB7]/20 text-[#534AB7] rounded-full flex items-center justify-center shrink-0">
            <Phone size={18} />
          </div>
          <span className="font-medium text-white">Continue with Phone OTP</span>
        </button>

        <button onClick={() => setMode('GUEST')} className="w-full flex items-center gap-3 p-4 rounded-xl glass hover:bg-white/10 transition-colors border border-white/5">
          <div className="w-8 h-8 bg-[#1D9E75]/20 text-[#1D9E75] rounded-full flex items-center justify-center shrink-0">
            <UserCircle size={18} />
          </div>
          <div className="text-left">
            <span className="font-medium text-white block">Continue as Guest</span>
            <span className="text-xs text-slate-400">No account required</span>
          </div>
        </button>

        <div className="pt-4 mt-4 border-t border-white/10">
          <button onClick={() => setMode('LOGIN')} className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
            <div className="w-8 h-8 bg-slate-800 text-slate-300 rounded-full flex items-center justify-center shrink-0">
              <LogIn size={18} />
            </div>
            <span className="font-medium text-white">Already have an account? Login</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto animate-fade-in relative pt-8">
      <button onClick={() => setMode('SELECT')} className="absolute top-0 left-0 text-slate-400 hover:text-white flex items-center gap-1 text-sm font-medium">
        <ArrowLeft size={16} /> Back
      </button>

      {mode === 'PHONE' && <PhoneOtpInput onSuccess={handlePhoneSuccess} />}

      {mode === 'GUEST' && (
        <form onSubmit={handleGuestSubmit} className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-white mb-6">Guest Details</h2>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name *</label>
            <input required value={guestData.name} onChange={e => setGuestData(d => ({...d, name: e.target.value}))} className="input w-full" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Mobile Number *</label>
            <input type="tel" required value={guestData.phone} onChange={e => setGuestData(d => ({...d, phone: e.target.value.replace(/\D/g,'')}))} maxLength={10} className="input w-full" placeholder="9876543210" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email <span className="text-slate-500">(Optional)</span></label>
            <input type="email" value={guestData.email} onChange={e => setGuestData(d => ({...d, email: e.target.value}))} className="input w-full" placeholder="john@example.com" />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full h-12 mt-2">{loading ? <Loader2 className="animate-spin" /> : 'Continue'}</button>
        </form>
      )}

      {mode === 'LOGIN' && (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-white mb-6">Login</h2>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <input type="email" required value={loginData.email} onChange={e => setLoginData(d => ({...d, email: e.target.value}))} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <input type="password" required value={loginData.password} onChange={e => setLoginData(d => ({...d, password: e.target.value}))} className="input w-full" />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full h-12 mt-2">{loading ? <Loader2 className="animate-spin" /> : 'Login'}</button>
        </form>
      )}
    </div>
  );
}

function AddressStep() {
  const { isAuthenticated } = useAuthStore();
  const { setAddress, setStep } = useCheckoutStore();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(isAuthenticated);
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      api.get('/users/addresses')
         .then(res => setAddresses(res.data.data))
         .catch(err => console.error(err))
         .finally(() => setLoading(false));
    }
  }, [isAuthenticated]);

  const handleSelect = (addr: any) => {
    setAddress({
      id: addr.id,
      name: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      district: addr.city,
      state: addr.state,
      pincode: addr.pincode
    });
    setStep(2);
  };

  if (!isAuthenticated || (!loading && addresses.length === 0) || showNewForm) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in relative">
        {isAuthenticated && addresses.length > 0 && showNewForm && (
          <button onClick={() => setShowNewForm(false)} className="absolute -top-10 left-0 text-slate-400 hover:text-white flex items-center gap-1 text-sm font-medium transition-colors">
             <ArrowLeft size={16}/> Back
          </button>
        )}
        <AddressForm />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in relative pt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-display font-semibold text-white">Select Delivery Address</h2>
        <button onClick={() => setShowNewForm(true)} className="btn bg-white/10 hover:bg-white/20 text-sm text-white px-4 py-2 border border-white/5">
          + Add New Address
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#534AB7]" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div key={addr.id} onClick={() => handleSelect(addr)} className="glass p-5 rounded-2xl border border-white/5 hover:border-[#534AB7]/50 cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(83,74,183,0.1)] group relative">
              {addr.isDefault && <span className="absolute top-4 right-4 text-xs font-semibold px-2 py-0.5 bg-[#1D9E75]/20 text-[#1D9E75] rounded">Default</span>}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#534AB7]/10 group-hover:text-[#534AB7] transition-colors relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#534AB7]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <MapPin size={20} className="relative z-10" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                    <span>{addr.fullName}</span>
                    {addr.type && <span className="text-[10px] px-2 py-0.5 bg-white/10 border border-white/10 rounded-full text-slate-300 capitalize tracking-wide">{addr.type}</span>}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-3">
                    {addr.addressLine1}
                    {addr.addressLine2 && <>, {addr.addressLine2}</>}
                    <br />
                    {addr.city}, {addr.state} {addr.pincode}
                  </p>
                  <div className="text-sm text-slate-300 bg-white/5 inline-flex px-2.5 py-1 rounded-md border border-white/5">
                    <Phone size={14} className="mr-2 inline-block text-slate-400" />
                    <span className="font-medium text-white">{addr.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PaymentStep() {
  const queryClient = useQueryClient();
  const { paymentMethod, address, setStep, setOrderId, couponCode, discount, setCoupon } = useCheckoutStore();
  const { items, totalPrice: subtotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const delivery = subtotal > 499 ? 0 : 40;
  const total = Math.max(0, subtotal - discount) + delivery;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return toast.error('Enter a coupon code');
    setIsApplying(true);
    try {
      const res = await api.post('/coupons/validate', { code: couponInput.toUpperCase(), orderAmount: subtotal });
      const discountAmount = res.data.data.discount || 0;
      setCoupon(couponInput.toUpperCase(), discountAmount);
      toast.success(`Coupon applied! You saved ₹${discountAmount}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setCoupon('', 0);
    } finally {
      setIsApplying(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!paymentMethod) return toast.error('Please select a payment method');
    
    setLoading(true);
    try {
      if (!address?.id) {
        toast.error('Shipping address ID is missing. Please re-enter your address.');
        return setLoading(false);
      }

      const res = await api.post('/orders', { 
        shippingAddressId: address.id, 
        paymentMethod,
        couponCode: couponCode || undefined,
      });
      setOrderId(res.data.data?.id || 'ORD12345');
      clearCart();
      queryClient.setQueryData(['cart'], { items: [], totalItems: 0, totalPrice: 0 });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setStep(3); // Success
      toast.success('Order placed successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
      <div className="space-y-8">
        <div className="glass p-6 rounded-2xl">
          <PaymentSelector />
        </div>
      </div>
      <div>
        <div className="glass p-6 rounded-2xl sticky top-24">
          <h3 className="font-display font-semibold text-white mb-4">Order Summary</h3>
          <div className="space-y-3 mb-6">
            {items.map(item => {
              const itemPrice = Number(item.variant?.product?.basePrice || 0) + Number(item.variant?.price || 0);
              return (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-slate-300">{item.variant?.product?.name} x {item.quantity}</span>
                <span className="text-white font-medium">₹{(itemPrice * item.quantity).toFixed(2)}</span>
              </div>
            )})}
          </div>

          <div className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Enter coupon code" 
              className="input w-full uppercase placeholder:normal-case font-medium text-white"
            />
            <button 
              onClick={handleApplyCoupon}
              disabled={isApplying || !couponInput}
              className="btn bg-white/10 hover:bg-white/20 text-white min-w-24 disabled:opacity-50"
            >
              {isApplying ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Apply'}
            </button>
          </div>

          <div className="border-t border-white/5 pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Subtotal</span>
              <span className="text-white">₹{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm animate-fade-in">
                <span className="text-[#1D9E75]">Coupon Discount ({couponCode})</span>
                <span className="text-[#1D9E75]">-₹{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Delivery</span>
              <span className={delivery === 0 ? "text-[#1D9E75]" : "text-white"}>{delivery === 0 ? 'Free' : `₹${delivery}`}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-white/5 pt-4 mt-4">
              <span className="text-white">Total</span>
              <span className="text-[#534AB7]">₹{total.toFixed(2)}</span>
            </div>
          </div>
          <button 
            onClick={handlePlaceOrder}
            disabled={loading || !paymentMethod}
            className="btn btn-primary w-full h-14 mt-8 text-base shadow-[0_0_20px_rgba(83,74,183,0.3)] hover:shadow-[0_0_25px_rgba(83,74,183,0.4)]"
          >
            {loading ? <Loader2 className="animate-spin" /> : `Pay ₹${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessStep() {
  const { orderId, authMethod } = useCheckoutStore();
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto text-center space-y-6 pt-10 animate-fade-in pb-20">
      <div className="w-24 h-24 bg-[#1D9E75]/20 text-[#1D9E75] rounded-full flex items-center justify-center mx-auto ring-8 ring-[#1D9E75]/10">
        <CheckCircle2 size={48} />
      </div>
      
      <h1 className="text-3xl font-display font-bold text-white">Order Confirmed!</h1>
      <p className="text-slate-400 text-lg">Thank you for your purchase.</p>

      <div className="glass p-6 rounded-2xl inline-block w-full text-left">
        <p className="text-sm text-slate-400 mb-1">Order ID</p>
        <p className="font-mono text-white font-medium text-lg mb-4">{orderId}</p>
        <p className="text-sm text-slate-400 mb-1">Estimated Delivery</p>
        <p className="text-white font-medium">5-7 Business Days</p>
      </div>

      {authMethod === 'guest' && (
        <div className="glass p-6 rounded-2xl border border-[#534AB7]/30 bg-[#534AB7]/5">
          <h3 className="font-semibold text-white mb-2">Save your details?</h3>
          <p className="text-sm text-slate-400 mb-4">Upgrade your guest account to track orders easily.</p>
          <PhoneOtpInput isGuestUpgrade onSuccess={() => toast.success('Account Upgraded!')} />
        </div>
      )}

      <div className="pt-6">
        <button onClick={() => navigate('/')} className="btn bg-white/10 hover:bg-white/20 text-white w-full h-12">
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { step } = useCheckoutStore();

  return (
    <div className="container max-w-5xl py-8 min-h-[80vh]">
      <StepIndicator currentStep={step} />

      <div className="mt-8 sm:mt-12">
        {step === 0 && <AuthStep />}
        {step === 1 && <AddressStep />}
        {step === 2 && <PaymentStep />}
        {step === 3 && <SuccessStep />}
      </div>
    </div>
  );
}

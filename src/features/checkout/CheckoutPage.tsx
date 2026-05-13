import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, orderApi, paymentApi, couponApi } from '@/services';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/utils/helpers';
import { MapPin, Tag, CreditCard, Check } from 'lucide-react';
import toast from 'react-hot-toast';

declare global { interface Window { Razorpay: any; } }

const STEPS = ['Address', 'Review', 'Payment'];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState(0);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState<any>(null);
  const [, setPlacedOrderId] = useState('');
  const queryClient = useQueryClient();

  const { data: addrRes } = useQuery({ queryKey: ['addresses'], queryFn: () => userApi.getAddresses() });
  const addresses = addrRes?.data?.data || [];

  const subtotal = totalPrice;
  const discount = couponData?.discount || 0;
  const tax = (subtotal - discount) * 0.18;
  const shipping = subtotal > 499 ? 0 : 49;
  const total = subtotal - discount + tax + shipping;

  const validateCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await couponApi.validateCoupon(couponCode, subtotal);
      setCouponData(res.data.data);
      toast.success(`Coupon applied! Saved ${formatPrice(res.data.data.discount)}`);
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Invalid coupon'); }
  };

  const placeOrderMutation = useMutation({
    mutationFn: () => orderApi.placeOrder({ shippingAddressId: selectedAddressId, couponCode: couponCode || undefined }),
    onSuccess: async (res) => {
      const order = res.data.data;
      setPlacedOrderId(order.id);
      
      // Invalidate relevant queries so everything is fresh
      queryClient.invalidateQueries({ queryKey: ['product'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      clearCart();

      await initiatePayment(order.id, order.total);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Order failed'),
  });

  const initiatePayment = async (orderId: string, amount: number) => {
    try {
      const payRes = await paymentApi.createRazorpayOrder(orderId);
      const { razorpayOrderId, currency, keyId } = payRes.data.data;

      const options = {
        key: keyId,
        amount: Math.round(amount * 100),
        currency,
        name: 'ShopHub',
        description: 'Purchase Payment',
        order_id: razorpayOrderId,
        prefill: { name: `${user?.firstName} ${user?.lastName}`, email: user?.email },
        theme: { color: '#6366f1' },
        handler: async (response: any) => {
          try {
            await paymentApi.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId,
            });
            navigate(`/payment/result?status=success&orderId=${orderId}`);
          } catch { navigate(`/payment/result?status=failed`); }
        },
        modal: { ondismiss: () => navigate(`/payment/result?status=failed`) },
      };

      // Load Razorpay script if not loaded
      if (!window.Razorpay) {
        await new Promise<void>((res) => {
          const s = document.createElement('script');
          s.src = 'https://checkout.razorpay.com/v1/checkout.js';
          s.onload = () => res();
          document.body.appendChild(s);
        });
      }
      new window.Razorpay(options).open();
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Payment init failed'); }
  };

  const OrderSummary = () => (
    <div className="glass p-5 rounded-xl space-y-3 text-sm">
      <h3 className="font-semibold text-white">Order Summary</h3>
      <div className="flex justify-between text-slate-400"><span>Subtotal ({items.length} items)</span><span className="text-white">{formatPrice(subtotal)}</span></div>
      {discount > 0 && <div className="flex justify-between text-green-400"><span>Coupon Discount</span><span>-{formatPrice(discount)}</span></div>}
      <div className="flex justify-between text-slate-400"><span>Tax (18% GST)</span><span className="text-white">{formatPrice(tax)}</span></div>
      <div className="flex justify-between text-slate-400"><span>Shipping</span><span className={shipping === 0 ? 'text-green-400' : 'text-white'}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
      <div className="border-t border-white/5 pt-3 flex justify-between font-bold text-base">
        <span className="text-white">Total</span><span className="gradient-text">{formatPrice(total)}</span>
      </div>
    </div>
  );

  return (
    <div className="container py-10 max-w-4xl animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-white mb-8">Checkout</h1>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span className={`text-sm font-medium ${i === step ? 'text-white' : 'text-slate-500'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-slate-700 mx-2 w-12" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 0: Address */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-white flex items-center gap-2"><MapPin size={18} /> Select Shipping Address</h2>
              {addresses.length === 0 ? (
                <div className="glass p-6 rounded-xl text-center">
                  <p className="text-slate-400 mb-4">No addresses saved yet</p>
                  <a href="/profile/addresses" className="btn btn-outline text-sm">Add Address</a>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr: any) => (
                    <label key={addr.id} className={`block glass p-4 rounded-xl cursor-pointer transition-all ${selectedAddressId === addr.id ? 'ring-2 ring-indigo-500' : 'hover:ring-1 hover:ring-white/20'}`}>
                      <div className="flex items-start gap-3">
                        <input type="radio" name="address" value={addr.id} checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)} className="mt-1" />
                        <div>
                          <p className="font-semibold text-white text-sm">{addr.fullName} <span className="badge badge-primary ml-1 text-xs">{addr.type}</span></p>
                          <p className="text-slate-400 text-xs mt-1">{addr.addressLine1}, {addr.city}, {addr.state} – {addr.pincode}</p>
                          <p className="text-slate-400 text-xs">{addr.phone}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <button onClick={() => { if (!selectedAddressId) { toast.error('Select an address'); return; } setStep(1); }}
                className="btn btn-primary w-full py-3 mt-4">Continue →</button>
            </div>
          )}

          {/* Step 1: Review + Coupon */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-white flex items-center gap-2"><Tag size={18} /> Apply Coupon</h2>
              <div className="flex gap-3">
                <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="COUPON CODE" className="input flex-1 uppercase font-mono" />
                <button onClick={validateCoupon} className="btn btn-outline text-sm px-5">Apply</button>
              </div>
              {couponData && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <Check size={16} /> Saved {formatPrice(couponData.discount)}
                </div>
              )}
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(0)} className="btn btn-outline flex-1 py-3">← Back</button>
                <button onClick={() => setStep(2)} className="btn btn-primary flex-1 py-3">Continue →</button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-white flex items-center gap-2"><CreditCard size={18} /> Payment</h2>
              <div className="glass p-5 rounded-xl">
                <p className="text-slate-400 text-sm mb-4">Secure payment powered by Razorpay</p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {['VISA', 'Mastercard', 'UPI', 'NetBanking', 'Wallets', 'EMI'].map(m => (
                    <div key={m} className="glass-sm rounded-lg p-2 text-center text-xs text-slate-400">{m}</div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(1)} className="btn btn-outline flex-1 py-3">← Back</button>
                <button onClick={() => placeOrderMutation.mutate()} disabled={placeOrderMutation.isPending}
                  className="btn btn-primary flex-1 py-3 text-base">
                  {placeOrderMutation.isPending ? 'Processing...' : `Pay ${formatPrice(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        <div><OrderSummary /></div>
      </div>
    </div>
  );
}

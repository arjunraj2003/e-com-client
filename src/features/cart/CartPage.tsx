import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { cartApi } from '@/services';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function CartPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const sessionId = useCartStore((s) => s.sessionId);
  const setCart = useCartStore((s) => s.setCart);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await cartApi.getCart(isAuthenticated ? undefined : sessionId);
      setCart(res.data.data?.items || []);
      return res.data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, qty }: { itemId: string; qty: number }) =>
      cartApi.updateItem(itemId, qty, isAuthenticated ? undefined : sessionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId, isAuthenticated ? undefined : sessionId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cart'] }); toast.success('Removed'); },
  });

  const items = data?.items || [];
  const subtotal = items.reduce((sum: number, item: any) => {
    const base = Number(item.variant?.product?.basePrice || 0);
    const extra = Number(item.variant?.price || 0);
    return sum + (base + extra) * item.quantity;
  }, 0);
  const shipping = subtotal > 499 ? 0 : 49;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  if (isLoading) return (
    <div className="container py-10">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4 mb-4 glass p-4 rounded-xl">
          <div className="skeleton w-20 h-20 rounded-lg" />
          <div className="flex-1 space-y-2"><div className="skeleton h-4 w-3/4 rounded" /><div className="skeleton h-4 w-1/2 rounded" /></div>
        </div>
      ))}
    </div>
  );

  if (items.length === 0) return (
    <div className="container py-20 text-center">
      <div className="text-7xl mb-6">🛒</div>
      <h2 className="text-2xl font-display font-bold text-white mb-2">Your cart is empty</h2>
      <p className="text-slate-400 mb-8">Add products to get started</p>
      <Link to="/products" className="btn btn-primary px-8 py-3">Browse Products</Link>
    </div>
  );

  return (
    <div className="container py-10 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-white mb-8">Shopping Cart ({items.length} items)</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item: any) => {
            const base = Number(item.variant?.product?.basePrice || 0);
            const extra = Number(item.variant?.price || 0);
            const price = base + extra;
            const img = item.variant?.product?.images?.find((i: any) => i.isPrimary) || item.variant?.product?.images?.[0];
            return (
              <div key={item.id} className="glass p-4 rounded-xl flex gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800">
                  {img ? <img src={img.url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm mb-1 truncate">{item.variant?.product?.name}</h3>
                  {item.variant?.attributes && (
                    <p className="text-xs text-slate-400 mb-2">
                      {Object.entries(item.variant.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')}
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 glass-sm rounded-lg p-0.5">
                      <button onClick={() => updateMutation.mutate({ itemId: item.id, qty: Math.max(1, item.quantity - 1) })}
                        className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/5 transition-colors">
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateMutation.mutate({ itemId: item.id, qty: item.quantity + 1 })}
                        className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/5 transition-colors">
                        <Plus size={13} />
                      </button>
                    </div>
                    <button onClick={() => removeMutation.mutate(item.id)} className="text-red-400 hover:text-red-300 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-white">{formatPrice(price * item.quantity)}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatPrice(price)} each</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div>
          <div className="glass p-6 rounded-2xl sticky top-20">
            <h2 className="font-display font-bold text-white text-lg mb-6">Order Summary</h2>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-slate-400"><span>Subtotal</span><span className="text-white">{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-slate-400"><span>Tax (18% GST)</span><span className="text-white">{formatPrice(tax)}</span></div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-400' : 'text-white'}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
              </div>
              {shipping > 0 && <p className="text-xs text-slate-500">Add {formatPrice(499 - subtotal)} more for free shipping</p>}
              <div className="border-t border-white/5 pt-3 flex justify-between font-bold text-white text-base">
                <span>Total</span><span className="gradient-text">{formatPrice(total)}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary w-full py-3 text-base">
              <ShoppingBag size={18} /> Proceed to Checkout <ArrowRight size={16} />
            </button>
            <Link to="/products" className="block text-center text-sm text-slate-400 hover:text-white mt-3 transition-colors">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

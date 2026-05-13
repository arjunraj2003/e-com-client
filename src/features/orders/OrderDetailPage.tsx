import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '@/services';
import { formatPrice } from '@/utils/helpers';
import PageLoader from '@/components/shared/PageLoader';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getOrder(id!),
    enabled: !!id,
  });

  if (isLoading) return <PageLoader />;
  const order = data?.data?.data;
  if (!order) return <div className="container py-20 text-center text-slate-400">Order not found</div>;

  const stepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="container py-8 md:py-12 max-w-4xl animate-fade-in">
      <div className="flex items-center gap-2 mb-8 text-sm">
        <Link to="/orders" className="text-slate-400 hover:text-white transition-colors">My Orders</Link>
        <span className="text-slate-700">/</span>
        <span className="text-indigo-400 font-mono font-medium">#{order.orderNumber}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tracker */}
          {!['cancelled', 'return_requested', 'returned'].includes(order.status) && (
            <div className="glass p-6 md:p-8 rounded-2xl">
              <h2 className="text-lg font-display font-bold text-white mb-8">Order Journey</h2>
              
              {/* Desktop Stepper */}
              <div className="hidden md:flex items-center justify-between relative px-2">
                <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-800 -z-10" />
                <div className="absolute top-4 left-0 h-0.5 bg-indigo-600 -z-10 transition-all duration-500" 
                  style={{ width: `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%` }} />
                
                {STATUS_STEPS.map((s, i) => (
                  <div key={s} className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${i <= stepIndex ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
                      {i < stepIndex ? <span className="text-sm">✓</span> : <span className="text-xs font-bold">{i + 1}</span>}
                    </div>
                    <span className={`text-[11px] font-semibold mt-3 uppercase tracking-wider ${i <= stepIndex ? 'text-indigo-300' : 'text-slate-500'}`}>{s}</span>
                  </div>
                ))}
              </div>

              {/* Mobile Stepper */}
              <div className="md:hidden space-y-6">
                {STATUS_STEPS.map((s, i) => (
                  <div key={s} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 ${i <= stepIndex ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
                        {i < stepIndex ? <span className="text-xs">✓</span> : <span className="text-[10px] font-bold">{i + 1}</span>}
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`w-0.5 h-6 -my-1 ${i < stepIndex ? 'bg-indigo-600' : 'bg-slate-800'}`} />
                      )}
                    </div>
                    <div className="pt-1">
                      <p className={`text-sm font-bold uppercase tracking-tight ${i <= stepIndex ? 'text-white' : 'text-slate-600'}`}>{s}</p>
                      {i === stepIndex && <p className="text-[10px] text-indigo-400 mt-0.5">Current Status</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="glass overflow-hidden rounded-2xl">
            <div className="px-6 py-4 border-b border-white/5 bg-white/5">
              <h3 className="font-display font-bold text-white">Order Items</h3>
            </div>
            <div className="p-6 divide-y divide-white/5">
              {order.items?.map((item: any) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{item.productName}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {Object.entries(item.variantAttributes || {}).map(([k, v]) => (
                        <span key={k} className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                          {k}: {String(v)}
                        </span>
                      ))}
                      <span className="text-[10px] text-indigo-400 font-bold px-1.5 py-0.5 border border-indigo-400/30 rounded">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{formatPrice(item.subtotal)}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{formatPrice(item.price)} ea</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipment Detail */}
          {order.shipment && (
            <div className="glass p-6 rounded-2xl bg-indigo-500/5 border-indigo-500/10">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                Shipping Details
              </h3>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-slate-500 text-xs mb-1">Carrier</p>
                  <p className="text-white font-medium">{order.shipment.carrier}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Tracking ID</p>
                  <p className="text-indigo-300 font-mono font-medium">{order.shipment.trackingNumber || 'Pending'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-2xl sticky top-24">
            <h3 className="font-display font-bold text-white mb-6">Payment Summary</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-slate-400"><span>Subtotal</span><span className="text-white font-medium">{formatPrice(order.subtotal)}</span></div>
              {Number(order.discountAmount) > 0 && <div className="flex justify-between text-green-400"><span>Discount Applied</span><span>-{formatPrice(order.discountAmount)}</span></div>}
              <div className="flex justify-between text-slate-400"><span>Taxes & Fees</span><span className="text-white font-medium">{formatPrice(order.taxAmount)}</span></div>
              <div className="flex justify-between text-slate-400"><span>Shipping</span><span className="text-white font-medium">{formatPrice(order.shippingCharge)}</span></div>
              <div className="border-t border-white/5 pt-4 flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Final Amount</p>
                  <p className="text-white text-xs font-medium capitalize">via {order.payment?.gateway || 'Razorpay'}</p>
                </div>
                <p className="text-2xl font-display font-bold gradient-text">{formatPrice(order.total)}</p>
              </div>
            </div>
            
            <div className="mt-8 p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 text-center">Payment Status</p>
              <p className={`text-sm font-bold text-center uppercase ${order.payment?.status === 'paid' ? 'text-green-400' : 'text-amber-400'}`}>
                {order.payment?.status}
              </p>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl text-center">
            <p className="text-xs text-slate-400">Need help with this order?</p>
            <button className="text-indigo-400 text-sm font-bold mt-2 hover:text-indigo-300">Contact Support</button>
          </div>
        </div>
      </div>
    </div>
  );
}

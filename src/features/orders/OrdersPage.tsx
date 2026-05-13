import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { orderApi } from '@/services';
import { formatPrice, formatDate } from '@/utils/helpers';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  pending: 'warning', confirmed: 'primary', processing: 'primary',
  shipped: 'primary', delivered: 'success', cancelled: 'danger',
  return_requested: 'warning', returned: 'danger',
};

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderApi.getOrders(),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => orderApi.cancelOrder(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['orders'] }); toast.success('Order cancelled'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Cannot cancel'),
  });

  const orders = data?.data?.data || [];

  if (isLoading) return (
    <div className="container py-10 space-y-4">
      {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
    </div>
  );

  if (orders.length === 0) return (
    <div className="container py-20 text-center">
      <Package size={64} className="mx-auto text-slate-600 mb-6" />
      <h2 className="text-2xl font-display font-bold text-white mb-2">No orders yet</h2>
      <p className="text-slate-400 mb-8">Your order history will appear here</p>
      <Link to="/products" className="btn btn-primary px-8 py-3">Start Shopping</Link>
    </div>
  );

  return (
    <div className="container py-10 max-w-3xl animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-white mb-8">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order: any) => (
          <div key={order.id} className="glass p-5 rounded-xl">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="font-semibold text-white">#{order.orderNumber}</p>
                <p className="text-xs text-slate-400 mt-0.5">{formatDate(order.createdAt)}</p>
              </div>
              <div className="text-right">
                <span className={`badge badge-${STATUS_COLORS[order.status] || 'primary'} capitalize`}>{order.status.replace('_', ' ')}</span>
                <p className="font-bold text-white mt-1">{formatPrice(order.total)}</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4">{order.items?.length} item(s)</p>
            <div className="flex items-center gap-3">
              <Link to={`/orders/${order.id}`} className="btn btn-outline text-sm py-1.5 flex items-center gap-1">
                View Details <ChevronRight size={14} />
              </Link>
              {['pending', 'confirmed'].includes(order.status) && (
                <button onClick={() => { if (window.confirm('Cancel this order?')) cancelMutation.mutate(order.id); }}
                  className="btn btn-ghost text-sm text-red-400 py-1.5">
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

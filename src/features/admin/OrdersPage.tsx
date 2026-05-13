import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, shipmentApi } from '@/services';
import { formatPrice, formatDate } from '@/utils/helpers';
import { Truck, X, Search, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'return_requested', 'returned'];
const STATUS_COLORS: Record<string, string> = {
  pending: 'warning', confirmed: 'primary', processing: 'primary',
  shipped: 'primary', delivered: 'success', cancelled: 'danger',
  return_requested: 'warning', returned: 'danger',
};

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [shipModal, setShipModal] = useState<any>(null);
  const [shipForm, setShipForm] = useState({ trackingNumber: '', carrier: '' });

  const { data } = useQuery({
    queryKey: ['admin', 'orders', page],
    queryFn: () => adminApi.getOrders({ page }),
  });
  const orders = data?.data?.data?.orders || [];
  const total = data?.data?.data?.total || 0;

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateOrderStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] }); toast.success('Status updated'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });

  const shipMutation = useMutation({
    mutationFn: (data: any) => shipmentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success('Order marked as shipped!');
      setShipModal(null);
      setShipForm({ trackingNumber: '', carrier: '' });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create shipment'),
  });

  return (
    <div className="container py-10 animate-fade-in relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Order Management</h1>
          <p className="text-slate-400 text-sm">{total} total orders found</p>
        </div>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input placeholder="Search by Order # or Customer..." className="input pl-10 h-10 text-sm" />
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-white/5 border-b border-white/10">
              <tr className="text-left text-slate-400">
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Timeline</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((o: any) => (
                <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-mono text-indigo-300 font-bold text-sm">#{o.orderNumber}</p>
                    {o.shipment?.trackingNumber && <p className="text-[10px] text-slate-500 mt-1">TRK: {o.shipment.trackingNumber}</p>}
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-white font-medium">{o.user?.firstName} {o.user?.lastName}</p>
                    <p className="text-[10px] text-slate-500">{o.user?.email}</p>
                  </td>
                  <td className="px-6 py-5 text-white font-bold">{formatPrice(o.total)}</td>
                  <td className="px-6 py-5">
                    <span className={`badge badge-${STATUS_COLORS[o.status] || 'primary'} capitalize text-[10px]`}>
                      {o.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-slate-400 text-xs">{formatDate(o.createdAt)}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-3">
                      <select value={o.status}
                        onChange={(e) => statusMutation.mutate({ id: o.id, status: e.target.value })}
                        className="glass-sm text-xs py-1.5 px-3 rounded-lg border-none focus:ring-1 focus:ring-indigo-500 max-w-[120px]">
                        {ORDER_STATUSES.map(s => <option key={s} value={s} className="bg-slate-900">{s.replace('_', ' ')}</option>)}
                      </select>
                      {(o.status === 'confirmed' || o.status === 'processing') && (
                        <button onClick={() => setShipModal(o)} className="btn btn-primary p-2 text-xs h-8" title="Ship this order">
                          <Truck size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="p-20 text-center text-slate-500">
            <AlertCircle className="mx-auto mb-4 opacity-20" size={48} />
            <p>No orders yet</p>
          </div>
        )}

        <div className="flex justify-center items-center gap-4 p-6 bg-white/5 border-t border-white/10">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn btn-outline text-xs px-4 py-2 disabled:opacity-20">← Previous</button>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">Page {page}</span>
          <button disabled={orders.length < 20} onClick={() => setPage(p => p + 1)} className="btn btn-outline text-xs px-4 py-2 disabled:opacity-20">Next →</button>
        </div>
      </div>

      {/* Shipment Modal */}
      {shipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass p-8 rounded-3xl max-w-md w-full border border-white/10 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-display font-bold text-white flex items-center gap-3">
                <Truck className="text-indigo-400" /> Dispatch Order
              </h3>
              <button onClick={() => setShipModal(null)} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            
            <p className="text-slate-400 text-sm mb-6">Dispatching order <span className="text-indigo-300 font-mono font-bold">#{shipModal.orderNumber}</span>. Enter the shipping details below.</p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="label">Carrier Name</label>
                <input value={shipForm.carrier} onChange={e => setShipForm(f => ({ ...f, carrier: e.target.value }))} className="input" placeholder="e.g. FedEx, BlueDart, Delhivery" />
              </div>
              <div>
                <label className="label">Tracking Number</label>
                <input value={shipForm.trackingNumber} onChange={e => setShipForm(f => ({ ...f, trackingNumber: e.target.value }))} className="input font-mono" placeholder="e.g. 1Z999AA10123456784" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => shipMutation.mutate({ orderId: shipModal.id, ...shipForm })} disabled={shipMutation.isPending} className="btn btn-primary flex-1 py-3 text-sm">
                {shipMutation.isPending ? 'Processing...' : 'Confirm Dispatch'}
              </button>
              <button onClick={() => setShipModal(null)} className="btn btn-outline flex-1 py-3 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


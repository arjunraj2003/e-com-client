import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { formatPrice, formatDate } from '@/utils/helpers';
import { Plus, Trash2, ToggleLeft, ToggleRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscountAmount: '', usageLimit: '', expiresAt: '' });

  const { data } = useQuery({ queryKey: ['admin', 'coupons'], queryFn: () => api.get('/coupons') });
  const coupons = data?.data?.data || [];

  const saveMutation = useMutation({
    mutationFn: (d: any) => api.post('/coupons', d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      toast.success('Coupon created');
      setShowForm(false);
      setForm({ code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscountAmount: '', usageLimit: '', expiresAt: '' });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });

  const handleCreate = () => {
    if (!form.code.trim()) return toast.error('Coupon code is required');
    if (!form.discountValue) return toast.error('Discount value is required');
    const payload: Record<string, any> = {
      code: form.code.trim().toUpperCase(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
    };
    if (form.minOrderAmount !== '') payload.minOrderAmount = Number(form.minOrderAmount);
    if (form.maxDiscountAmount !== '') payload.maxDiscountAmount = Number(form.maxDiscountAmount);
    if (form.usageLimit !== '') payload.usageLimit = Number(form.usageLimit);
    if (form.expiresAt !== '') payload.expiresAt = new Date(form.expiresAt).toISOString();
    saveMutation.mutate(payload);
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/coupons/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] }); toast.success('Coupon deleted'); },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => api.put(`/coupons/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
  });

  return (
    <div className="container py-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 shrink-0 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-display font-bold text-white">Coupons</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary text-sm py-2 w-full sm:w-auto"><Plus size={16} /> Create Coupon</button>
      </div>

      {showForm && (
        <div className="glass p-6 rounded-xl mb-6 animate-fade-in">
          <h3 className="font-semibold text-white mb-4">New Coupon</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div><label className="block text-xs text-slate-300 mb-1">Code</label><input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="input text-sm uppercase font-mono" /></div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Discount Type</label>
              <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))} className="input text-sm">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div><label className="block text-xs text-slate-300 mb-1">Discount Value</label><input type="number" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} className="input text-sm" /></div>
            <div><label className="block text-xs text-slate-300 mb-1">Min Order (₹)</label><input type="number" value={form.minOrderAmount} onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))} className="input text-sm" /></div>
            <div><label className="block text-xs text-slate-300 mb-1">Max Discount (₹)</label><input type="number" value={form.maxDiscountAmount} onChange={e => setForm(f => ({ ...f, maxDiscountAmount: e.target.value }))} className="input text-sm" /></div>
            <div><label className="block text-xs text-slate-300 mb-1">Usage Limit</label><input type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} className="input text-sm" /></div>
            <div><label className="block text-xs text-slate-300 mb-1">Expires At</label><input type="datetime-local" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} className="input text-sm" /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreate} disabled={saveMutation.isPending} className="btn btn-primary text-sm py-2">Create</button>
            <button onClick={() => setShowForm(false)} className="btn btn-outline text-sm py-2">Cancel</button>
          </div>
        </div>
      )}

      <div className="glass rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <tr className="text-left text-slate-400">
              {['Code', 'Type', 'Value', 'Min Order', 'Used / Limit', 'Expires', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-4 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coupons.map((c: any) => (
              <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td className="px-4 py-3 font-mono text-indigo-300 font-bold">{c.code}</td>
                <td className="px-4 py-3 text-slate-400 capitalize">{c.discountType}</td>
                <td className="px-4 py-3 text-white font-semibold">{c.discountType === 'percentage' ? `${c.discountValue}%` : formatPrice(c.discountValue)}</td>
                <td className="px-4 py-3 text-slate-400">{formatPrice(c.minOrderAmount || 0)}</td>
                <td className="px-4 py-3 text-slate-400">{c.usedCount} / {c.usageLimit || '∞'}</td>
                <td className="px-4 py-3 text-slate-400">{c.expiresAt ? formatDate(c.expiresAt) : '—'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleMutation.mutate({ id: c.id, isActive: !c.isActive })}
                    className={`flex items-center gap-1 text-xs font-semibold ${c.isActive ? 'text-green-400' : 'text-slate-500'}`}>
                    {c.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />} {c.isActive ? 'Active' : 'Off'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => { if (window.confirm('Delete coupon?')) deleteMutation.mutate(c.id); }}
                    className="btn btn-ghost p-1.5 text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

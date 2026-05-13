import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { userApi } from '@/services';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_ADDR = { fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: 'India', type: 'home' };

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null); // null = closed, 'new' = new form, id = edit form
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({ defaultValues: EMPTY_ADDR });

  const { data } = useQuery({ queryKey: ['addresses'], queryFn: () => userApi.getAddresses() });
  const addresses = data?.data?.data || [];

  const saveMutation = useMutation({
    mutationFn: (d: any) => editing === 'new' ? userApi.addAddress(d) : userApi.updateAddress(editing!, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['addresses'] }); toast.success('Address saved'); setEditing(null); reset(EMPTY_ADDR); },
    onError: () => toast.error('Failed to save address'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userApi.deleteAddress(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['addresses'] }); toast.success('Address deleted'); },
  });

  const openEdit = (addr: any) => { reset(addr); setEditing(addr.id); };
  const openNew = () => { reset(EMPTY_ADDR); setEditing('new'); };

  return (
    <div className="container py-10 max-w-2xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-bold text-white">My Addresses</h1>
        <button onClick={openNew} className="btn btn-primary text-sm py-2"><Plus size={16} /> Add Address</button>
      </div>

      {/* Address Form */}
      {editing && (
        <div className="glass p-6 rounded-xl mb-6 animate-fade-in">
          <h3 className="font-semibold text-white mb-5">{editing === 'new' ? 'New Address' : 'Edit Address'}</h3>
          <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label><input {...register('fullName', { required: true })} className="input text-sm" /></div>
              <div><label className="block text-xs font-medium text-slate-300 mb-1">Phone</label><input {...register('phone', { required: true })} type="tel" className="input text-sm" /></div>
            </div>
            <div><label className="block text-xs font-medium text-slate-300 mb-1">Address Line 1</label><input {...register('addressLine1', { required: true })} className="input text-sm" /></div>
            <div><label className="block text-xs font-medium text-slate-300 mb-1">Address Line 2 (optional)</label><input {...register('addressLine2')} className="input text-sm" /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-xs font-medium text-slate-300 mb-1">City</label><input {...register('city', { required: true })} className="input text-sm" /></div>
              <div><label className="block text-xs font-medium text-slate-300 mb-1">State</label><input {...register('state', { required: true })} className="input text-sm" /></div>
              <div><label className="block text-xs font-medium text-slate-300 mb-1">Pincode</label><input {...register('pincode', { required: true })} className="input text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-slate-300 mb-1">Country</label><input {...register('country')} className="input text-sm" /></div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Type</label>
                <select {...register('type')} className="input text-sm">
                  <option value="home">Home</option><option value="work">Work</option><option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={isSubmitting} className="btn btn-primary text-sm py-2">
                {isSubmitting ? 'Saving...' : 'Save Address'}
              </button>
              <button type="button" onClick={() => setEditing(null)} className="btn btn-outline text-sm py-2">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}
      {addresses.length === 0 && !editing ? (
        <div className="glass p-10 rounded-xl text-center">
          <p className="text-slate-400 mb-4">No saved addresses</p>
          <button onClick={openNew} className="btn btn-primary text-sm"><Plus size={14} /> Add your first address</button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr: any) => (
            <div key={addr.id} className="glass p-5 rounded-xl flex justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-white">{addr.fullName}</p>
                  <span className="badge badge-primary text-xs capitalize">{addr.type}</span>
                  {addr.isDefault && <span className="flex items-center gap-1 text-xs text-amber-400"><Star size={11} fill="currentColor" /> Default</span>}
                </div>
                <p className="text-sm text-slate-400">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                <p className="text-sm text-slate-400">{addr.city}, {addr.state} – {addr.pincode}</p>
                <p className="text-xs text-slate-500 mt-1">{addr.phone}</p>
              </div>
              <div className="flex items-start gap-2 flex-shrink-0">
                <button onClick={() => openEdit(addr)} className="btn btn-ghost p-1.5 text-slate-400 hover:text-white"><Pencil size={14} /></button>
                <button onClick={() => { if (window.confirm('Delete address?')) deleteMutation.mutate(addr.id); }}
                  className="btn btn-ghost p-1.5 text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

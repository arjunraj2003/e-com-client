import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { userApi } from '@/services';
import { Plus, Pencil, Trash2, Star, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { INDIA_STATES, getDistricts, isPincodeValidForState } from '@/data/indiaGeoData';

const EMPTY_ADDR = {
  fullName: '', phone: '', addressLine1: '', addressLine2: '',
  city: '', state: '', district: '', pincode: '', country: 'India', type: 'home',
};

type AddrForm = typeof EMPTY_ADDR;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
      <AlertCircle size={11} /> {msg}
    </p>
  );
}

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);

  const {
    register, handleSubmit, reset, watch,
    formState: { errors, isSubmitting },
  } = useForm<AddrForm>({ defaultValues: EMPTY_ADDR });

  const selectedState = watch('state');
  const districts = getDistricts(selectedState);

  const { data } = useQuery({ queryKey: ['addresses'], queryFn: () => userApi.getAddresses() });
  const addresses = data?.data?.data || [];

  const saveMutation = useMutation({
    mutationFn: (d: any) => editing === 'new' ? userApi.addAddress(d) : userApi.updateAddress(editing!, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address saved');
      setEditing(null);
      reset(EMPTY_ADDR);
    },
    onError: () => toast.error('Failed to save address'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userApi.deleteAddress(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['addresses'] }); toast.success('Address deleted'); },
  });

  const openEdit = (addr: any) => { reset({ ...EMPTY_ADDR, ...addr }); setEditing(addr.id); };
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

            {/* Row 1: Full Name + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                <input
                  {...register('fullName', { required: 'Full name is required', minLength: { value: 2, message: 'Name too short' } })}
                  className={`input text-sm ${errors.fullName ? 'border-red-500/60' : ''}`}
                  placeholder="Enter full name"
                />
                <FieldError msg={errors.fullName?.message} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number *</label>
                <div className="flex gap-2">
                  <span className="input text-sm flex items-center px-3 shrink-0 bg-white/5 text-slate-400 w-14">+91</span>
                  <input
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit Indian mobile number' },
                    })}
                    type="tel"
                    maxLength={10}
                    className={`input text-sm flex-1 ${errors.phone ? 'border-red-500/60' : ''}`}
                    placeholder="9876543210"
                  />
                </div>
                <FieldError msg={errors.phone?.message} />
              </div>
            </div>

            {/* Row 2: Address Lines */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Address Line 1 *</label>
              <input
                {...register('addressLine1', { required: 'Address is required' })}
                className={`input text-sm ${errors.addressLine1 ? 'border-red-500/60' : ''}`}
                placeholder="House no., Street, Area"
              />
              <FieldError msg={errors.addressLine1?.message} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Address Line 2 <span className="text-slate-500">(optional)</span></label>
              <input {...register('addressLine2')} className="input text-sm" placeholder="Landmark, Near..." />
            </div>

            {/* Row 3: State + District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">State *</label>
                <select
                  {...register('state', { required: 'Please select a state' })}
                  className={`input text-sm ${errors.state ? 'border-red-500/60' : ''}`}
                >
                  <option value="">— Select State —</option>
                  {INDIA_STATES.map(s => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
                <FieldError msg={errors.state?.message} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">District *</label>
                <select
                  {...register('district', { required: 'Please select a district' })}
                  disabled={!selectedState}
                  className={`input text-sm ${errors.district ? 'border-red-500/60' : ''} disabled:opacity-50`}
                >
                  <option value="">{selectedState ? '— Select District —' : '— Select state first —'}</option>
                  {districts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <FieldError msg={errors.district?.message} />
              </div>
            </div>

            {/* Row 4: City + Pincode + Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">City / Town *</label>
                <input
                  {...register('city', { required: 'City is required' })}
                  className={`input text-sm ${errors.city ? 'border-red-500/60' : ''}`}
                  placeholder="City"
                />
                <FieldError msg={errors.city?.message} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Pincode *</label>
                <input
                  {...register('pincode', {
                    required: 'Pincode is required',
                    pattern: { value: /^\d{6}$/, message: 'Pincode must be 6 digits' },
                    validate: (val) => {
                      if (!selectedState) return true;
                      return isPincodeValidForState(val, selectedState) || `Invalid pincode for ${selectedState}`;
                    },
                  })}
                  type="text"
                  maxLength={6}
                  className={`input text-sm ${errors.pincode ? 'border-red-500/60' : ''}`}
                  placeholder="6-digit PIN"
                />
                <FieldError msg={errors.pincode?.message} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Address Type</label>
                <select {...register('type')} className="input text-sm">
                  <option value="home">🏠 Home</option>
                  <option value="work">💼 Work</option>
                  <option value="other">📍 Other</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={isSubmitting || saveMutation.isPending} className="btn btn-primary text-sm py-2">
                {isSubmitting || saveMutation.isPending ? 'Saving...' : 'Save Address'}
              </button>
              <button type="button" onClick={() => { setEditing(null); reset(EMPTY_ADDR); }} className="btn btn-outline text-sm py-2">Cancel</button>
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
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-semibold text-white">{addr.fullName}</p>
                  <span className="badge badge-primary text-xs capitalize">{addr.type}</span>
                  {addr.isDefault && <span className="flex items-center gap-1 text-xs text-amber-400"><Star size={11} fill="currentColor" /> Default</span>}
                </div>
                <p className="text-sm text-slate-400 truncate">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                <p className="text-sm text-slate-400">{addr.city}{addr.district ? `, ${addr.district}` : ''}, {addr.state} – {addr.pincode}</p>
                <p className="text-xs text-slate-500 mt-1">📞 +91 {addr.phone}</p>
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

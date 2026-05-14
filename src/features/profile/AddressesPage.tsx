import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { userApi } from '@/services';
import {
  Plus, Pencil, Trash2, Star, AlertCircle,
  Loader2, CheckCircle2, MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_ADDR = {
  fullName: '', phone: '', addressLine1: '', addressLine2: '',
  city: '', state: '', district: '', pincode: '', country: 'India', type: 'home',
};

type AddrForm = typeof EMPTY_ADDR;

interface PostOffice {
  Name: string;
  BranchType: string;
  DeliveryStatus: string;
  District: string;
  Division: string;
  State: string;
  Block: string;
  Pincode: string;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
      <AlertCircle size={11} /> {msg}
    </p>
  );
}

function usePincodeLookup(pincode: string) {
  const [postOffices, setPostOffices] = useState<PostOffice[]>([]);
  const [stateVal, setStateVal] = useState('');
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!/^\d{6}$/.test(pincode)) {
      setPostOffices([]);
      setStateVal('');
      setDistrict('');
      setError('');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    fetch(`https://api.postalpincode.in/pincode/${pincode}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        const result = data?.[0];
        if (result?.Status === 'Success' && result?.PostOffice?.length > 0) {
          const offices: PostOffice[] = result.PostOffice;
          setPostOffices(offices);
          setStateVal(offices[0].State);
          setDistrict(offices[0].District);
          setError('');
        } else {
          setPostOffices([]);
          setStateVal('');
          setDistrict('');
          setError('Pincode not found. Please check and try again.');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not fetch pincode details. Check your connection.');
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [pincode]);

  return { postOffices, stateVal, district, loading, error };
}

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);

  const {
    register, handleSubmit, reset, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddrForm>({ defaultValues: EMPTY_ADDR });

  const pincodeValue = watch('pincode');
  const { postOffices, stateVal, district, loading: pinLoading, error: pinError } = usePincodeLookup(pincodeValue);

  // Auto-fill state and district when pincode resolves
  useEffect(() => {
    if (stateVal) setValue('state', stateVal, { shouldValidate: true });
    if (district) setValue('district', district, { shouldValidate: true });
    if (postOffices.length === 1) setValue('city', postOffices[0].Name, { shouldValidate: true });
    else setValue('city', '', { shouldValidate: false });
  }, [stateVal, district, postOffices, setValue]);

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

            {/* Name + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                <input
                  {...register('fullName', { required: 'Full name is required', minLength: { value: 2, message: 'Name too short' } })}
                  placeholder="Enter full name"
                  className={`input text-sm ${errors.fullName ? 'border-red-500/60' : ''}`}
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
                    placeholder="9876543210"
                    className={`input text-sm flex-1 ${errors.phone ? 'border-red-500/60' : ''}`}
                  />
                </div>
                <FieldError msg={errors.phone?.message} />
              </div>
            </div>

            {/* Address Lines */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Address Line 1 *</label>
              <input
                {...register('addressLine1', { required: 'Address is required' })}
                placeholder="House/Flat no., Building, Street"
                className={`input text-sm ${errors.addressLine1 ? 'border-red-500/60' : ''}`}
              />
              <FieldError msg={errors.addressLine1?.message} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Address Line 2 <span className="text-slate-500">(optional)</span></label>
              <input {...register('addressLine2')} placeholder="Landmark, Near..." className="input text-sm" />
            </div>

            {/* Pincode — key field that drives rest */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Pincode *</label>
              <div className="relative">
                <input
                  {...register('pincode', {
                    required: 'Pincode is required',
                    pattern: { value: /^\d{6}$/, message: 'Pincode must be exactly 6 digits' },
                  })}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit pincode"
                  className={`input text-sm pr-10 ${errors.pincode ? 'border-red-500/60' : stateVal ? 'border-green-500/50' : ''}`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {pinLoading && <Loader2 size={16} className="text-indigo-400 animate-spin" />}
                  {!pinLoading && stateVal && <CheckCircle2 size={16} className="text-green-400" />}
                </div>
              </div>
              <FieldError msg={errors.pincode?.message || pinError} />
              {pinLoading && (
                <p className="text-xs text-indigo-400 mt-1 flex items-center gap-1">
                  <Loader2 size={11} className="animate-spin" /> Fetching location details...
                </p>
              )}
            </div>

            {/* Auto-filled: State + District */}
            {stateVal && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">State</label>
                  <div className="input text-sm flex items-center gap-2 bg-white/[0.03] text-slate-300 cursor-default">
                    <MapPin size={13} className="text-indigo-400 shrink-0" />
                    {stateVal}
                  </div>
                  <input type="hidden" {...register('state', { required: true })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">District</label>
                  <div className="input text-sm flex items-center gap-2 bg-white/[0.03] text-slate-300 cursor-default">
                    <MapPin size={13} className="text-indigo-400 shrink-0" />
                    {district}
                  </div>
                  <input type="hidden" {...register('district')} />
                </div>
              </div>
            )}

            {/* Area/Locality + Address Type */}
            {postOffices.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Area / Locality *
                    <span className="text-slate-500 font-normal ml-1">({postOffices.length} areas found)</span>
                  </label>
                  <select
                    {...register('city', { required: 'Please select an area' })}
                    className={`input text-sm ${errors.city ? 'border-red-500/60' : ''}`}
                  >
                    {postOffices.length > 1 && <option value="">— Select Area —</option>}
                    {postOffices.map(po => (
                      <option key={po.Name} value={po.Name}>{po.Name}</option>
                    ))}
                  </select>
                  <FieldError msg={errors.city?.message} />
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
            )}

            {/* Type alone if no postOffices yet */}
            {postOffices.length === 0 && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Address Type</label>
                <select {...register('type')} className="input text-sm max-w-[200px]">
                  <option value="home">🏠 Home</option>
                  <option value="work">💼 Work</option>
                  <option value="other">📍 Other</option>
                </select>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={isSubmitting || saveMutation.isPending || pinLoading}
                className="btn btn-primary text-sm py-2"
              >
                {isSubmitting || saveMutation.isPending ? 'Saving...' : 'Save Address'}
              </button>
              <button
                type="button"
                onClick={() => { setEditing(null); reset(EMPTY_ADDR); }}
                className="btn btn-outline text-sm py-2"
              >
                Cancel
              </button>
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
                <button
                  onClick={() => { if (window.confirm('Delete address?')) deleteMutation.mutate(addr.id); }}
                  className="btn btn-ghost p-1.5 text-red-400 hover:text-red-300"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

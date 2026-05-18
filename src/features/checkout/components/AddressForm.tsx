import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCheckoutStore } from '@/store/checkoutStore';
import { useAuthStore } from '@/store/authStore';
import { usePincodeAutofill } from '@/hooks/usePincodeAutofill';
import { MapPin, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

interface AddressFormData {
  name: string;
  phone: string;
  pincode: string;
  addressLine1: string;
  addressLine2: string;
}

export default function AddressForm() {
  const { user } = useAuthStore();
  const { setAddress, setStep, address: storedAddress } = useCheckoutStore();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<AddressFormData>({
    defaultValues: {
      name: storedAddress?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : ''),
      phone: storedAddress?.phone || user?.phone || '',
      pincode: storedAddress?.pincode || '',
      addressLine1: storedAddress?.addressLine1 || '',
      addressLine2: storedAddress?.addressLine2 || '',
    }
  });

  const pincode = watch('pincode');
  const { district, state, loading: pinLoading, error: pinError } = usePincodeAutofill(pincode);
  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (data: AddressFormData) => {
    if (!district || !state) {
      toast.error('Please enter a valid pincode first');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        fullName: data.name,
        phone: data.phone,
        pincode: data.pincode,
        city: district,
        state: state,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || undefined,
      };

      const res = await api.post('/users/addresses', payload);
      const savedAddressId = res.data.data.id;

      setAddress({
        id: savedAddressId,
        ...data,
        district,
        state
      });
      setStep(2); // Move to Payment step
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur border border-white/5 p-5 sm:p-8 rounded-2xl animate-fade-in shadow-xl">
      <h2 className="text-xl font-display font-semibold text-white mb-6">Delivery Address</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name *</label>
            <input 
              {...register('name', { required: 'Name is required' })}
              className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
              placeholder="John Doe"
            />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Mobile Number *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">+91</span>
              <input 
                {...register('phone', { 
                  required: 'Phone is required',
                  pattern: { value: /^[6-9]\d{9}$/, message: 'Valid 10-digit number required' }
                })}
                type="tel"
                maxLength={10}
                className={`input w-full pl-12 ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="9876543210"
              />
            </div>
            {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Pincode *</label>
          <div className="relative max-w-[200px]">
            <input 
              {...register('pincode', { 
                required: 'Pincode is required',
                pattern: { value: /^\d{6}$/, message: 'Must be 6 digits' }
              })}
              type="text"
              inputMode="numeric"
              maxLength={6}
              className={`input w-full pr-10 ${errors.pincode || pinError ? 'border-red-500' : district ? 'border-[#1D9E75]/50' : ''}`}
              placeholder="000000"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {pinLoading && <Loader2 size={16} className="text-[#534AB7] animate-spin" />}
              {!pinLoading && district && <MapPin size={16} className="text-[#1D9E75]" />}
            </div>
          </div>
          {(errors.pincode || pinError) && (
            <p className="text-xs text-red-400 mt-1">{errors.pincode?.message || pinError}</p>
          )}
        </div>

        {/* Auto-filled Location tags */}
        {district && state && (
          <div className="flex gap-2 animate-fade-in">
            <span className="badge bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/20">📍 {district}</span>
            <span className="badge bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/20">{state}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">House / Flat / Block *</label>
          <input 
            {...register('addressLine1', { required: 'Address is required' })}
            className={`input w-full ${errors.addressLine1 ? 'border-red-500' : ''}`}
            placeholder="Flat 101, Building Name"
          />
        </div>

        <div>
           <label className="block text-sm font-medium text-slate-300 mb-1.5">Street / Area / Landmark <span className="text-slate-500 text-xs font-normal">(Optional)</span></label>
           <input 
             {...register('addressLine2')}
             className="input w-full"
             placeholder="Near Apollo Hospital"
           />
        </div>

        <div className="pt-4 border-t border-white/5">
          <button 
            type="submit" 
            disabled={isSaving}
            className="btn btn-primary w-full h-12 sm:w-auto px-8 group font-medium disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : (
              <>
                Continue to Payment 
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

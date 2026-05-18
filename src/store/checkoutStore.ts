import { create } from 'zustand';

interface AddressData {
  id?: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  pincode: string;
  district: string;
  state: string;
}

interface CheckoutState {
  step: number; // 0 = Auth, 1 = Address, 2 = Payment, 3 = Success
  authMethod: 'local' | 'google' | 'phone' | 'guest' | 'existing';
  address: AddressData | null;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'cod' | null;
  couponCode: string;
  discount: number;
  orderId: string | null;

  setStep: (step: number) => void;
  setAuthMethod: (method: 'local' | 'google' | 'phone' | 'guest' | 'existing') => void;
  setAddress: (address: AddressData) => void;
  setPaymentMethod: (method: 'upi' | 'card' | 'netbanking' | 'cod') => void;
  setCoupon: (code: string, discount: number) => void;
  setOrderId: (id: string) => void;
  resetCheckout: () => void;
}

const initialState = {
  step: 0,
  authMethod: 'existing' as const,
  address: null,
  paymentMethod: null,
  couponCode: '',
  discount: 0,
  orderId: null,
};

export const useCheckoutStore = create<CheckoutState>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setAuthMethod: (authMethod) => set({ authMethod }),
  setAddress: (address) => set({ address }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setCoupon: (couponCode, discount) => set({ couponCode, discount }),
  setOrderId: (orderId) => set({ orderId }),
  resetCheckout: () => set(initialState),
}));

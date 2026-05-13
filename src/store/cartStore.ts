import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItemState {
  id: string;
  variantId: string;
  quantity: number;
  variant: {
    id: string;
    sku: string;
    attributes: Record<string, string>;
    price: number;
    imageUrl?: string;
    product: {
      id: string;
      name: string;
      slug: string;
      basePrice: number;
      images: { url: string; isPrimary: boolean }[];
    };
  };
}

interface CartState {
  items: CartItemState[];
  sessionId: string;
  totalItems: number;
  totalPrice: number;
  setCart: (items: CartItemState[]) => void;
  clearCart: () => void;
}

const generateSessionId = () => `guest_${Math.random().toString(36).slice(2)}_${Date.now()}`;

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      sessionId: generateSessionId(),
      totalItems: 0,
      totalPrice: 0,
      setCart: (items) => {
        const totalItems = items.reduce((s, i) => s + i.quantity, 0);
        const totalPrice = items.reduce((s, i) => {
          const price = Number(i.variant.price || i.variant.product.basePrice);
          return s + price * i.quantity;
        }, 0);
        set({ items, totalItems, totalPrice });
      },
      clearCart: () => set({ items: [], totalItems: 0, totalPrice: 0 }),
    }),
    {
      name: 'cart-storage',
    }
  )
);

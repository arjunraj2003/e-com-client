import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '@/services';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

export default function CartSync() {
  const queryClient = useQueryClient();
  const sessionId = useCartStore((s) => s.sessionId);
  const setCart = useCartStore((s) => s.setCart);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Fetch cart data from API
  const { data } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await cartApi.getCart(isAuthenticated ? undefined : sessionId);
      return res.data.data;
    },
    // We want this to be fresh
    staleTime: 30000, 
  });

  // Keep store in sync with query data
  useEffect(() => {
    if (data?.items) {
      setCart(data.items);
    }
  }, [data, setCart]);

  // Merge guest cart on login
  useEffect(() => {
    if (isAuthenticated && sessionId) {
      const mergeCarts = async () => {
        try {
          await cartApi.mergeCarts(sessionId);
          // After merge, invalidate query to refetch the new merged cart
          queryClient.invalidateQueries({ queryKey: ['cart'] });
        } catch (err) {
          console.error('Failed to merge carts:', err);
        }
      };
      mergeCarts();
    }
  }, [isAuthenticated, sessionId, queryClient]);

  return null;
}

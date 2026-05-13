import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { wishlistApi } from '@/services';
// useCartStore import removed
import { formatPrice } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const queryClient = useQueryClient();
  // sessionId removed

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistApi.getWishlist(),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => wishlistApi.removeFromWishlist(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['wishlist'] }); toast.success('Removed'); },
  });

  const moveToCartMutation = useMutation({
    mutationFn: (id: string) => wishlistApi.moveToCart(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Moved to cart!');
    },
  });

  const items = data?.data?.data || [];

  if (isLoading) return (
    <div className="container py-10">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton aspect-square rounded-xl" />)}
      </div>
    </div>
  );

  if (items.length === 0) return (
    <div className="container py-20 text-center">
      <Heart size={64} className="mx-auto text-slate-600 mb-6" />
      <h2 className="text-2xl font-display font-bold text-white mb-2">Your wishlist is empty</h2>
      <p className="text-slate-400 mb-8">Save items you love to your wishlist</p>
      <Link to="/products" className="btn btn-primary px-8 py-3">Browse Products</Link>
    </div>
  );

  return (
    <div className="container py-10 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-white mb-8">My Wishlist ({items.length})</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item: any) => {
          const product = item.variant?.product;
          const img = product?.images?.find((i: any) => i.isPrimary) || product?.images?.[0];
          const price = Number(item.variant?.price || product?.basePrice || 0);
          return (
            <div key={item.id} className="card overflow-hidden group">
              <div className="relative aspect-square bg-slate-800">
                <Link to={`/products/${product?.slug}`}>
                  {img ? <img src={img.url} alt={product?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>}
                </Link>
                <button onClick={() => removeMutation.mutate(item.id)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/40 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="p-4">
                <Link to={`/products/${product?.slug}`}>
                  <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2 hover:text-indigo-300 transition-colors">{product?.name}</h3>
                </Link>
                <p className="font-bold text-white mb-3">{formatPrice(price)}</p>
                <button onClick={() => moveToCartMutation.mutate(item.id)}
                  className="btn btn-primary w-full text-sm py-2">
                  <ShoppingCart size={14} /> Move to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

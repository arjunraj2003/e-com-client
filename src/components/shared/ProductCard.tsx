import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import type { Product } from '@/types';
import { formatPrice } from '@/utils/helpers';
import { useCartStore } from '@/store/cartStore';
import { cartApi } from '@/services';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface Props { product: Product; }

export default function ProductCard({ product }: Props) {
  const sessionId = useCartStore((s) => s.sessionId);
  const queryClient = useQueryClient();
  const primaryImage = product.images?.find((i) => i.isPrimary) || product.images?.[0];
  const defaultVariant = product.variants?.[0];
  const price = Number(product.basePrice || 0) + Number(defaultVariant?.price || 0);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!defaultVariant) return;
    try {
      await cartApi.addItem(defaultVariant.id, 1, sessionId);
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <div className="card overflow-hidden">
        {/* Image */}
        <div className="relative overflow-hidden aspect-square bg-slate-800">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              <span className="text-4xl">📦</span>
            </div>
          )}
          {product.isFeatured && (
            <span className="absolute top-3 left-3 badge badge-primary text-xs">Featured</span>
          )}
          {/* Quick add to cart */}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 w-12 h-12 md:w-10 md:h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 hover:bg-indigo-500 hover:scale-110 shadow-lg z-10"
          >
            <ShoppingCart size={20} className="md:size-4" />
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          {product.brand && (
            <p className="text-xs text-indigo-400 font-medium uppercase tracking-wider mb-1">
              {product.brand}
            </p>
          )}
          <h3 className="font-semibold text-white text-sm line-clamp-2 mb-2 group-hover:text-indigo-300 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex items-center">
                {[1,2,3,4,5].map((s) => (
                  <Star
                    key={s}
                    size={12}
                    className={s <= Math.round(product.averageRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-400">({product.reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-white">{formatPrice(price)}</span>
            {product.variants?.length > 1 && (
              <span className="text-xs text-slate-400">{product.variants.length} variants</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

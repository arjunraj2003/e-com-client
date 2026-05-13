import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Star, ShoppingCart, Heart, Minus, Plus, X } from 'lucide-react';
import { productApi } from '@/services/productService';
import { cartApi, wishlistApi } from '@/services';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/utils/helpers';
import PageLoader from '@/components/shared/PageLoader';
import toast from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, FreeMode } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';

// Swiper styles
// @ts-ignore
import 'swiper/css';
// @ts-ignore
import 'swiper/css/navigation';
// @ts-ignore
import 'swiper/css/pagination';
// @ts-ignore
import 'swiper/css/thumbs';
// @ts-ignore
import 'swiper/css/free-mode';

function ZoomableLightbox({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-10"
      onClick={onClose}
    >
      <motion.button 
        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        onClick={onClose}
      >
        <X size={24} />
      </motion.button>
      <motion.img 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        src={url} 
        alt="Zoomed Product" 
        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl cursor-zoom-out"
        onClick={(e) => e.stopPropagation()}
      />
    </motion.div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const sessionId = useCartStore((s) => s.sessionId);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [zoomUrl, setZoomUrl] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productApi.getProductBySlug(slug!),
    enabled: !!slug,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', data?.data?.data?.id],
    queryFn: () => productApi.getReviews(data!.data.data.id),
    enabled: !!data?.data?.data?.id,
  });

  if (isLoading) return <PageLoader />;

  const product = data?.data?.data;
  if (!product) return (
    <div className="container py-20 text-center">
      <div className="text-6xl mb-4">😕</div>
      <h2 className="text-2xl font-bold text-white">Product not found</h2>
    </div>
  );

  const variant = product.variants?.[selectedVariantIdx];
  const price = Number(variant?.price || product.basePrice);
  const stock = variant?.inventory?.quantity ?? 0;
  const reviews = reviewsData?.data?.data || [];

  const handleAddToCart = async () => {
    if (!variant) return toast.error('Please select a variant');
    try {
      await cartApi.addItem(variant.id, quantity, sessionId);
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart!');
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Failed'); }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) return toast.error('Please login first');
    if (!variant) return;
    try {
      await wishlistApi.addToWishlist(variant.id);
      await queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Added to wishlist!');
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Failed'); }
  };

  const handleZoom = (url: string) => {
    setZoomUrl(url);
    setShowLightbox(true);
  };

  return (
    <div className="container py-10 animate-fade-in">
      <AnimatePresence>
        {showLightbox && <ZoomableLightbox url={zoomUrl} onClose={() => setShowLightbox(false)} />}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative rounded-3xl overflow-hidden aspect-square bg-slate-900 shadow-2xl border border-white/5 group">
            {product.images?.length > 0 ? (
              <Swiper
                modules={[Navigation, Pagination, Thumbs]}
                navigation={product.images.length > 1}
                pagination={{ clickable: true }}
                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                className="product-swiper w-full h-full"
              >
                {product.images.map((img: any) => (
                  <SwiperSlide key={img.id} className="relative cursor-zoom-in" onClick={() => handleZoom(img.url)}>
                    <img src={img.url} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                         <Plus size={24} />
                       </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">📦</div>
            )}
          </div>
          
          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <Swiper
              onSwiper={setThumbsSwiper}
              spaceBetween={12}
              slidesPerView={4}
              freeMode={true}
              watchSlidesProgress={true}
              modules={[FreeMode, Navigation, Thumbs]}
              className="thumbs-swiper"
            >
              {product.images.map((img: any) => (
                <SwiperSlide key={img.id} className="cursor-pointer">
                  <div className="aspect-square rounded-xl overflow-hidden border-2 border-transparent transition-all [.swiper-slide-thumb-active_&]:border-indigo-500 [.swiper-slide-thumb-active_&]:scale-95 bg-slate-800">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        {/* Product Info */}
        <div>
          {product.brand && <p className="text-indigo-400 text-sm font-semibold uppercase tracking-wider mb-2">{product.brand}</p>}
          <h1 className="text-3xl font-display font-bold text-white mb-3">{product.name}</h1>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">{[1,2,3,4,5].map(s => (
                <Star key={s} size={16} className={s <= Math.round(product.averageRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
              ))}</div>
              <span className="text-slate-400 text-sm">{product.averageRating.toFixed(1)} ({product.reviewCount} reviews)</span>
            </div>
          )}

          <div className="text-3xl font-bold text-white mb-6">{formatPrice(price)}</div>

          {/* Variants */}
          {product.variants?.length > 1 && (
            <div className="mb-6">
              {Object.keys(product.variants[0]?.attributes || {}).map(attrKey => {
                const uniqueVals = [...new Set(product.variants.map((v: any) => v.attributes[attrKey]))];
                return (
                  <div key={attrKey} className="mb-3">
                    <p className="text-sm font-medium text-slate-300 mb-2 capitalize">{attrKey}:</p>
                    <div className="flex flex-wrap gap-2">
                      {uniqueVals.map(val => {
                        const idx = product.variants.findIndex((v: any) => v.attributes[attrKey] === val);
                        const isSelected = selectedVariantIdx === idx;
                        return (
                          <button key={String(val)} onClick={() => { setSelectedVariantIdx(idx); setQuantity(1); }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${isSelected ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' : 'border-white/10 text-slate-400 hover:border-white/30'}`}>
                            {String(val)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Stock status */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-2 h-2 rounded-full ${stock > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className={`text-sm font-medium ${stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stock > 0 ? `${stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Quantity + Actions */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1 glass rounded-xl p-1">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors">
                <Minus size={16} />
              </button>
              <span className="w-10 text-center font-semibold">{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(stock, q + 1))} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors">
                <Plus size={16} />
              </button>
            </div>
            <button onClick={handleAddToCart} disabled={stock === 0}
              className="btn btn-primary flex-1 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button onClick={handleWishlist} className="btn btn-outline p-2.5">
              <Heart size={20} />
            </button>
          </div>

          {/* Description */}
          <div className="glass p-4 rounded-xl">
            <h3 className="font-semibold text-white mb-2">Description</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{product.description}</p>
          </div>

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="glass p-4 rounded-xl mt-4">
              <h3 className="font-semibold text-white mb-3">Specifications</h3>
              <div className="space-y-2">
                {Object.entries(product.specifications).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-slate-400 capitalize">{k}</span>
                    <span className="text-white font-medium">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-display font-bold text-white mb-6">Customer Reviews</h2>
          <div className="grid gap-4">
            {reviews.map((r: any) => (
              <div key={r.id} className="glass p-5 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-600/30 flex items-center justify-center text-sm font-bold text-indigo-300">
                    {r.user.firstName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{r.user.firstName} {r.user.lastName}</p>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={11} className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
                      ))}
                      {r.isVerifiedPurchase && <span className="text-xs text-green-400 ml-1">✓ Verified</span>}
                    </div>
                  </div>
                </div>
                {r.title && <p className="font-semibold text-white text-sm mb-1">{r.title}</p>}
                {r.comment && <p className="text-slate-400 text-sm">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

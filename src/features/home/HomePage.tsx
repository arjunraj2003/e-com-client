import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Truck, HeadphonesIcon } from 'lucide-react';
import { productApi } from '@/services/productService';
import ProductCard from '@/components/shared/ProductCard';
import { useAuthStore } from '@/store/authStore';

const features = [
  { icon: Truck, title: 'Free Delivery', desc: 'On orders above ₹499' },
  { icon: Shield, title: 'Secure Payments', desc: 'Razorpay protected' },
  { icon: Zap, title: 'Fast Shipping', desc: '2-5 business days' },
  { icon: HeadphonesIcon, title: '24/7 Support', desc: 'Always here for you' },
];

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();
  const { data: featuredRes } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productApi.getFeatured(),
  });
  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productApi.getCategories(),
  });

  const featured = featuredRes?.data?.data?.products || [];
  const categories = categoriesRes?.data?.data || [];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15"
            style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)' }} />
        </div>
        <div className="container relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-sm text-sm text-indigo-300 mb-6">
            <Zap size={14} className="text-amber-400" />
            <span>New Arrivals Every Week</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black mb-6 leading-tight">
            Shop the <span className="gradient-text">Future</span> of<br />Retail Experience
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Discover curated products, exclusive deals, and a seamless shopping experience — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="btn btn-primary text-base px-8 py-3">
              Shop Now <ArrowRight size={18} />
            </Link>
            <Link to="/products?featured=true" className="btn btn-outline text-base px-8 py-3">
              View Featured
            </Link>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="py-10 border-y border-white/5">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-indigo-400" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{title}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white">Shop by Category</h2>
              <Link to="/products" className="btn btn-ghost text-sm text-indigo-400">View All <ArrowRight size={14} /></Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((cat: any) => (
                <Link key={cat.id} to={`/products?category=${cat.slug}`}
                  className="card p-4 flex flex-col items-center gap-3 cursor-pointer">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} className="w-12 h-12 object-cover rounded-lg" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-2xl">🛍️</div>
                  )}
                  <span className="text-sm font-medium text-white text-center">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-16">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-white">Featured Products</h2>
                <p className="text-slate-400 text-sm mt-1">Hand-picked just for you</p>
              </div>
              <Link to="/products?featured=true" className="btn btn-ghost text-sm text-indigo-400">
                See All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featured.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="py-20">
        <div className="container">
          <div className="rounded-3xl p-10 md:p-16 text-center relative overflow-hidden group"
            style={{ background: 'var(--gradient-brand)' }}>
            {/* Animated Background Elements */}
            <div className="absolute top-0 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 -right-20 w-64 h-64 bg-indigo-900/20 rounded-full blur-3xl animate-pulse" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-display font-black text-white mb-6 leading-tight">
                {isAuthenticated 
                  ? `Welcome back, ${user?.firstName || 'Hero'}!` 
                  : 'Ready to start shopping?'}
              </h2>
              <p className="text-white/80 text-lg mb-10">
                {isAuthenticated
                  ? 'Explore the latest trends and exclusive offers curated just for you.'
                  : 'Join thousands of happy customers today and get access to exclusive deals.'}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {isAuthenticated ? (
                  <Link to="/products" className="btn bg-white text-indigo-700 font-bold px-10 py-4 rounded-2xl hover:shadow-[0_20px_50px_rgba(255,255,255,0.3)] transition-all hover:-translate-y-1">
                    Browse Collection <ArrowRight size={20} />
                  </Link>
                ) : (
                  <>
                    <Link to="/auth/register" className="btn bg-white text-indigo-700 font-bold px-10 py-4 rounded-2xl hover:shadow-[0_20px_50px_rgba(255,255,255,0.3)] transition-all hover:-translate-y-1">
                      Create Free Account <ArrowRight size={20} />
                    </Link>
                    <Link to="/auth/login" className="btn bg-white/10 text-white border border-white/20 font-semibold px-10 py-4 rounded-2xl hover:bg-white/20 transition-all">
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

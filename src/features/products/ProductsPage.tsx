import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { productApi } from '@/services/productService';
import ProductCard from '@/components/shared/ProductCard';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const SORT_OPTIONS = [
  { label: 'Sort: Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const q = {
    page: parseInt(searchParams.get('page') || '1'),
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: (searchParams.get('sortBy') || 'newest') as any,
    featured: searchParams.get('featured') === 'true',
  };

  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(localSearch, 500);

  const setParam = (key: string, val: string) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    if (key !== 'page') p.delete('page');
    setSearchParams(p);
  };

  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    if (debouncedSearch !== currentSearch) {
      setParam('search', debouncedSearch);
    }
  }, [debouncedSearch]);

  const { data, isLoading } = useQuery({
    queryKey: ['products', q],
    queryFn: () => productApi.getProducts({ 
      ...q, 
      minPrice: q.minPrice ? Number(q.minPrice) : undefined,
      maxPrice: q.maxPrice ? Number(q.maxPrice) : undefined,
      limit: 20 
    }),
  });
  const { data: catsRes } = useQuery({ queryKey: ['categories'], queryFn: () => productApi.getCategories() });

  const products = data?.data?.data?.products || [];
  const pagination = data?.data?.data?.pagination;
  const categories = catsRes?.data?.data || [];

  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="skeleton aspect-[4/5]" />
          <div className="p-5 space-y-3">
            <div className="skeleton h-4 rounded w-3/4" />
            <div className="skeleton h-4 rounded w-1/2" />
            <div className="skeleton h-6 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );

  const FilterContent = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider opacity-60">Categories</h3>
        <div className="grid grid-cols-1 gap-1.5 font-medium">
          <button onClick={() => setParam('category', '')}
            className={`w-full text-left text-sm px-4 py-2.5 rounded-xl transition-all ${!q.category ? 'bg-indigo-600/20 text-indigo-300 ring-1 ring-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            All Categories
          </button>
          {categories.map((cat: any) => (
            <button key={cat.id} onClick={() => setParam('category', cat.slug)}
              className={`w-full text-left text-sm px-4 py-2.5 rounded-xl transition-all ${q.category === cat.slug ? 'bg-indigo-600/20 text-indigo-300 ring-1 ring-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider opacity-60">Price Range</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₹</span>
              <input type="number" placeholder="Min" defaultValue={q.minPrice}
                className="input pl-7 text-sm py-2"
                onBlur={(e) => setParam('minPrice', e.target.value)} />
            </div>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₹</span>
              <input type="number" placeholder="Max" defaultValue={q.maxPrice}
                className="input pl-7 text-sm py-2"
                onBlur={(e) => setParam('maxPrice', e.target.value)} />
            </div>
          </div>
          <button 
            onClick={() => { setParam('minPrice', ''); setParam('maxPrice', ''); }}
            className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
            Reset Price
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-col gap-6 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-display font-black text-white leading-none">
              {q.search ? (
                <>Search: <span className="gradient-text">"{q.search}"</span></>
              ) : q.category ? (
                <>Category: <span className="gradient-text">{q.category}</span></>
              ) : (
                <>All <span className="gradient-text">Products</span></>
              )}
            </h1>
            {pagination && <p className="text-slate-400 text-sm mt-3 font-medium">{pagination.total} high-quality items found</p>}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select value={q.sortBy} onChange={(e) => setParam('sortBy', e.target.value)}
              className="input text-sm w-full sm:w-48 cursor-pointer h-11 rounded-xl">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={() => setShowFilters(true)} 
              className={`btn h-11 px-5 rounded-xl transition-all flex items-center gap-2 ${q.category || q.minPrice || q.maxPrice ? 'btn-primary' : 'btn-outline'}`}>
              <SlidersHorizontal size={18} />
              <span className="sm:inline hidden">Filters</span>
              {(q.category || q.minPrice || q.maxPrice) && (
                <span className="w-5 h-5 rounded-full bg-white text-indigo-600 text-[10px] font-bold flex items-center justify-center">
                  !
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            value={localSearch} 
            onChange={(e) => setLocalSearch(e.target.value)} 
            placeholder="Search for premium products, brands, and more..." 
            className="input !pl-14 py-4 rounded-2xl text-base shadow-xl border-white/5 bg-white/[0.03] focus:bg-white/5 transition-all"
          />
          {localSearch && (
            <button onClick={() => setLocalSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-full transition-colors">
              <X size={16} className="text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Active filters badges */}
      {(q.category || q.minPrice || q.maxPrice) && (
        <div className="flex flex-wrap gap-2 mb-8">
          {q.category && (
            <span className="badge badge-primary pl-3 pr-1 py-1 flex items-center gap-2 ring-1 ring-white/10">
              Category: {q.category}
              <button 
                onClick={() => setParam('category', '')}
                className="p-1 hover:bg-indigo-500/30 rounded-full transition-colors"
              >
                <X size={14} />
              </button>
            </span>
          )}
          {(q.minPrice || q.maxPrice) && (
            <span className="badge badge-primary pl-3 pr-1 py-1 flex items-center gap-2 ring-1 ring-white/10">
              Price: ₹{q.minPrice || 0} — ₹{q.maxPrice || '∞'}
              <button 
                onClick={() => { setParam('minPrice', ''); setParam('maxPrice', ''); }}
                className="p-1 hover:bg-indigo-500/30 rounded-full transition-colors"
              >
                <X size={14} />
              </button>
            </span>
          )}
          <button 
            onClick={() => {
              const p = new URLSearchParams(searchParams);
              ['category', 'minPrice', 'maxPrice'].forEach(k => p.delete(k));
              setSearchParams(p);
            }}
            className="text-xs text-slate-400 hover:text-white underline underline-offset-4 px-2"
          >
            Clear All
          </button>
        </div>
      )}

      <div className="flex gap-10">
        {/* Sidebar Filters — desktop */}
        <aside className="hidden md:block w-72 flex-shrink-0">
          <div className="glass p-6 rounded-2xl sticky top-24 border-white/5">
            <FilterContent />
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {showFilters && (
          <div className="fixed inset-0 z-[60] md:hidden animate-fade-in">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowFilters(false)} />
            <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm glass rounded-l-3xl shadow-2xl overflow-y-auto animate-slide-in-right p-8 border-l border-white/10">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-display font-black text-white">Filters</h2>
                <button 
                  onClick={() => setShowFilters(false)} 
                  className="p-3 hover:bg-white/5 rounded-full transition-colors ring-1 ring-white/5"
                >
                  <X size={24} className="text-slate-400" />
                </button>
              </div>
              <FilterContent />
              <div className="mt-12 h-px bg-white/5" />
              <button 
                onClick={() => setShowFilters(false)}
                className="btn btn-primary w-full mt-8 py-4 rounded-2xl shadow-2xl"
              >
                Show Results
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? <SkeletonGrid /> : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-bold text-white mb-2">No products found</h2>
              <p className="text-slate-400">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {q.page > 1 && (
                    <button onClick={() => setParam('page', String(q.page - 1))} className="btn btn-outline text-sm">← Prev</button>
                  )}
                  <span className="text-slate-400 text-sm">Page {q.page} of {pagination.totalPages}</span>
                  {q.page < pagination.totalPages && (
                    <button onClick={() => setParam('page', String(q.page + 1))} className="btn btn-outline text-sm">Next →</button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

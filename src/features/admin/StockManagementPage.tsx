import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '@/services/productService';
import { Package, Search, Save, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function StockManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [localStock, setLocalStock] = useState<Record<string, number>>({});

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin', 'inventory', search],
    queryFn: () => productApi.getProducts({ search, limit: 100 }),
  });

  const products = productsData?.data?.data?.products || [];

  const updateMutation = useMutation({
    mutationFn: ({ variantId, quantity }: { variantId: string, quantity: number }) => 
      productApi.updateVariant(variantId, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] });
      toast.success('Stock updated');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const handleStockChange = (variantId: string, val: string) => {
    const qty = parseInt(val) || 0;
    setLocalStock(prev => ({ ...prev, [variantId]: qty }));
  };

  const handleSave = (variantId: string) => {
    if (localStock[variantId] !== undefined) {
      updateMutation.mutate({ variantId, quantity: localStock[variantId] });
    }
  };

  return (
    <div className="container py-8 max-w-6xl animate-fade-in mb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Stock Management</h1>
          <p className="text-slate-400 text-sm mt-1">Monitor and update inventory across all products</p>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            className="pl-12 pr-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all w-full md:w-80"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
          <p className="text-slate-400 font-medium">Crunching inventory data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {products.map((product: any) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl border border-white/5 overflow-hidden"
            >
              <div className="p-6 bg-white/[0.02] border-b border-white/5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden glass border border-white/10">
                  <img src={product.images?.[0]?.url} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-white font-bold">{product.name}</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">{product.brand}</p>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {product.variants?.map((variant: any) => (
                    <div key={variant.id} className="relative p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:border-white/10 transition-all">
                      <div className="flex items-center justify-between mb-4">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">SKU</span>
                            <span className="text-xs font-mono text-indigo-400 font-bold">{variant.sku}</span>
                         </div>
                         <div className="flex flex-col text-right">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Attributes</span>
                            <span className="text-[10px] text-white/70 italic">
                               {Object.entries(variant.attributes || {}).map(([k,v]) => `${k}:${v}`).join(', ')}
                            </span>
                         </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                           <input
                             type="number"
                             className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                             value={localStock[variant.id] ?? variant.inventory?.quantity ?? 0}
                             onChange={(e) => handleStockChange(variant.id, e.target.value)}
                           />
                           { (localStock[variant.id] !== undefined && localStock[variant.id] !== variant.inventory?.quantity) && (
                              <div className="absolute -top-2 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
                              </div>
                           )}
                        </div>
                        <button
                          onClick={() => handleSave(variant.id)}
                          disabled={updateMutation.isPending && updateMutation.variables?.variantId === variant.id}
                          className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all disabled:opacity-50"
                        >
                          {updateMutation.isPending && updateMutation.variables?.variantId === variant.id ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        </button>
                      </div>
                      
                      { (variant.inventory?.quantity || 0) < 5 && (
                        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-amber-500 uppercase tracking-tighter">
                           <AlertCircle size={10} />
                           Low Stock Alert
                        </div>
                      )}
                    </div>
                  ))}
                  {(!product.variants || product.variants.length === 0) && (
                    <div className="col-span-full py-4 text-center opacity-40 italic text-slate-400 text-xs">
                      No variants found for this product
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {products.length === 0 && !isLoading && (
             <div className="flex flex-col items-center justify-center py-20 glass rounded-3xl border border-white/5">
                <Package size={48} className="text-slate-600 mb-4" />
                <p className="text-slate-400 font-medium">No products found matching your search</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
}

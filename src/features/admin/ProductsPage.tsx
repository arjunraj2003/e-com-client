import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { productApi } from '@/services/productService';
import { formatPrice } from '@/utils/helpers';
import { Plus, Pencil, Trash2, Upload, X, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ 
    name: '', description: '', basePrice: '', brand: '', 
    categoryId: '', isActive: true, isFeatured: false 
  });
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Queries
  const { data: prodRes } = useQuery({
    queryKey: ['admin', 'products', page],
    queryFn: () => productApi.getProducts({ page, limit: 10 }),
  });
  const { data: catRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productApi.getCategories(),
  });

  const products = prodRes?.data?.data?.products || [];
  const pagination = prodRes?.data?.data?.pagination;
  const categories = catRes?.data?.data || [];

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (d: any) => editId ? api.put(`/products/${editId}`, d) : api.post('/products', d),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }); 
      toast.success('Product saved'); 
      setShowForm(false); 
      setEditId(null); 
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }); 
      toast.success('Product deleted'); 
    },
  });

  const addVariantMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productApi.createVariant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Variant added');
    },
  });

  const [newVar, setNewVar] = useState({ sku: '', quantity: 0, attributes: '{}', price: '' });

  return (
    <div className="container py-10 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Product Inventory</h1>
          <p className="text-slate-400 text-sm">Manage your catalog, variants, and media</p>
        </div>
        <button onClick={() => { setEditId(null); setForm({ name: '', description: '', basePrice: '', brand: '', categoryId: '', isActive: true, isFeatured: false }); setShowForm(true); }}
          className="btn btn-primary text-sm py-2"><Plus size={16} /> New Product</button>
      </div>

      {showForm && (
        <div className="glass p-6 rounded-2xl mb-8 animate-fade-in border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-white text-lg">{editId ? 'Edit' : 'Create'} Product</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div><label className="label">Name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="e.g. UltraPhone X" /></div>
              <div><label className="label">Category</label>
                <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="input">
                  <option value="">Select Category</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="label">Brand</label><input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} className="input" /></div>
                <div><label className="label">Base Price (₹)</label><input type="number" value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))} className="input" /></div>
              </div>
            </div>
            <div className="space-y-4">
              <div><label className="label">Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} className="input resize-none" /></div>
              <div className="flex gap-6 items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${form.isActive ? 'bg-indigo-600 border-indigo-600' : 'border-slate-600 group-hover:border-slate-500'}`}>
                    <input type="checkbox" className="hidden" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                    {form.isActive && <Plus size={12} className="rotate-45" />}
                  </div>
                  <span className="text-sm text-slate-300">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${form.isFeatured ? 'bg-amber-600 border-amber-600' : 'border-slate-600 group-hover:border-slate-500'}`}>
                    <input type="checkbox" className="hidden" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} />
                    {form.isFeatured && <Plus size={12} className="rotate-45" />}
                  </div>
                  <span className="text-sm text-slate-300">Featured</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button onClick={() => saveMutation.mutate({ ...form, basePrice: Number(form.basePrice) })} disabled={saveMutation.isPending} className="btn btn-primary px-8 flex-1 sm:flex-none">
              {saveMutation.isPending ? 'Processing...' : 'Save Product'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn btn-outline flex-1 sm:flex-none">Cancel</button>
          </div>
        </div>
      )}

      {/* Product List */}
      <div className="glass rounded-2xl overflow-hidden border border-white/5">
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead className="bg-white/5 border-b border-white/10">
              <tr className="text-left text-slate-400">
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Product Info</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Metrics</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Media & Variants</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p: any) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex-shrink-0 overflow-hidden ring-1 ring-white/10 group-hover:ring-indigo-500/50 transition-all">
                        {p.images?.[0] ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
                      </div>
                      <div>
                        <p className="text-white font-bold leading-tight mb-1">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.brand || 'No Brand'} • {p.category?.name || 'Uncategorized'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <p className="text-white font-mono font-bold text-base">{formatPrice(p.basePrice)}</p>
                      <div className="flex gap-2">
                         <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${p.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {p.isActive ? 'Active' : 'Hidden'}
                        </span>
                        {p.isFeatured && <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Featured</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <button 
                          onClick={() => navigate(`/admin/products/${p.id}/media`)}
                          className="w-9 h-9 rounded-lg glass-sm transition-colors flex items-center justify-center text-indigo-400 hover:bg-white/10" 
                          title="Manage Images"
                        >
                          <Upload size={16} />
                        </button>
                        <span className="text-[10px] text-slate-500 mt-1">{p.images?.length || 0} pics</span>
                      </div>
                      <div className="flex flex-col items-center">
                         <button onClick={() => { setSelectedProduct(selectedProduct?.id === p.id ? null : p); }}
                          className={`w-9 h-9 rounded-lg glass-sm transition-colors flex items-center justify-center ${selectedProduct?.id === p.id ? 'bg-indigo-600 text-white' : 'text-indigo-400 hover:bg-white/10'}`} title="Manage Variants">
                          <Package size={16} />
                        </button>
                        <span className="text-[10px] text-slate-500 mt-1">{p.variants?.length || 0} vars</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex gap-1">
                      <button onClick={() => { setEditId(p.id); setForm({ name: p.name, description: p.description, basePrice: p.basePrice.toString(), brand: p.brand || '', categoryId: p.category?.id || '', isActive: p.isActive, isFeatured: p.isFeatured }); setShowForm(true); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all"><Pencil size={15} /></button>
                      <button onClick={() => { if (window.confirm('Delete product and all its variants?')) deleteMutation.mutate(p.id); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-white/5">
          {products.map((p: any) => (
            <div key={p.id} className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex-shrink-0 overflow-hidden ring-1 ring-white/10">
                  {p.images?.[0] ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold leading-tight truncate text-lg">{p.name}</p>
                  <p className="text-sm text-slate-500 mb-2">{p.brand || 'No Brand'} • {p.category?.name || 'Uncategorized'}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-indigo-400 font-mono font-bold">{formatPrice(p.basePrice)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${p.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {p.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => navigate(`/admin/products/${p.id}/media`)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold glass-sm transition-all text-slate-300"
                >
                  <Upload size={14} /> {p.images?.length || 0} Images
                </button>
                <button 
                  onClick={() => { setSelectedProduct(selectedProduct?.id === p.id ? null : p); }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold glass-sm transition-all ${selectedProduct?.id === p.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-300'}`}
                >
                  <Package size={14} /> {p.variants?.length || 0} Variants
                </button>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => { setEditId(p.id); setForm({ name: p.name, description: p.description, basePrice: p.basePrice.toString(), brand: p.brand || '', categoryId: p.category?.id || '', isActive: p.isActive, isFeatured: p.isFeatured }); setShowForm(true); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-white/5 text-white hover:bg-white/10 transition-all border border-white/5"
                >
                  <Pencil size={14} /> Edit Product
                </button>
                <button 
                  onClick={() => { if (window.confirm('Delete product?')) deleteMutation.mutate(p.id); }}
                  className="w-12 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/20"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 p-6 bg-white/5 border-t border-white/10">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn btn-outline text-xs px-4 py-2 disabled:opacity-30">Previous</button>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">Page {page} of {pagination.totalPages}</span>
            <button disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)} className="btn btn-outline text-xs px-4 py-2 disabled:opacity-30">Next</button>
          </div>
        )}
      </div>

      {/* Variant Management Overlay */}
      {selectedProduct && (
        <div className="p-6 bg-black/40 border-t border-white/5 animate-slide-up rounded-2xl mt-6 glass">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-bold flex items-center gap-2 tracking-wide"><Package size={18} className="text-indigo-400" /> Manage Variants for "{selectedProduct.name}"</h4>
            <button onClick={() => setSelectedProduct(null)} className="text-slate-400 hover:text-white"><X size={18} /></button>
          </div>
          
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
             <input placeholder="SKU (e.g. UL-BLK-128)" className="input text-xs" value={newVar.sku} onChange={e => setNewVar(v=>({...v, sku: e.target.value}))} />
             <input type="number" placeholder="Stock Qty" className="input text-xs" value={newVar.quantity} onChange={e => setNewVar(v=>({...v, quantity: parseInt(e.target.value) || 0}))} />
             <input type="number" placeholder="Price (optional)" className="input text-xs" value={newVar.price} onChange={e => setNewVar(v=>({...v, price: e.target.value}))} />
             <input placeholder="Attributes (e.g. color: Red)" className="input text-xs" value={newVar.attributes} onChange={e => setNewVar(v=>({...v, attributes: e.target.value}))} />
             <button onClick={() => {
                try {
                  const attrs = JSON.parse(newVar.attributes.replace(/(\w+):/g, '"$1":').replace(/:(\w+)/g, ':"$1"'));
                  const variantData = { 
                    ...newVar, 
                    price: newVar.price ? Number(newVar.price) : undefined, 
                    attributes: attrs 
                  };
                  addVariantMutation.mutate({ id: selectedProduct.id, data: variantData });
                } catch { toast.error('Invalid attributes format. Use key:Value'); }
             }} 
             className="btn btn-primary text-xs h-10"><Plus size={14} /> Add Variant</button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {selectedProduct.variants?.map((v: any) => (
              <div key={v.id} className="glass-sm p-3 rounded-xl border border-white/5 relative group">
                <p className="text-[10px] text-slate-500 font-mono mb-1 truncate">{v.sku}</p>
                <p className="text-white font-bold text-xs">{v.quantity} in stock</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {Object.entries(v.attributes || {}).map(([k, val]: any) => (
                    <span key={k} className="px-1.5 py-0.5 bg-white/5 rounded text-[9px] text-slate-300">{val}</span>
                  ))}
                </div>
                 <button onClick={() => { if(window.confirm('Delete variant?')) deleteMutation.mutate(v.id); }} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

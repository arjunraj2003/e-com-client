import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', slug: '' });

  const { data } = useQuery({ queryKey: ['admin', 'categories'], queryFn: () => api.get('/categories') });
  const categories = data?.data?.data || [];

  const saveMutation = useMutation({
    mutationFn: (d: any) => editing === 'new' ? api.post('/categories', d) : api.put(`/categories/${editing}`, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] }); toast.success('Category saved'); setEditing(null); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] }); toast.success('Category deleted'); },
  });

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return (
    <div className="container py-10 max-w-3xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-bold text-white">Categories</h1>
        <button onClick={() => { setForm({ name: '', description: '', slug: '' }); setEditing('new'); }} className="btn btn-primary text-sm py-2"><Plus size={16} /> Add</button>
      </div>

      {editing && (
        <div className="glass p-5 rounded-xl mb-6 animate-fade-in space-y-4">
          <h3 className="font-semibold text-white">{editing === 'new' ? 'New' : 'Edit'} Category</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} className="input text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Slug</label>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="input text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-300 mb-1">Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input text-sm" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending} className="btn btn-primary text-sm py-2">Save</button>
            <button onClick={() => setEditing(null)} className="btn btn-outline text-sm py-2">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {categories.map((cat: any) => (
          <div key={cat.id} className="glass p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">{cat.name}</p>
              <p className="text-xs text-slate-400 font-mono">{cat.slug}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setForm({ name: cat.name, description: cat.description || '', slug: cat.slug }); setEditing(cat.id); }}
                className="btn btn-ghost p-1.5 text-slate-400 hover:text-white"><Pencil size={14} /></button>
              <button onClick={() => { if (window.confirm('Delete category?')) deleteMutation.mutate(cat.id); }}
                className="btn btn-ghost p-1.5 text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

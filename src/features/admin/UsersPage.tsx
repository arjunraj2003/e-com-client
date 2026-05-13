import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { formatDate } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ['admin', 'users', page],
    queryFn: () => api.get(`/admin/users?page=${page}`),
  });
  const users = data?.data?.data?.users || [];
  const total = data?.data?.data?.total || 0;

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.put(`/admin/users/${id}/toggle`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }); toast.success('User status updated'); },
  });

  return (
    <div className="container py-10 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-white mb-8">Manage Users ({total})</h1>
      <div className="glass rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <tr className="text-left text-slate-400">
              {['Name', 'Email', 'Role', 'Joined', 'Status'].map(h => (
                <th key={h} className="px-5 py-4 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td className="px-5 py-4 text-white font-medium">{u.firstName} {u.lastName}</td>
                <td className="px-5 py-4 text-slate-400">{u.email}</td>
                <td className="px-5 py-4"><span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-warning'} capitalize`}>{u.role}</span></td>
                <td className="px-5 py-4 text-slate-400">{formatDate(u.createdAt)}</td>
                <td className="px-5 py-4">
                  <button onClick={() => { if (window.confirm(`${u.isActive ? 'Disable' : 'Enable'} this user?`)) toggleMutation.mutate(u.id); }}
                    className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'} cursor-pointer`}>
                    {u.isActive ? 'Active' : 'Disabled'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center gap-2 p-4">
          {page > 1 && <button onClick={() => setPage(p => p - 1)} className="btn btn-outline text-sm py-1.5">←</button>}
          <span className="text-sm text-slate-400 self-center">Page {page}</span>
          {users.length === 20 && <button onClick={() => setPage(p => p + 1)} className="btn btn-outline text-sm py-1.5">→</button>}
        </div>
      </div>
    </div>
  );
}

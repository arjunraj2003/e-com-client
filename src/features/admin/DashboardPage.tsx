import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { formatPrice } from '@/utils/helpers';
import { Package, Users, ShoppingBag, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboardPage() {
  const { data } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.get('/admin/dashboard'),
  });

  const stats = data?.data?.data?.stats;
  const recentOrders = data?.data?.data?.recentOrders || [];
  const monthlyRevenue = data?.data?.data?.monthlyRevenue || [];

  const STAT_CARDS = [
    { label: 'Total Revenue', value: formatPrice(stats?.totalRevenue || 0), icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Total Orders', value: (stats?.totalOrders || 0).toLocaleString(), icon: Package, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Total Users', value: (stats?.totalUsers || 0).toLocaleString(), icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Active Products', value: (stats?.totalProducts || 0).toLocaleString(), icon: ShoppingBag, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  ];

  const NAV = [
    { label: 'Products', href: '/admin/products', emoji: '📦' },
    { label: 'Inventory', href: '/admin/inventory', emoji: '📊' },
    { label: 'Orders', href: '/admin/orders', emoji: '🛒' },
    { label: 'Users', href: '/admin/users', emoji: '👥' },
    { label: 'Categories', href: '/admin/categories', emoji: '🏷️' },
    { label: 'Coupons', href: '/admin/coupons', emoji: '🎟️' },
  ];

  return (
    <div className="container py-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Overview of your store performance</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {NAV.map((n) => <Link key={n.href} to={n.href} className="btn btn-outline text-sm py-2">{n.emoji} {n.label}</Link>)}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="glass p-5 rounded-xl">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Monthly Revenue */}
      {monthlyRevenue.length > 0 && (
        <div className="glass p-6 rounded-xl mb-8">
          <h2 className="font-semibold text-white mb-5">Revenue (Last 6 Months)</h2>
          <div className="flex items-end gap-3 h-36">
            {monthlyRevenue.map((m: any, i: number) => {
              const max = Math.max(...monthlyRevenue.map((x: any) => Number(x.revenue)));
              const pct = max > 0 ? (Number(m.revenue) / max) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-lg transition-all" style={{ height: `${pct}%`, minHeight: 4, background: 'var(--gradient-brand)' }} />
                  <span className="text-xs text-slate-500">{new Date(m.month).toLocaleDateString('en-IN', { month: 'short' })}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="glass p-6 rounded-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-white">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-indigo-400 hover:text-indigo-300">View All →</Link>
        </div>
        <div className="space-y-3">
          {recentOrders.map((o: any) => (
            <div key={o.id} className="flex items-center justify-between text-sm">
              <div>
                <span className="font-semibold text-white">#{o.orderNumber}</span>
                <span className="text-slate-400 ml-2">{o.user?.firstName} {o.user?.lastName}</span>
              </div>
              <div className="text-right">
                <span className="text-white font-semibold">{formatPrice(o.total)}</span>
                <span className="text-slate-400 ml-2 capitalize">{o.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

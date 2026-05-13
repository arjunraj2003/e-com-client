import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Heart, User, Package, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

export default function BottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems);

  const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Search', icon: Search, path: '/products' },
    { label: 'Cart', icon: ShoppingCart, path: '/cart', count: totalItems },
    { label: 'Wishlist', icon: Heart, path: '/wishlist', protected: true },
    { label: 'Orders', icon: Package, path: '/orders', protected: true },
    { label: 'Profile', icon: User, path: '/profile', protected: true },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 animate-slide-up">
      <div className="glass rounded-2xl flex items-center justify-around h-16 shadow-2xl border border-white/5 backdrop-blur-xl">
        {navItems.map((item) => {
          if (item.protected && !isAuthenticated) return null;
          
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center relative w-12 h-12 rounded-xl transition-all ${
                isActive 
                  ? 'bg-indigo-600/20 text-indigo-400' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={20} className={isActive ? 'scale-110' : ''} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              
              {item.count !== undefined && item.count > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center animate-bounce-subtle">
                  {item.count > 9 ? '9+' : item.count}
                </span>
              )}
            </Link>
          );
        })}
        
        {!isAuthenticated && (
           <Link
              to="/auth/login"
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl text-slate-400`}
            >
              <User size={20} />
              <span className="text-[10px] mt-1 font-medium">Login</span>
            </Link>
        )}
      </div>
    </div>
  );
}

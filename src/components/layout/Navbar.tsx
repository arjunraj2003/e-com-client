import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Menu, Search, X, LogOut, LayoutDashboard, Package } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { authApi } from '@/services/authService';
import { useDebounce } from '@/hooks/useDebounce';
import toast from 'react-hot-toast';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const debouncedSearch = useDebounce(searchVal, 500);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (debouncedSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(debouncedSearch.trim())}`);
    }
  }, [debouncedSearch, navigate]);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    clearAuth();
    navigate('/auth/login');
    toast.success('Logged out');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <nav style={{ background: 'rgb(var(--surface))', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      className="sticky top-0 z-50 backdrop-blur-md">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--gradient-brand)' }}>
              <span className="text-white font-black text-sm">S</span>
            </div>
            <span className="font-display font-bold text-lg gradient-text">ShopHub</span>
          </Link>

          {/* Search — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
              <input
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search products..."
                className="input !pl-11 py-2.5 text-sm bg-white/[0.03] focus:bg-white/[0.06] border-white/5 transition-all w-full"
              />
            </div>
          </form>

          {/* Nav links — desktop */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/products" className="btn btn-ghost text-sm px-3">Products</Link>

            {/* Cart */}
            <Link to="/cart" className="btn btn-ghost relative px-3">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/wishlist" className="btn btn-ghost px-3"><Heart size={20} /></Link>
                {/* User dropdown */}
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="btn btn-ghost px-3 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-600/30 flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-300">
                        {user?.firstName?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-12 glass rounded-xl shadow-2xl w-52 overflow-hidden z-50"
                      onMouseLeave={() => setUserMenuOpen(false)}>
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="font-semibold text-white text-sm">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      </div>
                      <div className="p-2">
                        {user?.role === 'admin' && (
                          <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                            <LayoutDashboard size={15} /> Admin Panel
                          </Link>
                        )}
                        <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                          <User size={15} /> Profile
                        </Link>
                        <Link to="/orders" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                          <Package size={15} /> My Orders
                        </Link>
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                          <LogOut size={15} /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link to="/auth/login" className="btn btn-outline text-sm py-1.5 px-4">Login</Link>
                <Link to="/auth/register" className="btn btn-primary text-sm py-1.5 px-4">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden btn btn-ghost p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative group">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                <input value={searchVal} onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Search products..." className="input !pl-11 py-3 text-sm bg-white/[0.03] border-white/5" />
              </div>
            </form>
            <div className="flex flex-col gap-1">
              <Link to="/products" className="btn btn-ghost justify-start" onClick={() => setMobileOpen(false)}>Products</Link>
              <Link to="/cart" className="btn btn-ghost justify-start" onClick={() => setMobileOpen(false)}>
                Cart {totalItems > 0 && <span className="badge badge-primary ml-auto">{totalItems}</span>}
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/wishlist" className="btn btn-ghost justify-start" onClick={() => setMobileOpen(false)}>Wishlist</Link>
                  <Link to="/orders" className="btn btn-ghost justify-start" onClick={() => setMobileOpen(false)}>Orders</Link>
                  <Link to="/profile" className="btn btn-ghost justify-start" onClick={() => setMobileOpen(false)}>Profile</Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="btn btn-ghost justify-start" onClick={() => setMobileOpen(false)}>Admin</Link>
                  )}
                  <button onClick={handleLogout} className="btn btn-ghost justify-start text-red-400">Logout</button>
                </>
              ) : (
                <div className="flex gap-2 mt-2">
                  <Link to="/auth/login" className="btn btn-outline flex-1" onClick={() => setMobileOpen(false)}>Login</Link>
                  <Link to="/auth/register" className="btn btn-primary flex-1" onClick={() => setMobileOpen(false)}>Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

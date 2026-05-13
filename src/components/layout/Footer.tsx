import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: 'rgb(var(--surface))', borderTop: '1px solid rgba(255,255,255,0.07)' }} className="mt-auto">
      <div className="container py-4 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-4 md:mb-10">
          <div className="hidden md:block col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
                <span className="text-white font-black text-xs">S</span>
              </div>
              <span className="font-display font-bold text-base gradient-text">ShopHub</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your premium shopping destination. Quality products, fast delivery, exceptional service.
            </p>
          </div>
          
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-white mb-2 md:mb-3 text-[11px] md:text-sm uppercase tracking-wider md:normal-case">Shop</h4>
              <ul className="space-y-1 md:space-y-1.5">
                {['Products', 'Categories'].map((item) => (
                  <li key={item}><Link to="/products" className="text-[10px] md:text-xs text-slate-400 hover:text-white transition-colors">{item}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2 md:mb-3 text-[11px] md:text-sm uppercase tracking-wider md:normal-case">Account</h4>
              <ul className="space-y-1 md:space-y-1.5">
                {[['Orders', '/orders'], ['Profile', '/profile']].map(([label, href]) => (
                  <li key={label}><Link to={href} className="text-[10px] md:text-xs text-slate-400 hover:text-white transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="hidden md:block col-span-1">
            <h4 className="font-semibold text-white mb-3 text-sm">Support</h4>
            <div className="flex flex-col gap-1 text-xs text-slate-400">
              <p>contact@shophub.in</p>
              <p>+91 98765 43210</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          <p className="text-[10px] md:text-xs text-slate-500">© {new Date().getFullYear()} ShopHub. All rights reserved.</p>
          <div className="flex items-center gap-3 md:gap-4">
            {['Privacy', 'Terms'].map((item) => (
              <span key={item} className="text-[9px] md:text-xs text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center p-6">
      <div className="text-center animate-fade-in">
        <div className="text-8xl font-display font-black gradient-text mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-slate-400 mb-8 max-w-sm mx-auto">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn btn-primary px-8 py-3">Go Home</Link>
          <Link to="/products" className="btn btn-outline px-8 py-3">Browse Products</Link>
        </div>
      </div>
    </div>
  );
}

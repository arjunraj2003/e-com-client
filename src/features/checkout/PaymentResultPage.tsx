import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';

export default function PaymentResultPage() {
  const [params] = useSearchParams();
  const status = params.get('status');
  const orderId = params.get('orderId');
  const success = status === 'success';

  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center p-6">
      <div className="glass p-10 rounded-2xl text-center max-w-md w-full animate-fade-in">
        {success ? (
          <>
            <CheckCircle size={64} className="mx-auto text-green-400 mb-6" />
            <h1 className="text-2xl font-display font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-slate-400 mb-8">Your order has been placed. A confirmation email is on its way.</p>
            <div className="flex flex-col gap-3">
              {orderId && <Link to={`/orders/${orderId}`} className="btn btn-primary py-3">View Order Detail</Link>}
              <Link to="/orders" className="btn btn-outline py-3">All Orders</Link>
              <Link to="/" className="btn btn-ghost py-3 text-slate-400">Continue Shopping</Link>
            </div>
          </>
        ) : (
          <>
            <XCircle size={64} className="mx-auto text-red-400 mb-6" />
            <h1 className="text-2xl font-display font-bold text-white mb-2">Payment Failed</h1>
            <p className="text-slate-400 mb-8">Something went wrong. Your cart is intact — please try again.</p>
            <div className="flex flex-col gap-3">
              <Link to="/checkout" className="btn btn-primary py-3">Try Again</Link>
              <Link to="/cart" className="btn btn-outline py-3">Back to Cart</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

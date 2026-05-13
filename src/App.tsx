import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/lib/queryClient';
import AppRouter from '@/routes';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import CartSync from '@/components/cart/CartSync';
import ReloadPrompt from '@/components/ui/ReloadPrompt';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ReloadPrompt />
        <CartSync />
        <AppRouter />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: 'rgb(26, 26, 44)',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#0f172a' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#0f172a' } },
          }}
        />
      </ErrorBoundary>
      
    </QueryClientProvider>
  );
}

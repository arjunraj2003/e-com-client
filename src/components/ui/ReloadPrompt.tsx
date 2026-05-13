import { useRegisterSW } from 'virtual:pwa-register/react';

export default function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error: Error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-slate-800 text-white p-4 rounded-xl shadow-lg border border-slate-700 max-w-sm animate-fade-in">
      <div className="mb-3">
        {offlineReady ? (
          <span className="font-medium">App ready to work offline</span>
        ) : (
          <span className="font-medium">New content available, click on reload button to update.</span>
        )}
      </div>
      <div className="flex gap-2">
        {needRefresh && (
          <button className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm transition-colors" onClick={() => updateServiceWorker(true)}>
            Reload
          </button>
        )}
        <button className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm transition-colors" onClick={close}>
          Close
        </button>
      </div>
    </div>
  );
}

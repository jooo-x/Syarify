import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

type Route =
  | { name: 'beranda' }
  | { name: 'belajar' }
  | { name: 'modul'; slug: string }
  | { name: 'materi'; slug: string; materiIndex: number }
  | { name: 'kamus' }
  | { name: 'main' }
  | { name: 'tanya-ai' }
  | { name: 'peringkat' }
  | { name: 'pengaturan' }
  | { name: 'sumber' }
  | { name: 'tentang' };

interface RouterContextValue {
  route: Route;
  navigate: (route: Route) => void;
  goBack: () => void;
  canGoBack: boolean;
}

const MAX_HISTORY = 50;

const RouterContext = createContext<RouterContextValue | null>(null);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<Route[]>([{ name: 'beranda' }]);

  const route = history[history.length - 1];

  const navigate = useCallback((r: Route) => {
    setHistory((h) => {
      const next = [...h, r];
      return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goBack = useCallback(() => {
    setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    window.history.pushState(null, '', '');
  }, [route]);

  return (
    <RouterContext.Provider value={{ route, navigate, goBack, canGoBack: history.length > 1 }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}

export type { Route };

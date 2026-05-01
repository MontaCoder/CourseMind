import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api, { hydrateAuth, isAuthenticated } from '@/lib/api';

const GuardLoading = ({ label = 'Loading...' }: { label?: string }) => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="text-center">
      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      <p className="text-muted-foreground">{label}</p>
    </div>
  </div>
);

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'allowed' | 'denied'>(() => isAuthenticated() ? 'allowed' : 'loading');

  useEffect(() => {
    if (status !== 'loading') return;

    let active = true;
    hydrateAuth().then((session) => {
      if (active) setStatus(session ? 'allowed' : 'denied');
    });

    return () => {
      active = false;
    };
  }, [status]);

  if (status === 'loading') return <GuardLoading />;
  if (status === 'denied') return <Navigate to="/login" state={{ from: location }} replace />;

  return <>{children}</>;
};

export const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'allowed' | 'denied'>('loading');

  useEffect(() => {
    let active = true;
    hydrateAuth()
      .then((session) => {
        if (!active || !session) {
          if (active) setStatus('denied');
          return null;
        }
        return api.post<{ admin: { email: string } }>('/api/dashboard');
      })
      .then((response) => {
        if (!response) return;
        if (!active) return;
        sessionStorage.setItem('adminEmail', response.data.admin.email);
        setStatus('allowed');
      })
      .catch(() => {
        if (active) setStatus('denied');
      });

    return () => {
      active = false;
    };
  }, []);

  if (status === 'loading') return <GuardLoading label="Loading admin panel..." />;
  if (status === 'denied') {
    return <Navigate to={isAuthenticated() ? '/dashboard' : '/login'} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

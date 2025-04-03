
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface AuthCheckProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const AuthCheck = ({ children, redirectTo = '/auth' }: AuthCheckProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      const currentPath = window.location.pathname;
      navigate(`${redirectTo}?from=${encodeURIComponent(currentPath)}`);
    }
  }, [user, loading, navigate, redirectTo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <>{children}</> : null;
};

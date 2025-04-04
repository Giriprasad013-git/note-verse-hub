
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface AuthCheckProps {
  children: React.ReactNode;
  redirectTo?: string;
  allowGuest?: boolean;
}

export const AuthCheck = ({ 
  children, 
  redirectTo = '/auth', 
  allowGuest = true 
}: AuthCheckProps) => {
  const { user, loading, isGuest, guestId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      // If not authenticated and either guest mode is not allowed or there's no guest ID
      if (!user && !(allowGuest && isGuest && guestId)) {
        const currentPath = window.location.pathname;
        navigate(`${redirectTo}?from=${encodeURIComponent(currentPath)}`);
      }
    }
  }, [user, loading, navigate, redirectTo, isGuest, guestId, allowGuest]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render children if user is authenticated or guest is allowed and active
  return (user || (allowGuest && isGuest && guestId)) ? <>{children}</> : null;
};

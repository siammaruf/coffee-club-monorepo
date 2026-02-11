import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '~/redux/store/hooks'; 
import { checkAuthStatus } from '~/services/httpServices/authService';
import type { RootState } from '~/redux/store/rootReducer';
import type { AuthGuardProps } from '~/types/common';
import { Loading } from '~/components/ui/loading';

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch(); 
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      await dispatch(checkAuthStatus());
      setInitialCheckDone(true);
    };
    
    checkAuth();
  }, [dispatch]);

  useEffect(() => {
    if (initialCheckDone && !isAuthenticated && !loading) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate, initialCheckDone]);

  if (!initialCheckDone || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loading size="lg" />
        <span className="ml-3 text-lg font-medium text-muted-foreground">Loading your coffee...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
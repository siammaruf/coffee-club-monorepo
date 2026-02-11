import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '~/redux/store/hooks';
import { checkAuthStatus } from '~/services/httpServices/authService';
import type { RootState } from '~/redux/store/rootReducer';
import type { AuthGuardProps } from '~/types/common';

export function AuthRedirect({ children }: AuthGuardProps) {
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
    if (initialCheckDone && isAuthenticated && !loading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate, initialCheckDone]);

  if (!initialCheckDone || loading) {
    return <></>;
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
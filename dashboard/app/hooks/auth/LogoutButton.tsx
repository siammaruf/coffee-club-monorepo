import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { logout } from '~/redux/features/authSlice';
import { authService } from '~/services/httpServices/authService';

interface LogoutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function LogoutButton({ children, className = '', onClick, ...rest }: LogoutButtonProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    onClick?.();
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <button
      {...rest}
      onClick={handleLogout}
      className={className}
      type="button"
    >
      {children}
    </button>
  );
}
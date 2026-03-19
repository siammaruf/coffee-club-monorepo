import { useNavigate } from 'react-router';
import { authService } from '~/services/httpServices/authService';

interface LogoutButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function LogoutButton({ children, className = '', onClick }: LogoutButtonProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClick?.();
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={className}
      type="button"
    >
      {children}
    </button>
  );
}
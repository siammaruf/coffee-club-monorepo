import { useNavigate } from 'react-router';
import { authService } from '~/services/httpServices/authService';

interface LogoutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function LogoutButton({ children, className = '', onClick, ...rest }: LogoutButtonProps) {
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
      {...rest}
      onClick={handleLogout}
      className={className}
      type="button"
    >
      {children}
    </button>
  );
}
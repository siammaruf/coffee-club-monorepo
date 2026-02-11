import { useNavigate } from 'react-router';
import { authService } from '~/services/httpServices/authService';

interface LogoutButtonProps {
  children: React.ReactNode;
  className?: string;
}

export function LogoutButton({ children, className = '' }: LogoutButtonProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
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
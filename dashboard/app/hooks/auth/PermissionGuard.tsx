import { Navigate } from 'react-router';
import { useSelector } from 'react-redux';
import type { RootState } from '~/redux/store/rootReducer';

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Wrap a page component with this guard to protect it by permission.
 * Admin always passes. Other roles must have the permission in their list.
 * Redirects to `redirectTo` (default: /dashboard) if access is denied.
 *
 * Usage:
 *   export default function MyPage() {
 *     return (
 *       <PermissionGuard permission="orders.view">
 *         <OrdersContent />
 *       </PermissionGuard>
 *     );
 *   }
 */
export function PermissionGuard({
  permission,
  children,
  redirectTo = '/dashboard',
}: PermissionGuardProps) {
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) return <Navigate to="/" replace />;
  if (user.role === 'admin') return <>{children}</>;
  if (user.permissions?.includes(permission)) return <>{children}</>;

  return <Navigate to={redirectTo} replace />;
}

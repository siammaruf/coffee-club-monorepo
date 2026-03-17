import { useSelector } from 'react-redux';
import type { RootState } from '~/redux/store/rootReducer';

/**
 * Returns true if the current user has the given permission.
 * Admin role always returns true.
 */
export function usePermission(permission: string): boolean {
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) return false;
  if (user.role === 'admin') return true;

  return user.permissions?.includes(permission) ?? false;
}

/**
 * Returns true if the current user has ALL of the given permissions.
 * Admin role always returns true.
 */
export function usePermissions(permissions: string[]): boolean {
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) return false;
  if (user.role === 'admin') return true;

  return permissions.every((p) => user.permissions?.includes(p) ?? false);
}

/**
 * Returns true if the current user has ANY of the given permissions.
 * Admin role always returns true.
 */
export function useAnyPermission(permissions: string[]): boolean {
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) return false;
  if (user.role === 'admin') return true;

  return permissions.some((p) => user.permissions?.includes(p) ?? false);
}

import { httpService } from '../httpService';
import type { ApiResponse } from '~/types/user';
import type {
  GroupedPermissions,
  Permission,
  RolePermissionMatrix,
  RolePermissionsDetail,
} from '~/types/permission';

const BASE = '/permissions';

export const permissionsService = {
  getAll: () =>
    httpService.get<ApiResponse<Permission[]>>(BASE),

  getGrouped: () =>
    httpService.get<ApiResponse<GroupedPermissions>>(`${BASE}/grouped`),

  getMatrix: () =>
    httpService.get<ApiResponse<RolePermissionMatrix>>(`${BASE}/matrix`),

  getRolePermissions: (role: string) =>
    httpService.get<ApiResponse<RolePermissionsDetail>>(`${BASE}/roles/${role}`),

  setRolePermissions: (role: string, permission_ids: string[]) =>
    httpService.put<ApiResponse<null>>(`${BASE}/roles/${role}`, { permission_ids }),
};

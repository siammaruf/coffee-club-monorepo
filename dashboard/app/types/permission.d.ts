export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export type GroupedPermissions = Record<string, Permission[]>;

export type RolePermissionMatrix = Record<string, string[]>;

export interface RolePermissionsDetail {
  permission_ids: string[];
  permissions: Permission[];
}

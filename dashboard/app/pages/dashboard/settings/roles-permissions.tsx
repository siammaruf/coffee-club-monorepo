import { useEffect, useState, useCallback } from 'react';
import { PermissionGuard } from '~/hooks/auth/PermissionGuard';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Checkbox } from '~/components/ui/checkbox';
import { ShieldCheck, Save, RefreshCw } from 'lucide-react';
import { permissionsService } from '~/services/httpServices/permissionsService';
import type { GroupedPermissions, Permission, RolePermissionsDetail } from '~/types/permission';

const ROLES = [
  { key: 'manager', label: 'Manager', description: 'Operations & management access' },
  { key: 'chef', label: 'Chef', description: 'Kitchen & stock access' },
  { key: 'barista', label: 'Barista', description: 'Orders & products access' },
  { key: 'stuff', label: 'Staff', description: 'Limited view-only access' },
];

const RESOURCE_LABELS: Record<string, string> = {
  orders: 'Orders',
  employees: 'Employees',
  products: 'Products',
  categories: 'Categories',
  customers: 'Customers',
  kitchen_items: 'Kitchen Items',
  kitchen_stock: 'Kitchen Stock',
  tables: 'Tables',
  attendance: 'Attendance',
  salary: 'Salary',
  expenses: 'Expenses',
  discounts: 'Discounts',
  reports: 'Reports',
  website: 'Website',
  blog: 'Blog',
  reservations: 'Reservations',
  contact_messages: 'Contact Messages',
  partners: 'Partners',
  data_management: 'Data Management',
  settings: 'Settings',
  wifi_settings: 'WiFi Settings',
};

export default function RolesPermissionsPage() {
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermissions>({});
  const [selectedRole, setSelectedRole] = useState<string>('manager');
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadGroupedPermissions = useCallback(async () => {
    try {
      const res = await permissionsService.getGrouped();
      if (res?.data) setGroupedPermissions(res.data);
    } catch {
      setError('Failed to load permissions');
    }
  }, []);

  const loadRolePermissions = useCallback(async (role: string) => {
    try {
      const res = await permissionsService.getRolePermissions(role);
      const detail: RolePermissionsDetail | undefined = res?.data;
      if (detail) {
        setRolePermissions((prev) => ({
          ...prev,
          [role]: detail.permission_ids,
        }));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadGroupedPermissions();
      await Promise.all(ROLES.map((r) => loadRolePermissions(r.key)));
      setLoading(false);
    };
    init();
  }, [loadGroupedPermissions, loadRolePermissions]);

  const currentPermIds = rolePermissions[selectedRole] ?? [];

  const isChecked = (permId: string) => currentPermIds.includes(permId);

  const isResourceAllChecked = (perms: Permission[]) =>
    perms.length > 0 && perms.every((p) => currentPermIds.includes(p.id));

  const isResourcePartiallyChecked = (perms: Permission[]) =>
    perms.some((p) => currentPermIds.includes(p.id)) && !isResourceAllChecked(perms);

  const togglePermission = (permId: string) => {
    setRolePermissions((prev) => {
      const current = prev[selectedRole] ?? [];
      const updated = current.includes(permId)
        ? current.filter((id) => id !== permId)
        : [...current, permId];
      return { ...prev, [selectedRole]: updated };
    });
  };

  const toggleResource = (perms: Permission[]) => {
    const allChecked = isResourceAllChecked(perms);
    setRolePermissions((prev) => {
      const current = prev[selectedRole] ?? [];
      const permIds = perms.map((p) => p.id);
      const updated = allChecked
        ? current.filter((id) => !permIds.includes(id))
        : [...new Set([...current, ...permIds])];
      return { ...prev, [selectedRole]: updated };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaveSuccess(null);
    try {
      await permissionsService.setRolePermissions(selectedRole, currentPermIds);
      setSaveSuccess(`${selectedRole} permissions saved successfully`);
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch {
      setError('Failed to save permissions. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resources = Object.keys(groupedPermissions).sort();

  return (
    <PermissionGuard permission="settings.roles_permissions">
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-7 h-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Roles & Permissions</h1>
          <p className="text-sm text-muted-foreground">
            Manage what each role can access in the dashboard
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {saveSuccess && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {saveSuccess}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Role List */}
        <div className="col-span-12 md:col-span-3 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Select Role
          </p>
          {ROLES.map((role) => {
            const permCount = (rolePermissions[role.key] ?? []).length;
            return (
              <button
                key={role.key}
                onClick={() => setSelectedRole(role.key)}
                className={`w-full text-left rounded-lg border px-4 py-3 transition-all ${
                  selectedRole === role.key
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/40 hover:bg-muted/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{role.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {permCount}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{role.description}</p>
              </button>
            );
          })}

          {/* Admin note */}
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs font-semibold text-amber-800">Admin Role</p>
            <p className="text-xs text-amber-700 mt-1">
              Admin has full access to all features and cannot be restricted.
            </p>
          </div>
        </div>

        {/* Permissions Panel */}
        <div className="col-span-12 md:col-span-9">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base">
                Permissions for{' '}
                <span className="capitalize text-primary">{selectedRole}</span>
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadRolePermissions(selectedRole)}
                  disabled={loading}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving || loading}>
                  <Save className="w-4 h-4 mr-1" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : resources.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ShieldCheck className="w-10 h-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No permissions found</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Run <code className="bg-muted px-1 rounded">npm run seed:permissions</code> on the server to populate permissions.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {resources.map((resource) => {
                    const perms = groupedPermissions[resource] ?? [];
                    const allChecked = isResourceAllChecked(perms);
                    const partial = isResourcePartiallyChecked(perms);
                    const label = RESOURCE_LABELS[resource] ?? resource;

                    return (
                      <div
                        key={resource}
                        className="rounded-lg border border-border p-4 space-y-2.5"
                      >
                        {/* Resource header with select-all */}
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            className="h-4 w-4 shrink-0 rounded-sm border border-primary cursor-pointer"
                            checked={allChecked}
                            ref={(el) => {
                              if (el) el.indeterminate = partial;
                            }}
                            onChange={() => toggleResource(perms)}
                          />
                          <span className="text-sm font-semibold">{label}</span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {perms.filter((p) => currentPermIds.includes(p.id)).length}/{perms.length}
                          </span>
                        </div>

                        {/* Individual permissions */}
                        <div className="pl-6 space-y-1.5">
                          {perms.map((perm) => (
                            <label
                              key={perm.id}
                              className="flex items-center gap-2 cursor-pointer group"
                            >
                              <Checkbox
                                checked={isChecked(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                                className="cursor-pointer"
                              />
                              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                {perm.action}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </PermissionGuard>
  );
}

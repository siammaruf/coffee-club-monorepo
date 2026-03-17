import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../modules/users/enum/user-role.enum';
import { PermissionsService } from '../../modules/permissions/providers/permissions.service';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip public routes
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredPermission = this.reflector.getAllAndOverride<string>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @RequirePermission decorator = pass through
    if (!requiredPermission) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    // Admin bypasses all permission checks
    if (user.role === UserRole.ADMIN) return true;

    const rolePermissions = await this.permissionsService.getPermissionsForRole(
      user.role,
    );
    return rolePermissions.includes(requiredPermission);
  }
}

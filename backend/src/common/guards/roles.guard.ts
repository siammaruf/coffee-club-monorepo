import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../modules/users/enum/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Allow public routes to bypass role checking
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // If no user is present in the request, deny access
    if (!user) {
      this.logger.warn(`Role check denied: no user in request for ${context.getClass().name}.${context.getHandler().name}`);
      return false;
    }

    // Admin role has access to everything
    if (user.role?.toLowerCase() === UserRole.ADMIN) {
      return true;
    }

    const hasRole = requiredRoles.some((role) => user.role?.toLowerCase() === role);
    if (!hasRole) {
      this.logger.warn(
        `Role check denied: user ${user.id} (role: ${user.role}) does not have any of [${requiredRoles.join(', ')}] for ${context.getClass().name}.${context.getHandler().name}`
      );
    }
    return hasRole;
  }
}

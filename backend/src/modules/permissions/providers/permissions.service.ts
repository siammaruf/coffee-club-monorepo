import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UserRole } from '../../users/enum/user-role.enum';
import { CacheService } from '../../cache/cache.service';

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);
  private readonly CACHE_TTL = 3600 * 1000; // 1 hour

  constructor(
    @InjectRepository(Permission)
    private permissionRepo: Repository<Permission>,
    @InjectRepository(RolePermission)
    private rolePermissionRepo: Repository<RolePermission>,
    @InjectRepository(AuditLog)
    private auditLogRepo: Repository<AuditLog>,
    private readonly cacheService: CacheService,
  ) {}

  async findAll(): Promise<Permission[]> {
    return this.permissionRepo.find({ order: { resource: 'ASC', action: 'ASC' } });
  }

  async create(dto: CreatePermissionDto): Promise<Permission> {
    const permission = this.permissionRepo.create(dto);
    return this.permissionRepo.save(permission);
  }

  async getPermissionsForRole(role: UserRole): Promise<string[]> {
    const cacheKey = `permissions:role:${role}`;
    const cached = await this.cacheService.get<string[]>(cacheKey);
    if (cached) return cached;

    const rolePerms = await this.rolePermissionRepo.find({
      where: { role },
      relations: ['permission'],
    });

    const names = rolePerms.map((rp) => rp.permission.name);
    await this.cacheService.set(cacheKey, names, this.CACHE_TTL);
    return names;
  }

  async setPermissionsForRole(
    role: UserRole,
    permissionIds: string[],
    actorId: string,
    actorRole: string,
  ): Promise<void> {
    // Validate all permission IDs exist
    if (permissionIds.length > 0) {
      const permissions = await this.permissionRepo.findBy({ id: In(permissionIds) });
      if (permissions.length !== permissionIds.length) {
        throw new NotFoundException('One or more permission IDs are invalid');
      }
    }

    // Delete existing assignments for this role
    await this.rolePermissionRepo.delete({ role });

    // Bulk insert new assignments
    if (permissionIds.length > 0) {
      const rows = permissionIds.map((pid) =>
        this.rolePermissionRepo.create({ role, permission_id: pid }),
      );
      await this.rolePermissionRepo.save(rows);
    }

    // Invalidate caches
    await this.cacheService.delete(`permissions:role:${role}`);
    await this.cacheService.delete('user:*');

    // Write audit log
    await this.auditLogRepo.save(
      this.auditLogRepo.create({
        actor_id: actorId,
        actor_role: actorRole,
        action: 'role_permissions_updated',
        payload: { role, permission_ids: permissionIds },
      }),
    );

    this.logger.log(`Role ${role} permissions updated by ${actorId}`);
  }

  async getGroupedPermissions(): Promise<Record<string, Permission[]>> {
    const all = await this.findAll();
    return all.reduce<Record<string, Permission[]>>((acc, perm) => {
      if (!acc[perm.resource]) acc[perm.resource] = [];
      acc[perm.resource].push(perm);
      return acc;
    }, {});
  }

  async getRolePermissionMatrix(): Promise<Record<string, string[]>> {
    const roles = Object.values(UserRole).filter((r) => r !== UserRole.ADMIN);
    const matrix: Record<string, string[]> = {};

    await Promise.all(
      roles.map(async (role) => {
        matrix[role] = await this.getPermissionsForRole(role);
      }),
    );

    return matrix;
  }

  async getRolePermissionsWithIds(role: UserRole): Promise<{ permission_ids: string[]; permissions: Permission[] }> {
    const rolePerms = await this.rolePermissionRepo.find({
      where: { role },
      relations: ['permission'],
    });
    return {
      permission_ids: rolePerms.map((rp) => rp.permission_id),
      permissions: rolePerms.map((rp) => rp.permission),
    };
  }
}

import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { UserRole } from '../../users/enum/user-role.enum';
import { DEFAULT_PERMISSIONS, ROLE_PERMISSION_DEFAULTS } from '../constants/permission-defaults';

@Injectable()
export class PermissionsSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PermissionsSeedService.name);

  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: Repository<RolePermission>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    // Phase 1: Upsert permissions — insert any that don't exist yet
    for (const perm of DEFAULT_PERMISSIONS) {
      const existing = await this.permissionRepo.findOne({ where: { name: perm.name } });
      if (!existing) {
        await this.permissionRepo.save(this.permissionRepo.create(perm));
        this.logger.log(`Seeded permission: ${perm.name}`);
      }
    }

    // Phase 2: Seed role_permissions per-role — ensure ALL default permissions are present
    const allPermissions = await this.permissionRepo.find();
    const permByName = new Map(allPermissions.map((p) => [p.name, p]));

    for (const [role, permNames] of Object.entries(ROLE_PERMISSION_DEFAULTS)) {
      // Get existing assignments for this role
      const existingRolePerms = await this.rolePermissionRepo.find({
        where: { role: role as UserRole },
        relations: ['permission'],
      });
      const existingPermNames = new Set(existingRolePerms.map((rp) => rp.permission?.name).filter(Boolean));

      const rows: RolePermission[] = [];
      for (const name of permNames) {
        if (existingPermNames.has(name)) continue; // Already assigned, skip
        const perm = permByName.get(name);
        if (perm) {
          rows.push(this.rolePermissionRepo.create({ role: role as UserRole, permission_id: perm.id }));
        }
      }
      if (rows.length > 0) {
        await this.rolePermissionRepo.save(rows);
        this.logger.log(`Seeded ${rows.length} missing permissions for role: ${role}`);
      }
    }
  }
}

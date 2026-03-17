import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Permission } from '../modules/permissions/entities/permission.entity';
import { RolePermission } from '../modules/permissions/entities/role-permission.entity';
import { UserRole } from '../modules/users/enum/user-role.enum';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DEFAULT_PERMISSIONS, ROLE_PERMISSION_DEFAULTS } from '../modules/permissions/constants/permission-defaults';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });
  const permissionRepo = app.get<Repository<Permission>>(getRepositoryToken(Permission));
  const rolePermissionRepo = app.get<Repository<RolePermission>>(getRepositoryToken(RolePermission));

  try {
    console.log('Seeding permissions...');

    // Upsert all permissions
    for (const perm of DEFAULT_PERMISSIONS) {
      const existing = await permissionRepo.findOne({ where: { name: perm.name } });
      if (!existing) {
        await permissionRepo.save(permissionRepo.create(perm));
        console.log(`  Created: ${perm.name}`);
      } else {
        console.log(`  Exists:  ${perm.name}`);
      }
    }

    // Load all permissions by name for lookup
    const allPermissions = await permissionRepo.find();
    const permByName = new Map(allPermissions.map((p) => [p.name, p]));

    console.log('\nSeeding role-permission assignments...');

    for (const [role, permNames] of Object.entries(ROLE_PERMISSION_DEFAULTS)) {
      // Clear existing assignments
      await rolePermissionRepo.delete({ role: role as UserRole });

      const rows: RolePermission[] = [];
      for (const name of permNames) {
        const perm = permByName.get(name);
        if (!perm) {
          console.warn(`  WARNING: Permission "${name}" not found, skipping`);
          continue;
        }
        rows.push(rolePermissionRepo.create({ role: role as UserRole, permission_id: perm.id }));
      }

      await rolePermissionRepo.save(rows);
      console.log(`  ${role}: assigned ${rows.length} permissions`);
    }

    console.log('\nPermissions seed completed successfully!');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error seeding permissions:', errorMessage);
  } finally {
    await app.close();
  }
}

bootstrap();

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { AuditLog } from './entities/audit-log.entity';
import { PermissionsService } from './providers/permissions.service';
import { PermissionsSeedService } from './providers/permissions-seed.service';
import { PermissionsController } from './permissions.controller';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, RolePermission, AuditLog]),
    CacheModule,
  ],
  controllers: [PermissionsController],
  providers: [
    PermissionsService,
    PermissionsSeedService,
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
  exports: [PermissionsService],
})
export class PermissionsModule {}

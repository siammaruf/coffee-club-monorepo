import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PermissionsService } from './providers/permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { SetRolePermissionsDto } from './dto/set-role-permissions.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { UserRole } from '../users/enum/user-role.enum';
import { UserResponseDto } from '../users/dto/user-response.dto';

@ApiTags('Permissions')
@Controller('permissions')
@Roles(UserRole.ADMIN)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all permissions' })
  async findAll() {
    const data = await this.permissionsService.findAll();
    return {
      status: 'success',
      message: 'Permissions retrieved successfully',
      statusCode: HttpStatus.OK,
      data,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new permission' })
  async create(@Body() dto: CreatePermissionDto) {
    const data = await this.permissionsService.create(dto);
    return {
      status: 'success',
      message: 'Permission created successfully',
      statusCode: HttpStatus.CREATED,
      data,
    };
  }

  @Get('matrix')
  @ApiOperation({ summary: 'Get full role-permission matrix' })
  async getMatrix() {
    const data = await this.permissionsService.getRolePermissionMatrix();
    return {
      status: 'success',
      message: 'Permission matrix retrieved successfully',
      statusCode: HttpStatus.OK,
      data,
    };
  }

  @Get('grouped')
  @ApiOperation({ summary: 'Get all permissions grouped by resource' })
  async getGrouped() {
    const data = await this.permissionsService.getGroupedPermissions();
    return {
      status: 'success',
      message: 'Grouped permissions retrieved successfully',
      statusCode: HttpStatus.OK,
      data,
    };
  }

  @Get('roles/:role')
  @ApiOperation({ summary: 'Get permission IDs assigned to a role' })
  async getRolePermissions(@Param('role') role: UserRole) {
    const data = await this.permissionsService.getRolePermissionsWithIds(role);
    return {
      status: 'success',
      message: `Permissions for role ${role} retrieved successfully`,
      statusCode: HttpStatus.OK,
      data,
    };
  }

  @Put('roles/:role')
  @ApiOperation({ summary: 'Set permissions for a role (replaces all)' })
  async setRolePermissions(
    @Param('role') role: UserRole,
    @Body() dto: SetRolePermissionsDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    await this.permissionsService.setPermissionsForRole(
      role,
      dto.permission_ids,
      user.id ?? 'unknown',
      user.role,
    );
    return {
      status: 'success',
      message: `Permissions for role ${role} updated successfully`,
      statusCode: HttpStatus.OK,
      data: null,
    };
  }
}

import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enum/user-role.enum';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('Settings')
@ApiBearerAuth('staff-auth')
@ApiErrorResponses()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @RequirePermission('settings.roles_permissions')
  @ApiOperation({
    summary: 'List all settings',
    description: 'Retrieves all application settings (admin only)',
  })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  async getAllSettings() {
    const settings = await this.settingsService.getAllSettings();
    return {
      data: settings,
      status: 'success',
      message: 'Settings retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':key')
  @RequirePermission('settings.roles_permissions')
  @ApiOperation({
    summary: 'Get setting by key',
    description: 'Retrieves a single setting by its key (admin only)',
  })
  @ApiParam({ name: 'key', description: 'Setting key', example: 'reservations_enabled' })
  @ApiResponse({ status: 200, description: 'Setting retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  async getSettingByKey(@Param('key') key: string) {
    const setting = await this.settingsService.getSettingEntity(key);
    return {
      data: setting,
      status: 'success',
      message: 'Setting retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Put(':key')
  @RequirePermission('settings.roles_permissions')
  @ApiOperation({
    summary: 'Update setting',
    description: 'Updates a setting value by key (admin only). Creates the setting if it does not exist.',
  })
  @ApiParam({ name: 'key', description: 'Setting key', example: 'reservations_enabled' })
  @ApiResponse({ status: 200, description: 'Setting updated successfully' })
  async updateSetting(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
  ) {
    const setting = await this.settingsService.setSetting(key, dto.value);
    return {
      data: setting,
      status: 'success',
      message: 'Setting updated successfully.',
      statusCode: HttpStatus.OK,
    };
  }
}

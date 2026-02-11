import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/user.decorator';
import { UserRole } from '../../users/enum/user-role.enum';
import { User } from '../../users/entities/user.entity';
import { BackupType } from '../enums/backup-type.enum';
import { UpdateBackupSettingsDto } from '../dto/update-backup-settings.dto';

import { BackupService } from '../providers/backup.service';
import { BackupSchedulerService } from '../providers/backup-scheduler.service';
import { GoogleDriveService } from '../providers/google-drive.service';

@ApiTags('Data Management - Backup')
@Controller('data-management/backup')
@Roles(UserRole.ADMIN)
export class BackupController {
  constructor(
    private readonly backupService: BackupService,
    private readonly schedulerService: BackupSchedulerService,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a manual backup' })
  @ApiResponse({
    status: 201,
    description: 'Backup created successfully',
  })
  @ApiResponse({
    status: 500,
    description: 'Backup creation failed',
  })
  async createBackup(@CurrentUser() user: User) {
    return this.backupService.createBackup(user, BackupType.MANUAL);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get backup history with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Backup history retrieved successfully',
  })
  async getHistory(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.backupService.getHistory(pageNumber, limitNumber);
  }

  @Get('history/:id')
  @ApiOperation({ summary: 'Get backup detail by ID' })
  @ApiParam({
    name: 'id',
    description: 'Backup history UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Backup detail retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Backup not found',
  })
  async getBackupDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.backupService.findHistoryById(id);
  }

  @Delete('history/:id')
  @ApiOperation({ summary: 'Delete a backup' })
  @ApiParam({
    name: 'id',
    description: 'Backup history UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Backup deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Backup not found',
  })
  async deleteBackup(@Param('id', ParseUUIDPipe) id: string) {
    await this.backupService.deleteBackup(id);
    return { message: 'Backup deleted successfully' };
  }

  @Post('restore/:id')
  @ApiOperation({ summary: 'Restore database from a backup' })
  @ApiParam({
    name: 'id',
    description: 'Backup history UUID to restore from',
  })
  @ApiResponse({
    status: 200,
    description: 'Backup restored successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Backup not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Backup file not available or integrity check failed',
  })
  @ApiResponse({
    status: 500,
    description: 'Restore failed',
  })
  async restoreBackup(@Param('id', ParseUUIDPipe) id: string) {
    await this.backupService.restoreFromBackup(id);
    return { message: 'Backup restored successfully' };
  }

  @Get('restore/:id/preview')
  @ApiOperation({
    summary: 'Preview backup metadata before restoring',
  })
  @ApiParam({
    name: 'id',
    description: 'Backup history UUID to preview',
  })
  @ApiResponse({
    status: 200,
    description: 'Backup preview retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Backup not found',
  })
  async previewRestore(@Param('id', ParseUUIDPipe) id: string) {
    return this.backupService.previewBackup(id);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get backup settings' })
  @ApiResponse({
    status: 200,
    description: 'Backup settings retrieved successfully',
  })
  async getSettings() {
    return this.schedulerService.getSettings();
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update backup settings' })
  @ApiResponse({
    status: 200,
    description: 'Backup settings updated successfully',
  })
  async updateSettings(@Body() dto: UpdateBackupSettingsDto) {
    return this.schedulerService.updateSettings(dto);
  }

  @Get('drive/status')
  @ApiOperation({
    summary: 'Check Google Drive connection status',
  })
  @ApiResponse({
    status: 200,
    description: 'Google Drive connection status',
  })
  async getDriveStatus() {
    return this.googleDriveService.checkConnection();
  }
}

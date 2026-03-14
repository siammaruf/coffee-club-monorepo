import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
  Req,
  Res,
  Header,
  BadRequestException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/user.decorator';
import { UserRole } from '../../users/enum/user-role.enum';
import { User } from '../../users/entities/user.entity';
import { BackupType } from '../enums/backup-type.enum';
import { UpdateBackupSettingsDto } from '../dto/update-backup-settings.dto';

import { BackupService } from '../providers/backup.service';
import { BackupSchedulerService } from '../providers/backup-scheduler.service';
import { GoogleDriveService } from '../providers/google-drive.service';
import { ApiErrorResponses } from '../../../common/decorators/api-error-responses.decorator';

@ApiTags('Data Management - Backup')
@ApiBearerAuth('staff-auth')
@ApiErrorResponses()
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

  @Patch('settings/oauth')
  @ApiOperation({ summary: 'Save Google OAuth2 credentials for Drive access' })
  @ApiResponse({ status: 200, description: 'OAuth credentials saved successfully' })
  async updateOAuthSettings(@Body() dto: UpdateBackupSettingsDto) {
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

  @Get('drive/oauth/authorize')
  @ApiOperation({
    summary: 'Initiate Google OAuth2 flow for Drive access',
  })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth consent screen' })
  @ApiResponse({ status: 400, description: 'OAuth2 credentials not configured' })
  async oauthAuthorize(@Req() req: Request, @Res() res: Response) {
    const callbackUrl = `${req.protocol}://${req.get('host')}/api/v1/data-management/backup/drive/oauth/callback`;
    const authUrl = await this.googleDriveService.getOAuthAuthorizationUrl(callbackUrl);
    if (!authUrl) {
      throw new BadRequestException(
        'OAuth2 Client ID and Secret must be saved in backup settings before authorizing.',
      );
    }
    res.redirect(authUrl);
  }

  @Public()
  @Get('drive/oauth/callback')
  @Header('Content-Type', 'text/html')
  @ApiOperation({
    summary: 'Google OAuth2 callback — exchanges code and saves refresh token',
  })
  async oauthCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Query('code') code: string,
    @Query('error') error: string,
    @Query('state') state: string,
  ) {
    const dashboardOrigin = (process.env.CORS_ORIGINS ?? '').split(',')[0]?.trim() || '';

    if (error) {
      return res.send(oauthPopupHtml(null, `Google denied access: ${error}`, dashboardOrigin));
    }
    if (!code) {
      return res.send(oauthPopupHtml(null, 'No authorization code received.', dashboardOrigin));
    }
    if (!state || !this.googleDriveService.validateOAuthState(state)) {
      return res.send(oauthPopupHtml(null, 'Invalid or expired OAuth state. Please try again.', dashboardOrigin));
    }
    try {
      const callbackUrl = `${req.protocol}://${req.get('host')}/api/v1/data-management/backup/drive/oauth/callback`;
      const refreshToken = await this.googleDriveService.exchangeOAuthCode(code, callbackUrl);
      return res.send(oauthPopupHtml(refreshToken, null, dashboardOrigin));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'OAuth2 token exchange failed';
      return res.send(oauthPopupHtml(null, message, dashboardOrigin));
    }
  }
}

function oauthPopupHtml(
  refreshToken: string | null,
  error: string | null,
  targetOrigin: string,
): string {
  const payload = refreshToken
    ? JSON.stringify({ type: 'oauth_success', refreshToken })
    : JSON.stringify({ type: 'oauth_error', error });

  // targetOrigin restricts postMessage to the dashboard domain only (not '*')
  const safeTarget = targetOrigin || '*';

  return `<!DOCTYPE html>
<html>
<head><title>Google Drive Authorization</title></head>
<body>
  <p>${refreshToken ? 'Authorization successful! You can close this window.' : `Authorization failed: ${error}`}</p>
  <script>
    try {
      window.opener && window.opener.postMessage(${payload}, ${JSON.stringify(safeTarget)});
    } catch(e) {}
    window.close();
  </script>
</body>
</html>`;
}

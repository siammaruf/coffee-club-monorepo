import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateOAuthSettingsDto {
  @ApiPropertyOptional({
    description: 'Google OAuth2 client ID (for personal Drive uploads)',
    example: '123456789-abc.apps.googleusercontent.com',
  })
  @IsOptional()
  @IsString()
  google_oauth_client_id?: string | null;

  @ApiPropertyOptional({
    description: 'Google OAuth2 client secret (for personal Drive uploads)',
    example: 'GOCSPX-...',
  })
  @IsOptional()
  @IsString()
  google_oauth_client_secret?: string | null;

  @ApiPropertyOptional({
    description: 'Google OAuth2 refresh token (for personal Drive uploads)',
    example: '1//0e...',
  })
  @IsOptional()
  @IsString()
  google_oauth_refresh_token?: string | null;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateIf } from 'class-validator';

export class UpdateOAuthSettingsDto {
  @ApiPropertyOptional({
    description: 'Google OAuth2 refresh token (null to disconnect)',
    example: '1//0e...',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((o) => o.google_oauth_refresh_token !== null)
  @IsString()
  google_oauth_refresh_token?: string | null;
}

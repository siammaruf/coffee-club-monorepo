import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateWifiSettingsDto {
  @ApiProperty({
    description: 'WiFi network name (SSID)',
    example: 'CoffeeClub',
  })
  @IsString()
  wifi_name: string;

  @ApiProperty({
    description: 'WiFi password',
    example: '12345678',
  })
  @IsString()
  wifi_password: string;
}

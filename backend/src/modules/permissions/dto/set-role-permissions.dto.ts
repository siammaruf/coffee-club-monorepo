import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class SetRolePermissionsDto {
  @ApiProperty({ type: [String], description: 'Array of permission UUIDs' })
  @IsArray()
  @IsUUID('4', { each: true })
  permission_ids: string[];
}

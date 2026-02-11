import { ApiProperty } from '@nestjs/swagger';
import { CreateActivityDto } from './create-activity.dto';

export class ActivityResponseDto extends CreateActivityDto {
  @ApiProperty({
    description: 'Unique identifier of the activity',
    example: 'activity-uuid-1'
  })
  id: string;

  @ApiProperty({
    description: 'User who performed the activity',
    example: {
      id: 'user-uuid-1',
      name: 'John Doe',
      role: 'SERVER'
    },
    nullable: true
  })
  user?: {
    id: string;
    name: string;
    role: string;
  };

  @ApiProperty({
    description: 'Customer involved in the activity',
    example: {
      id: 'customer-uuid-1',
      name: 'Jane Smith',
      phone: '+1234567890'
    },
    nullable: true
  })
  customer?: {
    id: string;
    name: string;
    phone: string;
  };

  @ApiProperty({
    description: 'Timestamp when activity was recorded',
    example: '2024-01-20T14:30:00.000Z'
  })
  created_at: Date;

  @ApiProperty({
    description: 'Timestamp when record was last updated',
    example: '2024-01-20T14:30:00.000Z'
  })
  updated_at: Date;
}
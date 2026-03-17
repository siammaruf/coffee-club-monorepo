import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsService } from './sms.service';
import { SmsLog } from './entities/sms-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SmsLog])],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}

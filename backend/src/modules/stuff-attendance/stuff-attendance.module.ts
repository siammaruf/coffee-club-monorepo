import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StuffAttendanceController } from './stuff-attendance.controller';
import { StuffAttendanceService } from './providers/stuff-attendance.service';
import { StuffAttendance } from './entities/stuff-attendance.entity';
import { User } from '../users/entities/user.entity';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StuffAttendance, User]),
    CacheModule
  ],
  controllers: [StuffAttendanceController],
  providers: [StuffAttendanceService],
  exports: [StuffAttendanceService]
})
export class StuffAttendanceModule {}
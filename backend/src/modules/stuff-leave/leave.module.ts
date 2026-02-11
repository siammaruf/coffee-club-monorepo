import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveController } from './leave.controller';
import { LeaveService } from './providers/leave.service';
import { Leave } from './entities/leave.entity';
import { User } from '../users/entities/user.entity';
import { CacheModule } from '../cache/cache.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Leave, User]),
        CacheModule
    ],
    controllers: [LeaveController],
    providers: [LeaveService],
    exports: [LeaveService]
})
export class LeaveModule {}
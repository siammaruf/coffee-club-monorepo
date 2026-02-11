import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './providers/user.service';
import { User } from './entities/user.entity';
import { EncryptionUtil } from 'src/common/utils/encryption.util';
import { BankModule } from '../banks/bank.module';
import { EmailModule } from '../email/email.module';
import { SmsModule } from '../sms/sms.module';
import { PasswordResetToken } from '../auth/entities/password-reset-token.entity';
import { CacheModule } from '../cache/cache.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PasswordResetToken]),
    BankModule,
    EmailModule,
    SmsModule,
    CacheModule,
    CloudinaryModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    EncryptionUtil,
  ],
  exports: [UserService, EncryptionUtil]
})
export class UserModule {}
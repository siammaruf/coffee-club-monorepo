import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerAuthService } from './providers/customer-auth.service';
import { CustomerAuthController } from './customer-auth.controller';
import { CustomerJwtStrategy } from './strategies/customer-jwt.strategy';
import { Customer } from '../customers/entities/customer.entity';
import { PasswordResetToken } from '../auth/entities/password-reset-token.entity';
import { EmailModule } from '../email/email.module';
import { SmsModule } from '../sms/sms.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Customer, PasswordResetToken]),
    EmailModule,
    SmsModule,
    CacheModule,
  ],
  controllers: [CustomerAuthController],
  providers: [CustomerAuthService, CustomerJwtStrategy],
  exports: [CustomerAuthService],
})
export class CustomerAuthModule {}

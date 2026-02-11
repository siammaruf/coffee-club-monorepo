import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../users/providers/user.service';
import { UserStatus } from '../../users/enum/user-status.enum';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordResetToken } from '../entities/password-reset-token.entity';
import { Repository } from 'typeorm';
import { EmailService } from 'src/modules/email/email.service';
import { SmsService } from 'src/modules/sms/sms.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepository: Repository<PasswordResetToken>,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: { token, used: false }
    });

    if (!resetToken) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (new Date() > resetToken.expiresAt) {
      throw new UnauthorizedException('Token has expired');
    }

    resetToken.used = true;
    await this.passwordResetTokenRepository.save(resetToken);
    await this.userService.update(resetToken.userId, { password: newPassword });
  }

  async newUserPassword(token: string, newPassword: string): Promise<void> {
    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: { token, used: false }
    });

    if (!resetToken) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (new Date() > resetToken.expiresAt) {
      throw new UnauthorizedException('Token has expired');
    }

    resetToken.used = true;
    await this.passwordResetTokenRepository.save(resetToken);
    await this.userService.update(resetToken.userId, {
      password: newPassword,
      status: UserStatus.ACTIVE,
      date_joined: new Date()
    });
  }

  async verifyResetToken(token: string): Promise<boolean> {
    try {
      const resetToken = await this.passwordResetTokenRepository.findOne({
        where: { token, used: false }
      });

      if (!resetToken) {
        return false;
      }
      return new Date() <= resetToken.expiresAt;
    } catch (error) {
      console.error('Error verifying reset token:', error);
      return false;
    }
  }

  async validateUser(identifier: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findByIdentifier(identifier, password);
      return user;
    } catch (error) {
      return null;
    }
  }

  async login(identifier: string, password: string, rememberMe: boolean = false) {
    const user = await this.validateUser(identifier, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };

    const accessTokenExpiry = rememberMe ? '24h' : '15m';
    const refreshTokenExpiry = rememberMe ? '30d' : '7d';

    const access_token = this.jwtService.sign(payload, { expiresIn: accessTokenExpiry });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: refreshTokenExpiry });

    return {
      user,
      access_token,
      refresh_token,
      token_type: 'bearer'
    };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async forgotPassword(identifier: string): Promise<{ success: boolean; message: string }> {
    try {
      let user;
      const isEmail = identifier.includes('@');

      if (isEmail) {
        user = await this.userService.findByEmail(identifier);
      } else {
        user = await this.userService.findByPhone(identifier);
      }

      if (!user) {
        return {
          success: false,
          message: 'No account found with this email/phone number'
        };
      }

      const token = this.generateOtp();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);

      const resetToken = this.passwordResetTokenRepository.create({
        userId: user.id,
        token,
        expiresAt,
        used: false,
        isOtp: true,
      });

      await this.passwordResetTokenRepository.save(resetToken);
      const promises: Promise<any>[] = [];

      if (user.email) {
        promises.push(this.emailService.sendOtpEmail(user.email, token));
      }

      if (user.phone) {
        promises.push(this.smsService.sendOtpSms(user.phone, token));
      }

      await Promise.all(promises);

      return {
        success: true,
        message: 'OTP sent to your registered email and phone number'
      };
    } catch (error) {
      console.error('Error in forgotPassword:', error);
      return { success: false, message: 'Failed to process password reset request' };
    }
  }

  async verifyOtp(emailOrPhone: string, otp: string){
    try {
      const user = await this.userService.findByEmailOrPhone(emailOrPhone);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      const resetToken = await this.passwordResetTokenRepository.findOne({
        where: {
          userId: user.id,
          token: otp,
          used: false,
          isOtp: true,
        },
        order: { createdAt: 'DESC' },
      });

      if (!resetToken) {
        return { success: false, message: 'Invalid OTP' };
      }

      if (new Date() > resetToken.expiresAt) {
        return {
          success: false,
          message: 'OTP has expired',
          canResend: true,
        };
      }

      const passwordResetToken = await this.userService.createPasswordResetToken(user.id);
      resetToken.token = passwordResetToken;
      resetToken.expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      resetToken.used = false;
      resetToken.isOtp = false;

      await this.passwordResetTokenRepository.save(resetToken);

      return {
        success: true,
        message: 'OTP verified successfully',
        token: passwordResetToken
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, message: 'Failed to verify OTP' };
    }
  }
}

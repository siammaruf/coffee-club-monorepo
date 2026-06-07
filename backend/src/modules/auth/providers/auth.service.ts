import { createHmac } from 'crypto';
import { Injectable, Logger, Optional, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../users/providers/user.service';
import { UserStatus } from '../../users/enum/user-status.enum';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordResetToken } from '../entities/password-reset-token.entity';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { EmailService } from 'src/modules/email/email.service';
import { SmsService } from 'src/modules/sms/sms.service';
import { WhatsAppMessageService } from '../../whatsapp/providers/whatsapp-message.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  /**
   * Hash a raw refresh token with HMAC-SHA256 using a server-side pepper.
   * This prevents attackers from using stolen DB tokens directly, because
   * they would need BOTH the database dump AND the pepper to compute valid hashes.
   */
  private hashRefreshToken(token: string): string {
    const pepper = this.configService.get<string>('REFRESH_TOKEN_PEPPER');
    if (!pepper) {
      this.logger.warn(
        'REFRESH_TOKEN_PEPPER is not set in environment variables. ' +
        'Refresh token storage is using a fallback pepper. ' +
        'Set REFRESH_TOKEN_PEPPER to a strong random string for production.',
      );
    }
    return createHmac('sha256', pepper || 'coffee-club-default-pepper')
      .update(token)
      .digest('hex');
  }

  /**
   * Invalidate a user's refresh token in the database (e.g., on logout).
   */
  async revokeRefreshToken(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.refresh_token = null;
      await this.userService.update(user.id, { refresh_token: null });
    }
  }

  /**
   * Revoke a refresh token by its raw value (used by public logout endpoint).
   * Hashes the incoming token and finds the matching user to invalidate.
   */
  async revokeRefreshTokenByHash(rawRefreshToken: string): Promise<void> {
    const hash = this.hashRefreshToken(rawRefreshToken);
    let user = await this.userRepository.findOne({
      where: { refresh_token: hash },
    });
    // Fallback for legacy raw tokens still in the DB during transition
    if (!user) {
      user = await this.userRepository.findOne({
        where: { refresh_token: rawRefreshToken },
      });
    }
    if (user) {
      user.refresh_token = null;
      await this.userService.update(user.id, { refresh_token: null });
    }
  }

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepository: Repository<PasswordResetToken>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
    private smsService: SmsService,
    @Optional() private whatsappMessageService: WhatsAppMessageService,
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
      this.logger.error('Error verifying reset token: ' + (error?.message || error));
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
    const refresh_token = this.jwtService.sign(
      { ...payload, rememberMe },
      { expiresIn: refreshTokenExpiry },
    );

    // Store refresh token hash in DB so we can revoke/rotate it
    user.refresh_token = this.hashRefreshToken(refresh_token);
    await this.userService.update(user.id, { refresh_token: user.refresh_token });

    return {
      user,
      access_token,
      refresh_token,
      token_type: 'bearer'
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      const incomingHash = this.hashRefreshToken(refreshToken);
      let isValid = false;

      if (user) {
        // Primary: compare hashed token (new secure path)
        if (user.refresh_token === incomingHash) {
          isValid = true;
        }
        // Fallback: compare raw token for graceful transition of existing sessions.
        // Once a token rotates, the DB value becomes hashed, so this path disappears.
        else if (user.refresh_token === refreshToken) {
          isValid = true;
        }
      }

      if (!isValid || !user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const rememberMe = payload.rememberMe === true;
      const accessTokenExpiry = rememberMe ? '24h' : '15m';
      const refreshTokenExpiry = rememberMe ? '30d' : '7d';

      const new_access_token = this.jwtService.sign(
        { sub: user.id, email: user.email, role: user.role },
        { expiresIn: accessTokenExpiry },
      );

      // Rotate refresh token and store only its hash
      const new_refresh_token = this.jwtService.sign(
        { sub: user.id, email: user.email, role: user.role, rememberMe },
        { expiresIn: refreshTokenExpiry },
      );
      user.refresh_token = this.hashRefreshToken(new_refresh_token);
      await this.userService.update(user.id, { refresh_token: user.refresh_token });

      return {
        access_token: new_access_token,
        refresh_token: new_refresh_token,
        token_type: 'bearer',
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
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

        // Send OTP via WhatsApp if enabled (fire-and-forget)
        this.whatsappMessageService?.sendOtp(user.phone, token).catch((err) =>
          this.logger.warn(`WhatsApp OTP failed: ${err.message}`),
        );
      }

      await Promise.all(promises);

      return {
        success: true,
        message: 'OTP sent to your registered email and phone number'
      };
    } catch (error) {
      this.logger.error('Error in forgotPassword: ' + (error?.message || error));
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
      this.logger.error('Error verifying OTP: ' + (error?.message || error));
      return { success: false, message: 'Failed to verify OTP' };
    }
  }
}

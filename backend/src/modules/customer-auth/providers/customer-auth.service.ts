import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { PasswordResetToken } from '../../auth/entities/password-reset-token.entity';
import { EncryptionUtil } from '../../../common/utils/encryption.util';
import { CustomerRegisterDto } from '../dto/customer-register.dto';
import { UpdateCustomerProfileDto } from '../dto/update-customer-profile.dto';
import { EmailService } from '../../email/email.service';
import { SmsService } from '../../sms/sms.service';
import { randomBytes } from 'crypto';

@Injectable()
export class CustomerAuthService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  private async encryptPassword(password: string): Promise<string> {
    const { encryptedPassword, iv } = await EncryptionUtil.encryptPassword(password);
    return `${encryptedPassword}:${iv}`;
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async register(dto: CustomerRegisterDto): Promise<Customer> {
    const existingByEmail = await this.customerRepository.findOne({
      where: { email: dto.email },
    });
    if (existingByEmail) {
      throw new ConflictException('Email address is already in use');
    }

    const existingByPhone = await this.customerRepository.findOne({
      where: { phone: dto.phone },
    });
    if (existingByPhone) {
      throw new ConflictException('Phone number is already in use');
    }

    const encryptedPassword = await this.encryptPassword(dto.password);

    const customer = this.customerRepository.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      password: encryptedPassword,
      is_verified: false,
      is_active: true,
    });

    const savedCustomer = await this.customerRepository.save(customer);

    // Remove sensitive fields before returning
    const { password, refresh_token, otp, ...result } = savedCustomer;
    return result as Customer;
  }

  async login(identifier: string, password: string): Promise<{
    customer: Partial<Customer>;
    access_token: string;
    refresh_token: string;
  }> {
    const customer = await this.customerRepository.findOne({
      where: [
        { email: identifier },
        { phone: identifier },
      ],
    });

    if (!customer) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!customer.password) {
      throw new UnauthorizedException('No password set for this account. Please register or reset your password.');
    }

    if (!customer.is_active) {
      throw new UnauthorizedException('Account is inactive');
    }

    const [storedPassword, storedIv] = customer.password.split(':');
    const isValid = await EncryptionUtil.verifyPassword(password, storedPassword, storedIv);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: customer.id,
      email: customer.email,
      type: 'customer',
    };

    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Store refresh token
    customer.refresh_token = refresh_token;
    await this.customerRepository.save(customer);

    return {
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        picture: customer.picture,
      },
      access_token,
      refresh_token,
    };
  }

  async forgotPassword(identifier: string): Promise<{ success: boolean; message: string }> {
    try {
      const isEmail = identifier.includes('@');
      const customer = await this.customerRepository.findOne({
        where: isEmail ? { email: identifier } : { phone: identifier },
      });

      if (!customer) {
        // Don't reveal whether user exists
        return {
          success: true,
          message: 'If an account exists with this identifier, an OTP has been sent',
        };
      }

      const otp = this.generateOtp();
      const otpExpiresAt = new Date();
      otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 5);

      customer.otp = otp;
      customer.otp_expires_at = otpExpiresAt;
      await this.customerRepository.save(customer);

      const promises: Promise<any>[] = [];

      if (customer.email) {
        promises.push(this.emailService.sendOtpEmail(customer.email, otp));
      }

      if (customer.phone) {
        promises.push(this.smsService.sendOtpSms(customer.phone, otp));
      }

      await Promise.all(promises);

      return {
        success: true,
        message: 'OTP sent to your registered email and phone number',
      };
    } catch (error) {
      console.error('Error in customer forgotPassword:', error);
      return { success: false, message: 'Failed to process password reset request' };
    }
  }

  async verifyOtp(identifier: string, otp: string): Promise<{ success: boolean; message: string; token?: string }> {
    try {
      const isEmail = identifier.includes('@');
      const customer = await this.customerRepository.findOne({
        where: isEmail ? { email: identifier } : { phone: identifier },
      });

      if (!customer) {
        return { success: false, message: 'Customer not found' };
      }

      if (!customer.otp || customer.otp !== otp) {
        return { success: false, message: 'Invalid OTP' };
      }

      if (!customer.otp_expires_at || new Date() > customer.otp_expires_at) {
        return { success: false, message: 'OTP has expired' };
      }

      // Clear OTP
      customer.otp = null;
      customer.otp_expires_at = null;
      await this.customerRepository.save(customer);

      // Generate password reset token
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      const resetToken = this.passwordResetTokenRepository.create({
        userId: customer.id,
        token,
        expiresAt,
        used: false,
        isOtp: false,
      });

      await this.passwordResetTokenRepository.save(resetToken);

      return {
        success: true,
        message: 'OTP verified successfully',
        token,
      };
    } catch (error) {
      console.error('Error verifying customer OTP:', error);
      return { success: false, message: 'Failed to verify OTP' };
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: { token, used: false },
    });

    if (!resetToken) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (new Date() > resetToken.expiresAt) {
      throw new UnauthorizedException('Token has expired');
    }

    const customer = await this.customerRepository.findOne({
      where: { id: resetToken.userId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    resetToken.used = true;
    await this.passwordResetTokenRepository.save(resetToken);

    customer.password = await this.encryptPassword(newPassword);
    await this.customerRepository.save(customer);
  }

  async getProfile(customerId: string): Promise<Partial<Customer>> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const { password, refresh_token, otp, otp_expires_at, ...profile } = customer;
    return profile;
  }

  async updateProfile(customerId: string, dto: UpdateCustomerProfileDto): Promise<Partial<Customer>> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (dto.email && dto.email !== customer.email) {
      const existingByEmail = await this.customerRepository.findOne({
        where: { email: dto.email },
      });
      if (existingByEmail) {
        throw new ConflictException('Email address is already in use');
      }
    }

    if (dto.phone && dto.phone !== customer.phone) {
      const existingByPhone = await this.customerRepository.findOne({
        where: { phone: dto.phone },
      });
      if (existingByPhone) {
        throw new ConflictException('Phone number is already in use');
      }
    }

    if (dto.name) customer.name = dto.name;
    if (dto.email) customer.email = dto.email;
    if (dto.phone) customer.phone = dto.phone;
    if (dto.address !== undefined) customer.address = dto.address;
    if (dto.picture !== undefined) customer.picture = dto.picture;

    const updatedCustomer = await this.customerRepository.save(customer);

    const { password, refresh_token, otp, otp_expires_at, ...profile } = updatedCustomer;
    return profile;
  }

  async changePassword(customerId: string, currentPassword: string, newPassword: string): Promise<void> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (!customer.password) {
      throw new BadRequestException('No password set for this account');
    }

    const [storedPassword, storedIv] = customer.password.split(':');
    const isValid = await EncryptionUtil.verifyPassword(currentPassword, storedPassword, storedIv);

    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    customer.password = await this.encryptPassword(newPassword);
    await this.customerRepository.save(customer);
  }

  async logout(customerId: string): Promise<void> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (customer) {
      customer.refresh_token = null;
      await this.customerRepository.save(customer);
    }
  }
}

import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CustomerAuthService } from './providers/customer-auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentCustomer } from '../../common/decorators/customer.decorator';
import { CustomerJwtAuthGuard } from './guards/customer-jwt-auth.guard';
import { CustomerRegisterDto } from './dto/customer-register.dto';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { CustomerForgotPasswordDto } from './dto/customer-forgot-password.dto';
import { CustomerVerifyOtpDto } from './dto/customer-verify-otp.dto';
import { CustomerResetPasswordDto } from './dto/customer-reset-password.dto';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
import { ChangeCustomerPasswordDto } from './dto/change-customer-password.dto';
import { Customer } from '../customers/entities/customer.entity';

@ApiTags('Customer Auth')
@Public()
@Controller('customer-auth')
export class CustomerAuthController {
  constructor(private readonly customerAuthService: CustomerAuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Customer registration' })
  @ApiBody({ type: CustomerRegisterDto })
  async register(@Body() dto: CustomerRegisterDto) {
    const customer = await this.customerAuthService.register(dto);
    return {
      status: 'success',
      message: 'Registration successful',
      statusCode: HttpStatus.CREATED,
      data: customer,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Customer login' })
  @ApiBody({ type: CustomerLoginDto })
  async login(
    @Body() dto: CustomerLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.customerAuthService.login(dto.identifier, dto.password);

    this.setCustomerCookies(response, result.access_token, result.refresh_token);

    return {
      status: 'success',
      message: 'Login successful',
      statusCode: HttpStatus.OK,
      data: {
        customer: result.customer,
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      },
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(CustomerJwtAuthGuard)
  @ApiOperation({ summary: 'Customer logout' })
  async logout(
    @CurrentCustomer() customer: Customer,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.customerAuthService.logout(customer.id);

    response.clearCookie('customer_access');
    response.clearCookie('customer_refresh');

    return {
      status: 'success',
      message: 'Logout successful',
      statusCode: HttpStatus.OK,
    };
  }

  @Get('me')
  @UseGuards(CustomerJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current customer profile' })
  async getProfile(@CurrentCustomer() customer: Customer) {
    if (!customer) {
      throw new UnauthorizedException('Not authenticated');
    }

    const profile = await this.customerAuthService.getProfile(customer.id);

    return {
      status: 'success',
      message: 'Profile retrieved successfully',
      statusCode: HttpStatus.OK,
      data: profile,
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset OTP' })
  @ApiBody({ type: CustomerForgotPasswordDto })
  async forgotPassword(@Body() dto: CustomerForgotPasswordDto) {
    await this.customerAuthService.forgotPassword(dto.identifier);

    return {
      status: 'success',
      message: 'If an account exists with this identifier, an OTP has been sent',
      statusCode: HttpStatus.OK,
    };
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and get password reset token' })
  @ApiBody({ type: CustomerVerifyOtpDto })
  async verifyOtp(@Body() dto: CustomerVerifyOtpDto) {
    const result = await this.customerAuthService.verifyOtp(dto.identifier, dto.otp);

    if (!result.success) {
      throw new UnauthorizedException(result.message);
    }

    return {
      status: 'success',
      message: result.message,
      statusCode: HttpStatus.OK,
      token: result.token,
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiBody({ type: CustomerResetPasswordDto })
  async resetPassword(@Body() dto: CustomerResetPasswordDto) {
    await this.customerAuthService.resetPassword(dto.token, dto.password);

    return {
      status: 'success',
      message: 'Password has been reset successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Put('profile')
  @UseGuards(CustomerJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update customer profile' })
  @ApiBody({ type: UpdateCustomerProfileDto })
  async updateProfile(
    @CurrentCustomer() customer: Customer,
    @Body() dto: UpdateCustomerProfileDto,
  ) {
    const profile = await this.customerAuthService.updateProfile(customer.id, dto);

    return {
      status: 'success',
      message: 'Profile updated successfully',
      statusCode: HttpStatus.OK,
      data: profile,
    };
  }

  @Put('profile/picture')
  @UseGuards(CustomerJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload customer profile picture' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('picture'))
  async uploadProfilePicture(
    @CurrentCustomer() customer: Customer,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const profile = await this.customerAuthService.uploadProfilePicture(customer.id, file);

    return {
      status: 'success',
      message: 'Profile picture updated successfully',
      statusCode: HttpStatus.OK,
      data: profile,
    };
  }

  @Put('profile/password')
  @UseGuards(CustomerJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change customer password' })
  @ApiBody({ type: ChangeCustomerPasswordDto })
  async changePassword(
    @CurrentCustomer() customer: Customer,
    @Body() dto: ChangeCustomerPasswordDto,
  ) {
    await this.customerAuthService.changePassword(
      customer.id,
      dto.current_password,
      dto.new_password,
    );

    return {
      status: 'success',
      message: 'Password changed successfully',
      statusCode: HttpStatus.OK,
    };
  }

  private setCustomerCookies(response: Response, access: string, refresh: string) {
    const accessExpiry = 15 * 60 * 1000; // 15 minutes
    const refreshExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days

    response.cookie('customer_access', access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: accessExpiry,
      path: '/',
    });

    response.cookie('customer_refresh', refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshExpiry,
      path: '/',
    });
  }
}

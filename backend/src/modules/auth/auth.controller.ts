import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus, Res, BadRequestException, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthService } from './providers/auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { NewUserPasswordDto } from './dto/new-user-password.dto';
import { CacheService } from '../cache/cache.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly cacheService: CacheService
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const { username, password, rememberMe = false } = loginDto;
    if (!username || !password) {
      throw new UnauthorizedException('Username/email/phone and password are required');
    }
    type LoginResult = {
      user: {
        id: string | number; [key: string]: any,
        role: string;
        first_name: string;
        last_name: string;
        picture: string;
      };
      access_token: string;
      refresh_token: string;
    };
    const result: LoginResult = await this.authService.login(username, password, rememberMe);
    this.setCookies(response, result.access_token, result.refresh_token, rememberMe);

    return {
      status: 'success',
      message: 'Authentication successful',
      statusCode: HttpStatus.OK,
      data: {
        user: {
          id: result.user.id,
          role: result.user.role,
          first_name: result.user.first_name,
          last_name: result.user.last_name,
          picture: result.user.picture,
        },
        access_token: result.access_token,
        refresh_token: result.refresh_token
      }
    };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout' })
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access');
    response.clearCookie('refresh');
    return { message: 'Logout successful' };
  }

  private setCookies(response: Response, access: string, refresh: string, rememberMe: boolean = false) {
    const accessExpiry = rememberMe ? 24 * 60 * 60 * 1000 : 15 * 60 * 1000; // 24 hours or 15 minutes
    const refreshExpiry = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000; // 30 days or 7 days

    response.cookie('access', access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: accessExpiry,
      path: '/'
    });
    
    response.cookie('refresh', refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshExpiry,
      path: '/'
    });
  }

  // Add these endpoints
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset via email or SMS' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const identifier = forgotPasswordDto.identifier;

    if (!identifier) {
      throw new BadRequestException('Email or phone number is required');
    }

    // Always call the service but don't expose whether user exists or not
    await this.authService.forgotPassword(identifier);

    return {
      status: 'success',
      message: 'An OTP has been sent to your registered email and phone number',
      statusCode: HttpStatus.OK
    };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password
    );
    return {
      status: 'success',
      message: 'Password has been reset successfully',
      statusCode: HttpStatus.OK
    };
  }

  @Public()
  @Post('verify-reset-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify password reset token before allowing password reset' })
  async verifyResetToken(@Body() verifyTokenDto: VerifyTokenDto) {
    const isValid = await this.authService.verifyResetToken(verifyTokenDto.token);

    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return {
      status: 'success',
      message: 'Token is valid',
      statusCode: HttpStatus.OK
    };
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and get password reset token' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const result = await this.authService.verifyOtp(
      verifyOtpDto.identifier,
      verifyOtpDto.otp
    );

    if (!result.success) {
      const errorResponse: {
        message: string;
        error: string;
        statusCode: number;
        canResend?: boolean;
        resendEndpoint?: string;
      } = {
        message: result.message,
        error: 'Unauthorized',
        statusCode: 401
      };

      if (result.canResend) {
        errorResponse.canResend = true;
        errorResponse.resendEndpoint = '/auth/forgot-password';
      }

      throw new UnauthorizedException(errorResponse);
    }

    return {
      status: 'success',
      message: result.message,
      statusCode: HttpStatus.OK,
      token: result.token
    };
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current logged-in user information' })
  async getCurrentUser(@CurrentUser() user: UserResponseDto) {

    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }

    const cacheKey = `user:${user.id}`;
    let cachedUser = await this.cacheService.get<UserResponseDto>(cacheKey);

    if (!cachedUser) {
      cachedUser = user;
      await this.cacheService.set(cacheKey, cachedUser, 3600 * 1000);
    }

    const { password, ...userWithoutPassword } = user as any;
    return {
      status: 'success',
      message: 'User information retrieved successfully',
      statusCode: HttpStatus.OK,
      data: userWithoutPassword
    };
  }

  @Public()
  @Post('new-user-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set password for new user and activate account' })
  async newUserPassword(@Body() newUserPasswordDto: NewUserPasswordDto) {
    await this.authService.newUserPassword(
      newUserPasswordDto.token,
      newUserPasswordDto.password
    );
    return {
      status: 'success',
      message: 'Password has been set successfully and account is now active',
      statusCode: HttpStatus.OK
    };
  }
}

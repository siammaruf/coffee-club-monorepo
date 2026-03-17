import {
  Controller, Get, Patch, Post, Body, HttpCode, HttpStatus,
  UseInterceptors, UploadedFiles, BadRequestException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UserService } from './providers/user.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { UserResponseDto } from './dto/user-response.dto';
import { SendPhoneOtpDto } from './dto/send-phone-otp.dto';
import { VerifyPhoneOtpDto } from './dto/verify-phone-otp.dto';
import { UpdateKycDto } from './dto/update-kyc.dto';

@ApiTags('Profile')
@ApiBearerAuth('staff-auth')
@Controller('users/profile')
export class ProfileController {
  constructor(
    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get own profile' })
  async getOwnProfile(@CurrentUser() user: UserResponseDto) {
    return {
      data: await this.userService.findById(user.id!),
      status: 'success',
      message: 'Profile retrieved successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Post('send-phone-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to new phone number for verification' })
  async sendPhoneOtp(
    @CurrentUser() user: UserResponseDto,
    @Body() dto: SendPhoneOtpDto,
  ) {
    const result = await this.userService.sendPhoneVerificationOtp(user.id!, dto.phone);
    return {
      ...result,
      statusCode: HttpStatus.OK,
    };
  }

  @Post('verify-phone-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and update phone number' })
  async verifyPhoneOtp(
    @CurrentUser() user: UserResponseDto,
    @Body() dto: VerifyPhoneOtpDto,
  ) {
    const result = await this.userService.verifyPhoneOtp(user.id!, dto.phone, dto.otp);
    if (!result.success) {
      throw new BadRequestException(result.message);
    }
    return {
      ...result,
      statusCode: HttpStatus.OK,
    };
  }

  @Patch('kyc')
  @ApiOperation({ summary: 'Update NID number and address' })
  async updateKyc(
    @CurrentUser() user: UserResponseDto,
    @Body() dto: UpdateKycDto,
  ) {
    const updated = await this.userService.update(user.id!, dto);
    return {
      data: updated,
      status: 'success',
      message: 'KYC information updated successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Patch('nid-images')
  @ApiOperation({ summary: 'Upload NID front and back images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'NID image files',
    schema: {
      type: 'object',
      properties: {
        nid_front_picture: { type: 'string', format: 'binary' },
        nid_back_picture: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'nid_front_picture', maxCount: 1 },
    { name: 'nid_back_picture', maxCount: 1 },
  ]))
  async updateNidImages(
    @CurrentUser() user: UserResponseDto,
    @UploadedFiles() files: {
      nid_front_picture?: Express.Multer.File[];
      nid_back_picture?: Express.Multer.File[];
    },
  ) {
    if (!files || (!files.nid_front_picture && !files.nid_back_picture)) {
      throw new BadRequestException('At least one NID picture file is required');
    }

    if (files.nid_front_picture?.[0]) {
      const result = await this.cloudinaryService.uploadImage(files.nid_front_picture[0], {
        folder: 'coffee-club/users/nid-front',
        quality: 'auto:best',
      });
      await this.userService.updateNidFrontPicture(user.id!, result.secure_url);
    }

    if (files.nid_back_picture?.[0]) {
      const result = await this.cloudinaryService.uploadImage(files.nid_back_picture[0], {
        folder: 'coffee-club/users/nid-back',
        quality: 'auto:best',
      });
      await this.userService.updateNidBackPicture(user.id!, result.secure_url);
    }

    const updated = await this.userService.findById(user.id!);
    return {
      data: updated,
      status: 'success',
      message: 'NID images updated successfully',
      statusCode: HttpStatus.OK,
    };
  }
}

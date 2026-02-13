import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseInterceptors, UploadedFiles, UploadedFile, BadRequestException, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiBasicAuth, ApiQuery } from '@nestjs/swagger';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './providers/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UserStatus } from './enum/user-status.enum';
import { UserRole } from './enum/user-role.enum';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Users')
@Controller('users')
@Roles(UserRole.ADMIN)
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly cloudinaryService: CloudinaryService
    ) {}

    @Post()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Create a new user with optional file uploads' })
    @ApiResponse({
        status: 201,
        description: 'User created successfully with optional file uploads and bank information',
        type: UserResponseDto,
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                phone: '+1234567890',
                nid_number: '1234567890',
                nid_front_picture: 'https://res.cloudinary.com/coffee-club/image/upload/v1234567890/users/nid_front_1234567890.webp',
                nid_back_picture: 'https://res.cloudinary.com/coffee-club/image/upload/v1234567890/users/nid_back_1234567890.webp',
                address: '123 Main St',
                date_joined: '2024-01-01T00:00:00Z',
                status: 'ACTIVE',
                role: 'STUFF',
                picture: 'https://res.cloudinary.com/coffee-club/image/upload/v1234567890/users/profile_1234567890.webp',
                base_salary: 50000,
                bank: {
                    bank_name: 'Bank of America',
                    branch_name: 'Downtown Branch',
                    account_number: '1234567890',
                    routing_number: '987654321'
                }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - Invalid input data'
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error - User creation failed'
    })
    @ApiBasicAuth()
    @UseInterceptors(
        FileFieldsInterceptor([
          { name: 'picture', maxCount: 1 },
          { name: 'nid_front_picture', maxCount: 1 },
          { name: 'nid_back_picture', maxCount: 1 }
        ])
    )
    async create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFiles() files?: {
        picture?: Express.Multer.File[],
        nid_front_picture?: Express.Multer.File[],
        nid_back_picture?: Express.Multer.File[]
    },
    ){
        const user = await this.userService.create(createUserDto);
        let finalUser = user;

        if (files && user.id) {
            if (files.picture && files.picture[0]) {
                const uploadResult = await this.cloudinaryService.uploadImage(files.picture[0], {
                    folder: 'coffee-club/users/profiles',
                    width: 400,
                    height: 400,
                    crop: 'fill',
                    quality: 'auto:best'
                });
                await this.userService.updatePicture(user.id, uploadResult.secure_url);
            }
            
            if (files.nid_front_picture && files.nid_front_picture[0]) {
                const uploadResult = await this.cloudinaryService.uploadImage(files.nid_front_picture[0], {
                    folder: 'coffee-club/users/nid-front',
                    quality: 'auto:best'
                });
                await this.userService.updateNidFrontPicture(user.id, uploadResult.secure_url);
            }
            
            if (files.nid_back_picture && files.nid_back_picture[0]) {
                const uploadResult = await this.cloudinaryService.uploadImage(files.nid_back_picture[0], {
                    folder: 'coffee-club/users/nid-back',
                    quality: 'auto:best'
                });
                await this.userService.updateNidBackPicture(user.id, uploadResult.secure_url);
            }
            
            finalUser = await this.userService.findById(user.id);
        }

        return {
            data: finalUser,
            status: 'success',
            message: 'User has been created successfully. A password reset link has been sent to the employee via email and SMS.',
            statusCode: HttpStatus.OK
          };
    }

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ 
        status: 200, 
        description: 'Returns all users',
        schema: {
            example: {
                data: {
                    users: [
                        {
                            id: '123e4567-e89b-12d3-a456-426614174000',
                            first_name: 'John',
                            last_name: 'Doe',
                            email: 'john.doe@example.com',
                            phone: '+1234567890',
                            role: 'STUFF',
                            status: 'ACTIVE',
                            base_salary: 50000,
                            picture: 'https://res.cloudinary.com/coffee-club/image/upload/v1234567890/users/profile_1234567890.webp'
                        }
                    ],
                    total: 1,
                    page: 1,
                    limit: 10,
                    totalPages: 1
                },
                status: 'success',
                message: 'Users retrieved successfully.',
                statusCode: 200
            }
        }
    })
    @ApiQuery({ 
        name: 'page', 
        required: false, 
        type: Number, 
        description: 'Page number (starts from 1, default: 1)' 
    })
    @ApiQuery({ 
        name: 'limit', 
        required: false, 
        type: Number, 
        description: 'Number of users per page (default: 10)' 
    })
    @ApiQuery({ 
        name: 'search', 
        required: false, 
        type: String, 
        description: 'Search by name, email, or phone number' 
    })
    @ApiQuery({ 
        name: 'status', 
        required: false, 
        enum: UserStatus,
        enumName: 'UserStatus',
        description: 'Filter by user status'
    })
    @ApiQuery({
        name: 'role',
        required: false,
        enum: UserRole,
        enumName: 'UserRole',
        description: 'Filter by user role/position' 
    })
    @ApiBasicAuth()
    async findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('status') status?: UserStatus,
        @Query('role') role?: UserRole
    ) {
        const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
        const limitNumber = limit ? parseInt(limit, 10) : 10;
        
        const result = await this.userService.findAll(pageNumber, limitNumber, search, status, role);
        return {
            data: result,
            status: 'success',
            message: 'Users retrieved successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Find user by ID' })
    @ApiResponse({ 
        status: 200, 
        description: 'User found successfully',
        schema: {
            example: {
                data: {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john.doe@example.com',
                    phone: '+1234567890',
                    role: 'STUFF',
                    status: 'ACTIVE',
                    base_salary: 50000,
                    picture: 'https://res.cloudinary.com/coffee-club/image/upload/v1234567890/users/profile_1234567890.webp',
                    address: '123 Main St',
                    date_joined: '2024-01-01T00:00:00Z'
                },
                status: 'success',
                message: 'User retrieved successfully.',
                statusCode: 200
            }
        }
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiBasicAuth()
    async findById(@Param('id') id: string) {
        const user = await this.userService.findById(id);
        return {
            data: user,
            status: 'success',
            message: 'User retrieved successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Get('email/:email')
    @ApiOperation({ summary: 'Find user by email' })
    @ApiResponse({ 
        status: 200, 
        description: 'User found successfully',
        schema: {
            example: {
                data: {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john.doe@example.com',
                    phone: '+1234567890',
                    role: 'STUFF',
                    status: 'ACTIVE',
                    base_salary: 50000
                },
                status: 'success',
                message: 'User retrieved successfully.',
                statusCode: 200
            }
        }
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiBasicAuth()
    async findByEmail(@Param('email') email: string) {
        const user = await this.userService.findByEmail(email);
        return {
            data: user,
            status: 'success',
            message: 'User retrieved successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update user with optional file uploads' })
    @ApiResponse({ 
        status: 200, 
        description: 'User updated successfully with optional file uploads',
        schema: {
            example: {
                data: {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john.doe@example.com',
                    phone: '+1234567890',
                    role: 'STUFF',
                    status: 'ACTIVE',
                    base_salary: 55000,
                    picture: 'https://res.cloudinary.com/coffee-club/image/upload/v1234567890/users/profile_1234567890.webp',
                    nid_front_picture: 'https://res.cloudinary.com/coffee-club/image/upload/v1234567890/users/nid_front_1234567890.webp',
                    nid_back_picture: 'https://res.cloudinary.com/coffee-club/image/upload/v1234567890/users/nid_back_1234567890.webp'
                },
                status: 'success',
                message: 'User updated successfully.',
                statusCode: 200
            }
        }
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 409, description: 'Email already in use' })
    @ApiBasicAuth()
    @UseInterceptors(
        FileFieldsInterceptor([
          { name: 'picture', maxCount: 1 },
          { name: 'nid_front_picture', maxCount: 1 },
          { name: 'nid_back_picture', maxCount: 1 }
        ])
    )
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @UploadedFiles() files?: {
            picture?: Express.Multer.File[],
            nid_front_picture?: Express.Multer.File[],
            nid_back_picture?: Express.Multer.File[]
        },
    ) {
        const user = await this.userService.update(id, updateUserDto);
        let finalUser = user;

        if (files && user.id) {
            if (files.picture && files.picture[0]) {
                const uploadResult = await this.cloudinaryService.uploadImage(files.picture[0], {
                    folder: 'coffee-club/users/profiles',
                    width: 400,
                    height: 400,
                    crop: 'fill',
                    quality: 'auto:best'
                });
                await this.userService.updatePicture(user.id, uploadResult.secure_url);
            }
            
            if (files.nid_front_picture && files.nid_front_picture[0]) {
                const uploadResult = await this.cloudinaryService.uploadImage(files.nid_front_picture[0], {
                    folder: 'coffee-club/users/nid-front',
                    quality: 'auto:best'
                });
                await this.userService.updateNidFrontPicture(user.id, uploadResult.secure_url);
            }
            
            if (files.nid_back_picture && files.nid_back_picture[0]) {
                const uploadResult = await this.cloudinaryService.uploadImage(files.nid_back_picture[0], {
                    folder: 'coffee-club/users/nid-back',
                    quality: 'auto:best'
                });
                await this.userService.updateNidBackPicture(user.id, uploadResult.secure_url);
            }
            
            finalUser = await this.userService.findById(user.id);
        }

        return {
            data: finalUser,
            status: 'success',
            message: 'User updated successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Patch(':id/picture')
    @ApiOperation({ summary: 'Update user picture' })
    @ApiResponse({ 
        status: 200, 
        description: 'User picture updated successfully',
        schema: {
            example: {
                data: {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john.doe@example.com',
                    picture: 'https://res.cloudinary.com/coffee-club/image/upload/v1234567890/users/profile_1234567890.webp',
                    status: 'ACTIVE'
                },
                status: 'success',
                message: 'User picture updated successfully.',
                statusCode: 200
            }
        }
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 400, description: 'Invalid file format' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'User picture file',
        schema: {
            type: 'object',
            properties: {
                picture: {
                    type: 'string',
                    format: 'binary',
                    description: 'Profile picture file (jpg, jpeg, png)'
                }
            },
            required: ['picture']
        }
    })
    @UseInterceptors(FileInterceptor('picture'))
    @ApiBasicAuth()
    async updatePicture(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        if (!file) {
            throw new Error('Picture file is required');
        }
        
        const uploadResult = await this.cloudinaryService.uploadImage(file, {
            folder: 'coffee-club/users/profiles',
            width: 400,
            height: 400,
            crop: 'fill',
            quality: 'auto:best'
        });
        
        await this.userService.updatePicture(id, uploadResult.secure_url);
        const user = await this.userService.findById(id);
        return {
            data: user,
            status: 'success',
            message: 'User picture updated successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Patch(':id/nid-pictures')
    @ApiOperation({ summary: 'Update user NID pictures' })
    @ApiResponse({ 
        status: 200, 
        description: 'User NID pictures updated successfully',
        schema: {
            example: {
                data: {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john.doe@example.com',
                    nid_front_picture: 'https://res.cloudinary.com/coffee-club/image/upload/v1234567890/users/nid_front_1234567890.webp',
                    nid_back_picture: 'https://res.cloudinary.com/coffee-club/image/upload/v1234567890/users/nid_back_1234567890.webp',
                    status: 'ACTIVE'
                },
                status: 'success',
                message: 'User NID pictures updated successfully.',
                statusCode: 200
            }
        }
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 400, description: 'Invalid file format' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'NID picture files',
        schema: {
            type: 'object',
            properties: {
                nid_front_picture: {
                    type: 'string',
                    format: 'binary',
                    description: 'NID front picture file (jpg, jpeg, png)'
                },
                nid_back_picture: {
                    type: 'string',
                    format: 'binary',
                    description: 'NID back picture file (jpg, jpeg, png)'
                }
            }
        }
    })
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'nid_front_picture', maxCount: 1 },
        { name: 'nid_back_picture', maxCount: 1 }
    ]))
    @ApiBasicAuth()
    async updateNidPictures(
        @Param('id') id: string,
        @UploadedFiles() files: {
            nid_front_picture?: Express.Multer.File[],
            nid_back_picture?: Express.Multer.File[]
        }
    ) {
        if (!files || (!files.nid_front_picture && !files.nid_back_picture)) {
            throw new Error('At least one NID picture file is required');
        }
        
        if (files.nid_front_picture && files.nid_front_picture[0]) {
            const uploadResult = await this.cloudinaryService.uploadImage(files.nid_front_picture[0], {
                folder: 'coffee-club/users/nid-front',
                quality: 'auto:best'
            });
            await this.userService.updateNidFrontPicture(id, uploadResult.secure_url);
        }
        
        if (files.nid_back_picture && files.nid_back_picture[0]) {
            const uploadResult = await this.cloudinaryService.uploadImage(files.nid_back_picture[0], {
                folder: 'coffee-club/users/nid-back',
                quality: 'auto:best'
            });
            await this.userService.updateNidBackPicture(id, uploadResult.secure_url);
        }
        
        const user = await this.userService.findById(id);
        return {
            data: user,
            status: 'success',
            message: 'User NID pictures updated successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Patch(':id/deactivate')
    @ApiOperation({ summary: 'Deactivate user' })
    @ApiResponse({ 
        status: 200, 
        description: 'User deactivated successfully',
        schema: {
            example: {
                data: {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john.doe@example.com',
                    status: 'INACTIVE'
                },
                status: 'success',
                message: 'User deactivated successfully.',
                statusCode: 200
            }
        }
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiBasicAuth()
    async deactivateUser(@Param('id') id: string) {
        const user = await this.userService.deactivateUser(id);
        return {
            data: user,
            status: 'success',
            message: 'User deactivated successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Patch(':id/activate')
    @ApiOperation({ summary: 'Activate user' })
    @ApiResponse({ 
        status: 200, 
        description: 'User activated successfully',
        type: UserResponseDto 
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiBasicAuth()
    async activateUser(@Param('id') id: string): Promise<UserResponseDto> {
        return this.userService.activateUser(id);
    }

    @Post(':id/resend-password-reset')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Resend password reset email to user' })
    @ApiResponse({ 
        status: 200, 
        description: 'Password reset email sent successfully',
        schema: {
            example: {
                data: {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john.doe@example.com',
                    status: 'ACTIVE'
                },
                status: 'success',
                message: 'Password reset email sent successfully.',
                statusCode: 200
            }
        }
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 409, description: 'User does not have an email address or failed to send email' })
    @ApiBasicAuth()
    async resendPasswordResetEmail(@Param('id') id: string) {
        const user = await this.userService.resendPasswordResetEmail(id);
        return {
            data: user,
            status: 'success',
            message: 'Password reset email sent successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Patch(':id/change-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Change user password' })
    @ApiResponse({
        status: 200,
        description: 'Password changed successfully',
        schema: {
            example: {
                status: 'success',
                message: 'Password has been changed successfully',
                statusCode: 200
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Current password is incorrect'
    })
    @ApiResponse({
        status: 404,
        description: 'User not found'
    })
    async changePassword(
        @Param('id') id: string,
        @Body() changePasswordDto: ChangePasswordDto
    ) {
        await this.userService.changePassword(
            id,
            changePasswordDto.currentPassword,
            changePasswordDto.newPassword
        );
        
        return {
            status: 'success',
            message: 'Password has been changed successfully',
            statusCode: HttpStatus.OK
        };
    }

    @Patch(':id/profile-picture')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update user profile picture' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Profile picture file',
        type: 'multipart/form-data',
        schema: {
            type: 'object',
            properties: {
                picture: {
                    type: 'string',
                    format: 'binary',
                    description: 'Profile picture file (JPEG, PNG, WebP)'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Profile picture updated successfully',
        schema: {
            example: {
                status: 'success',
                message: 'Profile picture has been updated successfully',
                data: {
                    picture: 'https://res.cloudinary.com/coffee-club/image/upload/v1234567890/users/profile_1234567890.webp'
                },
                statusCode: 200
            }
        }
    })
    @UseInterceptors(FileInterceptor('picture'))
    async updateProfilePicture(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        if (!file) {
            throw new BadRequestException('Profile picture file is required');
        }
        
        const uploadResult = await this.cloudinaryService.uploadImage(file, {
            folder: 'coffee-club/users/profiles',
            width: 400,
            height: 400,
            crop: 'fill',
            quality: 'auto:best'
        });
        
        await this.userService.updatePicture(id, uploadResult.secure_url);
        
        return {
            status: 'success',
            message: 'Profile picture has been updated successfully',
            data: {
                picture: uploadResult.secure_url
            },
            statusCode: HttpStatus.OK
        };
    }
}
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { ConflictException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository, Like } from "typeorm";
import { User } from "../entities/user.entity";
import { EncryptionUtil } from "src/common/utils/encryption.util";
import { CreateUserDto } from "../dto/create-user.dto";
import { UserResponseDto } from "../dto/user-response.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { UserStatus } from "../enum/user-status.enum";
import { BankService } from '../../banks/providers/bank.service';
import { Bank } from "src/modules/banks/entities/bank.entity";
import { EmailService } from '../../email/email.service';
import { PasswordResetToken } from '../../auth/entities/password-reset-token.entity';
import { SmsService } from '../../sms/sms.service';
import { randomBytes } from 'crypto';
import { UserRole } from "../enum/user-role.enum";
import { CacheService } from "src/modules/cache/cache.service";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(PasswordResetToken)
        private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,
        private readonly bankService: BankService,
        private readonly emailService: EmailService,
        private readonly smsService: SmsService,
        private readonly cacheService: CacheService
    ) {}

    private async invalidateCache(): Promise<void> {
        await this.cacheService.delete('user:*');
        await this.cacheService.delete('users:*');
    }

    async createPasswordResetToken(userId: string): Promise<string> {
        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        const resetToken = this.passwordResetTokenRepository.create({
            userId,
            token,
            expiresAt,
            used: false,
        });

        await this.passwordResetTokenRepository.save(resetToken);
        return token;
    }

    private generateTemporaryPassword(): string {
        return randomBytes(8).toString('hex').toUpperCase();
    }

    async encryptPassword(password: string): Promise<string> {
        const { encryptedPassword, iv } = await EncryptionUtil.encryptPassword(password);
        return `${encryptedPassword}:${iv}`;
    }

    private async findUserOrFail(criteria: FindOptionsWhere<User>): Promise<User> {
        const user = await this.userRepository.findOne({ where: criteria });
        if (!user) {
            throw new NotFoundException(`User not found`);
        }
        return user;
    }

    async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const errors: string[] = [];

        if (createUserDto.email) {
            const existingEmail = await this.userRepository.findOne({
                where: { email: createUserDto.email }
            });
            if (existingEmail) {
                errors.push('Email address is already in use');
            }
        }

        const existingPhone = await this.userRepository.findOne({
            where: { phone: createUserDto.phone }
        });
        if (existingPhone) {
            errors.push('Phone number is already in use');
        }

        const existingNid = await this.userRepository.findOne({
            where: { nid_number: createUserDto.nid_number }
        });
        if (existingNid) {
            errors.push('NID number is already in use');
        }

        if (errors.length > 0) {
            throw new ConflictException({
                status: 'error',
                messages: errors,
                message: errors.join('. '),
                statusCode: HttpStatus.CONFLICT
            });
        }

        const { bank, ...userData } = createUserDto;

        let encryptedPassword: string;
        let userStatus: UserStatus;

        if (userData.role === UserRole.ADMIN) {
          if (!userData.password) {
            throw new ConflictException({
              status: 'error',
              message: 'Password is required for admin users',
              statusCode: HttpStatus.CONFLICT
            });
          }
          encryptedPassword = await this.encryptPassword(userData.password);
          userStatus = UserStatus.ACTIVE;
        } else {
          const temporaryPassword = this.generateTemporaryPassword();
          encryptedPassword = await this.encryptPassword(temporaryPassword);
          userStatus = UserStatus.INACTIVE;
        }

        const user = this.userRepository.create({
          ...userData,
          password: encryptedPassword,
          status: userStatus,
        });

        const savedUser = await this.userRepository.save(user);

        let bankInfo: Bank[] = [];
        if (bank) {
            const createdBank = await this.bankService.create(bank, savedUser.id);
            bankInfo = [createdBank];
        }

        if (savedUser.email) {
            try {
                const token = await this.createPasswordResetToken(savedUser.id);
                await this.emailService.sendWelcomeEmail(savedUser.email, savedUser.first_name, token);
                await this.smsService.sendWelcomeSms(savedUser.phone, savedUser.first_name, savedUser.email);
                console.log(`Welcome email sent to ${savedUser.email}`);
            } catch (error) {
                console.error('Failed to send welcome email:', error);
            }
        }

        const userResponse = new UserResponseDto(Array.isArray(savedUser) ? savedUser[0] : savedUser);
        userResponse.banks = bankInfo;

        return userResponse;
    }

    async findById(id: string): Promise<UserResponseDto> {
        const cacheKey = `user:${id}`;
        let user = await this.cacheService.get<User>(cacheKey);

        if (!user) {
          user = await this.findUserOrFail({ id });
          await this.cacheService.set(cacheKey, user, 3600 * 1000);
        }

        const banks = await this.bankService.findByUserId(id);
        const userResponse = new UserResponseDto(user);
        userResponse.banks = banks;
        return userResponse;
      }


    async findByEmail(email: string): Promise<UserResponseDto> {
        const user = await this.findUserOrFail({ email });
        return new UserResponseDto(user);
    }

    async findByPhone(phone: string): Promise<UserResponseDto> {
        const user = await this.findUserOrFail({ phone });
        return new UserResponseDto(user);
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
        const user = await this.findUserOrFail({ id });
        
        const { bank, ...userData } = updateUserDto;

        if (userData.email && userData.email !== user.email) {
            const existingEmail = await this.userRepository.findOne({
                where: { email: userData.email }
            });
            if (existingEmail) {
                throw new ConflictException({
                    status: 'error',
                    message: 'Email address is already in use',
                    statusCode: HttpStatus.CONFLICT
                });
            }
        }

        if (userData.password) {
            userData.password = await this.encryptPassword(userData.password);
        }

        await this.userRepository.update(id, userData);
        if (bank) {
            const existingBanks = await this.bankService.findByUserId(id);
            if (existingBanks.length > 0) {
                await this.bankService.update(existingBanks[0].id, bank);
            } else {
                await this.bankService.create(bank, id);
            }
        }
        
        await this.invalidateCache();

        const updated = await this.findUserOrFail({ id });
        return new UserResponseDto(updated);
    }

    async deactivateUser(id: string): Promise<UserResponseDto> {
        const user = await this.findUserOrFail({ id });
        user.status = UserStatus.INACTIVE;
        await this.userRepository.save(user);
        await this.invalidateCache();
        return new UserResponseDto(user);
    }

    async activateUser(id: string): Promise<UserResponseDto> {
        const user = await this.findUserOrFail({ id });
        user.status = UserStatus.ACTIVE;
        await this.userRepository.save(user);
        await this.invalidateCache();
        return new UserResponseDto(user);
    }

    async resendPasswordResetEmail(id: string): Promise<UserResponseDto> {
        const user = await this.findUserOrFail({ id });
        
        if (!user.email) {
            throw new ConflictException({
                status: 'error',
                message: 'User does not have an email address',
                statusCode: HttpStatus.CONFLICT
            });
        }

        try {
            const token = await this.createPasswordResetToken(user.id);
            await this.emailService.sendWelcomeEmail(user.email, user.first_name, token);
            return new UserResponseDto(user);
        } catch (error) {
            console.error('Failed to send password reset email:', error);
            throw new ConflictException({
                status: 'error',
                message: 'Failed to send password reset email',
                statusCode: HttpStatus.CONFLICT
            });
        }
    }

    async findByIdentifier(identifier: string, password: string): Promise<UserResponseDto> {
        const user = await this.userRepository.findOne({
            where: [
                { email: identifier },
                { phone: identifier }
            ]
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const [storedPassword, storedIv] = user.password.split(':');
        const isValid = await EncryptionUtil.verifyPassword(password, storedPassword, storedIv);

        if (!isValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.status === UserStatus.INACTIVE) {
            throw new UnauthorizedException('Account is inactive');
        }

        return new UserResponseDto(user);
    }

    async findAll(
        page: number = 1,
        limit: number = 10,
        search?: string,
        status?: UserStatus,
        role?: UserRole
      ): Promise<{ users: UserResponseDto[], total: number, page: number, limit: number, totalPages: number }> {
        const cacheKey = `users:findAll`;

        const cached = await this.cacheService.get<{
          users: UserResponseDto[];
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        }>(cacheKey);

        if (cached) {
          return cached;
        }

        const skip = (page - 1) * limit;
        const whereConditions: FindOptionsWhere<User> = {};

        if (status) {
          whereConditions.status = status;
        }

        if (role) {
          whereConditions.role = role;
        }

        let searchConditions: FindOptionsWhere<User>[] = [];
        if (search && search.trim()) {
          const searchTerm = `%${search.trim()}%`;
          searchConditions = [
            { ...whereConditions, first_name: Like(searchTerm) },
            { ...whereConditions, last_name: Like(searchTerm) },
            { ...whereConditions, email: Like(searchTerm) },
            { ...whereConditions, phone: Like(searchTerm) }
          ];
        }

        const queryOptions = {
          order: { created_at: 'DESC' as const },
          skip: skip,
          take: limit
        };

        let users: User[] = [];
        let total: number = 0;

        if (searchConditions.length > 0) {
          const [usersResult, totalResult] = await Promise.all([
            this.userRepository.find({ ...queryOptions, where: searchConditions }),
            this.userRepository.count({ where: searchConditions })
          ]);
          users = usersResult;
          total = totalResult;
        } else {
          const [usersResult, totalResult] = await Promise.all([
            this.userRepository.find({ ...queryOptions, where: whereConditions }),
            this.userRepository.count({ where: whereConditions })
          ]);
          users = usersResult;
          total = totalResult;
        }

        const totalPages = Math.ceil(total / limit);
        const result = {
          users: users.map(user => new UserResponseDto(user)),
          total,
          page,
          limit,
          totalPages
        };

        await this.cacheService.set(cacheKey, result, 3600 * 1000);

        return result;
    }

    async updatePicture(id: string, picturePath: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.picture = picturePath;
        await this.userRepository.save(user);
        await this.invalidateCache();
    }

    async updateNidFrontPicture(id: string, nidFrontPath: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.nid_front_picture = nidFrontPath;
        await this.userRepository.save(user);
        await this.invalidateCache();
    }

    async updateNidBackPicture(id: string, nidBackPath: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.nid_back_picture = nidBackPath;
        await this.userRepository.save(user);
        await this.invalidateCache();
    }

    async findByEmailOrPhone(emailOrPhone: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: [
                { email: emailOrPhone },
                { phone: emailOrPhone }
            ]
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async updatePassword(userId: string, hashedPassword: string): Promise<void> {
        await this.userRepository.update(userId, { password: hashedPassword });
        await this.invalidateCache();
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
        const user = await this.findUserOrFail({ id: userId });
        
        const [storedPassword, storedIv] = user.password.split(':');
        const isCurrentPasswordValid = await EncryptionUtil.verifyPassword(currentPassword, storedPassword, storedIv);
        
        if (!isCurrentPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }
        
        const encryptedNewPassword = await this.encryptPassword(newPassword);
        await this.userRepository.update(userId, { password: encryptedNewPassword });
        await this.invalidateCache();
    }

    async remove(id: string): Promise<void> {
        await this.userRepository.softDelete(id);
        await this.invalidateCache();
    }

    async bulkSoftDelete(ids: string[]): Promise<void> {
        await this.userRepository.softDelete(ids);
        await this.invalidateCache();
    }

    async findTrashed(options: { page: number, limit: number, search?: string }) {
        const { page, limit, search } = options;
        const query = this.userRepository.createQueryBuilder('user')
            .withDeleted()
            .where('user.deleted_at IS NOT NULL');

        if (search) {
            query.andWhere('LOWER(user.first_name) LIKE :search', { search: `%${search.toLowerCase()}%` });
        }

        query.orderBy('user.deleted_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }

    async restore(id: string): Promise<void> {
        await this.userRepository.restore(id);
        await this.invalidateCache();
    }

    async permanentDelete(id: string): Promise<void> {
        const entity = await this.userRepository.findOne({ where: { id }, withDeleted: true });
        if (!entity) {
            throw new NotFoundException(`Record with ID ${id} not found`);
        }
        if (!entity.deleted_at) {
            throw new NotFoundException(`Record with ID ${id} is not in trash`);
        }
        await this.userRepository.delete(id);
        await this.invalidateCache();
    }
}

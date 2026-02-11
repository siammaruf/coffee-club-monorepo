import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../modules/users/providers/user.service';
import { CreateUserDto } from '../modules/users/dto/create-user.dto';
import { UserRole } from '../modules/users/enum/user-role.enum';
import { UserStatus } from '../modules/users/enum/user-status.enum';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const userService = app.get(UserService);

  try {
    try {
      await userService.findByEmail('admin@coffeeclub.com');
      console.log('Admin user already exists, skipping creation');
    } catch {
      const adminUser: CreateUserDto = {
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@coffeeclub.com',
        phone: '01700000000',
        nid_front_picture: 'admin_front_id.jpg',
        nid_back_picture: 'admin_back_id.jpg',
        nid_number: 'ADMIN123456',
        password: 'Admin@123',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        date_joined: new Date(),
        picture: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
        bank: {
          bank_name: 'Bank of America',
          branch_name: 'Downtown Branch',
          account_number: '1234567890',
          routing_number: '987654321',
        }
      };

      const createdAdmin = await userService.create(adminUser);
      console.log('Admin user created successfully:', createdAdmin.id);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error creating admin user:', errorMessage);
  } finally {
    await app.close();
  }
}

bootstrap();
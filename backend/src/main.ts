import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { DatabaseExceptionFilter } from './common/filters/exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { PermissionsService } from './modules/permissions/providers/permissions.service';
import cookieParser from 'cookie-parser';
import { BasicAuthOptions, swaggerCustomOptions } from './config/swagger.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  app.set('trust proxy', 1); // Trust X-Forwarded-Proto from reverse proxy (nginx) so req.protocol returns 'https' in production
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('Coffee Club API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBasicAuth(BasicAuthOptions)
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Employee JWT token' }, 'staff-auth')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Customer JWT token' }, 'customer-auth')
    .setExternalDoc('Postman Collection', '/api/v1/docs-json')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/v1/docs', app, documentFactory(), swaggerCustomOptions);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Apply global guards in correct order: JWT → Roles → Permissions
  const reflector = app.get(Reflector);
  const permissionsService = app.get(PermissionsService);
  app.useGlobalGuards(
    new JwtAuthGuard(reflector),
    new RolesGuard(reflector),
    new PermissionsGuard(reflector, permissionsService),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new DatabaseExceptionFilter());

  const configService = app.get(ConfigService);

  const corsOrgins = configService
    .get<string>('CORS_ORIGINS', '')
    .split(',')
    .filter(Boolean);

  app.enableCors({
    origin: corsOrgins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  
  const serverUrl = `http://localhost:${port}`;
  const docsUrl = `${serverUrl}/api/v1/docs`;

  console.log('\n🚀 Application is running on:', serverUrl);
  console.log('📚 API Documentation:', docsUrl);
  console.log('🔌 Socket.IO:', serverUrl);
  console.log('   └─ WhatsApp:', `${serverUrl}/whatsapp`, '\n');
}
bootstrap();

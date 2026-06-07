import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { DatabaseExceptionFilter } from './common/filters/exception.filter';
import { CacheInvalidationInterceptor } from './common/interceptors/cache-invalidation.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { PermissionsService } from './modules/permissions/providers/permissions.service';
import { CacheService } from './modules/cache/cache.service';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { BasicAuthOptions, swaggerCustomOptions } from './config/swagger.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new Logger('Bootstrap'),
  });

  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  app.set('trust proxy', 1); // Trust X-Forwarded-Proto from reverse proxy (nginx) so req.protocol returns 'https' in production
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.use(compression());

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
  const cacheService = app.get(CacheService);
  app.useGlobalInterceptors(new CacheInvalidationInterceptor(cacheService));
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
    credentials: true,
    maxAge: 86400,
  });

  const port = process.env.PORT ?? 3000;
  const server = await app.listen(port, '0.0.0.0');

  // Set HTTP timeouts to prevent hung connections from exhausting the pool
  const serverTimeout = configService.get<number>('SERVER_TIMEOUT', 30000);
  server.setTimeout(serverTimeout);
  server.keepAliveTimeout = configService.get<number>('SERVER_KEEP_ALIVE_TIMEOUT', 5000);
  server.headersTimeout = configService.get<number>('SERVER_HEADERS_TIMEOUT', 60000);

  const logger = new Logger('Bootstrap');
  const serverUrl = `http://localhost:${port}`;
  const docsUrl = `${serverUrl}/api/v1/docs`;

  logger.log('\n🚀 Application is running on: ' + serverUrl);
  logger.log('📚 API Documentation: ' + docsUrl);
  logger.log('🔌 Socket.IO: ' + serverUrl);
  logger.log('   └─ WhatsApp: ' + `${serverUrl}/whatsapp` + '\n');
}
bootstrap();

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

// Entities
import { WhatsAppContact } from './entities/whatsapp-contact.entity';
import { WhatsAppMessage } from './entities/whatsapp-message.entity';
import { WhatsAppConfig } from './entities/whatsapp-config.entity';
import { WhatsAppPromotion } from './entities/whatsapp-promotion.entity';
import { Order } from '../orders/entities/order.entity';
import { Customer } from '../customers/entities/customer.entity';

// Gateway
import { WhatsAppGateway } from './gateways/whatsapp.gateway';

// Providers
import { WhatsAppConnectionService } from './providers/whatsapp-connection.service';
import { WhatsAppMessageService } from './providers/whatsapp-message.service';
import { WhatsAppReportService } from './providers/whatsapp-report.service';
import { WhatsAppPromotionService } from './providers/whatsapp-promotion.service';

// Controllers
import { WhatsAppController } from './controllers/whatsapp.controller';
import { WhatsAppPromotionController } from './controllers/whatsapp-promotion.controller';

// External modules
import { ReportModule } from '../reports/report.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WhatsAppContact,
      WhatsAppMessage,
      WhatsAppConfig,
      WhatsAppPromotion,
      Order,
      Customer,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
    ScheduleModule.forRoot(),
    ReportModule,
  ],
  controllers: [WhatsAppController, WhatsAppPromotionController],
  providers: [
    WhatsAppGateway,
    WhatsAppConnectionService,
    WhatsAppMessageService,
    WhatsAppReportService,
    WhatsAppPromotionService,
  ],
  exports: [WhatsAppMessageService, WhatsAppConnectionService],
})
export class WhatsAppModule {}

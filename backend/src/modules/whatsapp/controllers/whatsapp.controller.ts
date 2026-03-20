import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator';
import { WhatsAppConnectionService } from '../providers/whatsapp-connection.service';
import { WhatsAppMessageService } from '../providers/whatsapp-message.service';
import { WhatsAppReportService } from '../providers/whatsapp-report.service';
import { WhatsAppContact } from '../entities/whatsapp-contact.entity';
import { WhatsAppConfig } from '../entities/whatsapp-config.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContactDto } from '../dto/create-contact.dto';
import { UpdateContactDto } from '../dto/update-contact.dto';
import { SendMessageDto } from '../dto/send-message.dto';
import { UpdateConfigDto } from '../dto/update-config.dto';
import { ReportService } from '../../reports/providers/report.service';

@ApiTags('WhatsApp')
@ApiBearerAuth('staff-auth')
@Controller('whatsapp')
export class WhatsAppController {
  constructor(
    private readonly connectionService: WhatsAppConnectionService,
    private readonly messageService: WhatsAppMessageService,
    private readonly reportService: WhatsAppReportService,
    private readonly dailyReportService: ReportService,
    @InjectRepository(WhatsAppContact)
    private readonly contactRepo: Repository<WhatsAppContact>,
    @InjectRepository(WhatsAppConfig)
    private readonly configRepo: Repository<WhatsAppConfig>,
  ) {}

  // ─── Connection ───────────────────────────────────────

  @Get('status')
  @RequirePermission('whatsapp.view')
  @ApiOperation({ summary: 'Get WhatsApp connection status' })
  async getStatus() {
    return { status: this.connectionService.getStatus() };
  }

  @Post('connect')
  @RequirePermission('whatsapp.manage')
  @ApiOperation({ summary: 'Connect to WhatsApp (generates QR)' })
  async connect() {
    await this.connectionService.connect();
    return { message: 'Connection initiated. Scan QR code from dashboard.' };
  }

  @Post('disconnect')
  @RequirePermission('whatsapp.manage')
  @ApiOperation({ summary: 'Disconnect WhatsApp' })
  async disconnect() {
    await this.connectionService.disconnect();
    return { message: 'Disconnected' };
  }

  @Post('logout')
  @RequirePermission('whatsapp.manage')
  @ApiOperation({ summary: 'Logout from WhatsApp and clear auth state' })
  async logout() {
    await this.connectionService.logout();
    return { message: 'Logged out. Auth state cleared.' };
  }

  @Get('pending-qr')
  @RequirePermission('whatsapp.manage')
  @ApiOperation({ summary: 'Get pending QR code if available (polling fallback)' })
  getPendingQr() {
    return {
      qr: this.connectionService.getPendingQr(),
      status: this.connectionService.getStatus(),
    };
  }

  // ─── Config ───────────────────────────────────────────

  @Get('config')
  @RequirePermission('whatsapp.view')
  @ApiOperation({ summary: 'Get WhatsApp configuration' })
  async getConfig() {
    return this.messageService.getConfig();
  }

  @Put('config')
  @RequirePermission('whatsapp.manage')
  @ApiOperation({ summary: 'Update WhatsApp configuration' })
  async updateConfig(@Body() dto: UpdateConfigDto) {
    const config = await this.messageService.getConfig();
    Object.assign(config, dto);
    const saved = await this.configRepo.save(config);

    // Update WhatsApp report cron schedule if changed
    if (dto.daily_report_time !== undefined || dto.daily_report_enabled !== undefined) {
      await this.reportService.updateSchedule(
        saved.daily_report_time,
        saved.daily_report_enabled,
      );
    }

    // Update auto report generation cron schedule if changed
    if (dto.auto_report_generation_time !== undefined || dto.auto_report_generation_enabled !== undefined) {
      await this.dailyReportService.updateReportSchedule(
        saved.auto_report_generation_time,
        saved.auto_report_generation_enabled,
      );
    }

    return saved;
  }

  // ─── Contacts ─────────────────────────────────────────

  @Get('contacts')
  @RequirePermission('whatsapp.view')
  @ApiOperation({ summary: 'List WhatsApp contacts' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getContacts(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    const p = page || 1;
    const l = limit || 20;
    const skip = (p - 1) * l;

    const qb = this.contactRepo.createQueryBuilder('c');

    if (search) {
      qb.where('c.name ILIKE :search OR c.phone ILIKE :search', {
        search: `%${search}%`,
      });
    }

    qb.orderBy('c.created_at', 'DESC').skip(skip).take(l);

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      meta: { total, page: p, limit: l, totalPages: Math.ceil(total / l) },
    };
  }

  @Post('contacts')
  @RequirePermission('whatsapp.manage')
  @ApiOperation({ summary: 'Add a WhatsApp contact' })
  async createContact(@Body() dto: CreateContactDto) {
    const contact = this.contactRepo.create(dto);
    return this.contactRepo.save(contact);
  }

  @Put('contacts/:id')
  @RequirePermission('whatsapp.manage')
  @ApiOperation({ summary: 'Update a WhatsApp contact' })
  async updateContact(@Param('id') id: string, @Body() dto: UpdateContactDto) {
    const contact = await this.contactRepo.findOne({ where: { id } });
    if (!contact) {
      return { statusCode: HttpStatus.NOT_FOUND, message: 'Contact not found' };
    }
    Object.assign(contact, dto);
    return this.contactRepo.save(contact);
  }

  @Delete('contacts/:id')
  @RequirePermission('whatsapp.manage')
  @ApiOperation({ summary: 'Soft delete a WhatsApp contact' })
  async deleteContact(@Param('id') id: string) {
    const contact = await this.contactRepo.findOne({ where: { id } });
    if (!contact) {
      return { statusCode: HttpStatus.NOT_FOUND, message: 'Contact not found' };
    }
    await this.contactRepo.softRemove(contact);
    return { message: 'Contact deleted' };
  }

  // ─── Messages ─────────────────────────────────────────

  @Post('send')
  @RequirePermission('whatsapp.send')
  @ApiOperation({ summary: 'Send a custom WhatsApp message' })
  async sendMessage(@Body() dto: SendMessageDto) {
    const recipients = dto.recipients.map((r) => ({ phone: r }));
    const result = await this.messageService.sendBulk(
      recipients,
      dto.message,
      dto.message_type || 'custom',
    );
    return result;
  }

  @Get('messages')
  @RequirePermission('whatsapp.view')
  @ApiOperation({ summary: 'Get message log' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'message_type', required: false })
  async getMessages(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('message_type') message_type?: string,
  ) {
    return this.messageService.findMessages({ page, limit, status, message_type });
  }

  // ─── Report ───────────────────────────────────────────

  @Post('report/send')
  @RequirePermission('whatsapp.send')
  @ApiOperation({ summary: 'Manually trigger daily sales report' })
  async sendDailyReport() {
    const result = await this.reportService.sendDailyReport();
    return { message: 'Daily report sent', ...result };
  }
}

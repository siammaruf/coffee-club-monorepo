import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsAppMessage } from '../entities/whatsapp-message.entity';
import { WhatsAppContact } from '../entities/whatsapp-contact.entity';
import { WhatsAppConfig } from '../entities/whatsapp-config.entity';
import { WhatsAppConnectionService } from './whatsapp-connection.service';
import { MessageStatus } from '../enums';

@Injectable()
export class WhatsAppMessageService {
  private readonly logger = new Logger(WhatsAppMessageService.name);

  constructor(
    @InjectRepository(WhatsAppMessage)
    private readonly messageRepo: Repository<WhatsAppMessage>,
    @InjectRepository(WhatsAppContact)
    private readonly contactRepo: Repository<WhatsAppContact>,
    @InjectRepository(WhatsAppConfig)
    private readonly configRepo: Repository<WhatsAppConfig>,
    private readonly connectionService: WhatsAppConnectionService,
  ) {}

  async getConfig(): Promise<WhatsAppConfig> {
    let config = await this.configRepo.findOne({ where: {} });
    if (!config) {
      config = this.configRepo.create();
      config = await this.configRepo.save(config);
    }
    return config;
  }

  async sendMessage(
    recipient: string,
    message: string,
    type?: string,
    recipientName?: string,
    promotionId?: string,
  ): Promise<WhatsAppMessage> {
    const log = this.messageRepo.create({
      recipient,
      recipient_name: recipientName || null,
      message,
      message_type: type || 'custom',
      status: MessageStatus.PENDING,
      promotion_id: promotionId || null,
    });

    try {
      const config = await this.getConfig();
      if (!config.enabled) {
        log.status = MessageStatus.FAILED;
        log.error = 'WhatsApp is disabled';
        return this.messageRepo.save(log);
      }

      if (!this.connectionService.isConnected()) {
        log.status = MessageStatus.FAILED;
        log.error = 'WhatsApp is not connected';
        return this.messageRepo.save(log);
      }

      const sock = this.connectionService.getSock();
      if (!sock) {
        log.status = MessageStatus.FAILED;
        log.error = 'No active socket';
        return this.messageRepo.save(log);
      }

      const jid = this.formatJid(recipient);
      const result = await sock.sendMessage(jid, { text: message });

      log.status = MessageStatus.SENT;
      log.whatsapp_message_id = result?.key?.id || null;
    } catch (error) {
      log.status = MessageStatus.FAILED;
      log.error = error.message;
      this.logger.error(`Failed to send to ${recipient}: ${error.message}`);
    }

    return this.messageRepo.save(log);
  }

  async sendBulk(
    recipients: Array<{ phone: string; name?: string }>,
    message: string,
    type?: string,
    promotionId?: string,
  ): Promise<{ successful: number; failed: number }> {
    let successful = 0;
    let failed = 0;

    for (const recipient of recipients) {
      const result = await this.sendMessage(
        recipient.phone,
        message,
        type,
        recipient.name,
        promotionId,
      );

      if (result.status === MessageStatus.SENT) {
        successful++;
      } else {
        failed++;
      }

      // Throttle: 1.5s delay between messages
      if (recipients.indexOf(recipient) < recipients.length - 1) {
        await this.delay(1500);
      }
    }

    return { successful, failed };
  }

  async notifyNewOrder(order: any): Promise<void> {
    const config = await this.getConfig();
    if (!config.enabled || !config.order_notifications_enabled) return;
    if (!this.connectionService.isConnected()) return;

    const contacts = await this.contactRepo.find({
      where: { receive_order_notifications: true, is_active: true },
    });

    if (contacts.length === 0) return;

    const template = config.order_notification_template ||
      `New Order #{order_id}\nType: {order_type}\nAmount: {total_amount} BDT\nItems: {item_count}`;

    const message = template
      .replace('{order_id}', order.order_id || '')
      .replace('{order_type}', order.order_type || '')
      .replace('{total_amount}', order.total_amount?.toString() || '0')
      .replace('{item_count}', order.orderItems?.length?.toString() || '0');

    const recipients = contacts.map((c) => ({ phone: c.phone, name: c.name }));
    await this.sendBulk(recipients, message, 'order_notification');
  }

  async sendOtp(phone: string, otp: string): Promise<WhatsAppMessage> {
    const message = `Your Coffee Club OTP: ${otp}. Valid for 5 minutes. Do not share this code.`;
    return this.sendMessage(phone, message, 'otp');
  }

  async findMessages(params: {
    page?: number;
    limit?: number;
    status?: string;
    message_type?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.messageRepo.createQueryBuilder('msg');

    if (params.status) {
      qb.andWhere('msg.status = :status', { status: params.status });
    }

    if (params.message_type) {
      qb.andWhere('msg.message_type = :type', { type: params.message_type });
    }

    qb.orderBy('msg.created_at', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private formatJid(phone: string): string {
    // If it already looks like a group JID
    if (phone.includes('@')) return phone;
    // Strip any leading + or 0
    const cleaned = phone.replace(/^\+/, '');
    return `${cleaned}@s.whatsapp.net`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import moment from 'moment-timezone';
import { Order } from '../../orders/entities/order.entity';
import { WhatsAppConfig } from '../entities/whatsapp-config.entity';
import { WhatsAppContact } from '../entities/whatsapp-contact.entity';
import { WhatsAppMessageService } from './whatsapp-message.service';
import { WhatsAppConnectionService } from './whatsapp-connection.service';

@Injectable()
export class WhatsAppReportService implements OnModuleInit {
  private readonly logger = new Logger(WhatsAppReportService.name);
  private readonly CRON_JOB_NAME = 'whatsapp-daily-report';

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(WhatsAppConfig)
    private readonly configRepo: Repository<WhatsAppConfig>,
    @InjectRepository(WhatsAppContact)
    private readonly contactRepo: Repository<WhatsAppContact>,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly messageService: WhatsAppMessageService,
    private readonly connectionService: WhatsAppConnectionService,
  ) {}

  async onModuleInit() {
    const config = await this.messageService.getConfig();
    if (config.daily_report_enabled) {
      this.registerCronJob(config.daily_report_time);
    }
  }

  async updateSchedule(time: string, enabled: boolean) {
    try {
      if (this.schedulerRegistry.doesExist('cron', this.CRON_JOB_NAME)) {
        this.schedulerRegistry.deleteCronJob(this.CRON_JOB_NAME);
      }
    } catch {
      // Job does not exist
    }

    if (enabled) {
      this.registerCronJob(time);
      this.logger.log(`Daily report schedule updated: ${time}`);
    }
  }

  private registerCronJob(time: string) {
    const [hours, minutes] = time.split(':');
    const cronExpression = `${minutes} ${hours} * * *`;

    const job = new CronJob(
      cronExpression,
      () => this.handleDailyReport(),
      null,
      true,
      'Asia/Dhaka',
    );

    this.schedulerRegistry.addCronJob(this.CRON_JOB_NAME, job as any);
    job.start();
    this.logger.log(`Daily report cron registered: ${cronExpression}`);
  }

  async handleDailyReport() {
    this.logger.log('Sending daily sales report...');
    try {
      await this.sendDailyReport();
    } catch (error) {
      this.logger.error(`Daily report failed: ${error.message}`);
    }
  }

  async sendDailyReport(): Promise<{ successful: number; failed: number }> {
    const config = await this.messageService.getConfig();
    if (!config.enabled || !config.daily_report_enabled) {
      return { successful: 0, failed: 0 };
    }

    if (!this.connectionService.isConnected()) {
      this.logger.warn('WhatsApp not connected, skipping daily report');
      return { successful: 0, failed: 0 };
    }

    const contacts = await this.contactRepo.find({
      where: { receive_daily_reports: true, is_active: true },
    });

    if (contacts.length === 0) {
      this.logger.warn('No contacts subscribed to daily reports');
      return { successful: 0, failed: 0 };
    }

    const report = await this.generateSalesReport();
    const recipients = contacts.map((c) => ({ phone: c.phone, name: c.name }));

    return this.messageService.sendBulk(recipients, report, 'daily_report');
  }

  private async generateSalesReport(): Promise<string> {
    const today = moment().tz('Asia/Dhaka').format('YYYY-MM-DD');
    const startOfDay = moment.tz(today, 'Asia/Dhaka').startOf('day').toDate();
    const endOfDay = moment.tz(today, 'Asia/Dhaka').endOf('day').toDate();

    const orders = await this.orderRepo.find({
      where: {
        created_at: Between(startOfDay, endOfDay),
      },
      relations: ['orderItems'],
    });

    const completedOrders = orders.filter((o) => o.status !== 'CANCELLED');
    const totalRevenue = completedOrders.reduce(
      (sum, o) => sum + parseFloat(o.total_amount?.toString() || '0'),
      0,
    );

    const dineInOrders = completedOrders.filter((o) => o.order_type === 'DINEIN');
    const takeawayOrders = completedOrders.filter((o) => o.order_type === 'TAKEAWAY');
    const deliveryOrders = completedOrders.filter((o) => o.order_type === 'DELIVERY');

    const dineInRevenue = dineInOrders.reduce(
      (sum, o) => sum + parseFloat(o.total_amount?.toString() || '0'),
      0,
    );
    const takeawayRevenue = takeawayOrders.reduce(
      (sum, o) => sum + parseFloat(o.total_amount?.toString() || '0'),
      0,
    );
    const deliveryRevenue = deliveryOrders.reduce(
      (sum, o) => sum + parseFloat(o.total_amount?.toString() || '0'),
      0,
    );

    const avgOrderValue =
      completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

    return [
      `☕ *Coffee Club - Daily Sales Report*`,
      `📅 Date: ${today}`,
      ``,
      `📊 *Summary*`,
      `Total Orders: ${completedOrders.length}`,
      `Total Revenue: ${totalRevenue.toLocaleString()} BDT`,
      `Avg Order Value: ${avgOrderValue.toFixed(0)} BDT`,
      ``,
      `📋 *By Type*`,
      `  Dine-in: ${dineInOrders.length} (${dineInRevenue.toLocaleString()} BDT)`,
      `  Takeaway: ${takeawayOrders.length} (${takeawayRevenue.toLocaleString()} BDT)`,
      `  Delivery: ${deliveryOrders.length} (${deliveryRevenue.toLocaleString()} BDT)`,
    ].join('\n');
  }
}

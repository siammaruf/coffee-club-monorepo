import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { SmsLog } from './entities/sms-log.entity';
import { SmsLogStatus } from './enum/sms-log-status.enum';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(SmsLog)
    private readonly smsLogRepository: Repository<SmsLog>,
  ) {}

  async sendSms(phoneNumber: string, message: string): Promise<boolean> {
    const formattedNumber = phoneNumber.startsWith('+')
      ? phoneNumber.substring(1)
      : phoneNumber;

    try {
      const apiKey = this.configService.get<string>('SMS_API_KEY', '');
      const senderId = this.configService.get<string>('SMS_SENDER_ID', '');
      const url = `http://bulksmsbd.net/api/smsapi?api_key=${apiKey}&type=text&number=${formattedNumber}&senderid=${senderId}&message=${encodeURIComponent(message)}`;
      const response = await axios.get(url);
      this.logger.debug('SMS API Response: ' + JSON.stringify(response.data).slice(0, 200));

      await this.smsLogRepository
        .save(this.smsLogRepository.create({ phone: formattedNumber, message, status: SmsLogStatus.SENT }))
        .catch(() => {});

      return true;
    } catch (error) {
      this.logger.error('Error sending SMS: ' + (error?.message || error));

      await this.smsLogRepository
        .save(this.smsLogRepository.create({
          phone: formattedNumber,
          message,
          status: SmsLogStatus.FAILED,
          error: error?.message ?? String(error),
        }))
        .catch(() => {});

      return false;
    }
  }

  async sendOtpSms(phoneNumber: string, otp: string): Promise<boolean> {
    const message = `Your Coffee Club OTP: ${otp}. Valid for 5 minutes. Do not share this code.`;
    return this.sendSms(phoneNumber, message);
  }

  async sendWelcomeSms(phoneNumber: string, userName: string, email: string): Promise<boolean> {
    const message = `Welcome to Coffee Club, ${userName}! Your password setup link has been sent to ${email}. Enjoy your coffee journey with us!`;
    return this.sendSms(phoneNumber, message);
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
  constructor(private configService: ConfigService) {}

  async sendSms(phoneNumber: string, message: string): Promise<boolean> {
    try {
      const formattedNumber = phoneNumber.startsWith('+') 
        ? phoneNumber.substring(1) 
        : phoneNumber;
      
      const apiKey = this.configService.get<string>('SMS_API_KEY', '');
      const senderId = this.configService.get<string>('SMS_SENDER_ID', '');
      const url = `http://bulksmsbd.net/api/smsapi?api_key=${apiKey}&type=text&number=${formattedNumber}&senderid=${senderId}&message=${encodeURIComponent(message)}`;
      const response = await axios.get(url);
      console.log('SMS API Response:', response.data);
      
      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
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
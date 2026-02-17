import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { passwordResetTemplate } from './templates/password-reset.template';
import { welcomeUserTemplate } from './templates/welcome-user.template';
import { otpTemplate } from './templates/otp.template';

export type AppType = 'dashboard' | 'frontend';

export interface EmailOptions {
  to: string;
  subject: string;
  template: 'password-reset' | 'welcome';
  appType?: AppType;
  templateData: {
    email: string;
    token: string;
    firstName?: string;
  };
}

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  private generateResetUrl(token: string, appType: AppType = 'frontend'): string {
    const urlConfig = {
      dashboard: this.configService.get('DASHBOARD_URL', 'http://localhost:4200'),
      frontend: this.configService.get('FRONTEND_URL', 'http://localhost:3000'),
    };
    return `${urlConfig[appType]}/auth/reset-password?token=${token}`;
  }

  private getTemplateHtml(template: string, data: any, appType: AppType = 'frontend'): string {
    const resetUrl = this.generateResetUrl(data.token, appType);

    const templates = {
      'password-reset': () => passwordResetTemplate(data.email, resetUrl, data.token),
      'welcome': () => welcomeUserTemplate(data.email, data.firstName || 'User', resetUrl)
    };

    return templates[template]?.() || '';
  }

  async sendTemplatedEmail(options: EmailOptions): Promise<void> {
    const html = this.getTemplateHtml(options.template, options.templateData, options.appType);
    
    await this.mailerService.sendMail({
      to: options.to,
      subject: options.subject,
      html,
    });
  }

  async sendPasswordResetEmail(email: string, token: string, appType: AppType = 'frontend'): Promise<void> {
    await this.sendTemplatedEmail({
      to: email,
      subject: 'Password Reset Request',
      template: 'password-reset',
      appType,
      templateData: { email, token }
    });
  }

  async sendWelcomeEmail(email: string, firstName: string, token: string): Promise<void> {
    await this.sendTemplatedEmail({
      to: email,
      subject: 'Welcome to Coffee Club - Set Your Password',
      template: 'welcome',
      appType: 'dashboard',
      templateData: { email, token, firstName }
    });
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const html = otpTemplate(email, otp);
    
    await this.mailerService.sendMail({
      to: email,
      subject: 'Coffee Club - Your OTP Code',
      html,
    });
  }
}
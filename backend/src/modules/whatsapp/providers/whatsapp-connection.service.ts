import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  WASocket,
  ConnectionState,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as QRCode from 'qrcode';
import pino from 'pino';
import * as path from 'path';
import * as fs from 'fs';
import { WhatsAppGateway } from '../gateways/whatsapp.gateway';
import { ConnectionStatus } from '../enums';

@Injectable()
export class WhatsAppConnectionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsAppConnectionService.name);
  private sock: WASocket | null = null;
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private retryCount = 0;
  private readonly maxRetries = 5;
  private readonly authDir: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly gateway: WhatsAppGateway,
  ) {
    this.authDir = this.configService.get<string>(
      'WHATSAPP_AUTH_DIR',
      path.join(process.cwd(), 'whatsapp-auth'),
    );
  }

  async onModuleInit() {
    if (fs.existsSync(path.join(this.authDir, 'creds.json'))) {
      this.logger.log('Auth state found, auto-connecting...');
      await this.connect();
    }
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  getSock(): WASocket | null {
    return this.sock;
  }

  isConnected(): boolean {
    return this.status === ConnectionStatus.CONNECTED;
  }

  async connect(): Promise<void> {
    if (this.status === ConnectionStatus.CONNECTED) {
      this.logger.warn('Already connected');
      return;
    }

    this.setStatus(ConnectionStatus.CONNECTING);

    try {
      const { state, saveCreds } = await useMultiFileAuthState(this.authDir);

      this.sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }) as any,
        browser: ['CoffeeClub', 'Chrome', '1.0.0'],
      });

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('connection.update', async (update: Partial<ConnectionState>) => {
        await this.handleConnectionUpdate(update);
      });
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      this.setStatus(ConnectionStatus.DISCONNECTED);
      this.gateway.emitError(error.message);
    }
  }

  async disconnect(): Promise<void> {
    this.retryCount = this.maxRetries;
    if (this.sock) {
      this.sock.end(undefined);
      this.sock = null;
    }
    this.setStatus(ConnectionStatus.DISCONNECTED);
    this.retryCount = 0;
  }

  async logout(): Promise<void> {
    if (this.sock) {
      await this.sock.logout();
      this.sock = null;
    }
    if (fs.existsSync(this.authDir)) {
      fs.rmSync(this.authDir, { recursive: true, force: true });
    }
    this.setStatus(ConnectionStatus.DISCONNECTED);
    this.retryCount = 0;
  }

  private async handleConnectionUpdate(update: Partial<ConnectionState>) {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      this.setStatus(ConnectionStatus.SCANNING_QR);
      try {
        const qrDataUrl = await QRCode.toDataURL(qr);
        this.gateway.emitQrCode(qrDataUrl);
      } catch (err) {
        this.logger.error(`QR generation failed: ${err.message}`);
      }
    }

    if (connection === 'close') {
      const boom = lastDisconnect?.error as Boom;
      const statusCode = boom?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      this.logger.warn(
        `Connection closed. Reason: ${DisconnectReason[statusCode] || statusCode}`,
      );

      if (statusCode === DisconnectReason.loggedOut) {
        this.setStatus(ConnectionStatus.DISCONNECTED);
        if (fs.existsSync(this.authDir)) {
          fs.rmSync(this.authDir, { recursive: true, force: true });
        }
        this.gateway.emitError('Logged out from WhatsApp. Please scan QR again.');
        return;
      }

      if (shouldReconnect && this.retryCount < this.maxRetries) {
        this.retryCount++;
        const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
        this.logger.log(
          `Reconnecting in ${delay / 1000}s (attempt ${this.retryCount}/${this.maxRetries})...`,
        );
        setTimeout(() => this.connect(), delay);
      } else if (this.retryCount >= this.maxRetries) {
        this.setStatus(ConnectionStatus.DISCONNECTED);
        this.gateway.emitError('Max reconnection attempts reached');
        this.retryCount = 0;
      }
    }

    if (connection === 'open') {
      this.retryCount = 0;
      this.setStatus(ConnectionStatus.CONNECTED);
      this.logger.log('WhatsApp connected successfully');
    }
  }

  private setStatus(status: ConnectionStatus) {
    this.status = status;
    this.gateway.emitStatus(status);
  }
}

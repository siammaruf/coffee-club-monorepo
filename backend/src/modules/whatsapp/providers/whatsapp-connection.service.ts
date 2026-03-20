import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Boom } from '@hapi/boom';
import * as QRCode from 'qrcode';
import pino from 'pino';
import * as path from 'path';
import * as fs from 'fs';
import { WhatsAppGateway } from '../gateways/whatsapp.gateway';
import { ConnectionStatus } from '../enums';

// Baileys v7 is ESM-only — use cached dynamic import for CJS compatibility
let baileysModule: any = null;
async function getBaileys() {
  if (!baileysModule) {
    baileysModule = await import('@whiskeysockets/baileys');
  }
  return baileysModule;
}

@Injectable()
export class WhatsAppConnectionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsAppConnectionService.name);
  private sock: any = null;
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private retryCount = 0;
  private readonly maxRetries = 5;
  private readonly authDir: string;
  private keepAliveInterval: ReturnType<typeof setInterval> | null = null;
  private pendingQr: string | null = null;

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
    this.stopKeepAlive();
    await this.disconnect();
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  getSock(): any {
    return this.sock;
  }

  isConnected(): boolean {
    return this.status === ConnectionStatus.CONNECTED;
  }

  getPendingQr(): string | null {
    return this.pendingQr;
  }

  async connect(): Promise<void> {
    if (this.status === ConnectionStatus.CONNECTED) {
      this.logger.warn('Already connected');
      return;
    }

    this.setStatus(ConnectionStatus.CONNECTING);

    try {
      const baileys = await getBaileys();
      const makeWASocket = baileys.default || baileys.makeWASocket;
      const { useMultiFileAuthState, Browsers } = baileys;

      const { state, saveCreds } = await useMultiFileAuthState(this.authDir);

      this.sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }) as any,
        browser: Browsers.ubuntu('Chrome'),
        shouldIgnoreJid: (jid: string) =>
          jid?.endsWith('@broadcast') || jid?.endsWith('@newsletter'),
        getMessage: async () => ({ conversation: '' }),
      });

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('connection.update', async (update: any) => {
        await this.handleConnectionUpdate(update);
      });
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      this.setStatus(ConnectionStatus.DISCONNECTED);
      this.gateway.emitError(error.message);
    }
  }

  async disconnect(): Promise<void> {
    this.stopKeepAlive();
    this.retryCount = this.maxRetries;
    if (this.sock) {
      this.sock.end(undefined);
      this.sock = null;
    }
    this.setStatus(ConnectionStatus.DISCONNECTED);
    this.retryCount = 0;
  }

  async logout(): Promise<void> {
    this.stopKeepAlive();
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

  private async handleConnectionUpdate(update: any) {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      this.setStatus(ConnectionStatus.SCANNING_QR);
      try {
        const qrDataUrl = await QRCode.toDataURL(qr);
        this.pendingQr = qrDataUrl;
        this.gateway.emitQrCode(qrDataUrl);
      } catch (err) {
        this.logger.error(`QR generation failed: ${err.message}`);
      }
    }

    if (connection === 'close') {
      this.stopKeepAlive();
      const boom = lastDisconnect?.error as Boom;
      const statusCode = boom?.output?.statusCode;

      const { DisconnectReason } = await getBaileys();
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
      this.pendingQr = null;
      this.setStatus(ConnectionStatus.CONNECTED);
      this.logger.log('WhatsApp connected successfully');
      this.startKeepAlive();
    }
  }

  private startKeepAlive() {
    this.stopKeepAlive();
    this.keepAliveInterval = setInterval(() => {
      if (this.sock) {
        this.sock.sendPresenceUpdate('available').catch(() => {});
      }
    }, 25_000);
  }

  private stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  private setStatus(status: ConnectionStatus) {
    this.status = status;
    this.gateway.emitStatus(status);
  }
}

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  namespace: '/whatsapp',
  path: '/api/v1/ws',
  cors: {
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow connections with no origin (server-to-server, mobile apps)
      if (!origin) {
        callback(null, true);
        return;
      }
      const allowed = (process.env.CORS_ORIGINS || '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
      const isAllowed = allowed.includes(origin);
      if (!isAllowed) {
        console.warn(
          `[WhatsApp WS] CORS rejected origin: ${origin}. Allowed: ${allowed.join(', ')}`,
        );
      }
      callback(null, isAllowed);
    },
    credentials: true,
  },
})
export class WhatsAppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WhatsAppGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit() {
    const allowedOrigins = this.configService.get<string>('CORS_ORIGINS', '');
    this.logger.debug(
      `WhatsApp WebSocket gateway initialized on namespace: /whatsapp, allowed origins: ${allowedOrigins}`,
    );
  }

  async handleConnection(client: Socket) {
    this.logger.debug(
      `Client attempting connection: ${client.id}, origin: ${client.handshake?.headers?.origin}, transport: ${client.conn?.transport?.name}`,
    );

    try {
      // 1. Try socket.io auth payload first (cross-origin safe)
      let token = client.handshake?.auth?.token as string | undefined;

      // 2. Fallback: try cookie extraction
      if (!token) {
        const cookieHeader = client.handshake?.headers?.cookie;
        if (cookieHeader) {
          const accessCookie = cookieHeader
            .split(';')
            .find((c: string) => c.trim().startsWith('access='));
          if (accessCookie) {
            token = accessCookie.trim().split('=').slice(1).join('=');
          }
        }
      }

      if (!token) {
        this.logger.warn('WebSocket connection rejected: no auth token');
        client.disconnect();
        return;
      }

      const secret = this.configService.get<string>('JWT_SECRET');
      this.jwtService.verify(token, { secret });
      this.logger.debug(`Client authenticated and connected: ${client.id}`);
    } catch {
      this.logger.warn(`WebSocket connection rejected: invalid token`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitQrCode(qr: string) {
    this.server.emit('whatsapp:qr', { qr });
  }

  emitStatus(status: string) {
    this.server.emit('whatsapp:status', { status });
  }

  emitError(error: string) {
    this.server.emit('whatsapp:error', { error });
  }
}

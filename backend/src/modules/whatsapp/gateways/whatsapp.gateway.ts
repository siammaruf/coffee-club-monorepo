import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  namespace: '/whatsapp',
  cors: {
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      callback(null, true);
    },
    credentials: true,
  },
})
export class WhatsAppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WhatsAppGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake?.headers?.cookie
        ?.split(';')
        .find((c: string) => c.trim().startsWith('access='))
        ?.split('=')[1];

      if (!token) {
        this.logger.warn('WebSocket connection rejected: no auth cookie');
        client.disconnect();
        return;
      }

      const secret = this.configService.get<string>('JWT_SECRET');
      this.jwtService.verify(token, { secret });
      this.logger.log(`Client connected: ${client.id}`);
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

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import {
  Logger,
  UseGuards,
  Injectable,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from '../../../auth/ws-jwt.guard';
import { LockCommandPort } from '../../../../domain/ports/input/lock-command.port';
import { LockNotificationPort } from '../../../../domain/ports/output/lock-notification.port';
import { SessionRepositoryPort } from '../../../../domain/ports/output/session-repository.port';
import { OpenLockDto } from '../../../../application/dtos/open-lock.dto';
import { LockStatusType } from '../../../../domain/entities/lock.entity';
import { JwtPayload } from '../../../auth/jwt.strategy';
import { errorMessage } from 'src/infrastructure/utilities/error-message';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketsAdapter
  implements OnGatewayConnection, OnGatewayDisconnect, LockNotificationPort
{
  private readonly logger = new Logger(WebsocketsAdapter.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    @Inject('SESSION_REPOSITORY_PORT')
    private readonly sessionRepository: SessionRepositoryPort,
    @Inject(forwardRef(() => LockCommandPort))
    private readonly lockCommandPort: LockCommandPort,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        this.logger.warn('Connection rejected: Token not provided');
        client.disconnect();
        return;
      }

      const token = authHeader.split(' ')[1];

      try {
        const payload = this.jwtService.verify<JwtPayload>(token);

        if (!payload || !payload.userId) {
          this.logger.warn('Connection rejected: Invalid token');
          client.disconnect();
          return;
        }

        client.data.userId = payload.userId;

        await this.sessionRepository.registerClient(payload.userId, client.id);

        this.logger.log(
          `Client connected: ${client.id} (User: ${payload.userId})`,
        );
      } catch (error) {
        this.logger.warn(
          `Connection rejected: Invalid token - ${errorMessage(error)}`,
        );
        client.disconnect();
      }
    } catch (error) {
      this.logger.error(`Error in handleConnection: ${errorMessage(error)}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const userId = client.data.userId;

      if (userId) {
        await this.sessionRepository.unregisterClient(userId);
        this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
      } else {
        this.logger.log(
          `Client disconnected: ${client.id} (Not authenticated)`,
        );
      }
    } catch (error) {
      this.logger.error(`Error in handleDisconnect: ${errorMessage(error)}`);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('openLock')
  async handleOpenLock(
    @ConnectedSocket() client: Socket,
    @MessageBody() openLockDto: OpenLockDto,
  ) {
    try {
      const userId = client.data.userId;

      this.logger.log(
        `Request to open lock ${openLockDto.lockId} from user ${userId}`,
      );

      await this.lockCommandPort.openLock(openLockDto.lockId, userId);

      return { success: true, message: 'Command sent successfully' };
    } catch (error) {
      this.logger.error(
        `Error processing open request: ${errorMessage(error)}`,
      );
      return { success: false, message: errorMessage(error) };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('closeLock')
  async handleCloseLock(
    @ConnectedSocket() client: Socket,
    @MessageBody() closeLockDto: OpenLockDto,
  ) {
    try {
      const userId = client.data.userId;

      this.logger.log(
        `Request to close lock ${closeLockDto.lockId} from user ${userId}`,
      );

      await this.lockCommandPort.closeLock(closeLockDto.lockId, userId);

      return { success: true, message: 'Command sent successfully' };
    } catch (error) {
      this.logger.error(
        `Error processing close request: ${errorMessage(error)}`,
      );
      return { success: false, message: errorMessage(error) };
    }
  }

  async notifyStatusChange(
    lockId: number,
    status: LockStatusType,
  ): Promise<void> {
    this.server.emit('lockStatusChange', { lockId, status });
    this.logger.debug(
      `Notification sent to all clients: Lock ${lockId} - ${status}`,
    );
  }
}

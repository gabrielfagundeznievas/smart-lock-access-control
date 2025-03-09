import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  Inject,
} from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { EnvironmentConfigService } from '../../../../config/environment-config';
import {
  Lock,
  LockStatusType,
} from '../../../../../domain/entities/lock.entity';
import { LockRepositoryPort } from '../../../../../domain/ports/output/lock-repository.port';
import { SessionRepositoryPort } from '../../../../../domain/ports/output/session-repository.port';
import { errorMessage } from 'src/infrastructure/utilities/error-message';

@Injectable()
export class RedisRepository
  implements
    LockRepositoryPort,
    SessionRepositoryPort,
    OnModuleInit,
    OnModuleDestroy
{
  private readonly logger = new Logger(RedisRepository.name);
  private client: RedisClientType;

  constructor(
    @Inject('CONFIG_SERVICE')
    private readonly configService: EnvironmentConfigService,
  ) {
    this.client = createClient({
      url: this.configService.getRedisUrl(),
    });

    this.client.on('error', (err) => {
      this.logger.error(`Redis connection error: ${err.message}`);
    });
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      this.logger.log('Redis connection established');
    } catch (error) {
      this.logger.error(`Error connecting to Redis: ${errorMessage(error)}`);
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
    this.logger.log('Redis connection closed');
  }

  async findById(lockId: number): Promise<Lock | null> {
    const status = await this.getStatus(lockId);
    return new Lock(lockId, status);
  }

  async saveStatus(lockId: number, status: LockStatusType): Promise<void> {
    const key = `lock:${lockId}:status`;
    await this.client.set(key, status);
    this.logger.debug(`Lock ${lockId} status saved in Redis: ${status}`);
  }

  async getStatus(lockId: number): Promise<LockStatusType> {
    const key = `lock:${lockId}:status`;
    const status = await this.client.get(key);
    return (status as LockStatusType) || 'closed';
  }

  async registerClient(userId: number, socketId: string): Promise<void> {
    const key = `user:${userId}:socket`;
    await this.client.set(key, socketId);
    await this.client.sAdd('connected:clients', socketId);
    this.logger.debug(`Client registered: User ${userId}, Socket ${socketId}`);
  }

  async unregisterClient(userId: number): Promise<void> {
    const key = `user:${userId}:socket`;
    const socketId = await this.client.get(key);

    if (socketId) {
      await this.client.sRem('connected:clients', socketId);
    }

    await this.client.del(key);

    this.logger.debug(`Client unregistered: User ${userId}`);
  }

  async getClientSocketId(userId: number): Promise<string | null> {
    const key = `user:${userId}:socket`;
    return this.client.get(key);
  }

  async getConnectedClients(): Promise<string[]> {
    return this.client.sMembers('connected:clients');
  }
}

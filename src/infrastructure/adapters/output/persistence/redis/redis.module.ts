import { Module } from '@nestjs/common';
import { RedisRepository } from './redis.repository';
import { ConfigModule } from '../../../../config/config.module';
import { LockRepositoryPort } from '../../../../../domain/ports/output/lock-repository.port';
import { SessionRepositoryPort } from '../../../../../domain/ports/output/session-repository.port';

@Module({
  imports: [ConfigModule],
  providers: [
    RedisRepository,
    {
      provide: LockRepositoryPort,
      useExisting: RedisRepository,
    },
    {
      provide: SessionRepositoryPort,
      useExisting: RedisRepository,
    },
  ],
  exports: [LockRepositoryPort, SessionRepositoryPort, RedisRepository],
})
export class RedisModule {}

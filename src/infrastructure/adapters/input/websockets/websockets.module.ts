import { RedisModule } from './../../output/persistence/redis/redis.module';
import { Module, forwardRef } from '@nestjs/common';
import { WebsocketsAdapter } from './websockets.adapter';
import { AuthModule } from '../../../auth/auth.module';
import { DomainModule } from '../../../../domain/domain.module';
import { ApplicationModule } from '../../../../application/application.module';
import { SessionRepositoryPort } from 'src/domain/ports/output/session-repository.port';
import { LockCommandPort } from 'src/domain/ports/input/lock-command.port';

@Module({
  imports: [
    AuthModule,
    DomainModule,
    RedisModule,
    forwardRef(() => ApplicationModule),
  ],
  providers: [
    WebsocketsAdapter,
    {
      provide: 'SESSION_REPOSITORY_PORT',
      useExisting: SessionRepositoryPort,
    },
    {
      provide: 'LOCK_COMMAND_PORT',
      useExisting: LockCommandPort,
    },
  ],
  exports: [WebsocketsAdapter],
})
export class WebsocketsModule {}

import { Module, forwardRef } from '@nestjs/common';
import { DomainModule } from '../domain/domain.module';
import { RedisModule } from '../infrastructure/adapters/output/persistence/redis/redis.module';
import { OpenLockUseCase } from './use-cases/open-lock.use-case';
import { CloseLockUseCase } from './use-cases/close-lock.use-case';
import { UpdateLockStatusUseCase } from './use-cases/update-lock-status.use-case';
import { LockApplicationService } from './services/lock-application.service';
import { LockCommandPort } from '../domain/ports/input/lock-command.port';
import { LockQueryPort } from '../domain/ports/input/lock-query.port';
import { LockDomainService } from 'src/domain/services/lock-domain.service';
import { LockControlPort } from 'src/domain/ports/output/lock-control.port';
import { LockNotificationPort } from 'src/domain/ports/output/lock-notification.port';
import { LockRepositoryPort } from 'src/domain/ports/output/lock-repository.port';
import { LockNotificationProxy } from './proxy/lock-notification.proxy';

@Module({
  imports: [
    DomainModule,
    RedisModule,
    forwardRef(() =>
      import(
        '../infrastructure/adapters/output/messaging/mqtt/mqtt.module'
      ).then((m) => m.MqttModule),
    ),
  ],
  providers: [
    OpenLockUseCase,
    CloseLockUseCase,
    UpdateLockStatusUseCase,
    LockApplicationService,
    {
      provide: LockCommandPort,
      useExisting: LockApplicationService,
    },
    {
      provide: LockQueryPort,
      useExisting: LockApplicationService,
    },
    {
      provide: 'LOCK_DOMAIN_SERVICE',
      useExisting: LockDomainService,
    },
    {
      provide: 'LOCK_CONTROL_PORT',
      useExisting: LockControlPort,
    },
    {
      provide: 'LOCK_NOTIFICATION_PORT',
      useClass: LockNotificationProxy,
    },
    {
      provide: 'OPEN_LOCK_USE_CASE',
      useExisting: OpenLockUseCase,
    },
    {
      provide: 'CLOSE_LOCK_USE_CASE',
      useExisting: CloseLockUseCase,
    },
    {
      provide: 'UPDATE_LOCK_STATUS_USE_CASE',
      useExisting: UpdateLockStatusUseCase,
    },
    {
      provide: 'LOCK_REPOSITORY_PORT',
      useExisting: LockRepositoryPort,
    },
  ],
  exports: [
    LockCommandPort,
    LockQueryPort,
    LockApplicationService,
    OpenLockUseCase,
    CloseLockUseCase,
    UpdateLockStatusUseCase,
  ],
})
export class ApplicationModule {}

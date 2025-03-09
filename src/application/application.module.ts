import { Module, forwardRef } from '@nestjs/common';
import { DomainModule } from '../domain/domain.module';
import { RedisModule } from '../infrastructure/adapters/output/persistence/redis/redis.module';
import { OpenLockUseCase } from './use-cases/open-lock.use-case';
import { CloseLockUseCase } from './use-cases/close-lock.use-case';
import { UpdateLockStatusUseCase } from './use-cases/update-lock-status.use-case';
import { LockApplicationService } from './services/lock-application.service';
import { LockCommandPort } from '../domain/ports/input/lock-command.port';
import { LockQueryPort } from '../domain/ports/input/lock-query.port';

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

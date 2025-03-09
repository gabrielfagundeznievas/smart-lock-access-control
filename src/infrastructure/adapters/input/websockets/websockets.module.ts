import { Module, forwardRef } from '@nestjs/common';
import { WebsocketsAdapter } from './websockets.adapter';
import { AuthModule } from '../../../auth/auth.module';
import { DomainModule } from '../../../../domain/domain.module';
import { ApplicationModule } from '../../../../application/application.module';
import { LockNotificationPort } from '../../../../domain/ports/output/lock-notification.port';

@Module({
  imports: [AuthModule, DomainModule, forwardRef(() => ApplicationModule)],
  providers: [
    WebsocketsAdapter,
    {
      provide: LockNotificationPort,
      useExisting: WebsocketsAdapter,
    },
  ],
  exports: [WebsocketsAdapter, LockNotificationPort],
})
export class WebsocketsModule {}

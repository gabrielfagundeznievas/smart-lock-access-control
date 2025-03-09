import { Inject, Injectable } from '@nestjs/common';
import type { LockDomainService } from '../../domain/services/lock-domain.service';
import type { LockNotificationPort } from '../../domain/ports/output/lock-notification.port';
import type { LockStatusType } from '../../domain/entities/lock.entity';

@Injectable()
export class UpdateLockStatusUseCase {
  constructor(
    @Inject('LOCK_DOMAIN_SERVICE')
    private readonly lockDomainService: LockDomainService,
    @Inject('LOCK_NOTIFICATION_PORT')
    private readonly lockNotificationPort: LockNotificationPort,
  ) {}

  async execute(lockId: number, status: LockStatusType): Promise<void> {
    await this.lockDomainService.updateLockStatus(lockId, status);
    await this.lockNotificationPort.notifyStatusChange(lockId, status);
  }
}

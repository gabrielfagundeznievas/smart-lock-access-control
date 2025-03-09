import { Inject, Injectable } from '@nestjs/common';
import type { LockDomainService } from '../../domain/services/lock-domain.service';
import type { LockControlPort } from '../../domain/ports/output/lock-control.port';
import type { LockNotificationPort } from '../../domain/ports/output/lock-notification.port';

@Injectable()
export class OpenLockUseCase {
  constructor(
    @Inject('LOCK_DOMAIN_SERVICE')
    private readonly lockDomainService: LockDomainService,
    @Inject('LOCK_CONTROL_PORT')
    private readonly lockControlPort: LockControlPort,
    @Inject('LOCK_NOTIFICATION_PORT')
    private readonly lockNotificationPort: LockNotificationPort,
  ) {}

  async execute(lockId: number, userId: number): Promise<void> {
    const hasPermission = await this.lockDomainService.hasPermission(
      lockId,
      userId,
    );
    if (!hasPermission) {
      throw new Error(
        `User ${userId} does not have permission to open lock ${lockId}`,
      );
    }

    await this.lockControlPort.sendOpenCommand(lockId);
    await this.lockDomainService.updateLockStatus(lockId, 'open');
    await this.lockNotificationPort.notifyStatusChange(lockId, 'open');
  }
}

import { Injectable } from '@nestjs/common';
import { LockNotificationPort } from '../../domain/ports/output/lock-notification.port';
import { LockStatusType } from '../../domain/entities/lock.entity';

@Injectable()
export class LockNotificationProxy implements LockNotificationPort {
  async notifyStatusChange(
    lockId: number,
    status: LockStatusType,
  ): Promise<void> {
    console.log(
      `[PROXY] Status change notification: Lock ${lockId} - ${status}`,
    );
  }
}

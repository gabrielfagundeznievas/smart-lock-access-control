import type { LockStatusType } from '../../entities/lock.entity';

export abstract class LockNotificationPort {
  abstract notifyStatusChange(
    lockId: number,
    status: LockStatusType,
  ): Promise<void>;
}

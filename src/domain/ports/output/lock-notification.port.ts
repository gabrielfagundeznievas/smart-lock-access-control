import type { LockStatusType } from '../../entities/lock.entity';

export interface LockNotificationPort {
  notifyStatusChange(lockId: number, status: LockStatusType): Promise<void>;
}
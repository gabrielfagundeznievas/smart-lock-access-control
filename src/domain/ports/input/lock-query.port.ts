import type { LockStatusType } from '../../entities/lock.entity';

export interface LockQueryPort {
  getLockStatus(lockId: number): Promise<LockStatusType>;
}
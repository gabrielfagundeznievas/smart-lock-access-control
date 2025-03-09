import type { LockStatusType } from '../../entities/lock.entity';

export abstract class LockQueryPort {
  abstract getLockStatus(lockId: number): Promise<LockStatusType>;
}

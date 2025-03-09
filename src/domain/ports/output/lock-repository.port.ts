import type { Lock, LockStatusType } from '../../entities/lock.entity';

export abstract class LockRepositoryPort {
  abstract findById(lockId: number): Promise<Lock | null>;
  abstract saveStatus(lockId: number, status: LockStatusType): Promise<void>;
  abstract getStatus(lockId: number): Promise<LockStatusType>;
}

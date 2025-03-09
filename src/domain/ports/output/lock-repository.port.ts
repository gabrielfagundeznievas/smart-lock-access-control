import type { Lock, LockStatusType } from '../../entities/lock.entity';

export interface LockRepositoryPort {
  findById(lockId: number): Promise<Lock | null>;

  saveStatus(lockId: number, status: LockStatusType): Promise<void>;

  getStatus(lockId: number): Promise<LockStatusType>;
}
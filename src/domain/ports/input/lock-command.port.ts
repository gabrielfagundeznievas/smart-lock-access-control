export interface LockCommandPort {
  openLock(lockId: number, userId: number): Promise<void>;

  closeLock(lockId: number, userId: number): Promise<void>;
}
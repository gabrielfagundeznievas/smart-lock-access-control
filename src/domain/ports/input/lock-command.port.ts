export abstract class LockCommandPort {
  abstract openLock(lockId: number, userId: number): Promise<void>;
  abstract closeLock(lockId: number, userId: number): Promise<void>;
}

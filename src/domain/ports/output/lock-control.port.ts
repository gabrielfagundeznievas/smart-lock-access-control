export interface LockControlPort {
  sendOpenCommand(lockId: number): Promise<void>;

  sendCloseCommand(lockId: number): Promise<void>;
}
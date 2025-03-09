export abstract class LockControlPort {
  abstract sendOpenCommand(lockId: number): Promise<void>;
  abstract sendCloseCommand(lockId: number): Promise<void>;
}

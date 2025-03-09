export type LockStatusType = 'open' | 'closed';

export class Lock {
  readonly id: number;
  private _status: LockStatusType;

  constructor(id: number, status: LockStatusType = 'closed') {
    this.id = id;
    this._status = status;
  }

  get status(): LockStatusType {
    return this._status;
  }

  updateStatus(newStatus: LockStatusType): void {
    this._status = newStatus;
  }

  open(): void {
    this._status = 'open';
  }

  close(): void {
    this._status = 'closed';
  }

  isOpen(): boolean {
    return this._status === 'open';
  }

  isClosed(): boolean {
    return this._status === 'closed';
  }
}

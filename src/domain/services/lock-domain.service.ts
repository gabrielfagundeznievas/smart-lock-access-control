import { Injectable } from '@nestjs/common';
import { Lock, LockStatusType } from '../entities/lock.entity';
import { LockRepositoryPort } from '../ports/output/lock-repository.port';

@Injectable()
export class LockDomainService {
  constructor(private readonly lockRepository: LockRepositoryPort) {}

  async hasPermission(lockId: number, userId: number): Promise<boolean> {
    // Para la POC, cualquier usuario autenticado tiene permiso
    return userId > 0;
  }

  async updateLockStatus(
    lockId: number,
    status: LockStatusType,
  ): Promise<Lock> {
    let lock = await this.lockRepository.findById(lockId);

    if (!lock) {
      lock = new Lock(lockId, status);
    } else {
      lock.updateStatus(status);
    }

    await this.lockRepository.saveStatus(lockId, status);

    return lock;
  }
}

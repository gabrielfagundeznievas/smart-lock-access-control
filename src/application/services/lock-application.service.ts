import { Inject, Injectable } from '@nestjs/common';
import type { LockStatusType } from '../../domain/entities/lock.entity';
import type { OpenLockUseCase } from '../use-cases/open-lock.use-case';
import type { CloseLockUseCase } from '../use-cases/close-lock.use-case';
import type { UpdateLockStatusUseCase } from '../use-cases/update-lock-status.use-case';
import type { LockCommandPort } from '../../domain/ports/input/lock-command.port';
import type { LockQueryPort } from '../../domain/ports/input/lock-query.port';
import type { LockRepositoryPort } from '../../domain/ports/output/lock-repository.port';

@Injectable()
export class LockApplicationService implements LockCommandPort, LockQueryPort {
  constructor(
    @Inject('OPEN_LOCK_USE_CASE')
    private readonly openLockUseCase: OpenLockUseCase,
    @Inject('CLOSE_LOCK_USE_CASE')
    private readonly closeLockUseCase: CloseLockUseCase,
    @Inject('UPDATE_LOCK_STATUS_USE_CASE')
    private readonly updateLockStatusUseCase: UpdateLockStatusUseCase,
    @Inject('LOCK_REPOSITORY_PORT')
    private readonly lockRepository: LockRepositoryPort,
  ) {}

  async openLock(lockId: number, userId: number): Promise<void> {
    await this.openLockUseCase.execute(lockId, userId);
  }

  async closeLock(lockId: number, userId: number): Promise<void> {
    await this.closeLockUseCase.execute(lockId, userId);
  }

  async updateLockStatus(
    lockId: number,
    status: LockStatusType,
  ): Promise<void> {
    await this.updateLockStatusUseCase.execute(lockId, status);
  }

  async getLockStatus(lockId: number): Promise<LockStatusType> {
    return this.lockRepository.getStatus(lockId);
  }
}

import { IsNumber, IsEnum } from 'class-validator';
import type { LockStatusType } from '../../domain/entities/lock.entity';

export class LockStatusDto {
  @IsNumber()
  lockId: number;

  @IsEnum(['open', 'closed'], {
    message: "Status must be 'open' or 'closed'",
  })
  status: LockStatusType;
}

import { IsNumber } from 'class-validator';

export class OpenLockDto {
  @IsNumber()
  lockId!: number;
}

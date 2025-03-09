import { Module } from '@nestjs/common';
import { LockDomainService } from './services/lock-domain.service';
import { RedisModule } from '../infrastructure/adapters/output/persistence/redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [LockDomainService],
  exports: [LockDomainService],
})
export class DomainModule {}

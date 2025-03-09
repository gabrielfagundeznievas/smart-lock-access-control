import { Module } from '@nestjs/common';
import { ConfigModule } from './infrastructure/config/config.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { DomainModule } from './domain/domain.module';
import { ApplicationModule } from './application/application.module';
import { WebsocketsModule } from './infrastructure/adapters/input/websockets/websockets.module';
import { MqttModule } from './infrastructure/adapters/output/messaging/mqtt/mqtt.module';
import { RedisModule } from './infrastructure/adapters/output/persistence/redis/redis.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    DomainModule,
    ApplicationModule,
    WebsocketsModule,
    MqttModule,
    RedisModule,
  ],
})
export class AppModule {}

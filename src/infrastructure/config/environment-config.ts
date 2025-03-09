import { Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvironmentConfigService {
  constructor(private configService: ConfigService) {}

  getMqttBrokerUrl(): string {
    return this.configService.get<string>(
      'MQTT_BROKER_URL',
      'mqtt://localhost:1883',
    );
  }

  getRedisUrl(): string {
    return this.configService.get<string>(
      'REDIS_URL',
      'redis://localhost:6379',
    );
  }

  getJwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET', 'default_secret_key');
  }

  getJwtExpirationTime(): string {
    return this.configService.get<string>('JWT_EXPIRATION', '1h');
  }

  getPort(): number {
    return this.configService.get<number>('PORT', 3000);
  }
}

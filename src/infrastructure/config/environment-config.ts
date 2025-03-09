import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvironmentConfigService {
  constructor(private configService: ConfigService) {}

  getMqttBrokerUrl(): string {
    const mqttBrokerUrl = this.configService.get<string>('MQTT_BROKER_URL');
    if (mqttBrokerUrl) {
      return mqttBrokerUrl;
    }

    const mqttHost = this.configService.get<string>('MQTT_HOST', 'localhost');
    const mqttPort = this.configService.get<number>('MQTT_PORT', 1883);
    return `mqtt://${mqttHost}:${mqttPort}`;
  }

  getRedisUrl(): string {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (redisUrl) {
      return redisUrl;
    }

    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    return `redis://${redisHost}:${redisPort}`;
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

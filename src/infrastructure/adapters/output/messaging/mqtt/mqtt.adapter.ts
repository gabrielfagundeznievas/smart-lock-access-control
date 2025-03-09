import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  Inject,
  forwardRef,
} from '@nestjs/common';
import * as mqtt from 'mqtt';
import { EnvironmentConfigService } from '../../../../config/environment-config';
import { LockControlPort } from '../../../../../domain/ports/output/lock-control.port';
import { LockApplicationService } from '../../../../../application/services/lock-application.service';

interface LockStatusMessage {
  lockId: number;
  status: 'open' | 'closed';
}

interface LockControlMessage {
  lockId: number;
  command: 'open' | 'close';
}

@Injectable()
export class MqttAdapter
  implements LockControlPort, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(MqttAdapter.name);
  private client: mqtt.MqttClient;

  private readonly statusTopic = 'lock/status';
  private readonly controlTopic = 'lock/control';

  constructor(
    private readonly configService: EnvironmentConfigService,
    @Inject(forwardRef(() => LockApplicationService))
    private readonly lockApplicationService: LockApplicationService,
  ) {}

  async onModuleInit() {
    const brokerUrl = this.configService.getMqttBrokerUrl();

    this.client = mqtt.connect(brokerUrl, {
      clientId: `nest_backend_${Math.random().toString(16).substring(2, 10)}`,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
    });

    this.client.on('connect', () => {
      this.logger.log(`Connected to MQTT broker: ${brokerUrl}`);
      this.subscribeToTopics();
    });

    this.client.on('error', (error) => {
      this.logger.error(`MQTT connection error: ${error.message}`);
    });

    this.client.on('message', (topic, payload) => {
      this.handleMqttMessage(topic, payload);
    });
  }

  async onModuleDestroy() {
    if (this.client) {
      this.client.end(true);
      this.logger.log('MQTT connection closed');
    }
  }

  private subscribeToTopics() {
    this.client.subscribe(this.statusTopic, (err) => {
      if (err) {
        this.logger.error(
          `Error subscribing to ${this.statusTopic}: ${err.message}`,
        );
      } else {
        this.logger.log(`Subscribed to topic: ${this.statusTopic}`);
      }
    });
  }

  private handleMqttMessage(topic: string, payload: Buffer) {
    try {
      const message = JSON.parse(payload.toString());

      if (topic === this.statusTopic) {
        this.handleLockStatusUpdate(message);
      }
    } catch (error) {
      this.logger.error(`Error processing MQTT message: ${error.message}`);
    }
  }

  private async handleLockStatusUpdate(message: LockStatusMessage) {
    if (!message || !message.lockId || !message.status) {
      this.logger.warn('Incomplete or invalid lock status message');
      return;
    }

    this.logger.debug(
      `Received status update: Lock ${message.lockId} - ${message.status}`,
    );

    await this.lockApplicationService.updateLockStatus(
      message.lockId,
      message.status,
    );
  }

  async sendOpenCommand(lockId: number): Promise<void> {
    const message: LockControlMessage = {
      lockId,
      command: 'open',
    };

    return this.publishCommand(message);
  }

  async sendCloseCommand(lockId: number): Promise<void> {
    const message: LockControlMessage = {
      lockId,
      command: 'close',
    };

    return this.publishCommand(message);
  }

  private publishCommand(message: LockControlMessage): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.publish(
        this.controlTopic,
        JSON.stringify(message),
        { qos: 1 },
        (err) => {
          if (err) {
            this.logger.error(
              `Error publishing command for lock ${message.lockId}: ${err.message}`,
            );
            reject(err);
          } else {
            this.logger.debug(
              `Command published for lock ${message.lockId}: ${message.command}`,
            );
            resolve();
          }
        },
      );
    });
  }
}

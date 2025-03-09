import { Module, forwardRef } from '@nestjs/common';
import { MqttAdapter } from './mqtt.adapter';
import { ConfigModule } from '../../../../config/config.module';
import { ApplicationModule } from '../../../../../application/application.module';
import { LockControlPort } from '../../../../../domain/ports/output/lock-control.port';

@Module({
  imports: [ConfigModule, forwardRef(() => ApplicationModule)],
  providers: [
    MqttAdapter,
    {
      provide: LockControlPort,
      useClass: MqttAdapter,
    },
  ],
  exports: [LockControlPort, MqttAdapter],
})
export class MqttModule {}

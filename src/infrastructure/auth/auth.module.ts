import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { EnvironmentConfigService } from '../config/environment-config';
import { WsJwtGuard } from './ws-jwt.guard';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: EnvironmentConfigService) => ({
        secret: configService.getJwtSecret(),
        signOptions: {
          expiresIn: configService.getJwtExpirationTime(),
        },
      }),
      inject: [EnvironmentConfigService],
    }),
  ],
  providers: [
    {
      provide: 'CONFIG_SERVICE',
      useExisting: EnvironmentConfigService,
    },
    JwtStrategy,
    WsJwtGuard,
  ],
  exports: [JwtModule, PassportModule, WsJwtGuard],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { EnvironmentConfigService } from '../config/environment-config';
import { WsJwtGuard } from './ws-jwt.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: async (configService: EnvironmentConfigService) => ({
        secret: configService.getJwtSecret(),
        signOptions: {
          expiresIn: configService.getJwtExpirationTime(),
        },
      }),
      inject: [EnvironmentConfigService],
    }),
  ],
  providers: [JwtStrategy, WsJwtGuard],
  exports: [JwtModule, PassportModule, WsJwtGuard],
})
export class AuthModule {}

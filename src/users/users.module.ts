import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';

// comment: O código abaixo define o módulo de usuários da aplicação. Esse módulo deve ser importado no módulo principal da aplicação (AppModule) para que a aplicação o reconheça
@Module({
  controllers: [],
  providers: [UsersService],
  imports: [
    PrismaModule,
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'super-secret-key',
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  exports: [UsersService],
})
export class UsersModule {}

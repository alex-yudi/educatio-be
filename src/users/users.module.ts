import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

// comment: O código abaixo define o módulo de usuários da aplicação. Esse módulo deve ser importado no módulo principal da aplicação (AppModule) para que a aplicação o reconheça
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [PrismaModule],
})
export class UsersModule { }

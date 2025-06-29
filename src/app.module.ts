import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { AlunosController } from './alunos/alunos.controller';
import { DisciplinasController } from './disciplinas/disciplinas.controller';
import { MatriculasController } from './matriculas/matriculas.controller';
import { ProfessoresController } from './professores/professores.controller';
import { TurmasController } from './turmas/turmas.controller';
import { CursosController } from './cursos/cursos.controller';

// comment: O código abaixo é o módulo principal da aplicação NestJS. Ele importa os módulos Prisma e Users, e define o controlador e o serviço principais da aplicação.
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule
  ],
  controllers: [
    AppController,
    AuthController,
    AlunosController,
    DisciplinasController,
    MatriculasController,
    ProfessoresController,
    TurmasController,
    CursosController
  ],
  providers: [AppService],
})
export class AppModule { }

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOkResponse, ApiTags, ApiUnauthorizedResponse, ApiBearerAuth, ApiCreatedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { LoginResponseEntity } from './entities/login-response.entity';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { AlunoCreatedEntity } from './entities/aluno-created.entity';
import { AdminGuard } from 'src/auth/guards/admin.guard';

// comment: O código abaixo define um controlador para gerenciar apenas o login de usuários. 
// O controlador também usa decorators do Swagger para gerar a documentação da API.
@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: LoginResponseEntity,
    description: 'Login realizado com sucesso'
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciais inválidas'
  })
  async login(@Body() loginDto: LoginDto) {
    const { accessToken, user } = await this.usersService.login(loginDto);
    return new LoginResponseEntity({
      accessToken,
      user: new UserEntity({ ...user, name: user.nome ?? '' })
    });
  }

  @Post('aluno')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: AlunoCreatedEntity,
    description: 'Aluno cadastrado com sucesso'
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado. Apenas administradores podem criar alunos'
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado'
  })
  async createAluno(
    @Body() createAlunoDto: CreateAlunoDto,
    @Req() request: any
  ) {
    try {
      const adminId = request.user.sub;
      const result = await this.usersService.createAluno(createAlunoDto, adminId);

      return new AlunoCreatedEntity({
        usuario: new UserEntity({ ...result.usuario, name: result.usuario.nome }),
        senha_temporaria: result.senha_temporaria,
        curso: result.curso
      });
    } catch (error) {
      if (error.status === 401) {
        throw new ForbiddenException('Acesso restrito a administradores');
      }
      throw error;
    }
  }
}
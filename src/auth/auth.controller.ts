import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiOperation,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';
import { UserEntityMapper } from '../common/mappers/user-entity.mapper';
import { LoginDto } from '../users/dto/login.dto';
import { LoginResponseEntity } from '../users/entities/login-response.entity';
import { Headers } from '@nestjs/common';

@Controller('auth')
@ApiTags('Autenticação')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'login',
    summary: 'Realizar login no sistema',
    description:
      'Autentica um usuário no sistema utilizando e-mail e senha. Retorna um token JWT que deve ser usado no header Authorization (Bearer token) para acessar rotas protegidas. O token expira em 24 horas.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Credenciais de login',
    examples: {
      admin: {
        summary: 'Login de Administrador',
        description: 'Exemplo de login para usuário administrador',
        value: {
          email: 'admin@uni.edu',
          senha: 'admin123',
        },
      },
      professor: {
        summary: 'Login de Professor',
        description: 'Exemplo de login para professor',
        value: {
          email: 'maria.silva@uni.edu',
          senha: 'prof123',
        },
      },
      aluno: {
        summary: 'Login de Aluno',
        description: 'Exemplo de login para aluno',
        value: {
          email: 'joao.silva@uni.edu',
          senha: 'aluno123',
        },
      },
    },
  })
  @ApiOkResponse({
    type: LoginResponseEntity,
    description:
      'Login realizado com sucesso. Token JWT gerado para autenticação.',
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciais inválidas - e-mail ou senha incorretos',
  })
  @ApiBadRequestResponse({
    description:
      'Dados de entrada inválidos - formato de e-mail incorreto ou senha muito curta',
  })
  async login(@Body() loginDto: LoginDto) {
    const { accessToken, user } = await this.usersService.login(loginDto);
    return new LoginResponseEntity({
      accessToken,
      user: UserEntityMapper.toEntity(user),
    });
  }

  @Get('verificar')
  @ApiBearerAuth()
  @ApiOperation({
    operationId: 'verificarToken',
    summary: 'Verificar token JWT e obter dados do usuário',
    description:
      'Verifica a validade de um token JWT e retorna os dados completos do usuário autenticado. Use este endpoint para: 1) Validar se o token ainda é válido, 2) Obter dados atualizados do usuário, 3) Verificar o papel/perfil do usuário para controle de acesso no frontend.',
  })
  @ApiOkResponse({
    type: UserEntity,
    description:
      'Token válido. Dados completos do usuário retornados com sucesso.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Token não fornecido, inválido ou expirado. Redirecionar para tela de login.',
  })
  async verificar(@Headers('Authorization') authorization?: string) {
    const authWords = authorization?.split(' ');
    let token: string = '';
    if (authWords && authWords.length == 2) {
      token += authWords[1];
    }

    const user = await this.usersService.verifyToken(token);
    return UserEntityMapper.toEntity(user);
  }
}

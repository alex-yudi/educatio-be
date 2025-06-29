import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiUnauthorizedResponse, ApiOperation, ApiBadRequestResponse } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';
import { LoginDto } from '../users/dto/login.dto';
import { LoginResponseEntity } from '../users/entities/login-response.entity';

@Controller('auth')
@ApiTags('Autenticação')
export class AuthController {
  constructor(private readonly usersService: UsersService) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Realizar login',
    description: 'Autentica um usuário no sistema utilizando e-mail e senha, retornando um token JWT para acesso às rotas protegidas'
  })
  @ApiOkResponse({
    type: LoginResponseEntity,
    description: 'Login realizado com sucesso, token gerado'
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciais inválidas - e-mail ou senha incorretos'
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos'
  })
  async login(@Body() loginDto: LoginDto) {
    const { accessToken, user } = await this.usersService.login(loginDto);
    return new LoginResponseEntity({
      accessToken,
      user: new UserEntity({ ...user, name: user.nome ?? '' })
    });
  }
}

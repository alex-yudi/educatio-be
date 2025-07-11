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
} from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';
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
    summary: 'Realizar login',
    description:
      'Autentica um usuário no sistema utilizando e-mail e senha, retornando um token JWT para acesso às rotas protegidas',
  })
  @ApiOkResponse({
    type: LoginResponseEntity,
    description: 'Login realizado com sucesso, token gerado',
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciais inválidas - e-mail ou senha incorretos',
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
  })
  async login(@Body() loginDto: LoginDto) {
    const { accessToken, user } = await this.usersService.login(loginDto);
    return new LoginResponseEntity({
      accessToken,
      user: new UserEntity({ ...user, name: user.nome ?? '' }),
    });
  }

  @Get('verificar')
  @ApiBearerAuth() // This tells Swagger UI to show an "Authorize" button
  @ApiOperation({
    summary: 'Verificar token e obter dados do usuário',
    description:
      'Verifica a validade de um token JWT e retorna os dados do usuário autenticado. Deve ser usado para validar a sessão do usuário no frontend.',
  })
  @ApiOkResponse({
    type: UserEntity,
    description: 'Token válido. Dados do usuário retornados com sucesso.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token não fornecido, inválido ou expirado.',
  })
  async verificar(@Headers('Authorization') authorization?: string) {
    const authWords = authorization?.split(' ');
    let token: string = '';
    if (authWords && authWords.length == 2) {
      token += authWords[1];
    }

    // If the code reaches here, the JwtAuthGuard has already validated the token
    // and attached its payload to the request object as `req.user`.
    const user = await this.usersService.verifyToken(token);

    // We return a UserEntity, just like the login response, for consistency.
    return new UserEntity({ ...user, name: user.nome ?? '' });
  }
}

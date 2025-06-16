import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { LoginResponseEntity } from './entities/login-response.entity';

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
}
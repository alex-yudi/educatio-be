import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { LoginResponseEntity } from './entities/login-response.entity';

// comment: O código abaixo define um controlador para gerenciar usuários. Aqui que as rotas são criadas e os métodos correspondentes são definidos. Eles vão importar os services e os DTOs necessários para criar, atualizar, buscar e deletar usuários. O controlador também usa decorators do Swagger para gerar a documentação da API. O controlador é responsável por lidar com as requisições HTTP e retornar as respostas apropriadas para o cliente.
@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiCreatedResponse({ type: UserEntity })
  async create(@Body() createUserDto: CreateUserDto) {
    const createdUser = await this.usersService.create(createUserDto);
    return new UserEntity({ ...createdUser, name: createdUser.nome ?? '' });
  }

  @Get()
  @ApiOkResponse({ type: UserEntity, isArray: true })
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((user) => new UserEntity({ ...user, name: user.nome ?? '' }));
  }

  @Get(':id')
  @ApiOkResponse({ type: UserEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`Usuário com id ${id} não encontrado`);
    }
    return new UserEntity({ ...user, name: user.nome ?? '' });
  }

  @Patch(':id')
  @ApiCreatedResponse({ type: UserEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const updatedUser = await this.usersService.update(id, updateUserDto);
      return new UserEntity({ ...updatedUser, name: updatedUser.nome ?? '' });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Usuário com id ${id} não encontrado`);
      }
      throw error;
    }
  }

  @Delete(':id')
  @ApiOkResponse({ type: UserEntity })
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      const removedUser = await this.usersService.remove(id);
      return new UserEntity({ ...removedUser, name: removedUser.nome ?? '' });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Usuário com id ${id} não encontrado`);
      }
      throw error;
    }
  }

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
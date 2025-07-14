import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Req,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { CreateProfessorDto } from '../users/dto/create-professor.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { ProfessorCreatedEntity } from '../users/entities/professor-created.entity';
import { ProfessorListEntity } from '../users/entities/professor-list.entity';
import { UserEntity } from '../users/entities/user.entity';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminProfessorGuard } from '../auth/guards/admin-professor.guard';

@Controller('professores')
@ApiTags('Professores')
@ApiBearerAuth()
export class ProfessoresController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Cadastrar novo professor',
    description:
      'Cria um novo professor no sistema. Apenas administradores podem realizar esta operação.',
  })
  @ApiCreatedResponse({
    type: ProfessorCreatedEntity,
    description: 'Professor cadastrado com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description:
      'Acesso negado. Apenas administradores podem cadastrar professores',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos',
  })
  @ApiConflictResponse({
    description: 'E-mail já cadastrado no sistema',
  })
  async create(
    @Body() createProfessorDto: CreateProfessorDto,
    @Req() request: any,
  ) {
    try {
      const adminId = request.user.sub;
      const result = await this.usersService.createProfessor(
        createProfessorDto,
        adminId,
      );

      return new ProfessorCreatedEntity({
        usuario: new UserEntity({
          id: result.id,
          name: result.nome,
          nome: result.nome,
          email: result.email,
          password: '',
          senha: '',
          role: result.role,
          registrationNumber: null,
          matricula: null,
          createdAt: result.criado_em,
          criado_em: result.criado_em,
          updatedAt: result.atualizado_em,
          atualizado_em: result.atualizado_em,
        }),
        senha_temporaria: result.senha_temporaria,
      });
    } catch (error) {
      if (error.status === 401) {
        throw new ForbiddenException('Acesso restrito a administradores');
      }
      throw error;
    }
  }

  @Get()
  @UseGuards(AdminProfessorGuard)
  @ApiOperation({
    summary: 'Listar professores',
    description:
      'Lista todos os professores cadastrados no sistema. Administradores e professores podem acessar.',
  })
  @ApiOkResponse({
    type: [UserEntity],
    description: 'Lista de professores',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description:
      'Acesso negado. Apenas administradores e professores podem listar',
  })
  async findAll() {
    const professores = await this.usersService.findAllProfessores();
    return professores.map(
      (prof) =>
        new UserEntity({
          id: prof.id,
          name: prof.nome,
          nome: prof.nome,
          email: prof.email,
          password: '',
          senha: '',
          role: prof.role,
          registrationNumber: null,
          matricula: null,
          createdAt: prof.criado_em,
          criado_em: prof.criado_em,
          updatedAt: prof.atualizado_em,
          atualizado_em: prof.atualizado_em,
        }),
    );
  }

  @Get(':id')
  @UseGuards(AdminProfessorGuard)
  @ApiOperation({
    summary: 'Buscar professor por ID',
    description:
      'Retorna os dados de um professor específico pelo seu ID. Administradores e professores podem realizar esta operação.',
  })
  @ApiOkResponse({
    type: UserEntity,
    description: 'Dados do professor retornados com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado. Apenas administradores e professores podem acessar',
  })
  @ApiNotFoundResponse({
    description: 'Professor não encontrado',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const professor = await this.usersService.findOne(id);

      if (!professor || professor.role !== 'professor') {
        throw new ForbiddenException('Professor não encontrado');
      }

      return new UserEntity({
        id: professor.id,
        name: professor.nome,
        nome: professor.nome,
        email: professor.email,
        password: '',
        senha: '',
        role: professor.role,
        registrationNumber: null,
        matricula: null,
        createdAt: professor.criado_em,
        criado_em: professor.criado_em,
        updatedAt: professor.atualizado_em,
        atualizado_em: professor.atualizado_em,
      });
    } catch (error) {
      if (error.status === 401) {
        throw new ForbiddenException('Acesso restrito a administradores e professores');
      }
      throw error;
    }
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Atualizar professor',
    description:
      'Atualiza os dados de um professor. Apenas administradores podem realizar esta operação.',
  })
  @ApiOkResponse({
    type: UserEntity,
    description: 'Professor atualizado com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description:
      'Acesso negado. Apenas administradores podem atualizar professores',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos',
  })
  @ApiNotFoundResponse({
    description: 'Professor não encontrado',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: any,
  ) {
    try {
      const adminId = request.user.sub;
      const professor = await this.usersService.updateProfessor(
        id,
        updateUserDto,
        adminId,
      );
      return new UserEntity({
        id: professor.id,
        name: professor.nome,
        nome: professor.nome,
        email: professor.email,
        password: '',
        senha: '',
        role: professor.role,
        registrationNumber: null,
        matricula: null,
        createdAt: professor.criado_em,
        criado_em: professor.criado_em,
        updatedAt: professor.atualizado_em,
        atualizado_em: professor.atualizado_em,
      });
    } catch (error) {
      if (error.status === 401) {
        throw new ForbiddenException('Acesso restrito a administradores');
      }
      throw error;
    }
  }
}

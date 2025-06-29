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
  ApiNotFoundResponse
} from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';
import { CreateAlunoDto } from '../users/dto/create-aluno.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { AlunoCreatedEntity } from '../users/entities/aluno-created.entity';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminProfessorGuard } from '../auth/guards/admin-professor.guard';

@Controller('alunos')
@ApiTags('Alunos')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class AlunosController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({
    summary: 'Cadastrar novo aluno',
    description: 'Cria um novo aluno no sistema com senha temporária gerada automaticamente. Apenas administradores podem realizar esta operação.'
  })
  @ApiCreatedResponse({
    type: AlunoCreatedEntity,
    description: 'Aluno cadastrado com sucesso'
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido'
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado. Apenas administradores podem cadastrar alunos'
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos'
  })
  @ApiConflictResponse({
    description: 'E-mail ou matrícula já cadastrados no sistema'
  })
  @ApiNotFoundResponse({
    description: 'Curso especificado não encontrado'
  })
  async create(
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

  @Get()
  @ApiOperation({
    summary: 'Listar alunos',
    description: 'Retorna uma lista de alunos cadastrados no sistema. Apenas administradores podem realizar esta operação.'
  })
  @ApiOkResponse({
    type: [UserEntity],
    description: 'Lista de alunos retornada com sucesso'
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido'
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado. Apenas administradores podem listar alunos'
  })
  async findAll(@Req() request: any) {
    try {
      const alunos = await this.usersService.findAllAlunos();
      return alunos.map(aluno => new UserEntity({
        id: aluno.id,
        name: aluno.nome,
        nome: aluno.nome,
        email: aluno.email,
        password: '',
        senha: '',
        role: aluno.role,
        registrationNumber: aluno.matricula,
        matricula: aluno.matricula,
        createdAt: aluno.criado_em,
        criado_em: aluno.criado_em,
        updatedAt: aluno.atualizado_em,
        atualizado_em: aluno.atualizado_em
      }));
    } catch (error) {
      if (error.status === 401) {
        throw new ForbiddenException('Acesso restrito a administradores');
      }
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar aluno',
    description: 'Atualiza os dados de um aluno cadastrado no sistema. Apenas administradores podem realizar esta operação.'
  })
  @ApiOkResponse({
    type: UserEntity,
    description: 'Aluno atualizado com sucesso'
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido'
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado. Apenas administradores podem atualizar alunos'
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos'
  })
  @ApiNotFoundResponse({
    description: 'Aluno não encontrado'
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: any
  ) {
    try {
      const adminId = request.user.sub;
      const result = await this.usersService.updateAluno(id, updateUserDto, adminId);

      return new UserEntity({
        id: result.id,
        name: result.nome,
        nome: result.nome,
        email: result.email,
        password: '',
        senha: '',
        role: result.role,
        registrationNumber: result.matricula,
        matricula: result.matricula,
        createdAt: result.criado_em,
        criado_em: result.criado_em,
        updatedAt: result.atualizado_em,
        atualizado_em: result.atualizado_em
      });
    } catch (error) {
      if (error.status === 401) {
        throw new ForbiddenException('Acesso restrito a administradores');
      }
      throw error;
    }
  }
}

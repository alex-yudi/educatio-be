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
import { CreateTurmaDto } from '../users/dto/create-turma.dto';
import { TurmaCreatedEntity } from '../users/entities/turma-created.entity';
import { TurmaEntity } from '../users/entities/turma.entity';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminProfessorGuard } from '../auth/guards/admin-professor.guard';
import { HandleErrors } from '../common/decorators/handle-errors.decorator';

@Controller('turmas')
@ApiTags('Turmas')
@ApiBearerAuth()
export class TurmasController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Cadastrar nova turma',
    description:
      'Cria uma nova turma no sistema. Apenas administradores podem realizar esta operação.',
  })
  @ApiCreatedResponse({
    type: TurmaCreatedEntity,
    description: 'Turma cadastrada com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado. Apenas administradores podem cadastrar turmas',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos',
  })
  @ApiConflictResponse({
    description: 'Código da turma já existe no sistema',
  })
  @ApiNotFoundResponse({
    description: 'Disciplina ou professor não encontrados',
  })
  @HandleErrors('Acesso restrito a administradores')
  async create(@Body() createTurmaDto: CreateTurmaDto, @Req() request: any) {
    const adminId = request.user.sub;
    const result = await this.usersService.createTurma(
      createTurmaDto,
      adminId,
    );

    return new TurmaCreatedEntity({
      turma: {
        id: result.id,
        codigo: result.codigo,
        disciplina_id: result.disciplina_id,
        professor_id: result.professor_id,
        ano: result.ano,
        semestre: result.semestre,
        sala: result.sala,
        vagas: result.vagas,
        criado_em: result.criado_em,
        atualizado_em: result.atualizado_em,
      },
      disciplina_nome: result.disciplina.nome,
      professor_nome: result.professor.nome,
    });
  }

  @Get()
  @UseGuards(AdminProfessorGuard)
  @ApiOperation({
    summary: 'Listar turmas',
    description:
      'Lista todas as turmas cadastradas no sistema. Administradores e professores podem acessar.',
  })
  @ApiOkResponse({
    type: [TurmaEntity],
    description: 'Lista de turmas',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description:
      'Acesso negado. Apenas administradores e professores podem listar',
  })
  async findAll() {
    const turmas = await this.usersService.findAllTurmas();
    return turmas.map((turma) => ({
      id: turma.id,
      codigo: turma.codigo,
      disciplina_id: turma.disciplina_id,
      professor_id: turma.professor_id,
      disciplina_nome: turma.disciplina.nome,
      professor_nome: turma.professor.nome,
      ano: turma.ano,
      semestre: turma.semestre,
      sala: turma.sala,
      vagas: turma.vagas,
      matriculados: turma._count.matriculas,
      criado_em: turma.criado_em,
      atualizado_em: turma.atualizado_em,
    }));
  }

  @Get(':id')
  @UseGuards(AdminProfessorGuard)
  @ApiOperation({
    summary: 'Buscar turma por ID',
    description:
      'Retorna os dados de uma turma específica pelo seu ID. Administradores e professores podem realizar esta operação.',
  })
  @ApiOkResponse({
    type: TurmaEntity,
    description: 'Dados da turma retornados com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado. Apenas administradores e professores podem acessar',
  })
  @ApiNotFoundResponse({
    description: 'Turma não encontrada',
  })
  @HandleErrors('Acesso restrito a administradores e professores')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const turma = await this.usersService.findTurmaById(id);

    if (!turma) {
      throw new ForbiddenException('Turma não encontrada');
    }

    return {
      id: turma.id,
      codigo: turma.codigo,
      disciplina_id: turma.disciplina_id,
      professor_id: turma.professor_id,
      disciplina_nome: turma.disciplina.nome,
      disciplina_codigo: turma.disciplina.codigo,
      professor_nome: turma.professor.nome,
      professor_email: turma.professor.email,
      ano: turma.ano,
      semestre: turma.semestre,
      sala: turma.sala,
      vagas: turma.vagas,
      matriculados: turma._count.matriculas,
      horarios: turma.horarios,
      criado_em: turma.criado_em,
      atualizado_em: turma.atualizado_em,
    };
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Atualizar turma',
    description:
      'Atualiza os dados de uma turma. Apenas administradores podem realizar esta operação.',
  })
  @ApiOkResponse({
    type: TurmaCreatedEntity,
    description: 'Turma atualizada com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado. Apenas administradores podem atualizar turmas',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos',
  })
  @ApiNotFoundResponse({
    description: 'Turma não encontrada',
  })
  @HandleErrors('Acesso restrito a administradores')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTurmaDto: Partial<CreateTurmaDto>,
    @Req() request: any,
  ) {
    const adminId = request.user.sub;
    const turma = await this.usersService.updateTurma(
      id,
      updateTurmaDto,
      adminId,
    );

    return new TurmaCreatedEntity({
      turma: {
        id: turma.id,
        codigo: turma.codigo,
        disciplina_id: turma.disciplina_id,
        professor_id: turma.professor_id,
        ano: turma.ano,
        semestre: turma.semestre,
        sala: turma.sala,
        vagas: turma.vagas,
        criado_em: turma.criado_em,
        atualizado_em: turma.atualizado_em,
      },
      disciplina_nome: turma.disciplina.nome,
      professor_nome: turma.professor.nome,
    });
  }
}

import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
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
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { CreateTurmaDto } from '../users/dto/create-turma.dto';
import { TurmaCreatedEntity } from '../users/entities/turma-created.entity';
import { TurmaEntity } from '../users/entities/turma.entity';
import { TurmaCompletaEntity } from '../users/entities/turma-completa.entity';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminProfessorGuard } from '../auth/guards/admin-professor.guard';
import { HandleErrors } from '../common/decorators/handle-errors.decorator';
import { TurmaCompletaMapper } from '../common/mappers/turma-completa.mapper';

@Controller('turmas')
@ApiTags('Turmas')
@ApiBearerAuth()
export class TurmasController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({
    operationId: 'createTurma',
    summary: 'Cadastrar nova turma',
    description:
      'Cria uma nova turma no sistema. Apenas administradores podem realizar esta operação.',
  })
  @ApiBody({
    type: CreateTurmaDto,
    description: 'Dados para criação da turma',
    examples: {
      exemplo1: {
        summary: 'Turma de Programação 2025',
        description: 'Exemplo de cadastro de turma para disciplina',
        value: {
          codigo: 'PROG1-2025-1A',
          disciplina_codigo: 'PROG1',
          professor_email: 'carlos.prof@uni.edu',
          ano: 2025,
          semestre: 1,
          sala: 'Lab A-101',
          vagas: 35,
        },
      },
    },
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
    const result = await this.usersService.createTurma(createTurmaDto, adminId);

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
    operationId: 'getAllTurmas',
    summary: 'Listar turmas',
    description:
      'Quando em acesso do administrador, retorna todas as turmas cadastradas no sistema. Professores podem acessar apenas as turmas que lecionam.',
  })
  @ApiOkResponse({
    type: [TurmaCompletaEntity],
    description: 'Lista de turmas',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description:
      'Acesso negado. Apenas administradores e professores podem listar',
  })
  async findAll(@Req() request: any) {
    const user = request.user;

    if (user.role === 'professor') {
      const turmas = await this.usersService.findTurmasProfessor(user.sub);
      return turmas.map((turma) => TurmaCompletaMapper.toEntity(turma));
    }

    const turmas = await this.usersService.findAllTurmas();
    return turmas.map((turma) => TurmaCompletaMapper.toEntity(turma));
  }

  @Get('dropdown/options')
  @UseGuards(AdminProfessorGuard)
  @ApiOperation({
    operationId: 'getTurmasDropdown',
    summary: 'Listar turmas para dropdown/select',
    description:
      'Retorna lista simplificada de turmas (ID, código, disciplina e professor) especificamente otimizada para popular dropdowns e selects no frontend.',
  })
  @ApiOkResponse({
    description: 'Lista simplificada de turmas para dropdowns',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1, description: 'ID da turma' },
          codigo: {
            type: 'string',
            example: 'PROG1-2025-1A',
            description: 'Código da turma',
          },
          disciplina_nome: {
            type: 'string',
            example: 'Programação I',
            description: 'Nome da disciplina',
          },
          professor_nome: {
            type: 'string',
            example: 'Dr. Carlos Silva',
            description: 'Nome do professor',
          },
          vagas_disponiveis: {
            type: 'number',
            example: 15,
            description: 'Vagas disponíveis',
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description:
      'Acesso negado. Apenas administradores e professores podem acessar',
  })
  async findDropdownOptions() {
    const turmas = await this.usersService.findAllTurmas();
    return turmas.map((turma) => ({
      id: turma.id,
      codigo: turma.codigo,
      disciplina_nome: turma.disciplina.nome,
      professor_nome: turma.professor.nome,
      vagas_disponiveis: turma.vagas - turma._count.matriculas,
    }));
  }

  @Get(':id')
  @UseGuards(AdminProfessorGuard)
  @ApiOperation({
    operationId: 'getTurmaById',
    summary: 'Buscar turma por ID',
    description:
      'Retorna os dados completos de uma turma específica pelo seu ID, incluindo professor, disciplina e alunos matriculados. Administradores e professores podem realizar esta operação.',
  })
  @ApiOkResponse({
    type: TurmaCompletaEntity,
    description: 'Dados completos da turma retornados com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description:
      'Acesso negado. Apenas administradores e professores podem acessar',
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

    return TurmaCompletaMapper.toEntity(turma);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({
    operationId: 'updateTurma',
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

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({
    operationId: 'deleteTurma',
    summary: 'Excluir turma',
    description:
      'Exclui uma turma do sistema. Apenas administradores podem realizar esta operação. A turma não pode ser excluída se possuir matrículas ativas.',
  })
  @ApiOkResponse({
    description: 'Turma excluída com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado. Apenas administradores podem excluir turmas',
  })
  @ApiNotFoundResponse({
    description: 'Turma não encontrada',
  })
  @ApiBadRequestResponse({
    description: 'Turma possui matrículas ativas e não pode ser excluída',
  })
  @HandleErrors('Acesso restrito a administradores')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() request: any) {
    const adminId = request.user.sub;
    return await this.usersService.deleteTurma(id, adminId);
  }
}

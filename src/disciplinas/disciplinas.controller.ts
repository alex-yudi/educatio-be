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
  Delete,
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
import { CreateDisciplinaDto } from '../users/dto/create-disciplina.dto';
import { DisciplinaEntity } from '../users/entities/disciplina.entity';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminProfessorGuard } from '../auth/guards/admin-professor.guard';
import { HandleErrors } from '../common/decorators/handle-errors.decorator';

@Controller('disciplinas')
@ApiTags('Disciplinas')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class DisciplinasController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({
    operationId: 'createDisciplina',
    summary: 'Cadastrar nova disciplina',
    description:
      'Cria uma nova disciplina no sistema com código único. Apenas administradores podem realizar esta operação.',
  })
  @ApiBody({
    type: CreateDisciplinaDto,
    description: 'Dados para criação da disciplina',
    examples: {
      exemplo1: {
        summary: 'Disciplina de Programação',
        description: 'Exemplo de cadastro de disciplina básica',
        value: {
          codigo: 'PROG101',
          nome: 'Introdução à Programação',
          carga_horaria: 80,
          descricao: 'Disciplina introdutória de programação',
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: DisciplinaEntity,
    description: 'Disciplina cadastrada com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description:
      'Acesso negado. Apenas administradores podem cadastrar disciplinas',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos',
  })
  @ApiConflictResponse({
    description: 'Código da disciplina já existe no sistema',
  })
  @HandleErrors('Acesso restrito a administradores')
  async create(
    @Body() createDisciplinaDto: CreateDisciplinaDto,
    @Req() request: any,
  ) {
    const adminId = request.user.sub;
    const disciplina = await this.usersService.createDisciplina(
      createDisciplinaDto,
      adminId,
    );

    return new DisciplinaEntity(disciplina);
  }

  @Get()
  @ApiOperation({
    operationId: 'getAllDisciplinas',
    summary: 'Listar todas as disciplinas disponíveis',
    description:
      'Retorna uma lista completa de todas as disciplinas cadastradas no sistema com informações detalhadas (código, nome, carga horária, ementa). Ideal para popular dropdowns de disciplinas e visualizar disciplinas disponíveis.',
  })
  @ApiOkResponse({
    type: [DisciplinaEntity],
    description: 'Lista completa de disciplinas com todos os detalhes',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description:
      'Acesso negado. Apenas administradores podem acessar esta rota',
  })
  @HandleErrors('Acesso restrito a administradores')
  async findAll(@Req() request: any) {
    const disciplinas = await this.usersService.findAllDisciplinas();
    return disciplinas.map((disciplina) => new DisciplinaEntity(disciplina));
  }

  @Get('dropdown/options')
  @UseGuards(AdminGuard)
  @ApiOperation({
    operationId: 'getDisciplinasDropdown',
    summary: 'Listar disciplinas para dropdown/select',
    description:
      'Retorna lista simplificada de disciplinas (apenas ID, código e nome) especificamente otimizada para popular dropdowns e selects no frontend.',
  })
  @ApiOkResponse({
    description: 'Lista simplificada de disciplinas para dropdowns',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1, description: 'ID da disciplina' },
          codigo: {
            type: 'string',
            example: 'PROG1',
            description: 'Código da disciplina',
          },
          nome: {
            type: 'string',
            example: 'Programação I',
            description: 'Nome da disciplina',
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado. Apenas administradores podem acessar',
  })
  @HandleErrors('Acesso restrito a administradores')
  async findDropdownOptions(@Req() request: any) {
    const disciplinas = await this.usersService.findAllDisciplinas();
    return disciplinas.map((disciplina) => ({
      id: disciplina.id,
      codigo: disciplina.codigo,
      nome: disciplina.nome,
    }));
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'getDisciplinaById',
    summary: 'Busca disciplina por ID',
    description: 'Retorna a disciplina com ID especificado.',
  })
  @ApiOkResponse({
    type: [DisciplinaEntity],
    description: 'Disciplina',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description:
      'Acesso negado. Apenas administradores podem acessar esta rota',
  })
  async findById(@Param('id', ParseIntPipe) id: number, @Req() request: any) {
    return this.usersService.findDisciplinaById(id);
  }

  @Put(':id')
  @ApiOperation({
    operationId: 'updateDisciplina',
    summary: 'Atualizar disciplina',
    description: 'Atualiza os dados de uma disciplina existente no sistema.',
  })
  @ApiOkResponse({
    type: DisciplinaEntity,
    description: 'Disciplina atualizada com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description:
      'Acesso negado. Apenas administradores podem atualizar disciplinas',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos',
  })
  @ApiNotFoundResponse({
    description: 'Disciplina não encontrada',
  })
  @HandleErrors('Acesso restrito a administradores')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDisciplinaDto: CreateDisciplinaDto,
    @Req() request: any,
  ) {
    const adminId = request.user.sub;
    const disciplina = await this.usersService.updateDisciplina(
      id,
      updateDisciplinaDto,
      adminId,
    );

    return new DisciplinaEntity(disciplina);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({
    operationId: 'deleteDisciplina',
    summary: 'Excluir disciplina',
    description:
      'Exclui uma disciplina do sistema. Apenas administradores podem realizar esta operação. A disciplina não pode ser excluída se possuir turmas ativas ou estiver associada a cursos.',
  })
  @ApiOkResponse({
    description: 'Disciplina excluída com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description:
      'Acesso negado. Apenas administradores podem excluir disciplinas',
  })
  @ApiNotFoundResponse({
    description: 'Disciplina não encontrada',
  })
  @ApiBadRequestResponse({
    description:
      'Disciplina possui turmas ativas ou está associada a cursos e não pode ser excluída',
  })
  @HandleErrors('Acesso restrito a administradores')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() request: any) {
    const adminId = request.user.sub;
    return await this.usersService.deleteDisciplina(id, adminId);
  }
}

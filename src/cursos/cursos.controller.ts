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
import { CreateCursoDto } from '../users/dto/create-curso.dto';
import { CursoEntity } from '../users/entities/curso.entity';
import { CursoCreatedEntity } from '../users/entities/curso-created.entity';
import { CursoListEntity } from '../users/entities/curso-list.entity';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminProfessorGuard } from '../auth/guards/admin-professor.guard';
import { HandleErrors } from '../common/decorators/handle-errors.decorator';

@Controller('cursos')
@ApiTags('Cursos')
@ApiBearerAuth('bearer')
export class CursosController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({
    operationId: 'createCurso',
    summary: 'Cadastrar novo curso',
    description:
      'Cria um novo curso no sistema e pode vincular disciplinas existentes. Apenas administradores podem realizar esta operação.',
  })
  @ApiBody({
    type: CreateCursoDto,
    description:
      'Dados para criação do curso. Disciplinas podem ser vinculadas opcionalmente.',
    examples: {
      exemplo1: {
        summary: 'Curso de Engenharia de Software',
        description: 'Exemplo de cadastro de curso com disciplinas',
        value: {
          nome: 'Engenharia de Software',
          codigo: 'ESOFT',
          descricao:
            'Curso focado no desenvolvimento de software e metodologias ágeis',
          disciplinas_codigos: ['PROG1', 'PROG2', 'BD', 'ENGSW'],
        },
      },
      exemplo2: {
        summary: 'Curso básico sem disciplinas',
        description:
          'Exemplo de cadastro de curso sem vincular disciplinas inicialmente',
        value: {
          nome: 'Ciência da Computação',
          codigo: 'CC',
          descricao: 'Curso de graduação em Ciência da Computação',
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: CursoCreatedEntity,
    description: 'Curso cadastrado com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado. Apenas administradores podem cadastrar cursos',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos',
  })
  @ApiConflictResponse({
    description: 'Código do curso já existe no sistema',
  })
  @ApiNotFoundResponse({
    description: 'Uma ou mais disciplinas especificadas não foram encontradas',
  })
  @HandleErrors('Acesso restrito a administradores')
  async create(@Body() createCursoDto: CreateCursoDto, @Req() request: any) {
    const adminId = request.user.sub;
    const result = await this.usersService.createCurso(createCursoDto, adminId);

    return new CursoCreatedEntity({
      curso: new CursoEntity({
        id: result.id,
        nome: result.nome,
        codigo: result.codigo,
        descricao: result.descricao || undefined,
        criado_por_id: result.criado_por_id,
        criado_em: result.criado_em,
        atualizado_em: result.atualizado_em,
      }),
      disciplinas: result.disciplinas_nomes,
      criado_por: result.criado_por?.nome || 'Administrador',
    });
  }

  @Get()
  @UseGuards(AdminProfessorGuard)
  @ApiOperation({
    operationId: 'getAllCursos',
    summary: 'Listar todos os cursos disponíveis',
    description:
      'Lista todos os cursos cadastrados no sistema com informações resumidas (ID, nome, código). Ideal para popular dropdowns/selects no frontend. Administradores e professores podem acessar.',
  })
  @ApiOkResponse({
    type: [CursoListEntity],
    description: 'Lista de cursos com informações básicas para seleção',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description:
      'Acesso negado. Apenas administradores e professores podem listar',
  })
  async findAll() {
    const cursos = await this.usersService.findAllCursos();
    return cursos.map(
      (curso) =>
        new CursoListEntity({
          ...curso,
          descricao: curso.descricao || undefined,
        }),
    );
  }

  @Get('dropdown/options')
  @UseGuards(AdminProfessorGuard)
  @ApiOperation({
    operationId: 'getCursosDropdown',
    summary: 'Listar cursos para dropdown/select',
    description:
      'Retorna lista simplificada de cursos (apenas ID, código e nome) especificamente otimizada para popular dropdowns e selects no frontend.',
  })
  @ApiOkResponse({
    description: 'Lista simplificada de cursos para dropdowns',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1, description: 'ID do curso' },
          codigo: {
            type: 'string',
            example: 'ESOFT',
            description: 'Código do curso',
          },
          nome: {
            type: 'string',
            example: 'Engenharia de Software',
            description: 'Nome do curso',
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
    const cursos = await this.usersService.findAllCursos();
    return cursos.map((curso) => ({
      id: curso.id,
      codigo: curso.codigo,
      nome: curso.nome,
    }));
  }

  @Get(':id')
  @UseGuards(AdminProfessorGuard)
  @ApiOperation({
    operationId: 'getCursoById',
    summary: 'Buscar curso por ID',
    description:
      'Retorna os detalhes completos de um curso específico, incluindo disciplinas. Administradores e professores podem acessar.',
  })
  @ApiOkResponse({
    description: 'Detalhes do curso com disciplinas',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description:
      'Acesso negado. Apenas administradores e professores podem acessar',
  })
  @ApiNotFoundResponse({
    description: 'Curso não encontrado',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findCursoById(id);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({
    operationId: 'updateCurso',
    summary: 'Atualizar curso',
    description:
      'Atualiza os dados de um curso e pode modificar as disciplinas vinculadas. Apenas administradores podem realizar esta operação.',
  })
  @ApiOkResponse({
    type: CursoCreatedEntity,
    description: 'Curso atualizado com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado. Apenas administradores podem atualizar cursos',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos',
  })
  @ApiNotFoundResponse({
    description:
      'Curso não encontrado ou disciplinas especificadas não existem',
  })
  @ApiConflictResponse({
    description: 'Código do curso já existe',
  })
  @HandleErrors('Acesso restrito a administradores')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCursoDto: Partial<CreateCursoDto>,
    @Req() request: any,
  ) {
    const adminId = request.user.sub;
    const result = await this.usersService.updateCurso(
      id,
      updateCursoDto,
      adminId,
    );

    return new CursoCreatedEntity({
      curso: new CursoEntity({
        id: result.id,
        nome: result.nome,
        codigo: result.codigo,
        descricao: result.descricao || undefined,
        criado_por_id: result.criado_por_id,
        criado_em: result.criado_em,
        atualizado_em: result.atualizado_em,
      }),
      disciplinas: result.disciplinas_nomes,
      criado_por: result.criado_por?.nome || 'Administrador',
    });
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({
    operationId: 'deleteCurso',
    summary: 'Excluir curso',
    description:
      'Exclui um curso do sistema. Apenas administradores podem realizar esta operação. O curso não pode ser excluído se suas disciplinas possuírem turmas ativas.',
  })
  @ApiOkResponse({
    description: 'Curso excluído com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado. Apenas administradores podem excluir cursos',
  })
  @ApiNotFoundResponse({
    description: 'Curso não encontrado',
  })
  @ApiBadRequestResponse({
    description:
      'Curso possui disciplinas com turmas ativas e não pode ser excluído',
  })
  @HandleErrors('Acesso restrito a administradores')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() request: any) {
    const adminId = request.user.sub;
    return await this.usersService.deleteCurso(id, adminId);
  }
}

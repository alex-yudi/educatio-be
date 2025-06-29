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
import { CreateCursoDto } from '../users/dto/create-curso.dto';
import { CursoEntity } from '../users/entities/curso.entity';
import { CursoCreatedEntity } from '../users/entities/curso-created.entity';
import { CursoListEntity } from '../users/entities/curso-list.entity';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminProfessorGuard } from '../auth/guards/admin-professor.guard';

@Controller('cursos')
@ApiTags('Cursos')
@ApiBearerAuth()
export class CursosController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Cadastrar novo curso',
    description: 'Cria um novo curso no sistema e pode vincular disciplinas existentes. Apenas administradores podem realizar esta operação.'
  })
  @ApiCreatedResponse({
    type: CursoCreatedEntity,
    description: 'Curso cadastrado com sucesso'
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido'
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado. Apenas administradores podem cadastrar cursos'
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos'
  })
  @ApiConflictResponse({
    description: 'Código do curso já existe no sistema'
  })
  @ApiNotFoundResponse({
    description: 'Uma ou mais disciplinas especificadas não foram encontradas'
  })
  async create(
    @Body() createCursoDto: CreateCursoDto,
    @Req() request: any
  ) {
    try {
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
          atualizado_em: result.atualizado_em
        }),
        disciplinas: result.disciplinas_nomes,
        criado_por: result.criado_por?.nome || 'Administrador'
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
    summary: 'Listar cursos',
    description: 'Lista todos os cursos cadastrados no sistema com informações resumidas. Administradores e professores podem acessar.'
  })
  @ApiOkResponse({
    type: [CursoListEntity],
    description: 'Lista de cursos'
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido'
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado. Apenas administradores e professores podem listar'
  })
  async findAll() {
    const cursos = await this.usersService.findAllCursos();
    return cursos.map(curso => new CursoListEntity({
      ...curso,
      descricao: curso.descricao || undefined
    }));
  }

  @Get(':id')
  @UseGuards(AdminProfessorGuard)
  @ApiOperation({
    summary: 'Buscar curso por ID',
    description: 'Retorna os detalhes completos de um curso específico, incluindo disciplinas. Administradores e professores podem acessar.'
  })
  @ApiOkResponse({
    description: 'Detalhes do curso com disciplinas'
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido'
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado. Apenas administradores e professores podem acessar'
  })
  @ApiNotFoundResponse({
    description: 'Curso não encontrado'
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findCursoById(id);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Atualizar curso',
    description: 'Atualiza os dados de um curso e pode modificar as disciplinas vinculadas. Apenas administradores podem realizar esta operação.'
  })
  @ApiOkResponse({
    type: CursoCreatedEntity,
    description: 'Curso atualizado com sucesso'
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido'
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado. Apenas administradores podem atualizar cursos'
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos'
  })
  @ApiNotFoundResponse({
    description: 'Curso não encontrado ou disciplinas especificadas não existem'
  })
  @ApiConflictResponse({
    description: 'Código do curso já existe'
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCursoDto: Partial<CreateCursoDto>,
    @Req() request: any
  ) {
    try {
      const adminId = request.user.sub;
      const result = await this.usersService.updateCurso(id, updateCursoDto, adminId);

      return new CursoCreatedEntity({
        curso: new CursoEntity({
          id: result.id,
          nome: result.nome,
          codigo: result.codigo,
          descricao: result.descricao || undefined,
          criado_por_id: result.criado_por_id,
          criado_em: result.criado_em,
          atualizado_em: result.atualizado_em
        }),
        disciplinas: result.disciplinas_nomes,
        criado_por: result.criado_por?.nome || 'Administrador'
      });
    } catch (error) {
      if (error.status === 401) {
        throw new ForbiddenException('Acesso restrito a administradores');
      }
      throw error;
    }
  }
}

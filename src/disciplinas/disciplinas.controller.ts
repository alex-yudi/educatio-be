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
import { CreateDisciplinaDto } from '../users/dto/create-disciplina.dto';
import { DisciplinaEntity } from '../users/entities/disciplina.entity';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminProfessorGuard } from '../auth/guards/admin-professor.guard';

@Controller('disciplinas')
@ApiTags('Disciplinas')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class DisciplinasController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Cadastrar nova disciplina',
    description:
      'Cria uma nova disciplina no sistema com código único. Apenas administradores podem realizar esta operação.',
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
  async create(
    @Body() createDisciplinaDto: CreateDisciplinaDto,
    @Req() request: any,
  ) {
    try {
      const adminId = request.user.sub;
      const disciplina = await this.usersService.createDisciplina(
        createDisciplinaDto,
        adminId,
      );

      return new DisciplinaEntity(disciplina);
    } catch (error) {
      if (error.status === 401) {
        throw new ForbiddenException('Acesso restrito a administradores');
      }
      throw error;
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Listar disciplinas',
    description:
      'Retorna uma lista de todas as disciplinas cadastradas no sistema.',
  })
  @ApiOkResponse({
    type: [DisciplinaEntity],
    description: 'Lista de disciplinas',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description:
      'Acesso negado. Apenas administradores podem acessar esta rota',
  })
  async findAll(@Req() request: any) {
    try {
      const disciplinas = await this.usersService.findAllDisciplinas();
      return disciplinas.map((disciplina) => new DisciplinaEntity(disciplina));
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({
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
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDisciplinaDto: CreateDisciplinaDto,
    @Req() request: any,
  ) {
    try {
      const adminId = request.user.sub;
      const disciplina = await this.usersService.updateDisciplina(
        id,
        updateDisciplinaDto,
        adminId,
      );

      return new DisciplinaEntity(disciplina);
    } catch (error) {
      if (error.status === 401) {
        throw new ForbiddenException('Acesso restrito a administradores');
      }
      throw error;
    }
  }
}

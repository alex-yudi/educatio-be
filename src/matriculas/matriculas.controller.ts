import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiBody,
  ApiOkResponse,
} from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { CreateMatriculaDto } from '../users/dto/create-matricula.dto';
import { DesmatricularAlunoDto } from '../users/dto/desmatricular-aluno.dto';
import { MatriculaResponseEntity } from '../users/entities/matricula-response.entity';
import { AdminGuard } from '../auth/guards/admin.guard';
import { HandleErrors } from '../common/decorators/handle-errors.decorator';

@Controller('matriculas')
@ApiTags('Matrículas')
@UseGuards(AdminGuard)
@ApiBearerAuth('bearer')
export class MatriculasController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({
    operationId: 'createMatricula',
    summary: 'Realizar matrícula de aluno',
    description:
      'Matricula um aluno em uma turma específica. Verifica disponibilidade de vagas e se o aluno já não está matriculado. Apenas administradores podem realizar esta operação.',
  })
  @ApiBody({
    type: CreateMatriculaDto,
    description:
      'Dados para realização da matrícula. Use matrícula do aluno e código da turma.',
    examples: {
      exemplo1: {
        summary: 'Matrícula em turma de Programação',
        description: 'Exemplo de matrícula de aluno em turma',
        value: {
          matricula_aluno: '2025001',
          codigo_turma: 'PROG1-2025-1A',
        },
      },
      exemplo2: {
        summary: 'Matrícula em turma de Banco de Dados',
        description: 'Outro exemplo de matrícula',
        value: {
          matricula_aluno: '2025002',
          codigo_turma: 'BD-2025-1A',
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: MatriculaResponseEntity,
    description: 'Matrícula realizada com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description:
      'Acesso negado. Apenas administradores podem realizar matrículas',
  })
  @ApiBadRequestResponse({
    description:
      'Dados inválidos fornecidos, usuário não é aluno ou turma sem vagas',
  })
  @ApiNotFoundResponse({
    description: 'Aluno ou turma não encontrados',
  })
  @ApiConflictResponse({
    description: 'Aluno já matriculado nesta turma',
  })
  @HandleErrors('Acesso restrito a administradores')
  async create(
    @Body() createMatriculaDto: CreateMatriculaDto,
    @Req() request: any,
  ) {
    const adminId = request.user.sub;
    const result = await this.usersService.createMatricula(
      createMatriculaDto,
      adminId,
    );

    return new MatriculaResponseEntity(result);
  }

  @Delete()
  @ApiOperation({
    operationId: 'desmatricularAluno',
    summary: 'Desmatricular aluno de turma',
    description:
      'Desmatricula um aluno de uma turma específica. Remove automaticamente todas as notas e frequências associadas. Apenas administradores podem realizar esta operação.',
  })
  @ApiBody({
    type: DesmatricularAlunoDto,
    description:
      'Dados para desmatrícula do aluno. Use matrícula do aluno e código da turma.',
    examples: {
      exemplo1: {
        summary: 'Desmatrícula de turma',
        description: 'Exemplo de desmatrícula de aluno',
        value: {
          matricula_aluno: '2025001',
          codigo_turma: 'PROG1-2025-1A',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Aluno desmatriculado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Aluno desmatriculado com sucesso',
        },
        aluno: {
          type: 'object',
          properties: {
            nome: { type: 'string', example: 'João Silva' },
            matricula: { type: 'string', example: '2025001' },
          },
        },
        turma: {
          type: 'object',
          properties: {
            codigo: { type: 'string', example: 'PROG1-2025-1A' },
            disciplina: { type: 'string', example: 'Programação I' },
          },
        },
        dados_removidos: {
          type: 'object',
          properties: {
            notas_removidas: { type: 'number', example: 3 },
            frequencias_removidas: { type: 'number', example: 15 },
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
      'Acesso negado. Apenas administradores podem realizar desmatrículas',
  })
  @ApiNotFoundResponse({
    description: 'Aluno, turma ou matrícula não encontrados',
  })
  @HandleErrors('Acesso restrito a administradores')
  async desmatricular(
    @Body() desmatricularDto: DesmatricularAlunoDto,
    @Req() request: any,
  ) {
    const adminId = request.user.sub;
    return await this.usersService.desmatricularAluno(desmatricularDto, adminId);
  }
}

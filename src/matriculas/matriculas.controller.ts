import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
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
  ApiConflictResponse
} from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { CreateMatriculaDto } from '../users/dto/create-matricula.dto';
import { MatriculaResponseEntity } from '../users/entities/matricula-response.entity';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('matriculas')
@ApiTags('Matrículas')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class MatriculasController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Realizar matrícula de aluno',
    description: 'Matricula um aluno em uma turma específica. Verifica disponibilidade de vagas e se o aluno já não está matriculado. Apenas administradores podem realizar esta operação.'
  })
  @ApiCreatedResponse({
    type: MatriculaResponseEntity,
    description: 'Matrícula realizada com sucesso'
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido'
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado. Apenas administradores podem realizar matrículas'
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos, usuário não é aluno ou turma sem vagas'
  })
  @ApiNotFoundResponse({
    description: 'Aluno ou turma não encontrados'
  })
  @ApiConflictResponse({
    description: 'Aluno já matriculado nesta turma'
  })
  async create(
    @Body() createMatriculaDto: CreateMatriculaDto,
    @Req() request: any
  ) {
    try {
      const adminId = request.user.sub;
      const result = await this.usersService.createMatricula(createMatriculaDto, adminId);

      return new MatriculaResponseEntity(result);
    } catch (error) {
      if (error.status === 401) {
        throw new ForbiddenException('Acesso restrito a administradores');
      }
      throw error;
    }
  }
}

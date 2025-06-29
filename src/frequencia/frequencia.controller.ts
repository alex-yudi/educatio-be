import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
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
  ApiQuery
} from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { LancarFrequenciaDto } from '../users/dto/lancar-frequencia.dto';
import { FrequenciaResponseEntity } from '../users/entities/frequencia-response.entity';
import { ProfessorGuard } from '../auth/guards/professor.guard';

@Controller('frequencia')
@ApiTags('Frequência')
@ApiBearerAuth()
@UseGuards(ProfessorGuard)
export class FrequenciaController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({
    summary: 'Lançar frequência de uma aula',
    description: `Permite que um professor lance a frequência dos alunos para uma aula específica. 
    
    IMPORTANTE: 
    - Apenas o professor responsável pela turma pode lançar frequência
    - Envie no campo "alunos_presentes" apenas os IDs dos alunos que estiveram PRESENTES
    - Os alunos matriculados que não estiverem no array serão marcados como AUSENTES automaticamente
    - Use o ID do usuário (campo "id" da entidade Usuario), não matrícula nem ID de matrícula
    - Não é possível lançar frequência duas vezes para a mesma data`
  })
  @ApiCreatedResponse({
    type: FrequenciaResponseEntity,
    description: 'Frequência lançada com sucesso'
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou usuário não é professor'
  })
  @ApiForbiddenResponse({
    description: 'Professor não é responsável pela turma'
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou alunos não matriculados na turma'
  })
  @ApiConflictResponse({
    description: 'Frequência já foi lançada para esta data'
  })
  @ApiNotFoundResponse({
    description: 'Turma não encontrada'
  })
  async lancarFrequencia(
    @Body() lancarFrequenciaDto: LancarFrequenciaDto,
    @Req() request: any
  ) {
    try {
      const professorId = request.user.sub;
      const result = await this.usersService.lancarFrequencia(lancarFrequenciaDto, professorId);

      return new FrequenciaResponseEntity(result);
    } catch (error) {
      if (error.status === 401) {
        throw new ForbiddenException('Acesso restrito a professores');
      }
      throw error;
    }
  }

  @Get('turma/:id')
  @ApiOperation({
    summary: 'Consultar frequência de uma turma',
    description: `Permite que um professor consulte o histórico de frequência de sua turma.
    
    FUNCIONALIDADES:
    - Apenas o professor responsável pela turma pode consultar
    - Retorna histórico completo com dados por data de aula
    - Filtros opcionais por período (dataInicio e/ou dataFim)
    - Mostra estatísticas: total de alunos, presentes, ausentes
    - Lista detalhada por aluno com status de presença
    - Dados incluem: ID, nome, matrícula e status (presente/ausente)`
  })
  @ApiOkResponse({
    description: 'Histórico de frequência da turma'
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou usuário não é professor'
  })
  @ApiForbiddenResponse({
    description: 'Professor não é responsável pela turma'
  })
  @ApiNotFoundResponse({
    description: 'Turma não encontrada'
  })
  @ApiQuery({
    name: 'dataInicio',
    required: false,
    description: 'Data de início do período (formato: YYYY-MM-DD)',
    example: '2024-06-01'
  })
  @ApiQuery({
    name: 'dataFim',
    required: false,
    description: 'Data de fim do período (formato: YYYY-MM-DD)',
    example: '2024-06-30'
  })
  async consultarFrequencia(
    @Param('id', ParseIntPipe) turmaId: number,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Req() request?: any
  ) {
    try {
      const professorId = request.user.sub;
      return await this.usersService.consultarFrequencia(turmaId, professorId, dataInicio, dataFim);
    } catch (error) {
      if (error.status === 401) {
        throw new ForbiddenException('Acesso restrito a professores');
      }
      throw error;
    }
  }
}

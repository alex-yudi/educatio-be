import {
  Controller,
  Post,
  Get,
  Put,
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
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { LancarFrequenciaDto } from '../users/dto/lancar-frequencia.dto';
import { AlterarFrequenciaDto } from '../users/dto/alterar-frequencia.dto';
import { FrequenciaResponseEntity } from '../users/entities/frequencia-response.entity';
import { AlterarFrequenciaResponseEntity } from '../users/entities/alterar-frequencia-response.entity';
import { ProfessorGuard } from '../auth/guards/professor.guard';
import { HandleErrors } from '../common/decorators/handle-errors.decorator';

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
    - Não é possível lançar frequência duas vezes para a mesma data`,
  })
  @ApiCreatedResponse({
    type: FrequenciaResponseEntity,
    description: 'Frequência lançada com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou usuário não é professor',
  })
  @ApiForbiddenResponse({
    description: 'Professor não é responsável pela turma',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou alunos não matriculados na turma',
  })
  @ApiConflictResponse({
    description: 'Frequência já foi lançada para esta data',
  })
  @ApiNotFoundResponse({
    description: 'Turma não encontrada',
  })
  @HandleErrors('Acesso restrito a professores')
  async lancarFrequencia(
    @Body() lancarFrequenciaDto: LancarFrequenciaDto,
    @Req() request: any,
  ) {
    const professorId = request.user.sub;
    const result = await this.usersService.lancarFrequencia(
      lancarFrequenciaDto,
      professorId,
    );

    return new FrequenciaResponseEntity(result);
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
    - Dados incluem: ID, nome, matrícula e status (presente/ausente)`,
  })
  @ApiOkResponse({
    description: 'Histórico de frequência da turma',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou usuário não é professor',
  })
  @ApiForbiddenResponse({
    description: 'Professor não é responsável pela turma',
  })
  @ApiNotFoundResponse({
    description: 'Turma não encontrada',
  })
  @ApiQuery({
    name: 'dataInicio',
    required: false,
    description: 'Data de início do período (formato: YYYY-MM-DD)',
    example: '2024-06-01',
  })
  @ApiQuery({
    name: 'dataFim',
    required: false,
    description: 'Data de fim do período (formato: YYYY-MM-DD)',
    example: '2024-06-30',
  })
  @HandleErrors('Acesso restrito a professores')
  async consultarFrequencia(
    @Param('id', ParseIntPipe) turmaId: number,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Req() request?: any,
  ) {
    const professorId = request.user.sub;
    return await this.usersService.consultarFrequencia(
      turmaId,
      professorId,
      dataInicio,
      dataFim,
    );
  }

  @Put('alterar')
  @ApiOperation({
    summary: 'Alterar frequência de uma aula já registrada',
    description: `Permite que um professor altere a frequência de alunos em uma aula que já foi registrada.
    
    FUNCIONALIDADES:
    - Apenas o professor responsável pela turma pode alterar
    - Permite mudar alunos de presente para ausente e vice-versa
    - A aula deve ter frequência já registrada anteriormente
    - Envie TODOS os alunos com o status desejado (presente: true/false)
    - Sistema registra histórico das alterações realizadas
    - Alunos não incluídos manterão o status anterior
    
    IMPORTANTE:
    - Use o ID do usuário (campo "id" da entidade Usuario)
    - A data_aula deve corresponder a uma aula já lançada
    - Apenas alterações necessárias são processadas
    - Sistema valida se professor é responsável pela turma`,
  })
  @ApiOkResponse({
    type: AlterarFrequenciaResponseEntity,
    description: 'Frequência alterada com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou usuário não é professor',
  })
  @ApiForbiddenResponse({
    description: 'Professor não é responsável pela turma',
  })
  @ApiBadRequestResponse({
    description:
      'Dados inválidos, alunos não matriculados ou nenhuma alteração necessária',
  })
  @ApiNotFoundResponse({
    description:
      'Turma não encontrada ou frequência não registrada para a data informada',
  })
  @HandleErrors('Acesso restrito a professores')
  async alterarFrequencia(
    @Body() alterarFrequenciaDto: AlterarFrequenciaDto,
    @Req() request: any,
  ) {
    const professorId = request.user.sub;
    const result = await this.usersService.alterarFrequencia(
      alterarFrequenciaDto,
      professorId,
    );

    return new AlterarFrequenciaResponseEntity(result);
  }
}

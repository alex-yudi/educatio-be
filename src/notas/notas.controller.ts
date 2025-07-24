import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Req,
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
import { LancarNotaDto } from '../users/dto/lancar-nota.dto';
import { AlterarNotaDto } from '../users/dto/alterar-nota.dto';
import { LancarNotasLoteDto } from '../users/dto/lancar-notas-lote.dto';
import { AlterarNotasLoteDto } from '../users/dto/alterar-notas-lote.dto';
import { NotaResponseEntity } from '../users/entities/nota-response.entity';
import { BoletimAlunoEntity } from '../users/entities/boletim-aluno.entity';
import { LancarNotasLoteResponseEntity } from '../users/entities/lancar-notas-lote-response.entity';
import { ProfessorGuard } from '../auth/guards/professor.guard';
import { HandleErrors } from '../common/decorators/handle-errors.decorator';

@Controller('notas')
@ApiTags('Notas')
@ApiBearerAuth('bearer')
@UseGuards(ProfessorGuard)
export class NotasController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({
    operationId: 'lancarNota',
    summary: 'Lançar nota para um aluno',
    description: `Permite que um professor lance uma nota para um aluno em sua turma.
    
    REGRAS IMPORTANTES:
    - Apenas o professor responsável pela turma pode lançar notas
    - Existem 4 tipos de notas: UNIDADE_1, UNIDADE_2, UNIDADE_3 e FINAL
    - A nota FINAL só pode ser lançada se o aluno tiver notas nas 3 unidades
    - A nota FINAL só é necessária se a média das 3 unidades for menor que 7
    - Não é possível lançar duas notas do mesmo tipo para o mesmo aluno
    - As notas devem estar entre 0 e 10`,
  })
  @ApiBody({ type: LancarNotaDto })
  @ApiCreatedResponse({
    description: 'Nota lançada com sucesso',
    type: NotaResponseEntity,
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou professor não autorizado',
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado - apenas professores podem lançar notas',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou regras de negócio violadas',
  })
  @ApiConflictResponse({
    description: 'Já existe uma nota deste tipo para o aluno',
  })
  @ApiNotFoundResponse({
    description: 'Matrícula não encontrada',
  })
  @HandleErrors()
  async lancarNota(@Body() lancarNotaDto: LancarNotaDto, @Req() req: any) {
    return this.usersService.lancarNota(lancarNotaDto, req.user.sub);
  }

  @Put()
  @ApiOperation({
    operationId: 'alterarNota',
    summary: 'Alterar uma nota existente',
    description: `Permite que um professor altere uma nota já lançada.
    
    REGRAS:
    - Apenas o professor responsável pela turma pode alterar a nota
    - A nota deve existir
    - O novo valor deve estar entre 0 e 10`,
  })
  @ApiBody({ type: AlterarNotaDto })
  @ApiOkResponse({
    description: 'Nota alterada com sucesso',
    type: NotaResponseEntity,
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou professor não autorizado',
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado - apenas professores podem alterar notas',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos',
  })
  @ApiNotFoundResponse({
    description: 'Nota não encontrada',
  })
  @HandleErrors()
  async alterarNota(@Body() alterarNotaDto: AlterarNotaDto, @Req() req: any) {
    return this.usersService.alterarNota(alterarNotaDto, req.user.sub);
  }

  @Post('lote')
  @ApiOperation({
    operationId: 'lancarNotasLote',
    summary: 'Lançar múltiplas notas de uma vez',
    description: `Permite que um professor lance várias notas de uma vez para diferentes alunos.
    
    VANTAGENS:
    - Operação mais eficiente para lançar notas de toda uma turma
    - Processamento individual de cada nota (uma falha não afeta as outras)
    - Relatório detalhado de sucessos e erros
    
    REGRAS APLICADAS INDIVIDUALMENTE:
    - Apenas o professor responsável pela turma pode lançar notas
    - Não é possível lançar duas notas do mesmo tipo para o mesmo aluno
    - Validações específicas para nota FINAL
    - As notas devem estar entre 0 e 10
    
    RESPOSTA:
    - Total de notas processadas
    - Quantidade de sucessos e erros
    - Detalhes de cada operação (sucesso ou erro com mensagem)`,
  })
  @ApiBody({ type: LancarNotasLoteDto })
  @ApiCreatedResponse({
    description: 'Relatório do lançamento em lote',
    type: LancarNotasLoteResponseEntity,
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou professor não autorizado',
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado - apenas professores podem lançar notas',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou array vazio',
  })
  @HandleErrors()
  async lancarNotasLote(@Body() lancarNotasLoteDto: LancarNotasLoteDto, @Req() req: any) {
    return this.usersService.lancarNotasLote(lancarNotasLoteDto, req.user.sub);
  }

  @Put('lote')
  @ApiOperation({
    operationId: 'alterarNotasLote',
    summary: 'Alterar múltiplas notas de uma vez',
    description: `Permite que um professor altere várias notas de uma vez.
    
    VANTAGENS:
    - Operação mais eficiente para alterar várias notas
    - Processamento individual de cada nota (uma falha não afeta as outras)
    - Relatório detalhado de sucessos e erros
    
    REGRAS APLICADAS INDIVIDUALMENTE:
    - Apenas o professor responsável pela turma pode alterar a nota
    - A nota deve existir
    - O novo valor deve estar entre 0 e 10
    
    RESPOSTA:
    - Total de notas processadas
    - Quantidade de sucessos e erros
    - Detalhes de cada operação (sucesso ou erro com mensagem)`,
  })
  @ApiBody({ type: AlterarNotasLoteDto })
  @ApiOkResponse({
    description: 'Relatório da alteração em lote',
    type: LancarNotasLoteResponseEntity,
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou professor não autorizado',
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado - apenas professores podem alterar notas',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou array vazio',
  })
  @HandleErrors()
  async alterarNotasLote(@Body() alterarNotasLoteDto: AlterarNotasLoteDto, @Req() req: any) {
    return this.usersService.alterarNotasLote(alterarNotasLoteDto, req.user.sub);
  }

  @Get('boletim/:matriculaId')
  @ApiOperation({
    operationId: 'buscarBoletimAluno',
    summary: 'Buscar boletim de um aluno',
    description: `Busca o boletim completo de um aluno em uma disciplina específica.
    
    INFORMAÇÕES RETORNADAS:
    - Todas as notas do aluno na disciplina
    - Média das 3 unidades (se aplicável)
    - Nota final (se aplicável)
    - Situação atual do aluno (EM_ANDAMENTO, AGUARDANDO_FINAL, APROVADO, REPROVADO)
    
    CÁLCULO DA SITUAÇÃO:
    - EM_ANDAMENTO: Nem todas as 3 unidades foram lançadas
    - APROVADO: Média das 3 unidades >= 7 OU ((média das unidades + nota final) / 2) >= 5
    - AGUARDANDO_FINAL: Média das 3 unidades < 7 e nota final não lançada
    - REPROVADO: ((média das unidades + nota final) / 2) < 5`,
  })
  @ApiOkResponse({
    description: 'Boletim do aluno encontrado',
    type: BoletimAlunoEntity,
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou professor não autorizado',
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado - apenas professores podem visualizar boletins',
  })
  @ApiNotFoundResponse({
    description: 'Matrícula não encontrada',
  })
  @HandleErrors()
  async buscarBoletimAluno(
    @Param('matriculaId', ParseIntPipe) matriculaId: number,
    @Req() req: any,
  ) {
    return this.usersService.buscarBoletimAluno(matriculaId, req.user.sub);
  }

  @Get('turma/:turmaId')
  @ApiOperation({
    operationId: 'listarNotasTurma',
    summary: 'Listar todas as notas de uma turma',
    description: `Lista o boletim completo de todos os alunos matriculados em uma turma.
    
    APENAS O PROFESSOR RESPONSÁVEL pela turma pode visualizar essas informações.
    
    Para cada aluno são retornadas:
    - Todas as notas lançadas
    - Média das 3 unidades (se aplicável)
    - Nota final (se aplicável)
    - Situação atual na disciplina`,
  })
  @ApiOkResponse({
    description: 'Lista de boletins da turma',
    schema: {
      type: 'object',
      properties: {
        turma: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            codigo: { type: 'string', example: 'PROG1-2025-1' },
            disciplina_nome: { type: 'string', example: 'Programação I' },
            professor_nome: { type: 'string', example: 'Prof. Maria Santos' },
            ano: { type: 'number', example: 2025 },
            semestre: { type: 'number', example: 1 },
          },
        },
        boletins: {
          type: 'array',
          items: { $ref: '#/components/schemas/BoletimAlunoEntity' },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou professor não autorizado',
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado - apenas professores podem visualizar notas da turma',
  })
  @ApiNotFoundResponse({
    description: 'Turma não encontrada',
  })
  @HandleErrors()
  async listarNotasTurma(
    @Param('turmaId', ParseIntPipe) turmaId: number,
    @Req() req: any,
  ) {
    return this.usersService.listarNotasTurma(turmaId, req.user.sub);
  }
}

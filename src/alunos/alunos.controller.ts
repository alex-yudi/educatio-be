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
import { UserEntity } from '../users/entities/user.entity';
import { DeleteResponseEntity } from '../users/entities/delete-response.entity';
import { CreateAlunoDto } from '../users/dto/create-aluno.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { AlunoCreatedEntity } from '../users/entities/aluno-created.entity';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminProfessorGuard } from '../auth/guards/admin-professor.guard';
import { HandleErrors } from '../common/decorators/handle-errors.decorator';
import { UserEntityMapper } from '../common/mappers/user-entity.mapper';
import { AlunoComMatriculasEntity } from '../users/entities/aluno-com-matriculas.entity';
import { AlunoComMatriculasMapper } from '../common/mappers/aluno-com-matriculas.mapper';

@Controller('alunos')
@ApiTags('Alunos')
@ApiBearerAuth('bearer')
export class AlunosController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({
    operationId: 'createAluno',
    summary: 'Cadastrar novo aluno',
    description:
      'Cria um novo aluno no sistema com senha temporária gerada automaticamente. Apenas administradores podem realizar esta operação.',
  })
  @ApiBody({
    type: CreateAlunoDto,
    description:
      'Dados para criação do aluno. Senha será gerada automaticamente.',
    examples: {
      exemplo1: {
        summary: 'Aluno de Engenharia de Software',
        description:
          'Exemplo de cadastro de aluno no curso de Engenharia de Software',
        value: {
          nome: 'João Silva Santos',
          email: 'joao.silva@uni.edu',
          matricula: '2025001',
          curso_codigo: 'ESOFT',
        },
      },
      exemplo2: {
        summary: 'Aluno de Ciência da Computação',
        description:
          'Exemplo de cadastro de aluno no curso de Ciência da Computação',
        value: {
          nome: 'Maria Oliveira',
          email: 'maria.oliveira@uni.edu',
          matricula: '2025002',
          curso_codigo: 'CC',
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: AlunoCreatedEntity,
    description: 'Aluno cadastrado com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado. Apenas administradores podem cadastrar alunos',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos',
  })
  @ApiConflictResponse({
    description: 'E-mail ou matrícula já cadastrados no sistema',
  })
  @ApiNotFoundResponse({
    description: 'Curso especificado não encontrado',
  })
  @HandleErrors('Acesso restrito a administradores')
  async create(@Body() createAlunoDto: CreateAlunoDto, @Req() request: any) {
    const adminId = request.user.sub;
    const result = await this.usersService.createAluno(createAlunoDto, adminId);

    return new AlunoCreatedEntity({
      usuario: UserEntityMapper.toEntity(result.usuario),
      senha_temporaria: result.senha_temporaria,
      curso: result.curso,
    });
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({
    operationId: 'getAllAlunos',
    summary: 'Listar todos os alunos cadastrados',
    description:
      'Retorna uma lista completa de todos os alunos cadastrados no sistema, incluindo suas informações pessoais, curso e matrículas em turmas. Apenas administradores podem realizar esta operação.',
  })
  @ApiOkResponse({
    type: [AlunoComMatriculasEntity],
    description:
      'Lista de alunos com informações detalhadas: dados pessoais, curso e turmas matriculadas',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado. Apenas administradores podem listar alunos',
  })
  @HandleErrors('Acesso restrito a administradores')
  async findAll(@Req() request: any) {
    const alunos = await this.usersService.findAllAlunos();
    return AlunoComMatriculasMapper.toEntities(alunos);
  }

  @Get(':id')
  @UseGuards(AdminProfessorGuard)
  @ApiOperation({
    operationId: 'getAlunoById',
    summary: 'Buscar aluno por ID',
    description:
      'Retorna os dados de um aluno específico pelo seu ID. Administradores e professores podem realizar esta operação.',
  })
  @ApiOkResponse({
    type: AlunoComMatriculasEntity,
    description: 'Dados do aluno com suas matrículas retornados com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description:
      'Acesso negado. Apenas administradores e professores podem acessar',
  })
  @ApiNotFoundResponse({
    description: 'Aluno não encontrado',
  })
  @HandleErrors('Acesso restrito a administradores e professores')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const aluno = await this.usersService.findAlunoById(id);
    return AlunoComMatriculasMapper.toEntity(aluno);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({
    operationId: 'updateAluno',
    summary: 'Atualizar aluno',
    description:
      'Atualiza os dados de um aluno cadastrado no sistema. Apenas administradores podem realizar esta operação.',
  })
  @ApiOkResponse({
    type: UserEntity,
    description: 'Aluno atualizado com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado. Apenas administradores podem atualizar alunos',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos',
  })
  @ApiNotFoundResponse({
    description: 'Aluno não encontrado',
  })
  @HandleErrors('Acesso restrito a administradores')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: any,
  ) {
    const adminId = request.user.sub;
    const result = await this.usersService.updateAluno(
      id,
      updateUserDto,
      adminId,
    );

    return UserEntityMapper.toEntity(result);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({
    operationId: 'deleteAluno',
    summary: 'Excluir aluno',
    description:
      'Exclui um aluno do sistema. Apenas administradores podem realizar esta operação. O aluno não pode ser excluído se possuir matrículas ativas.',
  })
  @ApiOkResponse({
    type: DeleteResponseEntity,
    description: 'Aluno excluído com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado. Apenas administradores podem excluir alunos',
  })
  @ApiNotFoundResponse({
    description: 'Aluno não encontrado',
  })
  @ApiBadRequestResponse({
    description: 'Aluno possui matrículas ativas e não pode ser excluído',
  })
  @HandleErrors('Acesso restrito a administradores')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() request: any) {
    const adminId = request.user.sub;
    return await this.usersService.deleteAluno(id, adminId);
  }
}

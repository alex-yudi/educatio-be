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
import { CreateProfessorDto } from '../users/dto/create-professor.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { ProfessorCreatedEntity } from '../users/entities/professor-created.entity';
import { ProfessorComTurmasEntity } from '../users/entities/professor-com-turmas.entity';
import { ProfessorListEntity } from '../users/entities/professor-list.entity';
import { UserEntity } from '../users/entities/user.entity';
import { DeleteResponseEntity } from '../users/entities/delete-response.entity';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminProfessorGuard } from '../auth/guards/admin-professor.guard';
import { HandleErrors } from '../common/decorators/handle-errors.decorator';
import { UserEntityMapper } from '../common/mappers/user-entity.mapper';
import { ProfessorComTurmasMapper } from '../common/mappers/professor-com-turmas.mapper';

@Controller('professores')
@ApiTags('Professores')
@ApiBearerAuth()
export class ProfessoresController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Cadastrar novo professor',
    description:
      'Cria um novo professor no sistema. Apenas administradores podem realizar esta operação.',
  })
  @ApiBody({
    type: CreateProfessorDto,
    description: 'Dados para criação do professor',
    examples: {
      exemplo1: {
        summary: 'Professor de Programação',
        description: 'Exemplo de cadastro de professor',
        value: {
          nome: 'Dr. Carlos Silva',
          email: 'carlos.silva@uni.edu'
        }
      }
    }
  })
  @ApiCreatedResponse({
    type: ProfessorCreatedEntity,
    description: 'Professor cadastrado com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description:
      'Acesso negado. Apenas administradores podem cadastrar professores',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos',
  })
  @ApiConflictResponse({
    description: 'E-mail já cadastrado no sistema',
  })
  @HandleErrors('Acesso restrito a administradores')
  async create(
    @Body() createProfessorDto: CreateProfessorDto,
    @Req() request: any,
  ) {
    const adminId = request.user.sub;
    const result = await this.usersService.createProfessor(
      createProfessorDto,
      adminId,
    );

    return new ProfessorCreatedEntity({
      usuario: UserEntityMapper.toEntity(result),
      senha_temporaria: result.senha_temporaria,
    });
  }

  @Get()
  @UseGuards(AdminProfessorGuard)
  @ApiOperation({
    summary: 'Listar professores',
    description:
      'Lista todos os professores cadastrados no sistema com suas turmas associadas. Administradores e professores podem acessar.',
  })
  @ApiOkResponse({
    type: [ProfessorComTurmasEntity],
    description: 'Lista de professores com turmas associadas',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description:
      'Acesso negado. Apenas administradores e professores podem listar',
  })
  async findAll() {
    const professores = await this.usersService.findAllProfessores();
    return ProfessorComTurmasMapper.toEntities(professores);
  }

  @Get(':id')
  @UseGuards(AdminProfessorGuard)
  @ApiOperation({
    summary: 'Buscar professor por ID',
    description:
      'Retorna os dados de um professor específico pelo seu ID com suas turmas associadas. Administradores e professores podem realizar esta operação.',
  })
  @ApiOkResponse({
    type: ProfessorComTurmasEntity,
    description: 'Dados do professor com turmas retornados com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado. Apenas administradores e professores podem acessar',
  })
  @ApiNotFoundResponse({
    description: 'Professor não encontrado',
  })
  @HandleErrors('Acesso restrito a administradores e professores')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const professor = await this.usersService.findProfessorById(id);
    return ProfessorComTurmasMapper.toEntity(professor);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Atualizar professor',
    description:
      'Atualiza os dados de um professor. Apenas administradores podem realizar esta operação.',
  })
  @ApiOkResponse({
    type: UserEntity,
    description: 'Professor atualizado com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description:
      'Acesso negado. Apenas administradores podem atualizar professores',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos',
  })
  @ApiNotFoundResponse({
    description: 'Professor não encontrado',
  })
  @HandleErrors('Acesso restrito a administradores')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: any,
  ) {
    const adminId = request.user.sub;
    const professor = await this.usersService.updateProfessor(
      id,
      updateUserDto,
      adminId,
    );
    return UserEntityMapper.toEntity(professor);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Excluir professor',
    description:
      'Exclui um professor do sistema. Apenas administradores podem realizar esta operação. O professor não pode ser excluído se possuir turmas ativas.',
  })
  @ApiOkResponse({
    type: DeleteResponseEntity,
    description: 'Professor excluído com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido',
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado. Apenas administradores podem excluir professores',
  })
  @ApiNotFoundResponse({
    description: 'Professor não encontrado',
  })
  @ApiBadRequestResponse({
    description: 'Professor possui turmas ativas e não pode ser excluído',
  })
  @HandleErrors('Acesso restrito a administradores')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: any,
  ) {
    const adminId = request.user.sub;
    return await this.usersService.deleteProfessor(id, adminId);
  }
}

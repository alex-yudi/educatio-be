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
  ApiConflictResponse
} from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { CreateDisciplinaDto } from '../users/dto/create-disciplina.dto';
import { DisciplinaEntity } from '../users/entities/disciplina.entity';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('disciplinas')
@ApiTags('Disciplinas')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class DisciplinasController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({
    summary: 'Cadastrar nova disciplina',
    description: 'Cria uma nova disciplina no sistema com código único. Apenas administradores podem realizar esta operação.'
  })
  @ApiCreatedResponse({
    type: DisciplinaEntity,
    description: 'Disciplina cadastrada com sucesso'
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido'
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado. Apenas administradores podem cadastrar disciplinas'
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos'
  })
  @ApiConflictResponse({
    description: 'Código da disciplina já existe no sistema'
  })
  async create(
    @Body() createDisciplinaDto: CreateDisciplinaDto,
    @Req() request: any
  ) {
    try {
      const adminId = request.user.sub;
      const disciplina = await this.usersService.createDisciplina(createDisciplinaDto, adminId);

      return new DisciplinaEntity(disciplina);
    } catch (error) {
      if (error.status === 401) {
        throw new ForbiddenException('Acesso restrito a administradores');
      }
      throw error;
    }
  }
}

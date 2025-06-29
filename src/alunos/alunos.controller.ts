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
  ApiConflictResponse,
  ApiNotFoundResponse
} from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';
import { CreateAlunoDto } from '../users/dto/create-aluno.dto';
import { AlunoCreatedEntity } from '../users/entities/aluno-created.entity';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('alunos')
@ApiTags('Alunos')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class AlunosController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Cadastrar novo aluno',
    description: 'Cria um novo aluno no sistema com senha temporária gerada automaticamente. Apenas administradores podem realizar esta operação.'
  })
  @ApiCreatedResponse({
    type: AlunoCreatedEntity,
    description: 'Aluno cadastrado com sucesso'
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou não fornecido'
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado. Apenas administradores podem cadastrar alunos'
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos'
  })
  @ApiConflictResponse({
    description: 'E-mail ou matrícula já cadastrados no sistema'
  })
  @ApiNotFoundResponse({
    description: 'Curso especificado não encontrado'
  })
  async create(
    @Body() createAlunoDto: CreateAlunoDto,
    @Req() request: any
  ) {
    try {
      const adminId = request.user.sub;
      const result = await this.usersService.createAluno(createAlunoDto, adminId);

      return new AlunoCreatedEntity({
        usuario: new UserEntity({ ...result.usuario, name: result.usuario.nome }),
        senha_temporaria: result.senha_temporaria,
        curso: result.curso
      });
    } catch (error) {
      if (error.status === 401) {
        throw new ForbiddenException('Acesso restrito a administradores');
      }
      throw error;
    }
  }
}

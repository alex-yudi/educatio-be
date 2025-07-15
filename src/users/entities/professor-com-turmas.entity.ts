import { ApiProperty } from '@nestjs/swagger';
import { EnumPerfil } from '@prisma/client';
import { TurmaResumidaEntity } from './turma-resumida.entity';

export class ProfessorComTurmasEntity {
  @ApiProperty({ example: 1, description: 'ID do professor' })
  id: number;

  @ApiProperty({
    example: 'Dr. Carlos Silva',
    description: 'Nome do professor',
  })
  nome: string;

  @ApiProperty({
    example: 'carlos.silva@uni.edu',
    description: 'E-mail do professor',
  })
  email: string;

  @ApiProperty({
    enum: EnumPerfil,
    example: EnumPerfil.professor,
    description: 'Role do usuário',
  })
  role: EnumPerfil;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Data de criação do professor',
  })
  criado_em: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Data da última atualização',
  })
  atualizado_em: Date;

  @ApiProperty({
    type: [TurmaResumidaEntity],
    description: 'Lista de turmas que o professor ministra',
    example: [],
  })
  turmasMinistradas: TurmaResumidaEntity[];

  constructor(partial: Partial<ProfessorComTurmasEntity>) {
    Object.assign(this, partial);
    if (partial.turmasMinistradas) {
      this.turmasMinistradas = partial.turmasMinistradas.map(
        (turma) => new TurmaResumidaEntity(turma),
      );
    }
  }
}

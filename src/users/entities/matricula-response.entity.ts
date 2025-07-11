import { ApiProperty } from '@nestjs/swagger';
import { MatriculaEntity } from './matricula.entity';

export class MatriculaResponseEntity {
  @ApiProperty({
    description: 'Dados da matrícula criada',
    type: MatriculaEntity,
  })
  matricula: MatriculaEntity;

  @ApiProperty({
    example: 'João da Silva',
    description: 'Nome do aluno matriculado',
  })
  aluno: string;

  @ApiProperty({
    example: 'Banco de Dados',
    description: 'Nome da disciplina',
  })
  disciplina: string;

  @ApiProperty({
    example: 'BD-2024-1A',
    description: 'Código da turma',
  })
  turma: string;

  @ApiProperty({
    example: 'Carlos Andrade',
    description: 'Nome do professor da turma',
  })
  professor: string;

  constructor(partial: Partial<MatriculaResponseEntity>) {
    Object.assign(this, partial);
  }
}

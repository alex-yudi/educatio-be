import { ApiProperty } from '@nestjs/swagger';
import { Matricula } from '@prisma/client';

export class MatriculaEntity implements Partial<Matricula> {
  @ApiProperty({
    example: 1,
    description: 'ID único da matrícula',
  })
  id: number;

  @ApiProperty({
    example: 2,
    description: 'ID do estudante matriculado',
  })
  estudante_id: number;

  @ApiProperty({
    example: 3,
    description: 'ID da turma',
  })
  turma_id: number;

  @ApiProperty({
    example: 'ATIVA',
    description: 'Status da matrícula',
  })
  status: string;

  @ApiProperty({
    example: '2025-06-23T14:30:00.000Z',
    description: 'Data de criação do registro',
  })
  criado_em: Date;

  @ApiProperty({
    example: '2025-06-23T14:30:00.000Z',
    description: 'Data da última atualização do registro',
  })
  atualizado_em: Date;

  constructor(partial: Partial<MatriculaEntity>) {
    Object.assign(this, partial);
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { TurmaEntity } from './turma.entity';

export class TurmaListEntity {
  @ApiProperty({
    description: 'Lista de turmas',
    type: [TurmaEntity],
  })
  turmas: TurmaEntity[];

  @ApiProperty({
    example: 8,
    description: 'Total de turmas encontradas',
  })
  total: number;

  constructor(partial: Partial<TurmaListEntity>) {
    Object.assign(this, partial);
  }
}

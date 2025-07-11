import { ApiProperty } from '@nestjs/swagger';
import { DisciplinaEntity } from './disciplina.entity';

export class DisciplinaListEntity {
  @ApiProperty({
    description: 'Lista de disciplinas',
    type: [DisciplinaEntity],
  })
  disciplinas: DisciplinaEntity[];

  @ApiProperty({
    example: 15,
    description: 'Total de disciplinas encontradas',
  })
  total: number;

  constructor(partial: Partial<DisciplinaListEntity>) {
    Object.assign(this, partial);
  }
}

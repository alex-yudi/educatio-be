import { ApiProperty } from '@nestjs/swagger';
import { TurmaEntity } from './turma.entity';

export class TurmaCreatedEntity {
  @ApiProperty({
    description: 'Dados da turma criada',
    type: TurmaEntity
  })
  turma: TurmaEntity;

  @ApiProperty({
    example: 'Programação I',
    description: 'Nome da disciplina associada'
  })
  disciplina_nome: string;

  @ApiProperty({
    example: 'Carlos Andrade',
    description: 'Nome do professor responsável'
  })
  professor_nome: string;

  constructor(partial: Partial<TurmaCreatedEntity>) {
    Object.assign(this, partial);
  }
}

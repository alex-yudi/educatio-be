import { ApiProperty } from '@nestjs/swagger';
import { CursoEntity } from './curso.entity';

export class CursoCreatedEntity {
  @ApiProperty({
    description: 'Dados do curso criado',
    type: CursoEntity
  })
  curso: CursoEntity;

  @ApiProperty({
    example: ['Programação I', 'Programação II', 'Banco de Dados'],
    description: 'Lista de disciplinas vinculadas ao curso',
    type: [String],
    required: false
  })
  disciplinas?: string[];

  @ApiProperty({
    example: 'Maria Silva',
    description: 'Nome do administrador que criou o curso'
  })
  criado_por: string;

  constructor(partial: Partial<CursoCreatedEntity>) {
    Object.assign(this, partial);
  }
}

import { ApiProperty } from '@nestjs/swagger';

export class CursoListEntity {
  @ApiProperty({
    example: 1,
    description: 'ID único do curso'
  })
  id: number;

  @ApiProperty({
    example: 'Engenharia de Software',
    description: 'Nome do curso'
  })
  nome: string;

  @ApiProperty({
    example: 'ESOFT',
    description: 'Código único do curso'
  })
  codigo: string;

  @ApiProperty({
    example: 'Curso voltado para formação de engenheiros de software',
    description: 'Descrição detalhada do curso',
    required: false
  })
  descricao?: string;

  @ApiProperty({
    example: 12,
    description: 'Número de disciplinas do curso'
  })
  total_disciplinas: number;

  @ApiProperty({
    example: 45,
    description: 'Número de alunos matriculados no curso'
  })
  total_alunos: number;

  @ApiProperty({
    example: 'Maria Silva',
    description: 'Nome do administrador que criou o curso'
  })
  criado_por: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Data de criação do curso'
  })
  criado_em: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Data da última atualização do curso'
  })
  atualizado_em: Date;

  constructor(partial: Partial<CursoListEntity>) {
    Object.assign(this, partial);
  }
}

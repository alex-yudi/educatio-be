import { ApiProperty } from '@nestjs/swagger';

export class CursoListEntity {
  @ApiProperty({
    example: 1,
    description: 'ID único do curso (chave primária)',
  })
  id: number;

  @ApiProperty({
    example: 'Engenharia de Software',
    description: 'Nome completo do curso (para exibição)',
  })
  nome: string;

  @ApiProperty({
    example: 'ESOFT',
    description: 'Código único do curso (para identificação e formulários)',
  })
  codigo: string;

  @ApiProperty({
    example: 'Curso voltado para formação de engenheiros de software',
    description: 'Descrição detalhada do curso (opcional)',
    required: false,
    nullable: true,
  })
  descricao?: string;

  @ApiProperty({
    example: 12,
    description: 'Número total de disciplinas vinculadas ao curso',
  })
  total_disciplinas: number;

  @ApiProperty({
    example: 45,
    description: 'Número atual de alunos matriculados no curso',
  })
  total_alunos: number;

  @ApiProperty({
    example: 'Maria Silva',
    description: 'Nome do administrador que criou o curso',
  })
  criado_por: string;

  @ApiProperty({
    example: '2025-01-15T10:30:00.000Z',
    description: 'Data e hora de criação do curso (ISO 8601)',
  })
  criado_em: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Data da última atualização do curso',
  })
  atualizado_em: Date;

  constructor(partial: Partial<CursoListEntity>) {
    Object.assign(this, partial);
  }
}

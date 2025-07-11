import { ApiProperty } from '@nestjs/swagger';
import { Turma } from '@prisma/client';

export class TurmaEntity implements Partial<Turma> {
  @ApiProperty({
    example: 1,
    description: 'ID único da turma',
  })
  id: number;

  @ApiProperty({
    example: 'BD-2024-1A',
    description: 'Código único da turma',
  })
  codigo: string;

  @ApiProperty({
    example: 1,
    description: 'ID da disciplina associada à turma',
  })
  disciplina_id: number;

  @ApiProperty({
    example: 2,
    description: 'ID do professor responsável pela turma',
  })
  professor_id: number;

  @ApiProperty({
    example: 'Banco de Dados',
    description: 'Nome da disciplina associada à turma',
  })
  disciplina_nome?: string;

  @ApiProperty({
    example: 'Carlos Andrade',
    description: 'Nome do professor responsável pela turma',
  })
  professor_nome?: string;

  @ApiProperty({
    example: 2024,
    description: 'Ano da turma',
  })
  ano: number;

  @ApiProperty({
    example: 1,
    description: 'Semestre da turma (1 ou 2)',
  })
  semestre: number;

  @ApiProperty({
    example: 'Sala A-101',
    description: 'Sala onde as aulas são ministradas',
  })
  sala: string | null;

  @ApiProperty({
    example: 35,
    description: 'Número de vagas disponíveis na turma',
  })
  vagas: number;

  @ApiProperty({
    example: '2025-06-16T14:30:00.000Z',
    description: 'Data de criação do registro',
  })
  criado_em: Date;

  @ApiProperty({
    example: '2025-06-16T14:30:00.000Z',
    description: 'Data da última atualização do registro',
  })
  atualizado_em: Date;

  constructor(partial: Partial<TurmaEntity>) {
    Object.assign(this, partial);
  }
}

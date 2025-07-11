import { ApiProperty } from '@nestjs/swagger';
import { Disciplina } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class DisciplinaEntity implements Partial<Disciplina> {
  @ApiProperty({
    example: 1,
    description: 'ID único da disciplina',
  })
  id: number;

  @ApiProperty({
    example: 'Programação Orientada a Objetos',
    description: 'Nome da disciplina',
  })
  nome: string;

  @ApiProperty({
    example: 'POO101',
    description: 'Código único da disciplina',
  })
  codigo: string;

  @ApiProperty({
    example: 'Introdução aos conceitos de POO',
    description: 'Descrição da disciplina',
  })
  descricao: string | null;

  @ApiProperty({
    example: 60,
    description: 'Carga horária total em horas',
  })
  carga_horaria: number;

  @ApiProperty({
    example: 'Ementa completa da disciplina...',
    description: 'Ementa da disciplina',
  })
  ementa: string | null;

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

  @Exclude()
  criado_por_id: number;

  constructor(partial: Partial<DisciplinaEntity>) {
    Object.assign(this, partial);
  }
}

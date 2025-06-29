import { ApiProperty } from '@nestjs/swagger';
import { Curso } from '@prisma/client';

export class CursoEntity implements Partial<Curso> {
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
    example: 1,
    description: 'ID do administrador que criou o curso'
  })
  criado_por_id: number;

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

  constructor(partial: Partial<CursoEntity>) {
    Object.assign(this, partial);
  }
}

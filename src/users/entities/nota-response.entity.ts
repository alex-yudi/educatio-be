import { ApiProperty } from '@nestjs/swagger';

export class NotaResponseEntity {
  @ApiProperty({
    example: 1,
    description: 'ID da nota',
  })
  id: number;

  @ApiProperty({
    example: 8.5,
    description: 'Valor da nota',
  })
  valor: number;

  @ApiProperty({
    example: 'UNIDADE_1',
    description: 'Tipo da nota',
  })
  tipo: string;

  @ApiProperty({
    example: '2025-07-21T10:00:00.000Z',
    description: 'Data de criação da nota',
  })
  criado_em: Date;

  @ApiProperty({
    example: 'João Silva',
    description: 'Nome do professor que lançou a nota',
  })
  professor_nome: string;
}

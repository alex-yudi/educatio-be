import { ApiProperty } from '@nestjs/swagger';
import { NotaResponseEntity } from './nota-response.entity';

export class ResultadoNotaLote {
  @ApiProperty({
    example: true,
    description: 'Se a operação foi bem-sucedida',
  })
  sucesso: boolean;

  @ApiProperty({
    example: 'Nota lançada com sucesso',
    description: 'Mensagem de resultado',
  })
  mensagem: string;

  @ApiProperty({
    description: 'Dados da nota (quando sucesso = true)',
    type: NotaResponseEntity,
    required: false,
  })
  nota?: NotaResponseEntity;

  @ApiProperty({
    example: 'Matrícula não encontrada',
    description: 'Detalhes do erro (quando sucesso = false)',
    required: false,
  })
  erro?: string;
}

export class LancarNotasLoteResponseEntity {
  @ApiProperty({
    example: 8,
    description: 'Total de notas processadas',
  })
  total_processadas: number;

  @ApiProperty({
    example: 7,
    description: 'Total de notas lançadas com sucesso',
  })
  sucessos: number;

  @ApiProperty({
    example: 1,
    description: 'Total de erros encontrados',
  })
  erros: number;

  @ApiProperty({
    type: [ResultadoNotaLote],
    description: 'Detalhes de cada operação',
  })
  resultados: ResultadoNotaLote[];
}

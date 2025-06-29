import { ApiProperty } from '@nestjs/swagger';

export class AlteracaoFrequenciaEntity {
  @ApiProperty({ example: 23 })
  aluno_id: number;

  @ApiProperty({ example: 'João da Silva' })
  aluno_nome: string;

  @ApiProperty({ example: '20240001' })
  matricula: string;

  @ApiProperty({ example: true })
  status_anterior: boolean;

  @ApiProperty({ example: false })
  status_novo: boolean;

  @ApiProperty({ example: 'Presente → Ausente' })
  alteracao: string;

  constructor(partial: Partial<AlteracaoFrequenciaEntity>) {
    Object.assign(this, partial);
  }
}

export class AlterarFrequenciaResponseEntity {
  @ApiProperty({ example: 'Frequência alterada com sucesso' })
  message: string;

  @ApiProperty({ example: 'PROG1-2024-1A' })
  turma_codigo: string;

  @ApiProperty({ example: 'Programação I' })
  disciplina_nome: string;

  @ApiProperty({ example: '2025-06-29T14:00:00.000Z' })
  data_aula: Date;

  @ApiProperty({
    example: 3,
    description: 'Total de alunos que tiveram a frequência alterada'
  })
  total_alteracoes: number;

  @ApiProperty({
    example: 2,
    description: 'Quantidade de alunos presentes após as alterações'
  })
  presentes_final: number;

  @ApiProperty({
    example: 1,
    description: 'Quantidade de alunos ausentes após as alterações'
  })
  ausentes_final: number;

  @ApiProperty({
    type: [AlteracaoFrequenciaEntity],
    description: 'Detalhes das alterações realizadas para cada aluno'
  })
  detalhes_alteracoes: AlteracaoFrequenciaEntity[];

  @ApiProperty({ example: 'Prof. Carlos Andrade' })
  alterado_por: string;

  @ApiProperty({ example: '2025-06-29T15:30:00.000Z' })
  data_alteracao: Date;

  constructor(partial: Partial<AlterarFrequenciaResponseEntity>) {
    Object.assign(this, partial);
  }
}

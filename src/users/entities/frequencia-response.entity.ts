import { ApiProperty } from '@nestjs/swagger';

export class FrequenciaResponseEntity {
  @ApiProperty({ example: 'Frequência lançada com sucesso' })
  message: string;

  @ApiProperty({ example: 'PROG1-2024-1A' })
  turma_codigo: string;

  @ApiProperty({ example: 'Programação I' })
  disciplina_nome: string;

  @ApiProperty({ example: '2024-06-29T14:00:00.000Z' })
  data_aula: Date;

  @ApiProperty({ example: 5 })
  total_alunos: number;

  @ApiProperty({ example: 4 })
  presentes: number;

  @ApiProperty({ example: 1 })
  ausentes: number;

  @ApiProperty({
    example: ['João da Silva', 'Maria José Santos'],
    description: 'Lista de alunos presentes'
  })
  alunos_presentes: string[];

  @ApiProperty({
    example: ['Lucas Ferreira'],
    description: 'Lista de alunos ausentes'
  })
  alunos_ausentes: string[];

  @ApiProperty({ example: 'Prof. Carlos Andrade' })
  registrado_por: string;

  constructor(partial: Partial<FrequenciaResponseEntity>) {
    Object.assign(this, partial);
  }
}

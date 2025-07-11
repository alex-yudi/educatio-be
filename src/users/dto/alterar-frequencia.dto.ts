import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsDateString,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AlterarFrequenciaItemDto {
  @ApiProperty({
    example: 23,
    description: 'ID do aluno (campo "id" da tabela Usuario)',
  })
  @IsNotEmpty()
  aluno_id: number;

  @ApiProperty({
    example: true,
    description:
      'Nova situação de presença do aluno (true = presente, false = ausente)',
  })
  @IsNotEmpty()
  presente: boolean;
}

export class AlterarFrequenciaDto {
  @ApiProperty({
    example: 6,
    description: 'ID da turma onde a frequência será alterada',
  })
  @IsNotEmpty()
  turma_id: number;

  @ApiProperty({
    example: '2025-06-29T14:00:00.000Z',
    description:
      'Data e hora da aula que terá a frequência alterada (deve ser uma aula já registrada)',
  })
  @IsDateString()
  @IsNotEmpty()
  data_aula: string;

  @ApiProperty({
    example: [
      { aluno_id: 23, presente: false },
      { aluno_id: 24, presente: true },
      { aluno_id: 27, presente: true },
    ],
    description:
      'Array com as alterações de frequência. Inclua TODOS os alunos da turma com o status desejado (presente: true/false). Alunos não incluídos manterão o status anterior.',
    type: [AlterarFrequenciaItemDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AlterarFrequenciaItemDto)
  alteracoes: AlterarFrequenciaItemDto[];
}

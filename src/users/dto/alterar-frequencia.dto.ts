import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsDateString,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  IsInt,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AlterarFrequenciaItemDto {
  @ApiProperty({
    example: 23,
    description: 'ID do aluno (campo "id" da tabela Usuario)',
    minimum: 1,
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1, { message: 'ID do aluno deve ser um número positivo' })
  aluno_id: number;

  @ApiProperty({
    example: true,
    description:
      'Nova situação de presença do aluno (true = presente, false = ausente)',
    required: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  presente: boolean;
}

export class AlterarFrequenciaDto {
  @ApiProperty({
    example: 6,
    description: 'ID da turma onde a frequência será alterada',
    minimum: 1,
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1, { message: 'ID da turma deve ser um número positivo' })
  turma_id: number;

  @ApiProperty({
    example: '2025-07-14T14:00:00.000Z',
    description:
      'Data e hora da aula que terá a frequência alterada (deve ser uma aula já registrada)',
    format: 'date-time',
    required: true,
  })
  @IsDateString({}, { message: 'Data deve estar no formato ISO 8601' })
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
    required: true,
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'Lista de alterações não pode estar vazia' })
  @ValidateNested({ each: true })
  @Type(() => AlterarFrequenciaItemDto)
  alteracoes: AlterarFrequenciaItemDto[];
}

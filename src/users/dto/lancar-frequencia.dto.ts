import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsDateString,
  IsArray,
  ArrayNotEmpty,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LancarFrequenciaDto {
  @ApiProperty({
    example: 1,
    description: 'ID da turma onde será lançada a frequência',
    minimum: 1,
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(0, { message: 'ID da turma deve ser um número positivo' })
  turma_id: number;

  @ApiProperty({
    example: '2025-07-14T14:00:00.000Z',
    description: 'Data e hora da aula (formato ISO 8601)',
    format: 'date-time',
    required: true,
  })
  @IsDateString({}, { message: 'Data deve estar no formato ISO 8601' })
  @IsNotEmpty()
  data_aula: string;

  @ApiProperty({
    example: [23, 24, 25],
    description:
      'Array com os IDs únicos dos alunos que estiveram PRESENTES na aula. Os alunos matriculados na turma que não estiverem neste array serão automaticamente marcados como AUSENTES. Use o ID do usuário (campo "id" da tabela Usuario), não a matrícula nem o ID da matrícula.',
    type: [Number],
    required: true,
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'Lista de alunos presentes não pode estar vazia' })
  @IsInt({ each: true, message: 'Cada ID de aluno deve ser um número inteiro' })
  @Type(() => Number)
  alunos_presentes: number[];
}

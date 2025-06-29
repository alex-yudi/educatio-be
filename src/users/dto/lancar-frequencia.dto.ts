import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString, IsArray, ArrayNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class LancarFrequenciaDto {
  @ApiProperty({
    example: 1,
    description: 'ID da turma onde será lançada a frequência'
  })
  @IsInt()
  @IsNotEmpty()
  turma_id: number;

  @ApiProperty({
    example: '2024-06-29T14:00:00.000Z',
    description: 'Data e hora da aula'
  })
  @IsDateString()
  @IsNotEmpty()
  data_aula: string;

  @ApiProperty({
    example: [23, 24, 25],
    description: 'Array com os IDs únicos dos alunos que estiveram PRESENTES na aula. Os alunos matriculados na turma que não estiverem neste array serão automaticamente marcados como AUSENTES. Use o ID do usuário (campo "id" da tabela Usuario), não a matrícula nem o ID da matrícula.',
    type: [Number]
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Type(() => Number)
  alunos_presentes: number[];
}

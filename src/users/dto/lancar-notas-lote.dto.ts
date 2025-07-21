import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LancarNotaDto } from './lancar-nota.dto';

export class LancarNotasLoteDto {
  @ApiProperty({
    example: [
      {
        matricula_id: 1,
        valor: 8.5,
        tipo: 'UNIDADE_1'
      },
      {
        matricula_id: 2,
        valor: 7.0,
        tipo: 'UNIDADE_1'
      }
    ],
    description: 'Array de notas a serem lançadas',
    type: [LancarNotaDto],
    required: true,
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Deve haver pelo menos uma nota para lançar' })
  @ValidateNested({ each: true })
  @Type(() => LancarNotaDto)
  notas: LancarNotaDto[];
}

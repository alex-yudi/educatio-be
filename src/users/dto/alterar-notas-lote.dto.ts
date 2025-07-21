import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AlterarNotaDto } from './alterar-nota.dto';

export class AlterarNotasLoteDto {
  @ApiProperty({
    example: [
      {
        nota_id: 1,
        valor: 9.0
      },
      {
        nota_id: 2,
        valor: 8.5
      }
    ],
    description: 'Array de notas a serem alteradas',
    type: [AlterarNotaDto],
    required: true,
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Deve haver pelo menos uma nota para alterar' })
  @ValidateNested({ each: true })
  @Type(() => AlterarNotaDto)
  notas: AlterarNotaDto[];
}

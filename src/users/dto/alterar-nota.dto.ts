import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsInt,
} from 'class-validator';

export class AlterarNotaDto {
  @ApiProperty({
    example: 1,
    description: 'ID da nota a ser alterada',
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  nota_id: number;

  @ApiProperty({
    example: 8.5,
    description: 'Novo valor da nota (0 a 10)',
    minimum: 0,
    maximum: 10,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'A nota deve ser no mínimo 0' })
  @Max(10, { message: 'A nota deve ser no máximo 10' })
  valor: number;
}

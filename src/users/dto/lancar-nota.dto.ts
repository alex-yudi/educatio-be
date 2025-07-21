import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  Max,
  IsEnum,
  IsInt,
} from 'class-validator';

export enum TipoNota {
  UNIDADE_1 = 'UNIDADE_1',
  UNIDADE_2 = 'UNIDADE_2',
  UNIDADE_3 = 'UNIDADE_3',
  FINAL = 'FINAL',
}

export class LancarNotaDto {
  @ApiProperty({
    example: 1,
    description: 'ID da matrícula do aluno',
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  matricula_id: number;

  @ApiProperty({
    example: 8.5,
    description: 'Valor da nota (0 a 10)',
    minimum: 0,
    maximum: 10,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'A nota deve ser no mínimo 0' })
  @Max(10, { message: 'A nota deve ser no máximo 10' })
  valor: number;

  @ApiProperty({
    example: 'UNIDADE_1',
    description: 'Tipo da nota sendo lançada',
    enum: TipoNota,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(TipoNota, {
    message: 'Tipo de nota deve ser UNIDADE_1, UNIDADE_2, UNIDADE_3 ou FINAL',
  })
  tipo: TipoNota;
}

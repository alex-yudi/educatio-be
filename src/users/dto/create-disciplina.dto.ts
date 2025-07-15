import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  Max,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateDisciplinaDto {
  @ApiProperty({
    example: 'Programação Orientada a Objetos',
    description: 'Nome da disciplina',
    minLength: 2,
    maxLength: 100,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  nome: string;

  @ApiProperty({
    example: 'POO101',
    description:
      'Código único da disciplina (2-10 caracteres, letras e números)',
    pattern: '^[A-Z0-9]{2,10}$',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9]{2,10}$/, {
    message: 'Código deve conter de 2 a 10 caracteres maiúsculos e números',
  })
  codigo: string;

  @ApiProperty({
    example: 'Introdução aos conceitos de POO',
    description: 'Descrição da disciplina',
    maxLength: 500,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Descrição deve ter no máximo 500 caracteres' })
  descricao?: string;

  @ApiProperty({
    example: 60,
    description: 'Carga horária total em horas',
    minimum: 1,
    maximum: 500,
    default: 60,
    required: false,
  })
  @IsInt()
  @Min(1, { message: 'Carga horária deve ser pelo menos 1 hora' })
  @Max(500, { message: 'Carga horária deve ser no máximo 500 horas' })
  @IsOptional()
  carga_horaria?: number;

  @ApiProperty({
    example: 'Ementa completa da disciplina...',
    description: 'Ementa da disciplina',
    maxLength: 2000,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000, { message: 'Ementa deve ter no máximo 2000 caracteres' })
  ementa?: string;
}

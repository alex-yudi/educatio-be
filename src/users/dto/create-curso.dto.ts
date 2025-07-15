import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ArrayNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateCursoDto {
  @ApiProperty({
    example: 'Engenharia de Software',
    description: 'Nome do curso',
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
    example: 'ESOFT',
    description: 'Código único do curso (2-10 caracteres, letras e números)',
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
    example: 'Curso voltado para formação de engenheiros de software',
    description: 'Descrição detalhada do curso',
    maxLength: 500,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Descrição deve ter no máximo 500 caracteres' })
  descricao?: string;

  @ApiProperty({
    example: ['PROG1', 'PROG2', 'BD', 'ENGSW'],
    description: 'Lista de códigos das disciplinas que fazem parte do curso',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  disciplinas_codigos?: string[];
}

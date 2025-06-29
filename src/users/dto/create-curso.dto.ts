import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsArray, ArrayNotEmpty } from 'class-validator';

export class CreateCursoDto {
  @ApiProperty({
    example: 'Engenharia de Software',
    description: 'Nome do curso'
  })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({
    example: 'ESOFT',
    description: 'Código único do curso'
  })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({
    example: 'Curso voltado para formação de engenheiros de software',
    description: 'Descrição detalhada do curso',
    required: false
  })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiProperty({
    example: ['PROG1', 'PROG2', 'BD', 'ENGSW'],
    description: 'Lista de códigos das disciplinas que fazem parte do curso',
    type: [String],
    required: false
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  disciplinas_codigos?: string[];
}

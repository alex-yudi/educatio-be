import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateDisciplinaDto {
  @ApiProperty({
    example: 'Programação Orientada a Objetos',
    description: 'Nome da disciplina',
  })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({
    example: 'POO101',
    description: 'Código único da disciplina',
  })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({
    example: 'Introdução aos conceitos de POO',
    description: 'Descrição da disciplina',
    required: false,
  })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiProperty({
    example: 60,
    description: 'Carga horária total em horas',
    required: false,
    default: 60,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  carga_horaria?: number;

  @ApiProperty({
    example: 'Ementa completa da disciplina...',
    description: 'Ementa da disciplina',
    required: false,
  })
  @IsString()
  @IsOptional()
  ementa?: string;
}

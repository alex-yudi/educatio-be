import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateTurmaDto {
  @ApiProperty({
    example: 'PROG1-2025-1A',
    description: 'Código único da turma',
  })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({
    example: 'PROG1',
    description: 'Código da disciplina associada à turma',
  })
  @IsString()
  @IsNotEmpty()
  disciplina_codigo: string;

  @ApiProperty({
    example: 'carlos.prof@uni.edu',
    description: 'Email do professor responsável pela turma',
  })
  @IsString()
  @IsNotEmpty()
  professor_email: string;

  @ApiProperty({
    example: 2025,
    description: 'Ano da turma',
  })
  @IsInt()
  @IsNotEmpty()
  ano: number;

  @ApiProperty({
    example: 1,
    description: 'Semestre da turma (1 ou 2)',
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  semestre: number;

  @ApiProperty({
    example: 'Sala A-101',
    description: 'Sala onde as aulas são ministradas',
    required: false,
  })
  @IsString()
  @IsOptional()
  sala?: string;

  @ApiProperty({
    example: 35,
    description: 'Número de vagas disponíveis na turma',
    required: false,
    default: 30,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  vagas?: number;
}

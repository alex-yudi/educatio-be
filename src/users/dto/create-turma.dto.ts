import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min, Max, IsEmail } from 'class-validator';

export class CreateTurmaDto {
  @ApiProperty({
    example: 'PROG1-2025-1A',
    description: 'Código único da turma',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({
    example: 'PROG1',
    description: 'Código da disciplina associada à turma',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  disciplina_codigo: string;

  @ApiProperty({
    example: 'carlos.prof@uni.edu',
    description: 'Email do professor responsável pela turma',
    required: true,
  })
  @IsString()
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @IsNotEmpty()
  professor_email: string;

  @ApiProperty({
    example: 2025,
    description: 'Ano da turma',
    minimum: 2000,
    maximum: 3000,
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(2000)
  @Max(3000)
  ano: number;

  @ApiProperty({
    example: 1,
    description: 'Semestre da turma (1 ou 2)',
    minimum: 1,
    maximum: 2,
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(2)
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
    minimum: 1,
    maximum: 100,
    default: 30,
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(100)
  vagas?: number;
}

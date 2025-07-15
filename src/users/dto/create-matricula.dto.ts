import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateMatriculaDto {
  @ApiProperty({
    example: '2025001',
    description: 'Matrícula do aluno a ser matriculado (7 dígitos)',
    pattern: '^[0-9]{7}$',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{7}$/, { message: 'Matrícula deve conter exatamente 7 dígitos numéricos' })
  matricula_aluno: string;

  @ApiProperty({
    example: 'BD-2025-1A',
    description: 'Código da turma onde o aluno será matriculado',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  codigo_turma: string;
}

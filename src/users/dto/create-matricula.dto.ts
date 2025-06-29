import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMatriculaDto {
  @ApiProperty({
    example: '2025001',
    description: 'Matrícula do aluno a ser matriculado'
  })
  @IsString()
  @IsNotEmpty()
  matricula_aluno: string;

  @ApiProperty({
    example: 'BD-2024-1A',
    description: 'Código da turma onde o aluno será matriculado'
  })
  @IsString()
  @IsNotEmpty()
  codigo_turma: string;
}

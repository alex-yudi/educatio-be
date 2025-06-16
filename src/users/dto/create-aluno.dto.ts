import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateAlunoDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do aluno'
  })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({
    example: '2025001',
    description: 'Número de matrícula do aluno'
  })
  @IsString()
  @IsNotEmpty()
  matricula: string;

  @ApiProperty({
    example: 'joao.silva@uni.edu',
    description: 'E-mail institucional do aluno'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'ESOFT',
    description: 'Código do curso que o aluno está matriculado'
  })
  @IsString()
  @IsNotEmpty()
  curso_codigo: string;
}

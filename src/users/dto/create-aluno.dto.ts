import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateAlunoDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do aluno',
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
    example: '2025001',
    description: 'Número de matrícula do aluno',
    pattern: '^[0-9]{7}$',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{7}$/, { message: 'Matrícula deve conter exatamente 7 dígitos numéricos' })
  matricula: string;

  @ApiProperty({
    example: 'joao.silva@uni.edu',
    description: 'E-mail institucional do aluno',
    required: true,
  })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'ESOFT',
    description: 'Código do curso que o aluno está matriculado',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  curso_codigo: string;
}

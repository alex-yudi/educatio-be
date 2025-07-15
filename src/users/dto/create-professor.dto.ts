import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateProfessorDto {
  @ApiProperty({
    example: 'Maria Silva',
    description: 'Nome completo do professor',
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
    example: 'maria.silva@uni.edu',
    description: 'E-mail institucional do professor',
    required: true,
  })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'COMP101',
    description: 'Código da disciplina ministrada (opcional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  disciplina_codigo?: string;
}

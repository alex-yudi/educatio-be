import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProfessorDto {
  @ApiProperty({
    example: 'Maria Silva',
    description: 'Nome completo do professor'
  })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({
    example: 'maria.silva@uni.edu',
    description: 'E-mail institucional do professor'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'COMP101',
    description: 'Código da disciplina ministrada (opcional)',
    required: false
  })
  @IsString()
  @IsOptional()
  disciplina_codigo?: string;
}

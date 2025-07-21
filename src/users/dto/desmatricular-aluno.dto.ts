import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class DesmatricularAlunoDto {
  @ApiProperty({
    example: '2025001',
    description: 'Matrícula do aluno a ser desmatriculado',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  matricula_aluno: string;

  @ApiProperty({
    example: 'PROG1-2025-1A',
    description: 'Código da turma da qual o aluno será desmatriculado',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  codigo_turma: string;
}

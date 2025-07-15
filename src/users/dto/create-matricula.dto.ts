import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, IsArray } from 'class-validator';

export class CreateMatriculaDto {
  @ApiProperty({
    example: ['2025001', '2025002', '2025003'],
    description:
      'Lista completa de matrículas dos alunos que devem estar na turma. Alunos não listados serão desmatriculados. Alunos listados que não estão na turma serão matriculados.',
    type: [String],
    required: true,
  })
  @IsArray()
  @IsString({ each: true })
  // @Matches(/^[0-9]{7}$/, {
  //   each: true,
  //   message: 'Cada matrícula deve conter exatamente 7 dígitos numéricos',
  // })
  matriculas_alunos: string[];

  @ApiProperty({
    example: 'BD-2025-1A',
    description: 'Código da turma onde os alunos serão matriculados',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  codigo_turma: string;
}

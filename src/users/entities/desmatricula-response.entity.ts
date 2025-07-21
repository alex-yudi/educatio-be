import { ApiProperty } from '@nestjs/swagger';

class AlunoDesmatriculadoEntity {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome do aluno desmatriculado',
  })
  nome: string;

  @ApiProperty({
    example: '2025001',
    description: 'Matrícula do aluno desmatriculado',
  })
  matricula: string;
}

class TurmaDesmatriculaEntity {
  @ApiProperty({
    example: 'PROG1-2025-1A',
    description: 'Código da turma',
  })
  codigo: string;

  @ApiProperty({
    example: 'Programação I',
    description: 'Nome da disciplina',
  })
  disciplina: string;
}

class DadosRemovidosEntity {
  @ApiProperty({
    example: 3,
    description: 'Número de notas removidas',
  })
  notas_removidas: number;

  @ApiProperty({
    example: 15,
    description: 'Número de frequências removidas',
  })
  frequencias_removidas: number;
}

export class DesmatriculaResponseEntity {
  @ApiProperty({
    example: 'Aluno desmatriculado com sucesso',
    description: 'Mensagem de confirmação',
  })
  message: string;

  @ApiProperty({
    type: AlunoDesmatriculadoEntity,
    description: 'Dados do aluno desmatriculado',
  })
  aluno: AlunoDesmatriculadoEntity;

  @ApiProperty({
    type: TurmaDesmatriculaEntity,
    description: 'Dados da turma',
  })
  turma: TurmaDesmatriculaEntity;

  @ApiProperty({
    type: DadosRemovidosEntity,
    description: 'Dados sobre informações removidas',
  })
  dados_removidos: DadosRemovidosEntity;

  constructor(partial: Partial<DesmatriculaResponseEntity>) {
    Object.assign(this, partial);
  }
}

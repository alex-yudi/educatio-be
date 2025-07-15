import { ApiProperty } from '@nestjs/swagger';
import { EnumPerfil } from '@prisma/client';

export class DisciplinaMatriculaEntity {
  @ApiProperty({ example: 1, description: 'ID da disciplina' })
  id: number;

  @ApiProperty({ example: 'Programação I', description: 'Nome da disciplina' })
  nome: string;

  @ApiProperty({ example: 'PROG101', description: 'Código da disciplina' })
  codigo: string;

  @ApiProperty({ example: 80, description: 'Carga horária da disciplina' })
  carga_horaria: number;

  constructor(partial: Partial<DisciplinaMatriculaEntity>) {
    Object.assign(this, partial);
  }
}

export class ProfessorMatriculaEntity {
  @ApiProperty({ example: 1, description: 'ID do professor' })
  id: number;

  @ApiProperty({ example: 'Dr. Carlos Silva', description: 'Nome do professor' })
  nome: string;

  @ApiProperty({ example: 'carlos@uni.edu', description: 'E-mail do professor' })
  email: string;

  constructor(partial: Partial<ProfessorMatriculaEntity>) {
    Object.assign(this, partial);
  }
}

export class TurmaMatriculaEntity {
  @ApiProperty({ example: 1, description: 'ID da turma' })
  id: number;

  @ApiProperty({ example: 'PROG101-2024-1A', description: 'Código da turma' })
  codigo: string;

  @ApiProperty({ example: 2024, description: 'Ano da turma' })
  ano: number;

  @ApiProperty({ example: 1, description: 'Semestre da turma' })
  semestre: number;

  @ApiProperty({ example: 'Lab A-101', description: 'Sala da turma', required: false })
  sala?: string;

  @ApiProperty({ type: DisciplinaMatriculaEntity, description: 'Dados da disciplina' })
  disciplina: DisciplinaMatriculaEntity;

  @ApiProperty({ type: ProfessorMatriculaEntity, description: 'Dados do professor' })
  professor: ProfessorMatriculaEntity;

  constructor(partial: Partial<TurmaMatriculaEntity>) {
    Object.assign(this, partial);
    if (partial.disciplina) {
      this.disciplina = new DisciplinaMatriculaEntity(partial.disciplina);
    }
    if (partial.professor) {
      this.professor = new ProfessorMatriculaEntity(partial.professor);
    }
  }
}

export class MatriculaAlunoEntity {
  @ApiProperty({ example: 1, description: 'ID da matrícula' })
  id: number;

  @ApiProperty({ example: 'ATIVA', description: 'Status da matrícula' })
  status: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Data da matrícula' })
  criado_em: Date;

  @ApiProperty({ type: TurmaMatriculaEntity, description: 'Dados da turma' })
  turma: TurmaMatriculaEntity;

  constructor(partial: Partial<MatriculaAlunoEntity>) {
    Object.assign(this, partial);
    if (partial.turma) {
      this.turma = new TurmaMatriculaEntity(partial.turma);
    }
  }
}

export class AlunoComMatriculasEntity {
  @ApiProperty({ example: 1, description: 'ID do aluno' })
  id: number;

  @ApiProperty({ example: 'João Silva Santos', description: 'Nome do aluno' })
  nome: string;

  @ApiProperty({ example: 'joao@email.com', description: 'E-mail do aluno' })
  email: string;

  @ApiProperty({ example: '20240001', description: 'Número de matrícula do aluno' })
  matricula: string;

  @ApiProperty({
    enum: EnumPerfil,
    example: EnumPerfil.aluno,
    description: 'Role do usuário',
  })
  role: EnumPerfil;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Data de criação do aluno'
  })
  criado_em: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Data da última atualização'
  })
  atualizado_em: Date;

  @ApiProperty({
    type: [MatriculaAlunoEntity],
    description: 'Lista de matrículas do aluno',
    example: []
  })
  matriculas: MatriculaAlunoEntity[];

  constructor(partial: Partial<AlunoComMatriculasEntity>) {
    Object.assign(this, partial);
    if (partial.matriculas) {
      this.matriculas = partial.matriculas.map(
        matricula => new MatriculaAlunoEntity(matricula)
      );
    }
  }
}

import { ApiProperty } from '@nestjs/swagger';

export class DisciplinaTurmaEntity {
  @ApiProperty({ example: 1, description: 'ID da disciplina' })
  id: number;

  @ApiProperty({ example: 'Programação I', description: 'Nome da disciplina' })
  nome: string;

  @ApiProperty({ example: 'PROG101', description: 'Código da disciplina' })
  codigo: string;

  @ApiProperty({ example: 80, description: 'Carga horária da disciplina' })
  carga_horaria: number;

  @ApiProperty({ example: 'Disciplina introdutória de programação', description: 'Descrição da disciplina', required: false })
  descricao?: string;

  constructor(partial: Partial<DisciplinaTurmaEntity>) {
    Object.assign(this, partial);
  }
}

export class ProfessorTurmaEntity {
  @ApiProperty({ example: 1, description: 'ID do professor' })
  id: number;

  @ApiProperty({ example: 'Dr. Carlos Silva', description: 'Nome do professor' })
  nome: string;

  @ApiProperty({ example: 'carlos@uni.edu', description: 'E-mail do professor' })
  email: string;

  constructor(partial: Partial<ProfessorTurmaEntity>) {
    Object.assign(this, partial);
  }
}

export class AlunoMatriculaEntity {
  @ApiProperty({ example: 1, description: 'ID da matrícula' })
  id: number;

  @ApiProperty({ example: 'ATIVA', description: 'Status da matrícula' })
  status: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Data da matrícula' })
  criado_em: Date;

  @ApiProperty({
    type: Object,
    description: 'Dados do estudante matriculado',
    example: {
      id: 5,
      nome: 'João Silva',
      email: 'joao@email.com',
      matricula: '20240001'
    }
  })
  estudante: {
    id: number;
    nome: string;
    email: string;
    matricula: string;
  };

  constructor(partial: Partial<AlunoMatriculaEntity>) {
    Object.assign(this, partial);
  }
}

export class HorarioTurmaEntity {
  @ApiProperty({ example: 1, description: 'ID do horário' })
  id: number;

  @ApiProperty({ example: 'SEGUNDA', description: 'Dia da semana' })
  dia_semana: string;

  @ApiProperty({ example: '08:00', description: 'Horário de início' })
  hora_inicio: string;

  @ApiProperty({ example: '10:00', description: 'Horário de fim' })
  hora_fim: string;

  constructor(partial: Partial<HorarioTurmaEntity>) {
    Object.assign(this, partial);
  }
}

export class TurmaCompletaEntity {
  @ApiProperty({ example: 1, description: 'ID da turma' })
  id: number;

  @ApiProperty({ example: 'PROG101-2024-1A', description: 'Código da turma' })
  codigo: string;

  @ApiProperty({ example: 2024, description: 'Ano da turma' })
  ano: number;

  @ApiProperty({ example: 1, description: 'Semestre da turma' })
  semestre: number;

  @ApiProperty({ example: 30, description: 'Número de vagas da turma' })
  vagas: number;

  @ApiProperty({ example: 'Sala A101', description: 'Sala da turma', required: false })
  sala?: string;

  @ApiProperty({ example: 15, description: 'Número de alunos matriculados' })
  total_matriculados: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Data de criação' })
  criado_em: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Data de atualização' })
  atualizado_em: Date;

  @ApiProperty({ type: DisciplinaTurmaEntity, description: 'Dados da disciplina' })
  disciplina: DisciplinaTurmaEntity;

  @ApiProperty({ type: ProfessorTurmaEntity, description: 'Dados do professor responsável' })
  professor: ProfessorTurmaEntity;

  @ApiProperty({ 
    type: [AlunoMatriculaEntity],
    description: 'Lista de alunos matriculados na turma' 
  })
  matriculas: AlunoMatriculaEntity[];

  @ApiProperty({ 
    type: [HorarioTurmaEntity],
    description: 'Horários das aulas da turma' 
  })
  horarios: HorarioTurmaEntity[];

  constructor(partial: Partial<TurmaCompletaEntity>) {
    Object.assign(this, partial);
    if (partial.disciplina) {
      this.disciplina = new DisciplinaTurmaEntity(partial.disciplina);
    }
    if (partial.professor) {
      this.professor = new ProfessorTurmaEntity(partial.professor);
    }
    if (partial.matriculas) {
      this.matriculas = partial.matriculas.map(matricula => new AlunoMatriculaEntity(matricula));
    }
    if (partial.horarios) {
      this.horarios = partial.horarios.map(horario => new HorarioTurmaEntity(horario));
    }
  }
}

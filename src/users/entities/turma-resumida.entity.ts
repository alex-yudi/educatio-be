import { ApiProperty } from '@nestjs/swagger';

export class DisciplinaResumidaEntity {
  @ApiProperty({ example: 1, description: 'ID da disciplina' })
  id: number;

  @ApiProperty({ example: 'Programação I', description: 'Nome da disciplina' })
  nome: string;

  @ApiProperty({ example: 'PROG101', description: 'Código da disciplina' })
  codigo: string;

  @ApiProperty({ example: 80, description: 'Carga horária da disciplina' })
  carga_horaria: number;

  constructor(partial: Partial<DisciplinaResumidaEntity>) {
    Object.assign(this, partial);
  }
}

export class AlunoResumidoEntity {
  @ApiProperty({ example: 1, description: 'ID do aluno' })
  id: number;

  @ApiProperty({ example: 'João Silva', description: 'Nome do aluno' })
  nome: string;

  @ApiProperty({ example: 'joao@email.com', description: 'E-mail do aluno' })
  email: string;

  @ApiProperty({ example: '20240001', description: 'Matrícula do aluno' })
  matricula: string;

  @ApiProperty({ example: 'ATIVA', description: 'Status da matrícula' })
  status: string;

  constructor(partial: Partial<AlunoResumidoEntity>) {
    Object.assign(this, partial);
  }
}

export class HorarioAulaEntity {
  @ApiProperty({ example: 'SEGUNDA', description: 'Dia da semana' })
  dia_semana: string;

  @ApiProperty({ example: '08:00', description: 'Horário de início' })
  hora_inicio: string;

  @ApiProperty({ example: '10:00', description: 'Horário de fim' })
  hora_fim: string;

  constructor(partial: Partial<HorarioAulaEntity>) {
    Object.assign(this, partial);
  }
}

export class TurmaResumidaEntity {
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

  @ApiProperty({
    type: DisciplinaResumidaEntity,
    description: 'Dados da disciplina associada à turma'
  })
  disciplina: DisciplinaResumidaEntity;

  @ApiProperty({
    type: [AlunoResumidoEntity],
    description: 'Lista de alunos matriculados na turma'
  })
  alunos: AlunoResumidoEntity[];

  @ApiProperty({
    type: [HorarioAulaEntity],
    description: 'Horários das aulas da turma'
  })
  horarios: HorarioAulaEntity[];

  constructor(partial: Partial<TurmaResumidaEntity>) {
    Object.assign(this, partial);
    if (partial.disciplina) {
      this.disciplina = new DisciplinaResumidaEntity(partial.disciplina);
    }
    if (partial.alunos) {
      this.alunos = partial.alunos.map(aluno => new AlunoResumidoEntity(aluno));
    }
    if (partial.horarios) {
      this.horarios = partial.horarios.map(horario => new HorarioAulaEntity(horario));
    }
  }
}

import { ProfessorComTurmasEntity } from '../../users/entities/professor-com-turmas.entity';

/**
 * Helper para mapear professores com turmas do Prisma para entidade
 */
export class ProfessorComTurmasMapper {
  static toEntity(professor: any): ProfessorComTurmasEntity {
    const turmasFormatadas = professor.turmasMinistradas?.map((turma: any) => ({
      id: turma.id,
      codigo: turma.codigo,
      ano: turma.ano,
      semestre: turma.semestre,
      vagas: turma.vagas,
      sala: turma.sala,
      disciplina: {
        id: turma.disciplina.id,
        nome: turma.disciplina.nome,
        codigo: turma.disciplina.codigo,
        carga_horaria: turma.disciplina.carga_horaria,
      },
      alunos: turma.matriculas?.map((matricula: any) => ({
        id: matricula.estudante.id,
        nome: matricula.estudante.nome,
        email: matricula.estudante.email,
        matricula: matricula.estudante.matricula,
        status: matricula.status,
      })) || [],
      horarios: turma.horarios?.map((horario: any) => ({
        dia_semana: horario.dia_semana,
        hora_inicio: horario.hora_inicio,
        hora_fim: horario.hora_fim,
      })) || [],
    })) || [];

    return new ProfessorComTurmasEntity({
      id: professor.id,
      nome: professor.nome,
      email: professor.email,
      role: professor.role,
      criado_em: professor.criado_em,
      atualizado_em: professor.atualizado_em,
      turmasMinistradas: turmasFormatadas,
    });
  }

  static toEntities(professores: any[]): ProfessorComTurmasEntity[] {
    return professores.map(professor => this.toEntity(professor));
  }
}

import { TurmaCompletaEntity } from '../../users/entities/turma-completa.entity';

/**
 * Helper para mapear turma completa do Prisma para entidade
 */
export class TurmaCompletaMapper {
  static toEntity(turma: any): TurmaCompletaEntity {
    return new TurmaCompletaEntity({
      id: turma.id,
      codigo: turma.codigo,
      ano: turma.ano,
      semestre: turma.semestre,
      vagas: turma.vagas,
      sala: turma.sala,
      total_matriculados: turma._count.matriculas,
      criado_em: turma.criado_em,
      atualizado_em: turma.atualizado_em,
      disciplina: {
        id: turma.disciplina.id,
        nome: turma.disciplina.nome,
        codigo: turma.disciplina.codigo,
        carga_horaria: turma.disciplina.carga_horaria,
        descricao: turma.disciplina.descricao,
      },
      professor: {
        id: turma.professor.id,
        nome: turma.professor.nome,
        email: turma.professor.email,
      },
      matriculas: turma.matriculas?.map((matricula: any) => ({
        id: matricula.id,
        status: matricula.status,
        criado_em: matricula.criado_em,
        estudante: {
          id: matricula.estudante.id,
          nome: matricula.estudante.nome,
          email: matricula.estudante.email,
          matricula: matricula.estudante.matricula,
        },
      })) || [],
      horarios: turma.horarios?.map((horario: any) => ({
        id: horario.id,
        dia_semana: horario.dia_semana,
        hora_inicio: horario.hora_inicio,
        hora_fim: horario.hora_fim,
      })) || [],
    });
  }
}

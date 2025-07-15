import { AlunoComMatriculasEntity } from '../../users/entities/aluno-com-matriculas.entity';

/**
 * Helper para mapear alunos com matrículas do Prisma para entidade
 */
export class AlunoComMatriculasMapper {
  static toEntity(aluno: any): AlunoComMatriculasEntity {
    const matriculasFormatadas = aluno.matriculas?.map((matricula: any) => ({
      id: matricula.id,
      status: matricula.status,
      criado_em: matricula.criado_em,
      turma: {
        id: matricula.turma.id,
        codigo: matricula.turma.codigo,
        ano: matricula.turma.ano,
        semestre: matricula.turma.semestre,
        sala: matricula.turma.sala,
        disciplina: {
          id: matricula.turma.disciplina.id,
          nome: matricula.turma.disciplina.nome,
          codigo: matricula.turma.disciplina.codigo,
          carga_horaria: matricula.turma.disciplina.carga_horaria,
        },
        professor: {
          id: matricula.turma.professor.id,
          nome: matricula.turma.professor.nome,
          email: matricula.turma.professor.email,
        },
      },
    })) || [];

    return new AlunoComMatriculasEntity({
      id: aluno.id,
      nome: aluno.nome,
      email: aluno.email,
      matricula: aluno.matricula,
      role: aluno.role,
      criado_em: aluno.criado_em,
      atualizado_em: aluno.atualizado_em,
      matriculas: matriculasFormatadas,
    });
  }

  static toEntities(alunos: any[]): AlunoComMatriculasEntity[] {
    return alunos.map(aluno => this.toEntity(aluno));
  }
}

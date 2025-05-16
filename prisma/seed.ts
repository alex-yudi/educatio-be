import { PrismaClient, EnumPerfil } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// comment: O código abaixo é um script de seed para popular o banco de dados com dados iniciais.
// Ele cria usuários, departamentos, cursos, disciplinas, turmas, matrículas, notas e frequências.
async function main() {
  console.log('🚀 Iniciando seed completo...');

  try {
    // 1. Limpar o banco de dados (opcional)
    await prisma.$executeRaw`TRUNCATE TABLE 
      "PreRequisito", "CursoDisciplina", "Matricula", "Nota", "Frequencia", 
      "Turma", "Disciplina", "Curso", "Departamento", "Usuario" CASCADE`;

    // 2. Criar usuários
    const saltRounds = 10;
    const [chefe, professor, aluno] = await Promise.all([
      prisma.usuario.create({
        data: {
          nome: 'Maria Fernandes',
          email: 'chefe.dcomp@uni.edu',
          senha: await bcrypt.hash('Chefe@123', saltRounds),
          role: EnumPerfil.chefeDepartamento
        }
      }),
      prisma.usuario.create({
        data: {
          nome: 'Carlos Andrade',
          email: 'carlos.prof@uni.edu',
          senha: await bcrypt.hash('Professor@123', saltRounds),
          role: EnumPerfil.professor
        }
      }),
      prisma.usuario.create({
        data: {
          nome: 'João da Silva',
          email: 'joao.aluno@uni.edu',
          senha: await bcrypt.hash('Aluno@123', saltRounds),
          role: EnumPerfil.aluno,
          matricula: '20240001'
        }
      })
    ]);

    console.log('✔ Usuários criados');

    // 3. Criar departamento
    const departamento = await prisma.departamento.create({
      data: {
        nome: 'Departamento de Computação',
        codigo: 'DCOMP',
        chefe_id: chefe.id,
        professores: { connect: { id: professor.id } }
      }
    });
    console.log('✔ Departamento criado');

    // 4. Criar curso
    const curso = await prisma.curso.create({
      data: {
        nome: 'Engenharia de Software',
        codigo: 'ESOFT',
        departamento_id: departamento.id,
        criado_por_id: chefe.id
      }
    });
    console.log('✔ Curso criado');

    // 5. Criar disciplinas
    const [prog1, bd] = await Promise.all([
      prisma.disciplina.create({
        data: {
          nome: 'Programação I',
          codigo: 'PROG1',
          carga_horaria: 60,
          criado_por_id: chefe.id
        }
      }),
      prisma.disciplina.create({
        data: {
          nome: 'Banco de Dados',
          codigo: 'BD',
          carga_horaria: 80,
          criado_por_id: chefe.id
        }
      })
    ]);

    // 6. Vincular disciplinas ao curso
    await prisma.cursoDisciplina.createMany({
      data: [
        { curso_id: curso.id, disciplina_id: prog1.id },
        { curso_id: curso.id, disciplina_id: bd.id }
      ]
    });
    console.log('✔ Disciplinas vinculadas ao curso');

    // 7. Definir pré-requisitos
    await prisma.preRequisito.create({
      data: {
        disciplina_id: bd.id,
        disciplina_pre_requisito_id: prog1.id
      }
    });
    console.log('✔ Pré-requisitos definidos');

    // 8. Criar turma
    const turma = await prisma.turma.create({
      data: {
        codigo: 'BD-2024-1A',
        disciplina_id: bd.id,
        professor_id: professor.id,
        ano: 2024,
        semestre: 1,
        horario: 'Segunda 14:00-16:00, Quarta 14:00-16:00'
      }
    });
    console.log('✔ Turma criada');

    // 9. Matricular aluno
    const matricula = await prisma.matricula.create({
      data: {
        estudante_id: aluno.id,
        turma_id: turma.id
      }
    });
    console.log('✔ Aluno matriculado');

    // 10. Lançar notas
    await prisma.nota.createMany({
      data: [
        {
          matricula_id: matricula.id,
          tipo: 'PROVA',
          valor: 8.5,
          criado_por_id: professor.id
        },
        {
          matricula_id: matricula.id,
          tipo: 'TRABALHO',
          valor: 9.0,
          criado_por_id: professor.id
        }
      ]
    });
    console.log('✔ Notas lançadas');

    // 11. Registrar frequências
    await prisma.frequencia.createMany({
      data: [
        {
          matricula_id: matricula.id,
          data_aula: new Date('2024-03-15T14:00:00Z'),
          presente: true,
          registrado_por_id: professor.id
        },
        {
          matricula_id: matricula.id,
          data_aula: new Date('2024-03-17T14:00:00Z'),
          presente: false,
          registrado_por_id: professor.id
        }
      ]
    });
    console.log('✔ Frequências registradas');

    console.log('✅ Seed completo concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
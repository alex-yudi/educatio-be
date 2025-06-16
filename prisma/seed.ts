import { PrismaClient, EnumPerfil, DiaSemana } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// comment: O código abaixo é um script de seed para popular o banco de dados com dados iniciais.
// Ele cria usuários, cursos, disciplinas, turmas, matrículas, notas e frequências.
async function main() {
  console.log('🚀 Iniciando seed completo...');

  try {
    // 1. Limpar o banco de dados (opcional)
    await prisma.$executeRaw`TRUNCATE TABLE 
      "PreRequisito", "CursoDisciplina", "Matricula", "Nota", "Frequencia", 
      "HorarioAula", "Turma", "Disciplina", "Curso", "Usuario" CASCADE`;

    // 2. Criar usuários
    const saltRounds = 10;
    const [admin, professor, aluno] = await Promise.all([
      prisma.usuario.create({
        data: {
          nome: 'Maria Fernandes',
          email: 'admin@uni.edu',
          senha: await bcrypt.hash('Admin@123', saltRounds),
          role: EnumPerfil.admin
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

    // 3. Criar curso
    const curso = await prisma.curso.create({
      data: {
        nome: 'Engenharia de Software',
        codigo: 'ESOFT',
        criado_por_id: admin.id
      }
    });
    console.log('✔ Curso criado');

    // 4. Criar disciplinas
    const [prog1, bd] = await Promise.all([
      prisma.disciplina.create({
        data: {
          nome: 'Programação I',
          codigo: 'PROG1',
          carga_horaria: 60,
          criado_por_id: admin.id
        }
      }),
      prisma.disciplina.create({
        data: {
          nome: 'Banco de Dados',
          codigo: 'BD',
          carga_horaria: 80,
          criado_por_id: admin.id
        }
      })
    ]);

    // 5. Vincular disciplinas ao curso
    await prisma.cursoDisciplina.createMany({
      data: [
        { curso_id: curso.id, disciplina_id: prog1.id },
        { curso_id: curso.id, disciplina_id: bd.id }
      ]
    });
    console.log('✔ Disciplinas vinculadas ao curso');

    // 6. Definir pré-requisitos
    await prisma.preRequisito.create({
      data: {
        disciplina_id: bd.id,
        disciplina_pre_requisito_id: prog1.id
      }
    });
    console.log('✔ Pré-requisitos definidos');

    // 7. Criar turma
    const turma = await prisma.turma.create({
      data: {
        codigo: 'BD-2024-1A',
        disciplina_id: bd.id,
        professor_id: professor.id,
        ano: 2024,
        semestre: 1,
        sala: 'Sala A-101',
        vagas: 35
      }
    });
    console.log('✔ Turma criada');

    // 8. Adicionar horários para a turma
    await prisma.horarioAula.createMany({
      data: [
        {
          turma_id: turma.id,
          dia_semana: DiaSemana.SEGUNDA,
          hora_inicio: '14:00',
          hora_fim: '16:00'
        },
        {
          turma_id: turma.id,
          dia_semana: DiaSemana.QUARTA,
          hora_inicio: '14:00',
          hora_fim: '16:00'
        }
      ]
    });
    console.log('✔ Horários das aulas adicionados');

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
    console.log('\nUsuários criados:');
    console.log('- Admin: admin@uni.edu / Admin@123');
    console.log('- Professor: carlos.prof@uni.edu / Professor@123');
    console.log('- Aluno: joao.aluno@uni.edu / Aluno@123');

  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
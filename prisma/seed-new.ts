import { PrismaClient, EnumPerfil, DiaSemana } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * SEED COMPLETO DO SISTEMA EDUCATIO
 * 
 * Este script popula o banco de dados com dados realistas para demonstração
 * e desenvolvimento, incluindo:
 * - Usuários (admin, professores, alunos)
 * - Cursos e disciplinas
 * - Pré-requisitos entre disciplinas
 * - Turmas com horários
 * - Matrículas com notas e frequências
 */
async function main() {
  console.log('🚀 Iniciando seed completo do Sistema Educatio...');

  try {
    // 1. Limpar o banco de dados (desenvolvimento apenas)
    console.log('🧹 Limpando banco de dados...');
    await prisma.$executeRaw`TRUNCATE TABLE 
      "PreRequisito", "CursoDisciplina", "Matricula", "Nota", "Frequencia", 
      "HorarioAula", "Turma", "Disciplina", "Curso", "Usuario" CASCADE`;

    // 2. Criar usuários do sistema
    console.log('👥 Criando usuários...');
    const saltRounds = 10;

    // === ADMINISTRADORES ===
    const admin1 = await prisma.usuario.create({
      data: {
        nome: 'Maria Fernandes Silva',
        email: 'admin@uni.edu',
        senha: await bcrypt.hash('Admin@123', saltRounds),
        role: EnumPerfil.admin
      }
    });

    const admin2 = await prisma.usuario.create({
      data: {
        nome: 'Roberto Santos Oliveira',
        email: 'roberto.admin@uni.edu',
        senha: await bcrypt.hash('Admin@456', saltRounds),
        role: EnumPerfil.admin
      }
    });

    // === PROFESSORES ===
    const prof1 = await prisma.usuario.create({
      data: {
        nome: 'Carlos Andrade',
        email: 'carlos.prof@uni.edu',
        senha: await bcrypt.hash('Professor@123', saltRounds),
        role: EnumPerfil.professor
      }
    });

    const prof2 = await prisma.usuario.create({
      data: {
        nome: 'Ana Paula Oliveira',
        email: 'ana.prof@uni.edu',
        senha: await bcrypt.hash('Professor@456', saltRounds),
        role: EnumPerfil.professor
      }
    });

    const prof3 = await prisma.usuario.create({
      data: {
        nome: 'Pedro Henrique Costa',
        email: 'pedro.prof@uni.edu',
        senha: await bcrypt.hash('Professor@789', saltRounds),
        role: EnumPerfil.professor
      }
    });

    const prof4 = await prisma.usuario.create({
      data: {
        nome: 'Luciana Ferreira Silva',
        email: 'luciana.prof@uni.edu',
        senha: await bcrypt.hash('Professor@101', saltRounds),
        role: EnumPerfil.professor
      }
    });

    // === ALUNOS ===
    const aluno1 = await prisma.usuario.create({
      data: {
        nome: 'João da Silva',
        email: 'joao.aluno@uni.edu',
        senha: await bcrypt.hash('Aluno@123', saltRounds),
        role: EnumPerfil.aluno,
        matricula: '20240001'
      }
    });

    const aluno2 = await prisma.usuario.create({
      data: {
        nome: 'Maria José Santos',
        email: 'maria.aluna@uni.edu',
        senha: await bcrypt.hash('Aluno@456', saltRounds),
        role: EnumPerfil.aluno,
        matricula: '20240002'
      }
    });

    const aluno3 = await prisma.usuario.create({
      data: {
        nome: 'Lucas Ferreira',
        email: 'lucas.aluno@uni.edu',
        senha: await bcrypt.hash('Aluno@789', saltRounds),
        role: EnumPerfil.aluno,
        matricula: '20240003'
      }
    });

    const aluno4 = await prisma.usuario.create({
      data: {
        nome: 'Julia Ribeiro',
        email: 'julia.aluna@uni.edu',
        senha: await bcrypt.hash('Aluno@101', saltRounds),
        role: EnumPerfil.aluno,
        matricula: '20240004'
      }
    });

    const aluno5 = await prisma.usuario.create({
      data: {
        nome: 'Rafael Sousa',
        email: 'rafael.aluno@uni.edu',
        senha: await bcrypt.hash('Aluno@102', saltRounds),
        role: EnumPerfil.aluno,
        matricula: '20240005'
      }
    });

    console.log('✔ Usuários criados');

    // 3. Criar cursos
    console.log('🎓 Criando cursos...');
    const cursoEngSoft = await prisma.curso.create({
      data: {
        nome: 'Engenharia de Software',
        codigo: 'ESOFT',
        descricao: 'Curso focado no desenvolvimento de software de qualidade com metodologias ágeis',
        criado_por_id: admin1.id
      }
    });

    const cursoSI = await prisma.curso.create({
      data: {
        nome: 'Sistemas de Informação',
        codigo: 'SI',
        descricao: 'Curso voltado para análise e desenvolvimento de sistemas empresariais',
        criado_por_id: admin1.id
      }
    });

    const cursoCC = await prisma.curso.create({
      data: {
        nome: 'Ciência da Computação',
        codigo: 'CC',
        descricao: 'Curso com foco em fundamentos teóricos e práticos da computação',
        criado_por_id: admin2.id
      }
    });

    console.log('✔ Cursos criados');

    // 4. Criar disciplinas
    console.log('📚 Criando disciplinas...');
    const prog1 = await prisma.disciplina.create({
      data: {
        nome: 'Programação I',
        codigo: 'PROG1',
        descricao: 'Introdução à programação com algoritmos e estruturas básicas',
        carga_horaria: 60,
        ementa: 'Conceitos básicos de programação, variáveis, estruturas condicionais e de repetição',
        criado_por_id: admin1.id
      }
    });

    const prog2 = await prisma.disciplina.create({
      data: {
        nome: 'Programação II',
        codigo: 'PROG2',
        descricao: 'Programação orientada a objetos e estruturas de dados',
        carga_horaria: 80,
        ementa: 'POO, herança, polimorfismo, encapsulamento, listas, pilhas e filas',
        criado_por_id: admin1.id
      }
    });

    const bd = await prisma.disciplina.create({
      data: {
        nome: 'Banco de Dados',
        codigo: 'BD',
        descricao: 'Fundamentos de sistemas de gerenciamento de banco de dados',
        carga_horaria: 80,
        ementa: 'Modelo relacional, SQL, normalização e administração de SGBD',
        criado_por_id: admin1.id
      }
    });

    const engSoft = await prisma.disciplina.create({
      data: {
        nome: 'Engenharia de Software',
        codigo: 'ENGSW',
        descricao: 'Metodologias e práticas para desenvolvimento de software',
        carga_horaria: 60,
        ementa: 'Ciclo de vida do software, requisitos, testes e metodologias ágeis',
        criado_por_id: admin2.id
      }
    });

    const estrutDados = await prisma.disciplina.create({
      data: {
        nome: 'Estrutura de Dados',
        codigo: 'ED',
        descricao: 'Estruturas de dados avançadas e algoritmos de ordenação',
        carga_horaria: 80,
        ementa: 'Árvores, grafos, algoritmos de busca e ordenação, complexidade',
        criado_por_id: admin2.id
      }
    });

    const redesComp = await prisma.disciplina.create({
      data: {
        nome: 'Redes de Computadores',
        codigo: 'REDES',
        descricao: 'Fundamentos de redes e protocolos de comunicação',
        carga_horaria: 60,
        ementa: 'Modelo OSI, TCP/IP, roteamento e segurança em redes',
        criado_por_id: admin1.id
      }
    });

    console.log('✔ Disciplinas criadas');

    // 5. Vincular disciplinas aos cursos
    console.log('🔗 Vinculando disciplinas aos cursos...');
    await prisma.cursoDisciplina.createMany({
      data: [
        // Engenharia de Software
        { curso_id: cursoEngSoft.id, disciplina_id: prog1.id },
        { curso_id: cursoEngSoft.id, disciplina_id: prog2.id },
        { curso_id: cursoEngSoft.id, disciplina_id: bd.id },
        { curso_id: cursoEngSoft.id, disciplina_id: engSoft.id },
        { curso_id: cursoEngSoft.id, disciplina_id: estrutDados.id },

        // Sistemas de Informação
        { curso_id: cursoSI.id, disciplina_id: prog1.id },
        { curso_id: cursoSI.id, disciplina_id: prog2.id },
        { curso_id: cursoSI.id, disciplina_id: bd.id },
        { curso_id: cursoSI.id, disciplina_id: redesComp.id },

        // Ciência da Computação
        { curso_id: cursoCC.id, disciplina_id: prog1.id },
        { curso_id: cursoCC.id, disciplina_id: prog2.id },
        { curso_id: cursoCC.id, disciplina_id: estrutDados.id },
        { curso_id: cursoCC.id, disciplina_id: redesComp.id },
      ]
    });
    console.log('✔ Disciplinas vinculadas aos cursos');

    // 6. Definir pré-requisitos
    console.log('📋 Definindo pré-requisitos...');
    await prisma.preRequisito.createMany({
      data: [
        { disciplina_id: prog2.id, disciplina_pre_requisito_id: prog1.id },
        { disciplina_id: bd.id, disciplina_pre_requisito_id: prog1.id },
        { disciplina_id: engSoft.id, disciplina_pre_requisito_id: prog2.id },
        { disciplina_id: estrutDados.id, disciplina_pre_requisito_id: prog2.id },
        { disciplina_id: redesComp.id, disciplina_pre_requisito_id: prog1.id },
      ]
    });
    console.log('✔ Pré-requisitos definidos');

    // 7. Criar turmas
    console.log('🏫 Criando turmas...');
    const turma1 = await prisma.turma.create({
      data: {
        codigo: 'PROG1-2024-1A',
        disciplina_id: prog1.id,
        professor_id: prof1.id,
        ano: 2024,
        semestre: 1,
        sala: 'Lab A-101',
        vagas: 30
      }
    });

    const turma2 = await prisma.turma.create({
      data: {
        codigo: 'BD-2024-1A',
        disciplina_id: bd.id,
        professor_id: prof2.id,
        ano: 2024,
        semestre: 1,
        sala: 'Sala B-201',
        vagas: 35
      }
    });

    const turma3 = await prisma.turma.create({
      data: {
        codigo: 'PROG2-2024-2A',
        disciplina_id: prog2.id,
        professor_id: prof3.id,
        ano: 2024,
        semestre: 2,
        sala: 'Lab A-102',
        vagas: 28
      }
    });

    const turma4 = await prisma.turma.create({
      data: {
        codigo: 'ED-2024-2A',
        disciplina_id: estrutDados.id,
        professor_id: prof4.id,
        ano: 2024,
        semestre: 2,
        sala: 'Sala C-301',
        vagas: 25
      }
    });

    console.log('✔ Turmas criadas');

    // 8. Adicionar horários para as turmas
    console.log('⏰ Criando horários das aulas...');
    await prisma.horarioAula.createMany({
      data: [
        // PROG1 - Segunda e Quarta 14:00-16:00
        { turma_id: turma1.id, dia_semana: DiaSemana.SEGUNDA, hora_inicio: '14:00', hora_fim: '16:00' },
        { turma_id: turma1.id, dia_semana: DiaSemana.QUARTA, hora_inicio: '14:00', hora_fim: '16:00' },

        // BD - Terça e Quinta 16:00-18:00
        { turma_id: turma2.id, dia_semana: DiaSemana.TERCA, hora_inicio: '16:00', hora_fim: '18:00' },
        { turma_id: turma2.id, dia_semana: DiaSemana.QUINTA, hora_inicio: '16:00', hora_fim: '18:00' },

        // PROG2 - Segunda e Quarta 16:00-18:00
        { turma_id: turma3.id, dia_semana: DiaSemana.SEGUNDA, hora_inicio: '16:00', hora_fim: '18:00' },
        { turma_id: turma3.id, dia_semana: DiaSemana.QUARTA, hora_inicio: '16:00', hora_fim: '18:00' },

        // ED - Terça e Quinta 14:00-16:00
        { turma_id: turma4.id, dia_semana: DiaSemana.TERCA, hora_inicio: '14:00', hora_fim: '16:00' },
        { turma_id: turma4.id, dia_semana: DiaSemana.QUINTA, hora_inicio: '14:00', hora_fim: '16:00' },
      ]
    });
    console.log('✔ Horários das aulas criados');

    // 9. Criar matrículas
    console.log('📝 Realizando matrículas...');
    const matricula1 = await prisma.matricula.create({
      data: { estudante_id: aluno1.id, turma_id: turma1.id, status: 'ATIVA' }
    });

    const matricula2 = await prisma.matricula.create({
      data: { estudante_id: aluno1.id, turma_id: turma2.id, status: 'ATIVA' }
    });

    const matricula3 = await prisma.matricula.create({
      data: { estudante_id: aluno2.id, turma_id: turma1.id, status: 'ATIVA' }
    });

    const matricula4 = await prisma.matricula.create({
      data: { estudante_id: aluno2.id, turma_id: turma3.id, status: 'ATIVA' }
    });

    const matricula5 = await prisma.matricula.create({
      data: { estudante_id: aluno3.id, turma_id: turma2.id, status: 'ATIVA' }
    });

    const matricula6 = await prisma.matricula.create({
      data: { estudante_id: aluno4.id, turma_id: turma4.id, status: 'ATIVA' }
    });

    const matricula7 = await prisma.matricula.create({
      data: { estudante_id: aluno5.id, turma_id: turma1.id, status: 'ATIVA' }
    });

    console.log('✔ Matrículas realizadas');

    // 10. Lançar notas
    console.log('📊 Lançando notas...');
    await prisma.nota.createMany({
      data: [
        // Notas do João (matricula1 - PROG1)
        { matricula_id: matricula1.id, tipo: 'PROVA_1', valor: 8.5, criado_por_id: prof1.id },
        { matricula_id: matricula1.id, tipo: 'TRABALHO_1', valor: 9.0, criado_por_id: prof1.id },
        { matricula_id: matricula1.id, tipo: 'PROVA_2', valor: 7.8, criado_por_id: prof1.id },

        // Notas do João (matricula2 - BD)
        { matricula_id: matricula2.id, tipo: 'PROVA_1', valor: 7.2, criado_por_id: prof2.id },
        { matricula_id: matricula2.id, tipo: 'PROJETO', valor: 8.8, criado_por_id: prof2.id },

        // Notas da Maria (matricula3 - PROG1)
        { matricula_id: matricula3.id, tipo: 'PROVA_1', valor: 9.2, criado_por_id: prof1.id },
        { matricula_id: matricula3.id, tipo: 'TRABALHO_1', valor: 8.7, criado_por_id: prof1.id },

        // Notas da Maria (matricula4 - PROG2)
        { matricula_id: matricula4.id, tipo: 'PROVA_1', valor: 8.9, criado_por_id: prof3.id },
        { matricula_id: matricula4.id, tipo: 'PROJETO', valor: 9.5, criado_por_id: prof3.id },

        // Notas do Lucas (matricula5 - BD)
        { matricula_id: matricula5.id, tipo: 'PROVA_1', valor: 6.8, criado_por_id: prof2.id },
        { matricula_id: matricula5.id, tipo: 'TRABALHO_1', valor: 7.5, criado_por_id: prof2.id },

        // Notas da Julia (matricula6 - ED)
        { matricula_id: matricula6.id, tipo: 'PROVA_1', valor: 9.1, criado_por_id: prof4.id },
        { matricula_id: matricula6.id, tipo: 'LISTA_EXERCICIOS', valor: 8.6, criado_por_id: prof4.id },

        // Notas do Rafael (matricula7 - PROG1)
        { matricula_id: matricula7.id, tipo: 'PROVA_1', valor: 7.9, criado_por_id: prof1.id },
        { matricula_id: matricula7.id, tipo: 'TRABALHO_1', valor: 8.3, criado_por_id: prof1.id },
      ]
    });
    console.log('✔ Notas lançadas');

    // 11. Registrar frequências
    console.log('📅 Registrando frequências...');
    const baseDate = new Date('2024-03-01T00:00:00Z');

    await prisma.frequencia.createMany({
      data: [
        // Frequências PROG1 (Turma 1)
        { matricula_id: matricula1.id, data_aula: new Date(baseDate.getTime() + 0 * 24 * 60 * 60 * 1000), presente: true, registrado_por_id: prof1.id },
        { matricula_id: matricula1.id, data_aula: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000), presente: true, registrado_por_id: prof1.id },
        { matricula_id: matricula1.id, data_aula: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000), presente: false, registrado_por_id: prof1.id },

        { matricula_id: matricula3.id, data_aula: new Date(baseDate.getTime() + 0 * 24 * 60 * 60 * 1000), presente: true, registrado_por_id: prof1.id },
        { matricula_id: matricula3.id, data_aula: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000), presente: true, registrado_por_id: prof1.id },
        { matricula_id: matricula3.id, data_aula: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000), presente: true, registrado_por_id: prof1.id },

        { matricula_id: matricula7.id, data_aula: new Date(baseDate.getTime() + 0 * 24 * 60 * 60 * 1000), presente: true, registrado_por_id: prof1.id },
        { matricula_id: matricula7.id, data_aula: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000), presente: false, registrado_por_id: prof1.id },

        // Frequências BD (Turma 2)
        { matricula_id: matricula2.id, data_aula: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000), presente: true, registrado_por_id: prof2.id },
        { matricula_id: matricula2.id, data_aula: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000), presente: true, registrado_por_id: prof2.id },
        { matricula_id: matricula2.id, data_aula: new Date(baseDate.getTime() + 8 * 24 * 60 * 60 * 1000), presente: false, registrado_por_id: prof2.id },

        { matricula_id: matricula5.id, data_aula: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000), presente: true, registrado_por_id: prof2.id },
        { matricula_id: matricula5.id, data_aula: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000), presente: true, registrado_por_id: prof2.id },

        // Frequências PROG2 (Turma 3)
        { matricula_id: matricula4.id, data_aula: new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000), presente: true, registrado_por_id: prof3.id },
        { matricula_id: matricula4.id, data_aula: new Date(baseDate.getTime() + 16 * 24 * 60 * 60 * 1000), presente: true, registrado_por_id: prof3.id },

        // Frequências ED (Turma 4)
        { matricula_id: matricula6.id, data_aula: new Date(baseDate.getTime() + 15 * 24 * 60 * 60 * 1000), presente: true, registrado_por_id: prof4.id },
        { matricula_id: matricula6.id, data_aula: new Date(baseDate.getTime() + 17 * 24 * 60 * 60 * 1000), presente: true, registrado_por_id: prof4.id },
      ]
    });
    console.log('✔ Frequências registradas');

    // === RELATÓRIO FINAL ===
    console.log('\n🎉 Seed completo concluído com sucesso!');
    console.log('\n' + '='.repeat(60));
    console.log('📋 RESUMO DOS DADOS CRIADOS:');
    console.log('='.repeat(60));

    console.log('\n👥 USUÁRIOS DE ACESSO:');
    console.log('┌─────────────┬─────────────────────────┬─────────────────┐');
    console.log('│ Perfil      │ E-mail                  │ Senha           │');
    console.log('├─────────────┼─────────────────────────┼─────────────────┤');
    console.log('│ Admin       │ admin@uni.edu           │ Admin@123       │');
    console.log('│ Admin       │ roberto.admin@uni.edu   │ Admin@456       │');
    console.log('│ Professor   │ carlos.prof@uni.edu     │ Professor@123   │');
    console.log('│ Professor   │ ana.prof@uni.edu        │ Professor@456   │');
    console.log('│ Professor   │ pedro.prof@uni.edu      │ Professor@789   │');
    console.log('│ Professor   │ luciana.prof@uni.edu    │ Professor@101   │');
    console.log('│ Aluno       │ joao.aluno@uni.edu      │ Aluno@123       │');
    console.log('│ Aluno       │ maria.aluna@uni.edu     │ Aluno@456       │');
    console.log('│ Aluno       │ lucas.aluno@uni.edu     │ Aluno@789       │');
    console.log('│ Aluno       │ julia.aluna@uni.edu     │ Aluno@101       │');
    console.log('│ Aluno       │ rafael.aluno@uni.edu    │ Aluno@102       │');
    console.log('└─────────────┴─────────────────────────┴─────────────────┘');

    console.log('\n🎓 ESTRUTURA ACADÊMICA:');
    console.log('• 3 Cursos: Engenharia de Software, Sistemas de Informação, Ciência da Computação');
    console.log('• 6 Disciplinas: PROG1, PROG2, BD, ENGSW, ED, REDES');
    console.log('• 4 Turmas ativas com horários definidos');
    console.log('• 7 Matrículas com notas e frequências');
    console.log('• Pré-requisitos configurados entre disciplinas');

    console.log('\n📊 DADOS PARA TESTES:');
    console.log('• Turmas: PROG1-2024-1A, BD-2024-1A, PROG2-2024-2A, ED-2024-2A');
    console.log('• Alunos com matrículas: 20240001 a 20240005');
    console.log('• Notas lançadas para demonstração');
    console.log('• Frequências registradas com presenças e faltas');

    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('• Acesse http://localhost:3000/api para ver a documentação');
    console.log('• Faça login com qualquer usuário acima');
    console.log('• Teste os endpoints de cadastro (apenas admins)');
    console.log('• Explore as funcionalidades do sistema');

    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

# Diagrama UML do Sistema Educatio

Este documento contém o diagrama UML que representa o modelo de dados do Sistema Educatio, baseado no schema do Prisma.

## Diagrama

O diagrama UML completo está disponível no arquivo `diagrama-uml.puml`. Você pode visualizá-lo usando ferramentas como:

- [PlantUML Online Server](https://www.plantuml.com/plantuml/uml/)
- [PlantText](https://www.planttext.com/)
- Extensão PlantUML para VS Code

## Entidades

### Usuário

- Representa os três tipos de usuários do sistema: admin, professor e aluno
- Atributos principais: id, nome, email, senha, role (perfil)
- Um usuário pode ministrar turmas (se for professor), ter matrículas (se for aluno) e criar cursos/disciplinas (se for admin)

### Curso

- Representa um curso oferecido pela instituição
- Atributos principais: id, nome, código, descrição
- Um curso contém várias disciplinas

### Disciplina

- Representa uma disciplina que pode fazer parte de vários cursos
- Atributos principais: id, nome, código, carga horária, ementa
- Uma disciplina pode ter pré-requisitos (outras disciplinas) e várias turmas

### Turma

- Representa uma oferta específica de uma disciplina em um período
- Atributos principais: id, código, ano, semestre, sala, vagas
- Uma turma possui horários de aula e pode ter vários alunos matriculados

### HorarioAula

- Armazena os horários específicos de uma turma
- Atributos principais: id, dia da semana, hora de início, hora de fim
- Cada turma pode ter múltiplos horários em diferentes dias da semana

### Matricula

- Relaciona um aluno a uma turma específica
- Atributos principais: id, status
- Cada matrícula pode ter várias notas e registros de frequência

### Nota

- Registra as notas dos alunos em suas matrículas
- Atributos principais: id, tipo, valor
- Cada nota está associada a uma matrícula específica

### Frequencia

- Registra a presença dos alunos nas aulas
- Atributos principais: id, data da aula, presença
- Cada registro de frequência está associado a uma matrícula específica

## Relacionamentos

1. **Professor → Turmas**: Um professor ministra várias turmas
2. **Aluno → Matrículas**: Um aluno pode ter várias matrículas em diferentes turmas
3. **Admin → Cursos/Disciplinas**: Um administrador cria cursos e disciplinas
4. **Disciplina → Turmas**: Uma disciplina pode ter várias turmas
5. **Turma → Horários**: Uma turma possui vários horários de aula
6. **Turma → Matrículas**: Uma turma tem vários alunos matriculados
7. **Matrícula → Notas/Frequências**: Uma matrícula tem várias notas e registros de frequência
8. **Disciplina → Pré-requisitos**: Uma disciplina pode ter outras disciplinas como pré-requisitos
9. **Curso → Disciplinas**: Um curso contém várias disciplinas

## Como usar este diagrama

Este diagrama serve como referência para compreender a estrutura de dados do sistema e pode ser utilizado para:

1. Comunicação entre a equipe de desenvolvimento
2. Documentação do sistema
3. Planejamento de novas funcionalidades
4. Compreensão das relações entre as entidades

Para atualizar este diagrama quando o schema do Prisma for modificado, altere o arquivo `diagrama-uml.puml` e gere uma nova versão visual.

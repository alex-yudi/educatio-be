# 🗃️ Modelo de Dados - Sistema Educatio

## 📋 Visão Geral

Este documento descreve o modelo de dados completo do Sistema Educatio, baseado no schema Prisma atualizado. O sistema suporta gestão completa de usuários, cursos, disciplinas, turmas, matrículas, notas e frequências.

## 🔗 Diagrama UML

O diagrama UML completo está disponível no arquivo `diagrama-uml.puml`. Para visualizar:

- [PlantUML Online Server](https://www.plantuml.com/plantuml/uml/)
- [PlantText](https://www.planttext.com/)
- Extensão PlantUML para VS Code

## 📊 Entidades Principais

### 👤 Usuario

**Descrição:** Entidade central que representa todos os tipos de usuários do sistema

**Campos:**

- `id` (Int): Identificador único
- `nome` (String): Nome completo do usuário
- `email` (String): Email único para login
- `senha` (String): Senha hash para autenticação
- `role` (EnumPerfil): Tipo de usuário (admin, professor, aluno)
- `matricula` (String?): Número de matrícula (apenas para alunos)
- `criado_em` (DateTime): Data de criação
- `atualizado_em` (DateTime): Data da última atualização

**Relacionamentos:**

- `turmasMinistradas`: Turmas que o usuário ministra (se professor)
- `matriculas`: Matrículas do usuário (se aluno)
- `cursosCriados`: Cursos criados pelo usuário (se admin)
- `Nota`: Notas lançadas pelo usuário
- `Frequencia`: Frequências registradas pelo usuário

### 🎓 Curso

**Descrição:** Representa um curso oferecido pela instituição

**Campos:**

- `id` (Int): Identificador único
- `nome` (String): Nome do curso
- `codigo` (String): Código único do curso
- `descricao` (String?): Descrição detalhada
- `criado_por_id` (Int): ID do usuário que criou
- `criado_em` (DateTime): Data de criação
- `atualizado_em` (DateTime): Data da última atualização

**Relacionamentos:**

- `disciplinas`: Disciplinas associadas ao curso (via CursoDisciplina)
- `criado_por`: Usuário que criou o curso

### 📚 Disciplina

**Descrição:** Representa uma disciplina que pode fazer parte de vários cursos

**Campos:**

- `id` (Int): Identificador único
- `nome` (String): Nome da disciplina
- `codigo` (String): Código único da disciplina
- `descricao` (String?): Descrição da disciplina
- `carga_horaria` (Int): Carga horária em horas
- `ementa` (String?): Ementa detalhada
- `criado_por_id` (Int): ID do usuário que criou
- `criado_em` (DateTime): Data de criação
- `atualizado_em` (DateTime): Data da última atualização

**Relacionamentos:**

- `turmas`: Turmas da disciplina
- `cursos`: Cursos que incluem a disciplina (via CursoDisciplina)
- `pre_requisitos`: Pré-requisitos da disciplina
- `criado_por`: Usuário que criou a disciplina

### 🏫 Turma

**Descrição:** Representa uma oferta específica de uma disciplina em um período

**Campos:**

- `id` (Int): Identificador único
- `codigo` (String): Código único da turma
- `disciplina_id` (Int): ID da disciplina
- `professor_id` (Int): ID do professor responsável
- `ano` (Int): Ano letivo
- `semestre` (Int): Semestre (1 ou 2)
- `sala` (String?): Sala onde ocorrem as aulas
- `vagas` (Int): Número de vagas (padrão: 30)
- `criado_em` (DateTime): Data de criação
- `atualizado_em` (DateTime): Data da última atualização

**Relacionamentos:**

- `disciplina`: Disciplina da turma
- `professor`: Professor responsável
- `horarios`: Horários de aula
- `matriculas`: Matrículas na turma

### 📝 Matricula

**Descrição:** Relaciona um aluno a uma turma específica

**Campos:**

- `id` (Int): Identificador único
- `estudante_id` (Int): ID do aluno
- `turma_id` (Int): ID da turma
- `status` (String): Status da matrícula (padrão: "ATIVA")
- `criado_em` (DateTime): Data de criação
- `atualizado_em` (DateTime): Data da última atualização

**Relacionamentos:**

- `estudante`: Aluno matriculado
- `turma`: Turma da matrícula
- `notas`: Notas da matrícula
- `frequencias`: Frequências da matrícula

**Restrições:**

- Chave única: `(estudante_id, turma_id)` - um aluno não pode se matricular duas vezes na mesma turma

### 📊 Frequencia

**Descrição:** Registra a presença/ausência de um aluno em uma aula

**Campos:**

- `id` (Int): Identificador único
- `matricula_id` (Int): ID da matrícula
- `data_aula` (DateTime): Data e hora da aula
- `presente` (Boolean): Status de presença (padrão: true)
- `registrado_por_id` (Int): ID do professor que registrou
- `criado_em` (DateTime): Data de criação
- `atualizado_em` (DateTime): Data da última atualização

**Relacionamentos:**

- `matricula`: Matrícula do aluno
- `registrado_por`: Professor que registrou a frequência

### 📋 Nota

**Descrição:** Armazena as notas dos alunos

**Campos:**

- `id` (Int): Identificador único
- `matricula_id` (Int): ID da matrícula
- `tipo` (String): Tipo de avaliação (P1, P2, Projeto, etc.)
- `valor` (Float): Valor da nota
- `criado_por_id` (Int): ID do professor que lançou
- `criado_em` (DateTime): Data de criação
- `atualizado_em` (DateTime): Data da última atualização

**Relacionamentos:**

- `matricula`: Matrícula do aluno
- `criado_por`: Professor que lançou a nota

## 🔗 Entidades de Relacionamento

### CursoDisciplina

**Descrição:** Relaciona cursos com suas disciplinas (Many-to-Many)

**Campos:**

- `curso_id` (Int): ID do curso
- `disciplina_id` (Int): ID da disciplina
- `criado_em` (DateTime): Data de criação

**Chave Primária:** Composta por `(curso_id, disciplina_id)`

### PreRequisito

**Descrição:** Define pré-requisitos entre disciplinas

**Campos:**

- `disciplina_id` (Int): ID da disciplina
- `disciplina_pre_requisito_id` (Int): ID da disciplina pré-requisito
- `criado_em` (DateTime): Data de criação

**Chave Primária:** Composta por `(disciplina_id, disciplina_pre_requisito_id)`

### HorarioAula

**Descrição:** Define os horários de uma turma

**Campos:**

- `id` (Int): Identificador único
- `turma_id` (Int): ID da turma
- `dia_semana` (DiaSemana): Dia da semana (SEGUNDA, TERCA, etc.)
- `hora_inicio` (String): Hora de início (formato HH:MM)
- `hora_fim` (String): Hora de fim (formato HH:MM)
- `criado_em` (DateTime): Data de criação
- `atualizado_em` (DateTime): Data da última atualização

## 📋 Enums

### EnumPerfil

- `admin`: Administrador do sistema
- `professor`: Professor da instituição
- `aluno`: Aluno matriculado

### DiaSemana

- `SEGUNDA`, `TERCA`, `QUARTA`, `QUINTA`, `SEXTA`, `SABADO`

## 🔒 Regras de Integridade

### Exclusões com Restrições:

1. **Aluno**: Não pode ser excluído se tiver matrículas ativas
2. **Professor**: Não pode ser excluído se tiver turmas ativas
3. **Disciplina**: Não pode ser excluída se tiver turmas ativas ou estar associada a cursos
4. **Turma**: Não pode ser excluída se tiver matrículas ativas
5. **Curso**: Não pode ser excluído se suas disciplinas tiverem turmas ativas

### Unicidade:

- Email de usuário deve ser único
- Matrícula de aluno deve ser única
- Código de curso deve ser único
- Código de disciplina deve ser único
- Código de turma deve ser único
- Combinação (estudante_id, turma_id) deve ser única

## 🎯 Considerações de Design

1. **Flexibilidade**: O modelo suporta múltiplos cursos, disciplinas compartilhadas e pré-requisitos complexos
2. **Auditoria**: Todas as entidades possuem timestamps de criação e atualização
3. **Segurança**: Senhas são armazenadas como hash, nunca em texto plano
4. **Escalabilidade**: Relacionamentos bem definidos permitem crescimento sem reestruturação major
5. **Integridade**: Restrições de chave estrangeira garantem consistência dos dados

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

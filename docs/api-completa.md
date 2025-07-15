# 📋 API Educatio - Documentação Completa

## 🎯 Visão Geral

A API do Sistema Educatio oferece endpoints completos para gestão acadêmica, incluindo operações CRUD para todos os recursos principais e funcionalidades avançadas como controle de frequência.

## 🔐 Autenticação

Todos os endpoints protegidos exigem autenticação via **Bearer Token (JWT)**.

### Endpoints de Autenticação

#### Login

```
POST /auth/login
```

**Descrição:** Autentica usuário e retorna JWT token

**Body:**

```json
{
  "email": "admin@educatio.com",
  "senha": "admin123"
}
```

**Resposta:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nome": "Administrador",
    "email": "admin@educatio.com",
    "role": "admin"
  }
}
```

#### Verificar Token

```
GET /auth/verificar
```

**Descrição:** Valida token JWT e retorna dados do usuário

## 👥 Gestão de Usuários

### 🎓 Alunos

#### Listar Alunos

```
GET /alunos
```

**Acesso:** Admin, Professor
**Retorna:** Lista de todos os alunos

#### Buscar Aluno por ID

```
GET /alunos/:id
```

**Acesso:** Admin, Professor

#### Cadastrar Aluno

```
POST /alunos
```

**Acesso:** Admin
**Body:**

```json
{
  "nome": "João Silva",
  "email": "joao.silva@email.com",
  "matricula": "2025001"
}
```

#### Atualizar Aluno

```
PUT /alunos/:id
```

**Acesso:** Admin

#### Excluir Aluno

```
DELETE /alunos/:id
```

**Acesso:** Admin
**Restrição:** Não pode ter matrículas ativas

### 👨‍🏫 Professores

#### Listar Professores

```
GET /professores
```

**Acesso:** Admin, Professor

#### Buscar Professor por ID

```
GET /professores/:id
```

**Acesso:** Admin, Professor

#### Cadastrar Professor

```
POST /professores
```

**Acesso:** Admin
**Body:**

```json
{
  "nome": "Maria Santos",
  "email": "maria.santos@instituicao.edu.br"
}
```

**Resposta:** Inclui senha temporária gerada automaticamente

#### Atualizar Professor

```
PUT /professores/:id
```

**Acesso:** Admin

#### Excluir Professor

```
DELETE /professores/:id
```

**Acesso:** Admin
**Restrição:** Não pode ter turmas ativas

## 📚 Gestão Acadêmica

### 🎯 Cursos

#### Listar Cursos

```
GET /cursos
```

**Acesso:** Admin

#### Buscar Curso por ID

```
GET /cursos/:id
```

**Acesso:** Admin

#### Cadastrar Curso

```
POST /cursos
```

**Acesso:** Admin
**Body:**

```json
{
  "nome": "Engenharia de Software",
  "codigo": "ES001",
  "descricao": "Curso de graduação em Engenharia de Software",
  "disciplina_ids": [1, 2, 3]
}
```

#### Atualizar Curso

```
PUT /cursos/:id
```

**Acesso:** Admin

#### Excluir Curso

```
DELETE /cursos/:id
```

**Acesso:** Admin
**Restrição:** Disciplinas não podem ter turmas ativas

### 📖 Disciplinas

#### Listar Disciplinas

```
GET /disciplinas
```

**Acesso:** Admin

#### Buscar Disciplina por ID

```
GET /disciplinas/:id
```

**Acesso:** Admin

#### Cadastrar Disciplina

```
POST /disciplinas
```

**Acesso:** Admin
**Body:**

```json
{
  "nome": "Programação Orientada a Objetos",
  "codigo": "POO001",
  "carga_horaria": 60,
  "ementa": "Conceitos fundamentais de POO...",
  "descricao": "Disciplina introdutória de POO"
}
```

#### Atualizar Disciplina

```
PUT /disciplinas/:id
```

**Acesso:** Admin

#### Excluir Disciplina

```
DELETE /disciplinas/:id
```

**Acesso:** Admin
**Restrições:**

- Não pode ter turmas ativas
- Não pode estar associada a cursos

### 🏫 Turmas

#### Listar Turmas

```
GET /turmas
```

**Acesso:** Admin, Professor

#### Buscar Turma por ID

```
GET /turmas/:id
```

**Acesso:** Admin, Professor

#### Cadastrar Turma

```
POST /turmas
```

**Acesso:** Admin
**Body:**

```json
{
  "codigo": "POO001-2025-1",
  "disciplina_id": 1,
  "professor_id": 2,
  "ano": 2025,
  "semestre": 1,
  "sala": "Lab 101",
  "vagas": 30,
  "horarios": [
    {
      "dia_semana": "SEGUNDA",
      "hora_inicio": "08:00",
      "hora_fim": "10:00"
    }
  ]
}
```

#### Atualizar Turma

```
PUT /turmas/:id
```

**Acesso:** Admin

#### Excluir Turma

```
DELETE /turmas/:id
```

**Acesso:** Admin
**Restrição:** Não pode ter matrículas ativas

### 📝 Matrículas

#### Cadastrar Matrícula

```
POST /matriculas
```

**Acesso:** Admin
**Body:**

```json
{
  "estudante_id": 3,
  "turma_id": 1
}
```

## 📊 Sistema de Frequência

### Lançar Frequência

```
POST /frequencia
```

**Acesso:** Professor (apenas da turma)
**Body:**

```json
{
  "turma_id": 1,
  "data_aula": "2025-07-14T08:00:00.000Z",
  "alunos_presentes": [3, 4, 5]
}
```

### Consultar Frequência

```
GET /frequencia/turma/:id
```

**Acesso:** Professor (apenas da turma)
**Query params opcionais:**

- `data_inicio`: Filtro por data inicial
- `data_fim`: Filtro por data final

### Alterar Frequência

```
PUT /frequencia/alterar
```

**Acesso:** Professor (apenas da turma)
**Body:**

```json
{
  "turma_id": 1,
  "data_aula": "2025-07-14T08:00:00.000Z",
  "alteracoes": [
    {
      "aluno_id": 3,
      "presente": false
    }
  ]
}
```

## 🛡️ Controle de Acesso

### Níveis de Acesso

1. **Admin (Administrador)**

   - Acesso total ao sistema
   - CRUD completo para todos os recursos
   - Único que pode cadastrar professores e alunos

2. **Professor**

   - Visualizar alunos e professores
   - Gerenciar frequência apenas das suas turmas
   - Consultar dados das suas turmas

3. **Aluno**
   - Acesso limitado (não implementado nesta versão)

### Guards Implementados

- `AdminGuard`: Permite apenas usuários admin
- `ProfessorGuard`: Permite apenas usuários professor
- `AdminProfessorGuard`: Permite admin e professor

## 📈 Códigos de Resposta HTTP

- `200 OK`: Operação realizada com sucesso
- `201 Created`: Recurso criado com sucesso
- `400 Bad Request`: Dados inválidos ou restrições não atendidas
- `401 Unauthorized`: Token inválido ou ausente
- `403 Forbidden`: Acesso negado (role insuficiente)
- `404 Not Found`: Recurso não encontrado
- `409 Conflict`: Conflito (email já cadastrado, etc.)

## 🔄 Tratamento de Erros

Todos os endpoints utilizam o decorador `@HandleErrors` para tratamento centralizado de erros com respostas padronizadas.

## 📋 Exemplo de Uso Completo

```bash
# 1. Fazer login como admin
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@educatio.com","senha":"admin123"}'

# 2. Usar token para cadastrar professor
curl -X POST http://localhost:3000/professores \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Professor","email":"joao@escola.com"}'

# 3. Login como professor com senha temporária
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@escola.com","senha":"SENHA_TEMPORARIA"}'
```

## 📚 Documentação Interativa

Acesse a documentação Swagger completa em:
**http://localhost:3000/api**

# 🚀 Educatio API - Referência Rápida

## ⚡ Quick Start

### 1. Setup Inicial

```bash
# Clone e configure
git clone https://github.com/alex-yudi/educatio-be.git
cd educatio-be
npm install

# Configure environment
cp example.env .env
# Edite .env com suas configurações

# Start database
docker compose up -d

# Run migrations e seed
npx prisma migrate dev
npx prisma db seed

# Start application
npm run start:dev
```

### 2. Acesso Swagger

**URL:** http://localhost:3000/api

### 3. Usuários Padrão (seed)

```json
// Admin
{
  "email": "admin@educatio.com",
  "senha": "admin123"
}

// Professor (exemplo)
{
  "email": "professor@educatio.com",
  "senha": "prof123"
}
```

## 🎯 Endpoints Essenciais

### 🔐 Autenticação

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@educatio.com","senha":"admin123"}'

# Response: { "accessToken": "jwt_token", "user": {...} }
```

### 👥 Gestão de Usuários

#### Cadastrar Professor (Admin)

```bash
curl -X POST http://localhost:3000/professores \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Professor","email":"joao@escola.com"}'

# Response inclui senha_temporaria gerada automaticamente
```

#### Cadastrar Aluno (Admin)

```bash
curl -X POST http://localhost:3000/alunos \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Maria Aluna","email":"maria@email.com","matricula":"2025001"}'
```

### 📚 Gestão Acadêmica

#### Cadastrar Disciplina

```bash
curl -X POST http://localhost:3000/disciplinas \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Programação Web",
    "codigo": "PW001",
    "carga_horaria": 60,
    "ementa": "Desenvolvimento de aplicações web..."
  }'
```

#### Criar Turma

```bash
curl -X POST http://localhost:3000/turmas \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "PW001-2025-1",
    "disciplina_id": 1,
    "professor_id": 2,
    "ano": 2025,
    "semestre": 1,
    "vagas": 30,
    "horarios": [
      {
        "dia_semana": "SEGUNDA",
        "hora_inicio": "08:00",
        "hora_fim": "10:00"
      }
    ]
  }'
```

### 📊 Sistema de Frequência

#### Lançar Frequência (Professor)

```bash
curl -X POST http://localhost:3000/frequencia \
  -H "Authorization: Bearer JWT_TOKEN_PROFESSOR" \
  -H "Content-Type: application/json" \
  -d '{
    "turma_id": 1,
    "data_aula": "2025-07-14T08:00:00.000Z",
    "alunos_presentes": [3, 4, 5]
  }'
```

## 🔒 Controle de Acesso

| Ação              | Admin | Professor        | Aluno |
| ----------------- | ----- | ---------------- | ----- |
| CRUD Usuários     | ✅    | ❌               | ❌    |
| CRUD Acadêmico    | ✅    | ❌               | ❌    |
| Lançar Frequência | ❌    | ✅ (suas turmas) | ❌    |
| Consultar Dados   | ✅    | ✅ (limitado)    | ❌    |

## 🛡️ Guards Implementados

- `@UseGuards(AdminGuard)` - Apenas admin
- `@UseGuards(ProfessorGuard)` - Apenas professor
- `@UseGuards(AdminProfessorGuard)` - Admin ou professor

## 📋 Decoradores Customizados

- `@HandleErrors('mensagem')` - Tratamento centralizado de erros
- `@ApiBearerAuth()` - Documentação de autenticação

## 🗃️ Estrutura do Banco

```sql
-- Principais tabelas
Usuario (id, nome, email, senha, role, matricula)
Curso (id, nome, codigo, descricao)
Disciplina (id, nome, codigo, carga_horaria, ementa)
Turma (id, codigo, disciplina_id, professor_id, ano, semestre)
Matricula (id, estudante_id, turma_id, status)
Frequencia (id, matricula_id, data_aula, presente)
```

## ⚠️ Restrições de Deleção

- **Aluno**: Não pode ser excluído com matrículas ativas
- **Professor**: Não pode ser excluído com turmas ativas
- **Disciplina**: Não pode ser excluída com turmas ativas ou cursos associados
- **Turma**: Não pode ser excluída com matrículas ativas
- **Curso**: Não pode ser excluído com disciplinas que têm turmas ativas

## 🐛 Debugging

### Logs da Aplicação

```bash
# Development logs
npm run start:dev

# Database logs
docker compose logs db
```

### Prisma Studio

```bash
npx prisma studio
# Abre interface visual do banco em http://localhost:5555
```

### Reset do Banco

```bash
# CUIDADO: Apaga todos os dados
npx prisma migrate reset
```

## 📊 Status Codes Comuns

- `200` - Sucesso
- `201` - Criado
- `400` - Dados inválidos
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Não encontrado
- `409` - Conflito (email duplicado, etc.)

## 🔧 Comandos Úteis

```bash
# Build production
npm run build

# Run tests
npm run test

# Format code
npm run format

# Lint code
npm run lint

# Generate Prisma client
npx prisma generate

# View database
npx prisma studio
```

## 📞 Troubleshooting

### Erro de Conexão com Banco

1. Verificar se PostgreSQL está rodando: `docker compose ps`
2. Verificar variáveis de ambiente no `.env`
3. Executar migrations: `npx prisma migrate dev`

### Token JWT Inválido

1. Verificar se token está sendo enviado no header `Authorization: Bearer TOKEN`
2. Verificar se token não expirou
3. Fazer novo login para obter token válido

### Erro de Permissão

1. Verificar role do usuário logado
2. Confirmar se endpoint permite o role atual
3. Usar usuário admin para operações de gestão

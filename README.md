Coletando informações do workspace# Sistema Educatio - Backend

## 📋 Descrição

Este é o backend do Sistema Educatio, uma aplicação REST para gerenciamento acadêmico desenvolvida com **NestJS**, **Prisma** e **PostgreSQL**. O sistema permite o cadastro e gerenciamento de usuários (admins, professores e alunos), disciplinas, turmas, matrículas, notas e frequências.

## 🚀 Funcionalidades

- **Autenticação JWT** com perfis de usuário (Admin, Professor, Aluno)
- **Cadastro de Alunos** com geração de matrícula automática
- **Gestão de Disciplinas** com carga horária e ementa
- **Criação de Turmas** com horários e controle de vagas
- **Sistema de Matrículas** com validações
- **Controle de Acesso** por perfil de usuário
- **Documentação Swagger** completa
- **Validação de Dados** com class-validator
- **Estrutura REST** bem organizada

## ⚙️ Configuração do Projeto

### Pré-requisitos

- Node.js (versão 18 ou superior)
- Docker e Docker Compose
- npm (gerenciador de pacotes do Node.js)

### Instalação

1. **Clone o repositório**

   ```bash
   git clone [url-do-repositorio]
   cd educatio-be
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp example.env .env
   # Edite o arquivo .env com suas configurações
   ```
4. **Inicie o banco de dados PostgreSQL com Docker**

   ```bash
   docker compose up -d
   ```

5. **Execute as migrações do Prisma**

   ```bash
   npx prisma migrate dev
   ```

6. **Popule o banco de dados com dados iniciais**

   ```bash
   npm run seed
   ```

7. **Inicie o servidor de desenvolvimento**

   ```bash
   npm run start:dev
   ```

8. **Acesse a documentação Swagger**
   ```
   http://localhost:3000/api
   ```

## 📊 Dados de Teste

Após executar o seed, você terá os seguintes usuários disponíveis:

### 👨‍💼 Administradores

- **Email:** `admin@uni.edu` - **Senha:** `Admin@123`
- **Email:** `roberto.admin@uni.edu` - **Senha:** `Admin@456`

### 👨‍🏫 Professores

- **Email:** `carlos.prof@uni.edu` - **Senha:** `Professor@123`
- **Email:** `ana.prof@uni.edu` - **Senha:** `Professor@456`
- **Email:** `pedro.prof@uni.edu` - **Senha:** `Professor@789`

### 🎓 Alunos

- **Email:** `joao.aluno@uni.edu` - **Senha:** `Aluno@123`
- **Email:** `maria.aluna@uni.edu` - **Senha:** `Aluno@456`
- **Email:** `lucas.aluno@uni.edu` - **Senha:** `Aluno@789`

## 🛠 Estrutura da API

### Autenticação

- `POST /auth/login` - Login do usuário

### Alunos (Requer Admin)

- `POST /alunos` - Cadastrar novo aluno

### Disciplinas (Requer Admin)

- `POST /disciplinas` - Cadastrar nova disciplina

### Matrículas (Requer Admin)

- `POST /matriculas` - Realizar matrícula de aluno

## 📋 Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev          # Inicia o servidor em modo desenvolvimento
npm run start:debug        # Inicia o servidor em modo debug
npm run start:prod         # Inicia o servidor em modo produção

# Build
npm run build              # Compila o projeto

# Testes
npm run test               # Executa os testes unitários
npm run test:e2e           # Executa os testes e2e
npm run test:cov           # Executa os testes com cobertura

# Prisma
npm run seed               # Popula o banco com dados iniciais
npx prisma studio          # Abre interface visual do banco
npx prisma migrate dev     # Executa migrações
```

## 🗄️ Estrutura do Banco de Dados

O sistema utiliza PostgreSQL com as seguintes entidades principais:

- **Usuario** - Administradores, Professores e Alunos
- **Curso** - Cursos oferecidos pela instituição
- **Disciplina** - Disciplinas dos cursos
- **Turma** - Turmas específicas de disciplinas
- **Matricula** - Matrículas dos alunos nas turmas
- **Nota** - Notas dos alunos
- **Frequencia** - Controle de presença
- **HorarioAula** - Horários das turmas

## 🏗️ Arquitetura

```
src/
├── auth/           # Módulo de autenticação
├── users/          # Gestão de usuários e DTOs
├── alunos/         # Endpoints de alunos
├── disciplinas/    # Endpoints de disciplinas
├── matriculas/     # Endpoints de matrículas
├── prisma/         # Configuração do Prisma
└── utils/          # Utilitários (hash de senha, etc.)
```

## 🔒 Autorização

- **Endpoints públicos:** Login
- **Endpoints protegidos (Admin apenas):** Cadastros de alunos, disciplinas e matrículas
- **Sistema de roles:** admin, professor, aluno

## 📖 Documentação

A documentação completa da API está disponível via Swagger em:
`http://localhost:3000/api`

## 🐳 Docker

O projeto inclui configuração Docker Compose para PostgreSQL:

```bash
# Iniciar o banco
docker compose up -d

# Parar o banco
docker compose down

# Ver logs
docker compose logs
```

## 📝 Modelo de Dados

Consulte o arquivo `docs/diagrama-uml.puml` para ver o diagrama UML completo das entidades e relacionamentos do sistema.

## 🛣️ Roadmap

- [ ] Endpoints de listagem e consulta
- [ ] Sistema de turmas e horários
- [ ] Controle de notas e frequência
- [ ] Relatórios acadêmicos
- [ ] API de notificações
- [ ] Dashboard administrativo

## Executando a Aplicação

```bash
# modo de desenvolvimento
npm run start:dev

# modo de produção
npm run build
npm run start:prod
```

## Swagger API

Após iniciar a aplicação, você pode acessar a documentação Swagger em:

```
http://localhost:3000/api
```

## Estrutura do Projeto

- src - Código fonte da aplicação

  - prisma - Serviço de acesso ao banco de dados
  - `users/` - Módulo de usuários
  - `prisma-client-exception/` - Tratamento de exceções do Prisma

- prisma - Definição do esquema do banco de dados e migrações
  - schema.prisma - Modelo de dados
  - `migrations/` - Migrações do banco de dados
  - seed.ts - Script para população inicial do banco

## Testes

```bash
# testes unitários
npm run test

# testes e2e
npm run test:e2e

# cobertura de testes
npm run test:cov
```

## Usuários de Teste

Após executar o seed, os seguintes usuários estarão disponíveis:

- **Chefe de Departamento**

  - Email: chefe.dcomp@uni.edu
  - Senha: Chefe@123

- **Professor**

  - Email: carlos.prof@uni.edu
  - Senha: Professor@123

- **Aluno**
  - Email: joao.aluno@uni.edu
  - Senha: Aluno@123

# educatio-be

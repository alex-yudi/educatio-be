# Sistema Educatio - Backend

## 📋 Descrição do Projeto

O **Sistema Educatio** é uma aplicação backend robusta para gerenciamento acadêmico, desenvolvida com tecnologias modernas e escaláveis. O sistema oferece uma API REST completa para administração de instituições de ensino.

### 🛠️ Tecnologias Utilizadas
- **NestJS** - Framework Node.js para aplicações backend escaláveis
- **Prisma ORM** - Ferramenta de mapeamento objeto-relacional moderna
- **PostgreSQL** - Banco de dados relacional robusto
- **TypeScript** - Linguagem com tipagem estática
- **JWT** - Autenticação segura com tokens
- **Swagger** - Documentação automática da API
- **Docker** - Containerização para desenvolvimento e produção

## 🚀 Funcionalidades Principais

### Gestão de Usuários
- **Autenticação JWT** com diferentes perfis (Admin, Professor, Aluno)
- **Controle de acesso** baseado em roles
- **Cadastro automatizado** de usuários com validações

### Gestão Acadêmica
- **Cursos** - Criação e organização de cursos
- **Disciplinas** - Gestão com carga horária, ementa e pré-requisitos
- **Turmas** - Controle de vagas, horários e salas
- **Matrículas** - Sistema completo de inscrições
- **Notas** - Lançamento e acompanhamento de notas
- **Frequências** - Controle de presença dos alunos

### Recursos Técnicos
- **Documentação Swagger** automática e interativa
- **Validação de dados** robusta com class-validator
- **Estrutura modular** bem organizada
- **Tratamento de erros** personalizado
- **Seeds** para dados de desenvolvimento

## ⚙️ Instalação e Configuração

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm (gerenciador de pacotes)
- Docker e Docker Compose (recomendado)

### Opção 1: Instalação com Docker (Recomendado)

1. **Clone o repositório**
   ```bash
   git clone https://github.com/alex-yudi/educatio-be.git
   cd educatio-be
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp example.env .env
   ```
   
   **Configuração do .env para Docker:**
   ```env
   # Configuração do Container PostgreSQL
   CONTAINER_NAME="educatio-db"
   POSTGRES_USER="postgres"
   POSTGRES_PASSWORD="postgres"
   POSTGRES_DB="educatio"
   DB_PORT="5432"

   # String de conexão para Docker
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/educatio?schema=public"

   # Autenticação JWT
   JWT_SECRET="seu-jwt-secret-super-seguro"
   JWT_EXPIRES_IN="24h"
   ```

4. **Inicie o banco PostgreSQL**
   ```bash
   docker compose up -d
   ```

5. **Execute as migrações do Prisma**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

6. **Popule o banco com dados iniciais**
   ```bash
   npm run seed
   ```

7. **Inicie o servidor**
   ```bash
   npm run start:dev
   ```

### Opção 2: Instalação com PostgreSQL Local

1. **Instale PostgreSQL** em sua máquina local

2. **Configure o banco de dados**
   ```sql
   CREATE DATABASE educatio;
   CREATE USER educatio_user WITH PASSWORD 'sua_senha';
   GRANT ALL PRIVILEGES ON DATABASE educatio TO educatio_user;
   ```

3. **Configure as variáveis de ambiente**
   ```env
   # Configuração do PostgreSQL Local
   DATABASE_URL="postgresql://educatio_user:sua_senha@localhost:5432/educatio?schema=public"

   # Autenticação JWT
   JWT_SECRET="seu-jwt-secret-super-seguro"
   JWT_EXPIRES_IN="24h"
   ```

4. **Execute as migrações e seed**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npm run seed
   ```

5. **Inicie o servidor**
   ```bash
   npm run start:dev
   ```

## 📋 Comandos Disponíveis

### Desenvolvimento
```bash
npm run start:dev          # Servidor em modo desenvolvimento com hot-reload
npm run start:debug        # Servidor em modo debug
npm run start:prod         # Servidor em modo produção
```

### Build e Deploy
```bash
npm run build              # Compilar o projeto TypeScript
npm run format             # Formatar código com Prettier
npm run lint               # Executar ESLint
```

### Banco de Dados
```bash
npm run seed               # Popular banco com dados de teste
npx prisma generate        # Gerar cliente Prisma
npx prisma migrate dev     # Executar migrações
npx prisma studio          # Interface visual do banco
npx prisma db push         # Sincronizar schema sem migração
```

### Testes
```bash
npm run test               # Testes unitários
npm run test:watch         # Testes em modo watch
npm run test:cov           # Testes com cobertura
npm run test:e2e           # Testes end-to-end
```

## 👥 Usuários de Teste

Após executar o comando `npm run seed`, os seguintes usuários estarão disponíveis:

### 🔑 Administradores
| Nome | Email | Senha |
|------|-------|-------|
| Maria Fernandes Silva | `admin@uni.edu` | `Admin@123` |
| Roberto Santos Oliveira | `roberto.admin@uni.edu` | `Admin@456` |

### 👨‍🏫 Professores
| Nome | Email | Senha |
|------|-------|-------|
| Carlos Andrade | `carlos.prof@uni.edu` | `Professor@123` |
| Ana Paula Oliveira | `ana.prof@uni.edu` | `Professor@456` |
| Pedro Henrique Costa | `pedro.prof@uni.edu` | `Professor@789` |
| Luciana Ferreira Silva | `luciana.prof@uni.edu` | `Professor@101` |

### 🎓 Alunos
| Nome | Email | Senha | Matrícula |
|------|-------|-------|-----------|
| João da Silva | `joao.aluno@uni.edu` | `Aluno@123` | 20240001 |
| Maria José Santos | `maria.aluna@uni.edu` | `Aluno@456` | 20240002 |
| Lucas Ferreira | `lucas.aluno@uni.edu` | `Aluno@789` | 20240003 |
| Julia Ribeiro | `julia.aluna@uni.edu` | `Aluno@101` | 20240004 |
| Rafael Sousa | `rafael.aluno@uni.edu` | `Aluno@102` | 20240005 |

## 📁 Estrutura do Projeto

```
educatio-be/
├── prisma/                    # Configuração do banco de dados
│   ├── migrations/           # Migrações do banco
│   ├── schema.prisma         # Schema do banco de dados
│   └── seed.ts              # Script de população inicial
├── src/                      # Código fonte da aplicação
│   ├── alunos/              # Módulo de gestão de alunos
│   ├── auth/                # Módulo de autenticação
│   ├── cursos/              # Módulo de gestão de cursos
│   ├── disciplinas/         # Módulo de gestão de disciplinas
│   ├── frequencia/          # Módulo de controle de frequência
│   ├── matriculas/          # Módulo de gestão de matrículas
│   ├── prisma/              # Configuração do cliente Prisma
│   ├── prisma-client-exception/ # Tratamento de exceções
│   ├── professores/         # Módulo de gestão de professores
│   ├── turmas/              # Módulo de gestão de turmas
│   ├── users/               # Módulo base de usuários
│   ├── utils/               # Utilitários (hash, validações)
│   ├── app.module.ts        # Módulo principal da aplicação
│   └── main.ts              # Ponto de entrada da aplicação
├── test/                     # Testes end-to-end
├── docs/                     # Documentação adicional
├── docker-compose.yaml       # Configuração Docker
├── example.env              # Exemplo de variáveis de ambiente
└── package.json             # Dependências e scripts
```

## 📖 Documentação da API

A documentação completa e interativa da API está disponível através do **Swagger UI**.

**Acesse:** http://localhost:3000/api

### Principais Endpoints

#### Autenticação
- `POST /auth/login` - Realizar login
- `GET /auth/verificar` - Verificar token JWT

#### Gestão de Usuários (Acesso Admin)
- `POST /alunos` - Cadastrar novo aluno
- `GET /alunos` - Listar todos os alunos
- `GET /alunos/:id` - Buscar aluno por ID
- `PUT /alunos/:id` - Atualizar dados do aluno
- `DELETE /alunos/:id` - Excluir aluno (sem matrículas ativas)

- `POST /professores` - Cadastrar novo professor (com senha temporária)
- `GET /professores` - Listar todos os professores
- `GET /professores/:id` - Buscar professor por ID
- `PUT /professores/:id` - Atualizar dados do professor
- `DELETE /professores/:id` - Excluir professor (sem turmas ativas)

#### Gestão Acadêmica (Acesso Admin)
- `POST /disciplinas` - Cadastrar nova disciplina
- `GET /disciplinas` - Listar todas as disciplinas
- `PUT /disciplinas/:id` - Atualizar disciplina
- `DELETE /disciplinas/:id` - Excluir disciplina (sem turmas/cursos)

- `POST /cursos` - Cadastrar novo curso
- `GET /cursos` - Listar todos os cursos
- `PUT /cursos/:id` - Atualizar curso
- `DELETE /cursos/:id` - Excluir curso (sem turmas ativas nas disciplinas)

- `POST /turmas` - Criar nova turma
- `GET /turmas` - Listar todas as turmas
- `PUT /turmas/:id` - Atualizar turma
- `DELETE /turmas/:id` - Excluir turma (sem matrículas ativas)

- `POST /matriculas` - Realizar matrícula

#### Sistema de Frequência (Acesso Professor)
- `POST /frequencia` - Lançar frequência de uma aula
- `GET /frequencia/turma/:id` - Consultar frequências de uma turma
- `PUT /frequencia/alterar` - Alterar frequência já registrada

### Como Testar a API

1. Acesse a documentação Swagger: http://localhost:3000/api
2. Utilize o endpoint `/auth/login` com um dos usuários listados
3. Copie o token JWT retornado
4. Use o botão "Authorize" no Swagger para adicionar o token
5. Teste os endpoints protegidos

## 🐳 Docker

### Comandos Docker Úteis

```bash
# Iniciar apenas o banco PostgreSQL
docker compose up -d

# Parar os serviços
docker compose down

# Ver logs do banco
docker compose logs db

# Reconstruir e iniciar
docker compose up -d --build

# Limpar volumes (cuidado: apaga dados)
docker compose down -v
```

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).

---

**Sistema Educatio** - Transformando a gestão acadêmica através da tecnologia 🎓

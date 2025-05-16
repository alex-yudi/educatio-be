Coletando informações do workspace# Sistema Educatio - Backend

## Descrição

Este é o backend do Sistema Educatio, uma aplicação para gerenciamento acadêmico desenvolvida com NestJS e Prisma.

## Configuração do Projeto

### Pré-requisitos
- Node.js (versão 18 ou superior)
- Docker e Docker Compose
- npm (gerenciador de pacotes do Node.js)

### Passos para Configuração

1. **Clone o repositório**
   ```bash
   git clone [url-do-repositorio]
   cd educatio-be
   ```

2. **Configure as variáveis de ambiente**
   ```bash
   cp example.env .env
   ```
   
3. **Inicie o banco de dados PostgreSQL com Docker**
   ```bash
   docker compose up -d
   ```

4. **Instale as dependências**
   ```bash
   npm install
   ```

5. **Execute as migrações do Prisma**
   ```bash
   npx prisma migrate dev
   ```

6. **Popule o banco de dados com dados iniciais**
   ```bash
   npx prisma db seed
   ```

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

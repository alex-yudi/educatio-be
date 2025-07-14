# 📚 Documentação do Sistema Educatio

## 🎯 Visão Geral

Bem-vindo à documentação completa do Sistema Educatio! Esta pasta contém toda a documentação técnica e funcional do projeto.

## 📖 Índice da Documentação

### 🚀 Primeiros Passos
- **[Referência Rápida](./referencia-rapida.md)** - Setup inicial, comandos essenciais e troubleshooting
- **[README Principal](../README.md)** - Visão geral do projeto e instalação

### 🔧 Documentação Técnica
- **[API Completa](./api-completa.md)** - Documentação detalhada de todos os endpoints
- **[Modelo de Dados](./modelo-dados.md)** - Estrutura do banco de dados e relacionamentos
- **[Diagrama UML](./diagrama-uml.puml)** - Modelo visual das entidades

### 👥 Gestão de Usuários
- **[Cadastro de Professores](./cadastro-professores.md)** - Processo completo de cadastro e primeiro acesso

### 📊 Sistema de Frequência
- **[Frequência - Lançamento](./frequencia-api.md)** - Como lançar e consultar frequências
- **[Frequência - Alteração](./alterar-frequencia-api.md)** - Como alterar frequências já registradas
- **[Frequência - Resumo](./README-frequencia.md)** - Visão geral completa do sistema

## 🎯 Por Onde Começar?

### 👨‍💻 Desenvolvedor Novo no Projeto
1. **[Referência Rápida](./referencia-rapida.md)** - Para setup e comandos básicos
2. **[API Completa](./api-completa.md)** - Para entender todos os endpoints
3. **[Modelo de Dados](./modelo-dados.md)** - Para compreender a estrutura

### 🎓 Usuário Final/Admin
1. **[Cadastro de Professores](./cadastro-professores.md)** - Como cadastrar e gerenciar professores
2. **[API Completa](./api-completa.md)** - Referência de funcionalidades disponíveis

### 👨‍🏫 Professor
1. **[Frequência - Lançamento](./frequencia-api.md)** - Como lançar frequência
2. **[Frequência - Alteração](./alterar-frequencia-api.md)** - Como corrigir frequências

## 🔍 Navegação Rápida

### Autenticação e Segurança
- Login e JWT tokens: [API Completa](./api-completa.md#-autenticação)
- Controle de acesso: [API Completa](./api-completa.md#️-controle-de-acesso)
- Cadastro com senha temporária: [Cadastro de Professores](./cadastro-professores.md)

### CRUD Completo
- **Usuários**: [API Completa](./api-completa.md#-gestão-de-usuários)
- **Cursos**: [API Completa](./api-completa.md#-cursos)
- **Disciplinas**: [API Completa](./api-completa.md#-disciplinas)
- **Turmas**: [API Completa](./api-completa.md#-turmas)
- **Matrículas**: [API Completa](./api-completa.md#-matrículas)

### Funcionalidades Especiais
- **Sistema de Frequência**: [README Frequência](./README-frequencia.md)
- **Endpoints de Deleção**: [API Completa](./api-completa.md)
- **Validações e Restrições**: [Modelo de Dados](./modelo-dados.md#-regras-de-integridade)

## 🛠️ Ferramentas de Desenvolvimento

### Documentação Interativa
- **Swagger UI**: http://localhost:3000/api (quando a aplicação estiver rodando)

### Visualização do Banco
- **Prisma Studio**: `npx prisma studio` (abre em http://localhost:5555)

### Diagrama UML
- Arquivo: [diagrama-uml.puml](./diagrama-uml.puml)
- Visualizar em: [PlantUML Online](https://www.plantuml.com/plantuml/uml/)

## 📝 Convenções da Documentação

### Códigos de Status HTTP
- `200 OK` - Operação realizada com sucesso
- `201 Created` - Recurso criado com sucesso  
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Token inválido/ausente
- `403 Forbidden` - Acesso negado
- `404 Not Found` - Recurso não encontrado
- `409 Conflict` - Conflito (duplicação, etc.)

### Níveis de Acesso
- 🔴 **Admin**: Acesso total ao sistema
- 🟡 **Professor**: Acesso limitado às suas turmas
- 🟢 **Aluno**: Acesso limitado (futuro)

### Ícones Utilizados
- ✅ Implementado/Permitido
- ❌ Não implementado/Negado
- ⚠️ Atenção/Limitação
- 🔄 Em desenvolvimento
- 📋 Documentação
- 🎯 Objetivo/Meta

## 🔄 Atualizações da Documentação

Esta documentação é mantida sincronizada com o código. Última atualização: **Julho 2025**

### Principais Atualizações Recentes:
- ✅ Adicionados endpoints de deleção (DELETE) para todos os recursos
- ✅ Documentação completa do sistema de frequência
- ✅ Processo de cadastro de professores com senha temporária
- ✅ Controle de acesso detalhado por role
- ✅ Validações e restrições de integridade

## 📞 Suporte

Para dúvidas sobre a documentação ou funcionalidades:
1. Consulte primeiro a [Referência Rápida](./referencia-rapida.md)
2. Verifique a [API Completa](./api-completa.md) para detalhes específicos
3. Use o Swagger UI para testes interativos

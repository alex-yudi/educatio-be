# 📋 Sistema de Frequência - Documentação

## 🎯 Visão Geral

O sistema de frequência permite que professores lancem e consultem a presença dos alunos em suas aulas de forma simples e segura.

## 🔐 Segurança

- **Apenas professores** podem acessar os endpoints de frequência
- **Apenas o professor responsável** pela turma pode lançar/consultar frequência
- Autenticação via **JWT Token** obrigatória

## 📡 Endpoints Disponíveis

### 1. 📝 Lançar Frequência

```
POST /frequencia
```

**Descrição:** Lança a frequência de uma aula específica.

**Autenticação:** Bearer Token (Professor da turma)

**Body (JSON):**

```json
{
  "turma_id": 6,
  "data_aula": "2025-06-29T14:00:00.000Z",
  "alunos_presentes": [23, 24]
}
```

**Campos:**

- `turma_id` (number): ID da turma onde será lançada a frequência
- `data_aula` (string): Data e hora da aula no formato ISO 8601
- `alunos_presentes` (array): **IDs dos alunos que estiveram PRESENTES**

**⚠️ IMPORTANTE:**

- Use o **ID do usuário** (campo `id` da tabela `Usuario`)
- **NÃO** use matrícula nem ID da matrícula
- Alunos **não informados** serão marcados como **AUSENTES** automaticamente
- Não é possível lançar frequência duas vezes para a mesma data

**Resposta de Sucesso (201):**

```json
{
  "message": "Frequência lançada com sucesso",
  "turma_codigo": "PROG1-2024-1A",
  "disciplina_nome": "Programação I",
  "data_aula": "2025-06-29T14:00:00.000Z",
  "total_alunos": 3,
  "presentes": 2,
  "ausentes": 1,
  "alunos_presentes": ["João da Silva", "Maria José Santos"],
  "alunos_ausentes": ["Rafael Sousa"],
  "registrado_por": "Carlos Andrade"
}
```

### 2. 📊 Consultar Frequência

```
GET /frequencia/turma/:id
```

**Descrição:** Consulta o histórico de frequência de uma turma.

**Autenticação:** Bearer Token (Professor da turma)

**Parâmetros:**

- `id` (number): ID da turma

**Query Params (opcionais):**

- `dataInicio` (string): Data de início do período (formato: YYYY-MM-DD)
- `dataFim` (string): Data de fim do período (formato: YYYY-MM-DD)

**Exemplo de uso:**

```
GET /frequencia/turma/6?dataInicio=2024-06-01&dataFim=2024-06-30
```

**Resposta de Sucesso (200):**

```json
{
  "turma": {
    "id": 6,
    "codigo": "PROG1-2024-1A",
    "disciplina": "Programação I",
    "professor": "Carlos Andrade"
  },
  "frequencias": [
    {
      "data_aula": "2025-06-29T14:00:00.000Z",
      "total_alunos": 3,
      "presentes": 2,
      "ausentes": 1,
      "alunos": [
        {
          "id": 23,
          "nome": "João da Silva",
          "matricula": "20240001",
          "presente": true
        },
        {
          "id": 24,
          "nome": "Maria José Santos",
          "matricula": "20240002",
          "presente": true
        },
        {
          "id": 27,
          "nome": "Rafael Sousa",
          "matricula": "20240005",
          "presente": false
        }
      ]
    }
  ]
}
```

## 🚨 Códigos de Erro

### 400 - Bad Request

- Dados inválidos fornecidos
- Alunos não matriculados na turma
- Formato de data inválido

### 401 - Unauthorized

- Token de acesso inválido ou expirado
- Usuário não é professor

### 403 - Forbidden

- Professor não é responsável pela turma

### 404 - Not Found

- Turma não encontrada

### 409 - Conflict

- Frequência já foi lançada para esta data

## 📋 Exemplos Práticos

### Como descobrir os IDs dos alunos?

1. **Listar turmas do professor:**

```bash
curl -X GET http://localhost:3000/turmas \
  -H "Authorization: Bearer SEU_TOKEN"
```

2. **A resposta mostra alunos matriculados:**

```json
{
  "id": 6,
  "codigo": "PROG1-2024-1A",
  "matriculados": 3
}
```

3. **Para ver detalhes dos alunos, use o histórico de frequência:**

```bash
curl -X GET http://localhost:3000/frequencia/turma/6 \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Exemplo Completo de Lançamento

```bash
# 1. Fazer login como professor
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "carlos.prof@uni.edu", "senha": "Professor@123"}'

# 2. Lançar frequência (apenas alunos presentes)
curl -X POST http://localhost:3000/frequencia \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "turma_id": 6,
    "data_aula": "2025-06-29T14:00:00.000Z",
    "alunos_presentes": [23, 24]
  }'

# 3. Consultar histórico
curl -X GET http://localhost:3000/frequencia/turma/6 \
  -H "Authorization: Bearer SEU_TOKEN"
```

## 🔍 Validações Implementadas

✅ **Segurança:**

- Token JWT válido
- Usuário é professor
- Professor é responsável pela turma

✅ **Dados:**

- Turma existe
- Data de aula é válida
- Alunos informados estão matriculados na turma
- Frequência não foi lançada anteriormente para a mesma data

✅ **Automatização:**

- Alunos não informados marcados como ausentes
- Cálculo automático de estatísticas
- Histórico ordenado por data (mais recente primeiro)

## 📚 Documentação da API

Para ver a documentação interativa completa, acesse:

```
http://localhost:3000/api
```

A documentação Swagger inclui todos os detalhes, exemplos e permite testar os endpoints diretamente no navegador.

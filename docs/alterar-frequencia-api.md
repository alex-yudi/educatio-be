# 🔄 Alteração de Frequência - Guia Completo

## 🎯 Visão Geral

O endpoint de alteração permite que professores modifiquem a frequência de alunos em aulas já registradas. É possível alterar o status de qualquer aluno de presente para ausente ou vice-versa.

## 🚨 Pré-requisitos

- ✅ A aula deve ter frequência **já registrada** anteriormente
- ✅ Apenas o **professor responsável** pela turma pode alterar
- ✅ **Token JWT válido** é obrigatório

## 📡 Endpoint de Alteração

### 🔄 Alterar Frequência Existente

```
PUT /frequencia/alterar
```

**Descrição:** Altera a frequência de alunos em uma aula já registrada.

**Autenticação:** Bearer Token (Professor da turma)

**Body (JSON):**

```json
{
  "turma_id": 6,
  "data_aula": "2025-06-29T14:00:00.000Z",
  "alteracoes": [
    {
      "aluno_id": 23,
      "presente": false
    },
    {
      "aluno_id": 24,
      "presente": true
    },
    {
      "aluno_id": 27,
      "presente": true
    }
  ]
}
```

**Campos Detalhados:**

1. **`turma_id`** (number)

   - ID da turma que terá a frequência alterada
   - Deve ser uma turma do professor logado

2. **`data_aula`** (string)

   - Data e hora da aula no formato ISO 8601
   - **IMPORTANTE:** Deve ser uma aula com frequência já registrada

3. **`alteracoes`** (array)
   - Lista de alterações a serem feitas
   - Cada item contém:
     - `aluno_id`: ID do usuário (campo `id` da tabela Usuario)
     - `presente`: novo status (true = presente, false = ausente)

**⚠️ REGRAS IMPORTANTES:**

- **Incluir todos os alunos:** Informe todos os alunos da turma com o status desejado
- **Apenas alterações necessárias:** Sistema só processa mudanças reais de status
- **IDs corretos:** Use ID do usuário, não matrícula nem ID de matrícula
- **Aula existente:** A data deve corresponder a uma frequência já lançada
- **Validações:** Sistema verifica se alunos estão matriculados na turma

## 📊 Resposta de Sucesso (200)

```json
{
  "message": "Frequência alterada com sucesso",
  "turma_codigo": "PROG1-2024-1A",
  "disciplina_nome": "Programação I",
  "data_aula": "2025-06-29T14:00:00.000Z",
  "total_alteracoes": 2,
  "presentes_final": 2,
  "ausentes_final": 1,
  "detalhes_alteracoes": [
    {
      "aluno_id": 23,
      "aluno_nome": "João da Silva",
      "matricula": "20240001",
      "status_anterior": true,
      "status_novo": false,
      "alteracao": "Presente → Ausente"
    },
    {
      "aluno_id": 27,
      "aluno_nome": "Rafael Sousa",
      "matricula": "20240005",
      "status_anterior": false,
      "status_novo": true,
      "alteracao": "Ausente → Presente"
    }
  ],
  "alterado_por": "Carlos Andrade",
  "data_alteracao": "2025-06-29T15:30:00.000Z"
}
```

**Campos da Resposta:**

- `message`: Confirmação da operação
- `turma_codigo`: Código da turma alterada
- `disciplina_nome`: Nome da disciplina
- `data_aula`: Data da aula alterada
- `total_alteracoes`: Quantas alterações foram feitas
- `presentes_final`: Total de presentes após alterações
- `ausentes_final`: Total de ausentes após alterações
- `detalhes_alteracoes`: Lista detalhada das mudanças
- `alterado_por`: Nome do professor que fez as alterações
- `data_alteracao`: Timestamp da operação

## 🚨 Códigos de Erro

### 400 - Bad Request

```json
{
  "message": "Nenhuma alteração foi necessária. Os status informados já são os atuais.",
  "error": "Bad Request",
  "statusCode": 400
}
```

**Causa:** Todos os status informados já são os atuais (não há mudanças)

```json
{
  "message": "Alunos não matriculados na turma: 999",
  "error": "Bad Request",
  "statusCode": 400
}
```

**Causa:** IDs de alunos não estão matriculados na turma

### 401 - Unauthorized

```json
{
  "message": "Apenas professores podem alterar frequência",
  "error": "Unauthorized",
  "statusCode": 401
}
```

**Causa:** Token inválido ou usuário não é professor

### 403 - Forbidden

```json
{
  "message": "Acesso restrito a professores",
  "error": "Forbidden",
  "statusCode": 403
}
```

**Causa:** Professor não é responsável pela turma especificada

### 404 - Not Found

```json
{
  "message": "Turma não encontrada",
  "error": "Not Found",
  "statusCode": 404
}
```

**Causa:** Turma com o ID informado não existe

```json
{
  "message": "Não existe frequência registrada para a aula do dia 25/12/2025",
  "error": "Not Found",
  "statusCode": 404
}
```

**Causa:** Frequência ainda não foi lançada para esta data específica

## 📋 Exemplos Práticos

### Exemplo 1: Marcar Aluno Ausente como Presente

**Cenário:** João faltou, mas chegou atrasado e professor quer corrigir

```bash
curl -X PUT http://localhost:3000/frequencia/alterar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "turma_id": 6,
    "data_aula": "2025-06-29T14:00:00.000Z",
    "alteracoes": [
      { "aluno_id": 23, "presente": true }
    ]
  }'
```

### Exemplo 2: Marcar Aluno Presente como Ausente

**Cenário:** Aluno saiu mais cedo, professor quer marcar como ausente

```bash
curl -X PUT http://localhost:3000/frequencia/alterar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "turma_id": 6,
    "data_aula": "2025-06-29T14:00:00.000Z",
    "alteracoes": [
      { "aluno_id": 24, "presente": false }
    ]
  }'
```

### Exemplo 3: Múltiplas Alterações Simultâneas

**Cenário:** Correção de vários status após verificação da lista

```bash
curl -X PUT http://localhost:3000/frequencia/alterar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "turma_id": 6,
    "data_aula": "2025-06-29T14:00:00.000Z",
    "alteracoes": [
      { "aluno_id": 23, "presente": true },
      { "aluno_id": 24, "presente": false },
      { "aluno_id": 27, "presente": true }
    ]
  }'
```

### Exemplo 4: Situação Comum - Chegada Tardia

**Cenário:** Aluno chegou após a chamada inicial

```bash
# 1. Primeiro consulte para ver o status atual
curl -X GET "http://localhost:3000/frequencia/turma/6" \
  -H "Authorization: Bearer SEU_TOKEN"

# 2. Na resposta, identifique o aluno ausente que chegou
# 3. Altere apenas esse aluno específico
curl -X PUT http://localhost:3000/frequencia/alterar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "turma_id": 6,
    "data_aula": "2025-06-29T14:00:00.000Z",
    "alteracoes": [
      { "aluno_id": 23, "presente": true }
    ]
  }'
```

## 🔍 Fluxo Completo de Uso

### 1. Consultar Frequência Atual

```bash
# Ver status atual da aula
curl -X GET "http://localhost:3000/frequencia/turma/6" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 2. Identificar Alterações Necessárias

- Verificar na resposta quais alunos têm status incorreto
- Anotar os IDs dos alunos e novos status desejados

### 3. Fazer as Alterações

```bash
# Aplicar correções
curl -X PUT http://localhost:3000/frequencia/alterar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{ ... }'
```

### 4. Verificar Resultado

- A resposta já mostra o resultado das alterações
- Opcionalmente, consultar novamente para confirmar

## ⚠️ Boas Práticas

### ✅ Fazer

- **Consultar primeiro:** Veja a frequência atual antes de alterar
- **Alterar apenas necessário:** Inclua somente alunos que realmente mudam de status
- **Verificar IDs:** Use os IDs corretos dos alunos (campo `id` do Usuario)
- **Data exata:** Use a data/hora exata da aula registrada
- **Múltiplas alterações:** Agrupe várias alterações numa única requisição

### ❌ Evitar

- **Alterar sem consultar:** Pode causar mudanças desnecessárias
- **IDs incorretos:** Não use matrícula nem ID de matrícula
- **Data errada:** Data deve corresponder a aula já registrada
- **Alterações desnecessárias:** Não inclua alunos que já têm status correto
- **Múltiplas requisições:** Prefira uma requisição com várias alterações

### 🚀 Otimização

- **Eficiência:** Sistema só processa mudanças reais de status
- **Atomicidade:** Todas as alterações são aplicadas em uma transação
- **Validação:** Verifica permissões e dados antes de aplicar alterações

## 🔄 Diferenças dos Endpoints

| Aspecto           | Lançar Frequência  | Alterar Frequência        |
| ----------------- | ------------------ | ------------------------- |
| **Quando usar**   | Primeira vez       | Correções posteriores     |
| **Pré-requisito** | Nenhum             | Frequência já lançada     |
| **Input**         | Apenas presentes   | Todos com status          |
| **Ausentes**      | Automático         | Manual                    |
| **Endpoint**      | `POST /frequencia` | `PUT /frequencia/alterar` |
| **Validação**     | Data não duplicada | Data deve existir         |

## 📚 Documentação Completa

Para documentação interativa completa:

```
http://localhost:3000/api
```

O Swagger inclui todos os detalhes, exemplos e permite testar diretamente no navegador.

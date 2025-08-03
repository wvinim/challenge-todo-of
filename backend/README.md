# 📝 Todo Sync Backend

API para sincronização de tarefas (todo list) construído com **NestJS**, **Prisma** e **SQLite**
---

## 🚀 Funcionalidades

- CRUD completo de tarefas com sincronização bidirecional via endpoints `/tasks/push` e `/tasks/pull`
- Suporte a múltiplos dispositivos
- **Resolução de conflitos** com estratégia básica, onde a última atualização vence.
- Registro de deleções com a tabela `DeletedTask`

---

## 📦 Estrutura dos dados

### `Task`
| Campo        | Tipo     | Descrição                       |
|--------------|----------|---------------------------------|
| `id`         | UUID     | Identificador único da tarefa   |
| `title`      | String   | Título da tarefa                |
| `description`| String   | Descrição da tarefa             |
| `done`       | Boolean  | Pendete 0 ou Concluída 1        |
| `createdAt`  | DateTime | Data de criação                 |
| `updatedAt`  | DateTime | Última atualização              |

### `DeletedTask`
| Campo       | Tipo     | Descrição                       |
|-------------|----------|---------------------------------|
| `id`        | UUID     | ID da tarefa deletada           |
| `deletedAt` | DateTime | Quando foi marcada como deletada|

---

## 🔄 Endpoints de Sincronização

### `POST /tasks/push`

Envia alterações do app para o backend.

**Payload esperado:**
```json
{
  "created": [ /* lista de novas tarefas */ ],
  "updated": [ /* lista de tarefas modificadas */ ],
  "deleted": [ "id1", "id2" ] // lista de IDs deletados
}
```

### `GET /tasks/pull?lastPulledAt=timestamp`

Recebe alterações ocorridas no backend desde o último pull.

**Payload esperado:**
```json
{
  {
    "changes": {
      "tasks": [ /* tarefas novas ou atualizadas */ ],
      "tasks_deleted": [ "id1", "id2" ]
    },
    "timestamp": 1722746030123
  }
}
```

---

📦 Estrutura do projeto

Criei a base do módulo tasks através cli do nest utilizando os comandos:

```
nest generate module tasks
nest generate service tasks
nest generate controller tasks
```

A arquitetura guiada por módulos facilita o crescimento do projeto de maneira simples e bem legível, com esta estrutura de pastas:
```
/src
 ├─ /tasks
     ├─ tasks.controller.ts
     ├─ tasks.service.ts
     └─ tasks.module.ts
```
---

## ⚖️ Estratégia de Resolução de Conflitos

Considerando o uso em vários dispositivos e intermitência de rede, a sincronização adota uma abordagem simples:

✅ upsert (create ou update):
	•	Usado para todos os dados recebidos em created e updated
	•	Garante que tarefas com mesmo id sejam atualizadas se já existirem
	•	Evita falhas por duplicidade ou reenvio

✅ Tolerância a exclusões:
	•	Tentativas de deletar tarefas já inexistentes não causam erro
	•	Cada deleção registrada na tabela DeletedTask é retornada no pull

✅ Baseado em timestamp:
	•	O updatedAt das tarefas determina o que é novo para o pull
	•	O deletedAt da DeletedTask garante exclusões sincronizáveis

## ⚙️ Rodando o projeto em dev

1. Instale dependências
```
npm install
```

2. Rode as migrações
```
npx prisma migrate dev --name init
```

3. Inicie o servidor
```
npm run start:dev
```

## ⚙️ Mais comandos úteis

* Build para produção (resultado na pasta dist)
```
npm run build
```

* Linter
```
npm run lint
```

* Test
```
npm run test
```

## Observações ao avaliador

* Utilizei o SQLite com a url hardcoded no prisma (poderia ser qualquer banco relacional via docker), devido a simplicidade do projeto.
* Foi necessário utilizar a injeção de dependência para que o módulo tasks pudesse acessar o service do Prisma durante os testes.
* Apliquei apenas dois testes unitários em tasks.service como exemplo de conhecimento da ferramenta.

## License

Este projeto é [MIT licensed](https://github.com/wvinim/challenge-todo-of/blob/main/LICENSE).

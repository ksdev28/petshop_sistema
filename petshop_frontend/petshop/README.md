# 🐾 Sistema de Agendamento Pet Shop

## 🛠 Tecnologias Utilizadas

- **Backend**: FastAPI (Python) + SQL puro (PostgreSQL)
- **Frontend**: React + Tailwind CSS
- **Banco de Dados**: PostgreSQL

---

## 📁 Estrutura do Projeto

- `petshop_backend/`: API REST com FastAPI
- `petshop_frontend/petshop/`: Interface web com React

---

## 🚀 Como Iniciar o Projeto

### 🔧 Requisitos

- Python 3.8+
- Node.js 14+
- PostgreSQL 12+

---

### 📦 Backend

1. Acesse a pasta do backend:

   ```bash
   cd petshop_backend
   ```

2. Crie o banco de dados no PostgreSQL e execute o script `modelo_fisico.sql` para criar as tabelas.

3. Instale as dependências:

   ```bash
   pip install -r requirements.txt
   ```

4. Configure as variáveis de ambiente:

   ```bash
   export DB_HOST=localhost
   export DB_PORT=5432
   export DB_NAME=petshop
   export DB_USER=seu_usuario
   export DB_PASSWORD=sua_senha
   ```

5. Inicie o servidor:

   ```bash
   uvicorn app.main:app --reload
   ```

> A API estará disponível em `http://localhost:8000`  
> Documentação Swagger: `http://localhost:8000/docs`

---

### 💻 Frontend

1. Acesse a pasta do frontend:

   ```bash
   cd petshop_frontend
   cd petshop
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure a URL da API no arquivo `src/services/api.ts` (se necessário).

4. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

---

## ✅ Funcionalidades

- **Clientes**: Cadastro, edição, busca e exclusão
- **Animais**: Associados a clientes, com dados como espécie e raça
- **Funcionários**: Gerenciamento com status ativo/inativo
- **Serviços**: Cadastro com preço e duração
- **Agendamentos**: Seleção de animal, funcionário e serviços, com status e valor total automático

# Cardápio de Lanchonete - Sistema de Pedidos Online

Este projeto implementa uma aplicação web completa para uma lanchonete de bairro, permitindo que os clientes visualizem o cardápio online e façam pedidos de forma prática.

## 📋 Funcionalidades

### Frontend
- **Listagem do cardápio** organizada por categorias (Lanches, Bebidas, Doces)
- **Sistema de busca** por nome do item
- **Filtros por categoria** para facilitar a navegação
- **Carrinho de compras** interativo com:
  - Adição e remoção de itens
  - Controle de quantidade
  - Cálculo automático de subtotais e total geral
- **Formulário de pedido** com nome do cliente e observações
- **Interface responsiva** que funciona em desktop e mobile
- **Mensagens de feedback** para sucesso e erro

### Backend
- **API REST** em Node.js com Express
- **Endpoints disponíveis:**
  - `GET /cardapio` - Lista todo o cardápio
  - `GET /cardapio?nome=termo` - Busca itens por nome
  - `GET /cardapio?categoria=categoria` - Filtra por categoria
  - `POST /pedidos` - Recebe novos pedidos
  - `GET /pedidos` - Lista pedidos (para consulta da lanchonete)
- **Armazenamento em arquivos JSON**
- **Suporte a CORS** para comunicação frontend-backend

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm (gerenciador de pacotes do Node.js)

### Passo a Passo

1. **Clone ou baixe o projeto**
   ```bash
   # Se usando git
   git clone <url-do-repositorio>
   cd problema1_cardapio
   ```

2. **Instale as dependências do backend**
   ```bash
   cd backend
   npm install
   ```

3. **Inicie o servidor backend**
   ```bash
   npm start
   ```
   
   O servidor será iniciado em `http://localhost:3000`

4. **Acesse a aplicação**
   
   Abra seu navegador e acesse: `http://localhost:3000`

### Estrutura de Arquivos

```
problema1_cardapio/
├── frontend/
│   ├── index.html          # Página principal
│   ├── style.css           # Estilos CSS responsivos
│   └── app.js              # Lógica JavaScript
├── backend/
│   ├── server.js           # Servidor Node.js
│   ├── package.json        # Dependências do projeto
│   ├── cardapio.json       # Dados do cardápio
│   └── pedidos.json        # Pedidos recebidos
└── README.md               # Este arquivo
```

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Estilização responsiva com Flexbox e Grid
- **JavaScript ES6+** - Lógica da aplicação e comunicação com API

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **CORS** - Middleware para permitir requisições cross-origin


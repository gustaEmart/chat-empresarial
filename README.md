# 💬 Chat Empresarial Web

Sistema de chat corporativo interno com autenticação simulada do Active Directory.

## 🚀 Protótipo para Apresentação

Este é um protótipo funcional para demonstração das funcionalidades do sistema de chat empresarial.

## ✨ Funcionalidades

- 🔐 Login com usuários mock (simulando Active Directory)
- 💬 Chat 1:1 em tempo real com WebSocket
- 👥 Chat em grupo (público e privado)
- ➕ Criação e gerenciamento de grupos
- 🌙 Modo escuro/claro com persistência
- 🔍 Busca avançada por nome, cargo e departamento
- ⌨️ Indicador "digitando" em tempo real
- ✓✓ Read receipts (confirmação de leitura)
- 🟢 Status online/offline
- ⚙️ Painel administrativo (apenas para admins)

## 📋 Tecnologias Utilizadas

### Backend
- **Node.js** + **Express** - Framework web
- **Socket.io** - WebSocket para comunicação em tempo real
- **JWT** - Autenticação baseada em tokens
- **bcryptjs** - Hash de senhas
- **CORS** - Cross-Origin Resource Sharing

### Frontend
- **React 18** - Biblioteca UI
- **Vite** - Build tool e dev server
- **Socket.io Client** - Cliente WebSocket
- **Axios** - Cliente HTTP
- **CSS Variables** - Temas dinâmicos

## 📦 Estrutura do Projeto

```
chat-empresarial/
├── backend/
│   ├── src/
│   │   ├── data/
│   │   │   └── mockData.js          # Dados mock (usuários, grupos)
│   │   ├── middleware/
│   │   │   └── auth.js              # Middleware de autenticação
│   │   ├── routes/
│   │   │   ├── auth.js              # Rotas de autenticação
│   │   │   ├── users.js             # Rotas de usuários
│   │   │   ├── groups.js            # Rotas de grupos
│   │   │   └── messages.js          # Rotas de mensagens
│   │   ├── socket/
│   │   │   └── socketHandler.js     # Handler WebSocket
│   │   └── server.js                # Servidor principal
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Auth/
    │   │   │   └── Login.jsx        # Componente de login
    │   │   ├── Layout/
    │   │   │   ├── Header.jsx       # Cabeçalho da aplicação
    │   │   │   └── ThemeToggle.jsx  # Toggle de tema
    │   │   ├── Sidebar/
    │   │   │   ├── Sidebar.jsx      # Barra lateral principal
    │   │   │   ├── UserList.jsx     # Lista de usuários
    │   │   │   ├── GroupList.jsx    # Lista de grupos
    │   │   │   └── SearchBar.jsx    # Barra de busca
    │   │   ├── Chat/
    │   │   │   ├── ChatArea.jsx     # Área principal do chat
    │   │   │   ├── MessageList.jsx  # Lista de mensagens
    │   │   │   ├── MessageInput.jsx # Input de mensagens
    │   │   │   └── TypingIndicator.jsx # Indicador de digitação
    │   │   ├── Groups/
    │   │   │   ├── CreateGroupModal.jsx # Modal de criação de grupo
    │   │   │   └── GroupSettings.jsx    # Configurações do grupo
    │   │   └── Admin/
    │   │       └── AdminPanel.jsx   # Painel administrativo
    │   ├── contexts/
    │   │   ├── AuthContext.jsx      # Context de autenticação
    │   │   ├── ChatContext.jsx      # Context do chat
    │   │   └── ThemeContext.jsx     # Context de tema
    │   ├── hooks/
    │   │   ├── useSocket.js         # Hook de WebSocket
    │   │   └── useChat.js           # Hook de chat
    │   ├── services/
    │   │   └── api.js               # Configuração da API
    │   ├── styles/
    │   │   ├── globals.css          # Estilos globais
    │   │   └── themes.css           # Definições de temas
    │   ├── App.jsx                  # Componente principal
    │   └── main.jsx                 # Entry point
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 16+ instalado
- npm ou yarn

### Backend

1. Navegue até a pasta do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Crie o arquivo `.env` (copie do `.env.example`):
```bash
cp .env.example .env
```

4. Inicie o servidor:
```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# Modo produção
npm start
```

O servidor estará rodando em `http://localhost:3001`

### Frontend

1. Em outro terminal, navegue até a pasta do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. (Opcional) Crie o arquivo `.env` se precisar customizar URLs:
```bash
cp .env.example .env
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

### Build de Produção

Para gerar o build de produção do frontend:
```bash
cd frontend
npm run build
```

Os arquivos serão gerados na pasta `frontend/dist`

## 👥 Usuários de Demonstração

Todos os usuários têm a senha padrão: **demo123**

### Administradores
- **gustavo.martinez** - Desenvolvedor Sênior (TI)
- **ana.oliveira** - Coordenadora de RH (RH)
- **roberto.alves** - Diretor de TI (TI)

### Colaboradores
- **maria.silva** - Analista de Suporte (Suporte TI)
- **carlos.santos** - Gerente de Projetos (PMO)
- **pedro.costa** - Analista Financeiro (Financeiro)
- **juliana.lima** - Designer UX (TI)
- **fernanda.souza** - Analista de Marketing (Marketing)
- **lucas.ferreira** - Suporte Técnico N2 (Suporte TI)
- **camila.rodrigues** - Assistente Administrativo (Administrativo)

## 🎨 Design e Temas

### Tema Claro
- Background: `#ffffff`
- Sidebar: `#f5f5f5`
- Primary: `#0078d4`
- Text: `#333333`

### Tema Escuro
- Background: `#1e1e1e`
- Sidebar: `#252526`
- Primary: `#0078d4`
- Text: `#ffffff`

O tema é persistido no localStorage e pode ser alternado clicando no botão 🌙/☀️ no header.

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/logout` - Logout de usuário
- `GET /api/auth/me` - Obter usuário atual

### Usuários
- `GET /api/users` - Listar todos os usuários
- `GET /api/users/:id` - Buscar usuário por ID
- `GET /api/users/search?q=` - Buscar usuários

### Grupos
- `GET /api/groups` - Listar grupos do usuário
- `POST /api/groups` - Criar novo grupo
- `PUT /api/groups/:id` - Atualizar grupo
- `DELETE /api/groups/:id` - Excluir grupo
- `POST /api/groups/:id/members` - Adicionar membro
- `DELETE /api/groups/:id/members/:userId` - Remover membro

### Mensagens
- `GET /api/messages/:conversationId` - Listar mensagens
- `POST /api/messages` - Enviar mensagem
- `PUT /api/messages/:id/read` - Marcar como lida
- `PUT /api/messages/conversation/:conversationId/read` - Marcar conversa como lida

## 🔌 WebSocket Events

### Eventos do Cliente
- `message:send` - Enviar mensagem
- `message:read` - Marcar mensagem como lida
- `typing:start` - Iniciar indicador de digitação
- `typing:stop` - Parar indicador de digitação
- `group:join` - Entrar em um grupo
- `group:leave` - Sair de um grupo

### Eventos do Servidor
- `message:new` - Nova mensagem recebida
- `message:read` - Mensagem foi lida
- `typing:start` - Usuário começou a digitar
- `typing:stop` - Usuário parou de digitar
- `user:status` - Status do usuário mudou (online/offline)

## 🔒 Segurança

- Autenticação JWT com expiração de 24 horas
- Senhas armazenadas com hash bcrypt
- Middleware de autenticação em todas as rotas protegidas
- Middleware de autorização para rotas administrativas
- CORS configurado para o domínio do frontend

## 🛠️ Desenvolvimento

### Estrutura de Dados Mock

Os dados são armazenados em memória no arquivo `backend/src/data/mockData.js`:
- **mockUsers**: Array de usuários
- **mockGroups**: Array de grupos pré-criados
- **mockMessages**: Array de mensagens
- **mockConversations**: Array de conversas 1:1
- **mockAuditLogs**: Array de logs de auditoria

### Considerações

Este é um protótipo para demonstração. Em produção, você deve:
- Integrar com Active Directory real
- Usar banco de dados (MongoDB, PostgreSQL, etc.)
- Implementar sistema de upload de arquivos
- Adicionar notificações push
- Implementar rate limiting
- Adicionar testes automatizados
- Configurar SSL/TLS
- Implementar backup de mensagens

## 📝 Licença

Este é um projeto de demonstração educacional.

## 👨‍💻 Desenvolvido por

Gustavo Martinez - Chat Empresarial Prototype 2024
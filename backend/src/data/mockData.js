const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Senha padrão para todos os usuários: demo123
const defaultPasswordHash = bcrypt.hashSync('demo123', 10);

// Usuários simulados do Active Directory
const mockUsers = [
  {
    id: uuidv4(),
    sAMAccountName: 'gustavo.martinez',
    displayName: 'Gustavo Martinez',
    title: 'Desenvolvedor Sênior',
    department: 'TI',
    mail: 'gustavo.martinez@empresa.com',
    role: 'admin',
    password: defaultPasswordHash,
    avatar: null,
    status: 'offline',
    lastSeen: new Date()
  },
  {
    id: uuidv4(),
    sAMAccountName: 'maria.silva',
    displayName: 'Maria Silva',
    title: 'Analista de Suporte',
    department: 'Suporte TI',
    mail: 'maria.silva@empresa.com',
    role: 'colaborador',
    password: defaultPasswordHash,
    avatar: null,
    status: 'offline',
    lastSeen: new Date()
  },
  {
    id: uuidv4(),
    sAMAccountName: 'carlos.santos',
    displayName: 'Carlos Santos',
    title: 'Gerente de Projetos',
    department: 'PMO',
    mail: 'carlos.santos@empresa.com',
    role: 'colaborador',
    password: defaultPasswordHash,
    avatar: null,
    status: 'offline',
    lastSeen: new Date()
  },
  {
    id: uuidv4(),
    sAMAccountName: 'ana.oliveira',
    displayName: 'Ana Oliveira',
    title: 'Coordenadora de RH',
    department: 'RH',
    mail: 'ana.oliveira@empresa.com',
    role: 'admin',
    password: defaultPasswordHash,
    avatar: null,
    status: 'offline',
    lastSeen: new Date()
  },
  {
    id: uuidv4(),
    sAMAccountName: 'pedro.costa',
    displayName: 'Pedro Costa',
    title: 'Analista Financeiro',
    department: 'Financeiro',
    mail: 'pedro.costa@empresa.com',
    role: 'colaborador',
    password: defaultPasswordHash,
    avatar: null,
    status: 'offline',
    lastSeen: new Date()
  },
  {
    id: uuidv4(),
    sAMAccountName: 'juliana.lima',
    displayName: 'Juliana Lima',
    title: 'Designer UX',
    department: 'TI',
    mail: 'juliana.lima@empresa.com',
    role: 'colaborador',
    password: defaultPasswordHash,
    avatar: null,
    status: 'offline',
    lastSeen: new Date()
  },
  {
    id: uuidv4(),
    sAMAccountName: 'roberto.alves',
    displayName: 'Roberto Alves',
    title: 'Diretor de TI',
    department: 'TI',
    mail: 'roberto.alves@empresa.com',
    role: 'admin',
    password: defaultPasswordHash,
    avatar: null,
    status: 'offline',
    lastSeen: new Date()
  },
  {
    id: uuidv4(),
    sAMAccountName: 'fernanda.souza',
    displayName: 'Fernanda Souza',
    title: 'Analista de Marketing',
    department: 'Marketing',
    mail: 'fernanda.souza@empresa.com',
    role: 'colaborador',
    password: defaultPasswordHash,
    avatar: null,
    status: 'offline',
    lastSeen: new Date()
  },
  {
    id: uuidv4(),
    sAMAccountName: 'lucas.ferreira',
    displayName: 'Lucas Ferreira',
    title: 'Suporte Técnico N2',
    department: 'Suporte TI',
    mail: 'lucas.ferreira@empresa.com',
    role: 'colaborador',
    password: defaultPasswordHash,
    avatar: null,
    status: 'offline',
    lastSeen: new Date()
  },
  {
    id: uuidv4(),
    sAMAccountName: 'camila.rodrigues',
    displayName: 'Camila Rodrigues',
    title: 'Assistente Administrativo',
    department: 'Administrativo',
    mail: 'camila.rodrigues@empresa.com',
    role: 'colaborador',
    password: defaultPasswordHash,
    avatar: null,
    status: 'offline',
    lastSeen: new Date()
  }
];

// Grupos pré-criados
const mockGroups = [
  {
    id: uuidv4(),
    name: 'Geral',
    description: 'Canal geral da empresa',
    type: 'public',
    createdBy: mockUsers[0].id,
    members: mockUsers.map(u => u.id),
    createdAt: new Date(),
    avatar: null
  },
  {
    id: uuidv4(),
    name: 'Equipe TI',
    description: 'Discussões da equipe de Tecnologia',
    type: 'private',
    createdBy: mockUsers[6].id,
    members: [mockUsers[0].id, mockUsers[5].id, mockUsers[6].id],
    createdAt: new Date(),
    avatar: null
  },
  {
    id: uuidv4(),
    name: 'Suporte Técnico',
    description: 'Canal do time de suporte',
    type: 'private',
    createdBy: mockUsers[1].id,
    members: [mockUsers[1].id, mockUsers[8].id],
    createdAt: new Date(),
    avatar: null
  }
];

// Mensagens simuladas
const mockMessages = [];

// Conversas individuais (1:1)
const mockConversations = [];

// Logs de auditoria
const mockAuditLogs = [
  {
    id: uuidv4(),
    action: 'LOGIN',
    userId: mockUsers[0].id,
    details: 'Login realizado com sucesso',
    timestamp: new Date()
  }
];

module.exports = {
  mockUsers,
  mockGroups,
  mockMessages,
  mockConversations,
  mockAuditLogs
};

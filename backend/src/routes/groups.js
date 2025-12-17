const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { mockGroups, mockUsers, mockAuditLogs } = require('../data/mockData');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// GET /api/groups - Listar grupos do usuário
router.get('/', (req, res) => {
  try {
    const userId = req.user.id;

    // Filtrar grupos onde o usuário é membro
    const userGroups = mockGroups.filter(group => 
      group.members.includes(userId)
    );

    res.json(userGroups);
  } catch (error) {
    console.error('Erro ao listar grupos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/groups - Criar novo grupo
router.post('/', (req, res) => {
  try {
    const { name, description, type, members } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ error: 'Nome do grupo é obrigatório' });
    }

    if (!type || !['public', 'private'].includes(type)) {
      return res.status(400).json({ error: 'Tipo do grupo deve ser "public" ou "private"' });
    }

    // Criar lista de membros incluindo o criador
    const groupMembers = members && Array.isArray(members) ? [...new Set([userId, ...members])] : [userId];

    // Validar se todos os membros existem
    const invalidMembers = groupMembers.filter(memberId => 
      !mockUsers.find(u => u.id === memberId)
    );

    if (invalidMembers.length > 0) {
      return res.status(400).json({ error: 'Um ou mais membros não encontrados' });
    }

    const newGroup = {
      id: uuidv4(),
      name,
      description: description || '',
      type,
      createdBy: userId,
      members: groupMembers,
      createdAt: new Date(),
      avatar: null
    };

    mockGroups.push(newGroup);

    mockAuditLogs.push({
      id: uuidv4(),
      action: 'CREATE_GROUP',
      userId: userId,
      details: `Grupo criado: ${name}`,
      timestamp: new Date()
    });

    res.status(201).json(newGroup);
  } catch (error) {
    console.error('Erro ao criar grupo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/groups/:id - Atualizar grupo
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type } = req.body;
    const userId = req.user.id;

    const group = mockGroups.find(g => g.id === id);

    if (!group) {
      return res.status(404).json({ error: 'Grupo não encontrado' });
    }

    // Verificar se o usuário é o criador do grupo
    if (group.createdBy !== userId) {
      return res.status(403).json({ error: 'Apenas o criador pode atualizar o grupo' });
    }

    // Atualizar campos
    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (type && ['public', 'private'].includes(type)) group.type = type;

    mockAuditLogs.push({
      id: uuidv4(),
      action: 'UPDATE_GROUP',
      userId: userId,
      details: `Grupo atualizado: ${group.name}`,
      timestamp: new Date()
    });

    res.json(group);
  } catch (error) {
    console.error('Erro ao atualizar grupo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/groups/:id - Excluir grupo
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const groupIndex = mockGroups.findIndex(g => g.id === id);

    if (groupIndex === -1) {
      return res.status(404).json({ error: 'Grupo não encontrado' });
    }

    const group = mockGroups[groupIndex];

    // Verificar se o usuário é o criador do grupo
    if (group.createdBy !== userId) {
      return res.status(403).json({ error: 'Apenas o criador pode excluir o grupo' });
    }

    mockGroups.splice(groupIndex, 1);

    mockAuditLogs.push({
      id: uuidv4(),
      action: 'DELETE_GROUP',
      userId: userId,
      details: `Grupo excluído: ${group.name}`,
      timestamp: new Date()
    });

    res.json({ message: 'Grupo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir grupo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/groups/:id/members - Adicionar membro
router.post('/:id/members', (req, res) => {
  try {
    const { id } = req.params;
    const { userId: newMemberId } = req.body;
    const userId = req.user.id;

    if (!newMemberId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' });
    }

    const group = mockGroups.find(g => g.id === id);

    if (!group) {
      return res.status(404).json({ error: 'Grupo não encontrado' });
    }

    // Verificar se o usuário atual é membro do grupo
    if (!group.members.includes(userId)) {
      return res.status(403).json({ error: 'Você não é membro deste grupo' });
    }

    // Verificar se o novo membro existe
    const newMember = mockUsers.find(u => u.id === newMemberId);
    if (!newMember) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar se já é membro
    if (group.members.includes(newMemberId)) {
      return res.status(400).json({ error: 'Usuário já é membro do grupo' });
    }

    group.members.push(newMemberId);

    mockAuditLogs.push({
      id: uuidv4(),
      action: 'ADD_GROUP_MEMBER',
      userId: userId,
      details: `Membro adicionado ao grupo ${group.name}: ${newMember.displayName}`,
      timestamp: new Date()
    });

    res.json(group);
  } catch (error) {
    console.error('Erro ao adicionar membro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/groups/:id/members/:userId - Remover membro
router.delete('/:id/members/:memberId', (req, res) => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user.id;

    const group = mockGroups.find(g => g.id === id);

    if (!group) {
      return res.status(404).json({ error: 'Grupo não encontrado' });
    }

    // Apenas o criador ou o próprio membro pode remover
    if (group.createdBy !== userId && memberId !== userId) {
      return res.status(403).json({ error: 'Sem permissão para remover este membro' });
    }

    // Verificar se é membro
    const memberIndex = group.members.indexOf(memberId);
    if (memberIndex === -1) {
      return res.status(404).json({ error: 'Usuário não é membro do grupo' });
    }

    // Não permitir que o criador se remova
    if (memberId === group.createdBy) {
      return res.status(400).json({ error: 'O criador não pode sair do grupo' });
    }

    group.members.splice(memberIndex, 1);

    const removedUser = mockUsers.find(u => u.id === memberId);

    mockAuditLogs.push({
      id: uuidv4(),
      action: 'REMOVE_GROUP_MEMBER',
      userId: userId,
      details: `Membro removido do grupo ${group.name}: ${removedUser?.displayName || memberId}`,
      timestamp: new Date()
    });

    res.json(group);
  } catch (error) {
    console.error('Erro ao remover membro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

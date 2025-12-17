const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { mockMessages, mockUsers, mockGroups, mockConversations } = require('../data/mockData');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// GET /api/messages/:conversationId - Listar mensagens de uma conversa
router.get('/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const { limit = 50, before } = req.query;

    // Filtrar mensagens desta conversa
    let conversationMessages = mockMessages.filter(msg => 
      msg.conversationId === conversationId
    );

    // Verificar se o usuário tem acesso a esta conversa
    // Para grupos
    const group = mockGroups.find(g => g.id === conversationId);
    if (group) {
      if (!group.members.includes(userId)) {
        return res.status(403).json({ error: 'Acesso negado a este grupo' });
      }
    } else {
      // Para conversas 1:1
      const conversation = mockConversations.find(c => c.id === conversationId);
      if (conversation) {
        if (!conversation.participants.includes(userId)) {
          return res.status(403).json({ error: 'Acesso negado a esta conversa' });
        }
      } else {
        // Verificar se é uma conversa 1:1 direta (usando IDs dos usuários)
        const hasAccess = conversationMessages.some(msg => 
          msg.senderId === userId || msg.recipientId === userId
        );
        
        if (!hasAccess && conversationMessages.length > 0) {
          return res.status(403).json({ error: 'Acesso negado a esta conversa' });
        }
      }
    }

    // Filtrar mensagens antes de um timestamp específico (paginação)
    if (before) {
      const beforeDate = new Date(before);
      conversationMessages = conversationMessages.filter(msg => 
        new Date(msg.timestamp) < beforeDate
      );
    }

    // Ordenar por timestamp (mais recentes primeiro) e limitar
    conversationMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    conversationMessages = conversationMessages.slice(0, parseInt(limit));

    // Reverter para ordem cronológica
    conversationMessages.reverse();

    res.json(conversationMessages);
  } catch (error) {
    console.error('Erro ao listar mensagens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/messages - Enviar mensagem
router.post('/', (req, res) => {
  try {
    const { conversationId, recipientId, content, type = 'text' } = req.body;
    const userId = req.user.id;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Conteúdo da mensagem é obrigatório' });
    }

    if (!conversationId && !recipientId) {
      return res.status(400).json({ error: 'conversationId ou recipientId é obrigatório' });
    }

    let finalConversationId = conversationId;

    // Se for uma conversa 1:1 e não existir conversationId
    if (!conversationId && recipientId) {
      // Verificar se o destinatário existe
      const recipient = mockUsers.find(u => u.id === recipientId);
      if (!recipient) {
        return res.status(404).json({ error: 'Destinatário não encontrado' });
      }

      // Procurar conversa existente
      let conversation = mockConversations.find(c => 
        c.participants.includes(userId) && c.participants.includes(recipientId)
      );

      // Se não existe, criar nova conversa
      if (!conversation) {
        conversation = {
          id: uuidv4(),
          type: 'direct',
          participants: [userId, recipientId],
          createdAt: new Date()
        };
        mockConversations.push(conversation);
      }

      finalConversationId = conversation.id;
    }

    // Verificar acesso ao grupo
    if (conversationId) {
      const group = mockGroups.find(g => g.id === conversationId);
      if (group) {
        if (!group.members.includes(userId)) {
          return res.status(403).json({ error: 'Você não é membro deste grupo' });
        }
      }
    }

    const newMessage = {
      id: uuidv4(),
      conversationId: finalConversationId,
      senderId: userId,
      recipientId: recipientId || null,
      content,
      type,
      timestamp: new Date(),
      readBy: [userId], // Autor já "leu" a mensagem
      deliveredTo: [userId]
    };

    mockMessages.push(newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/messages/:id/read - Marcar mensagem como lida
router.put('/:id/read', (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = mockMessages.find(m => m.id === id);

    if (!message) {
      return res.status(404).json({ error: 'Mensagem não encontrada' });
    }

    // Verificar se o usuário tem acesso a esta mensagem
    const group = mockGroups.find(g => g.id === message.conversationId);
    if (group) {
      if (!group.members.includes(userId)) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
    } else if (message.recipientId && message.recipientId !== userId && message.senderId !== userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Adicionar usuário à lista de leitura se não estiver
    if (!message.readBy.includes(userId)) {
      message.readBy.push(userId);
    }

    res.json(message);
  } catch (error) {
    console.error('Erro ao marcar mensagem como lida:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/messages/conversation/:conversationId/read - Marcar todas as mensagens de uma conversa como lidas
router.put('/conversation/:conversationId/read', (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verificar acesso
    const group = mockGroups.find(g => g.id === conversationId);
    if (group && !group.members.includes(userId)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const conversation = mockConversations.find(c => c.id === conversationId);
    if (conversation && !conversation.participants.includes(userId)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Marcar todas as mensagens como lidas
    const conversationMessages = mockMessages.filter(msg => 
      msg.conversationId === conversationId && !msg.readBy.includes(userId)
    );

    conversationMessages.forEach(msg => {
      msg.readBy.push(userId);
    });

    res.json({ 
      message: 'Mensagens marcadas como lidas',
      count: conversationMessages.length
    });
  } catch (error) {
    console.error('Erro ao marcar mensagens como lidas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

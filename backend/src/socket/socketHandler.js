const jwt = require('jsonwebtoken');
const { mockUsers, mockMessages, mockGroups } = require('../data/mockData');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'chat-empresarial-secret-key-2024';

// Armazenar mapeamento de userId para socketId
const userSockets = new Map();
// Armazenar usuários digitando por conversa
const typingUsers = new Map();

const socketHandler = (io) => {
  // Middleware de autenticação para Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Token não fornecido'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.id;
      socket.userInfo = decoded;
      next();
    } catch (err) {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`Usuário conectado: ${socket.userInfo.displayName} (${userId})`);

    // Registrar socket do usuário
    userSockets.set(userId, socket.id);

    // Atualizar status para online
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      user.status = 'online';
      user.lastSeen = new Date();

      // Notificar todos sobre o status online
      io.emit('user:status', {
        userId,
        status: 'online',
        lastSeen: user.lastSeen
      });
    }

    // Entrar nas salas dos grupos do usuário
    const userGroups = mockGroups.filter(g => g.members.includes(userId));
    userGroups.forEach(group => {
      socket.join(`group:${group.id}`);
    });

    // Evento: Enviar mensagem
    socket.on('message:send', (data) => {
      try {
        const { conversationId, recipientId, content, type = 'text' } = data;

        if (!content || content.trim() === '') {
          socket.emit('error', { message: 'Conteúdo da mensagem é obrigatório' });
          return;
        }

        const newMessage = {
          id: uuidv4(),
          conversationId,
          senderId: userId,
          recipientId: recipientId || null,
          content,
          type,
          timestamp: new Date(),
          readBy: [userId],
          deliveredTo: [userId]
        };

        mockMessages.push(newMessage);

        // Enviar para o grupo ou destinatário específico
        if (conversationId) {
          const group = mockGroups.find(g => g.id === conversationId);
          if (group) {
            // Mensagem de grupo
            io.to(`group:${conversationId}`).emit('message:new', newMessage);
            
            // Atualizar deliveredTo para membros online
            group.members.forEach(memberId => {
              if (userSockets.has(memberId)) {
                if (!newMessage.deliveredTo.includes(memberId)) {
                  newMessage.deliveredTo.push(memberId);
                }
              }
            });
          } else {
            // Conversa 1:1
            socket.emit('message:new', newMessage);
            
            if (recipientId && userSockets.has(recipientId)) {
              io.to(userSockets.get(recipientId)).emit('message:new', newMessage);
              if (!newMessage.deliveredTo.includes(recipientId)) {
                newMessage.deliveredTo.push(recipientId);
              }
            }
          }
        } else if (recipientId) {
          // Conversa 1:1 direta
          socket.emit('message:new', newMessage);
          
          if (userSockets.has(recipientId)) {
            io.to(userSockets.get(recipientId)).emit('message:new', newMessage);
            if (!newMessage.deliveredTo.includes(recipientId)) {
              newMessage.deliveredTo.push(recipientId);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        socket.emit('error', { message: 'Erro ao enviar mensagem' });
      }
    });

    // Evento: Marcar mensagem como lida
    socket.on('message:read', (data) => {
      try {
        const { messageId, conversationId } = data;

        if (messageId) {
          const message = mockMessages.find(m => m.id === messageId);
          if (message && !message.readBy.includes(userId)) {
            message.readBy.push(userId);

            // Notificar o remetente sobre a leitura
            if (userSockets.has(message.senderId)) {
              io.to(userSockets.get(message.senderId)).emit('message:read', {
                messageId,
                userId,
                timestamp: new Date()
              });
            }
          }
        } else if (conversationId) {
          // Marcar todas as mensagens da conversa como lidas
          const conversationMessages = mockMessages.filter(
            m => m.conversationId === conversationId && !m.readBy.includes(userId)
          );

          const readMessageIds = [];
          conversationMessages.forEach(msg => {
            msg.readBy.push(userId);
            readMessageIds.push(msg.id);

            // Notificar o remetente
            if (userSockets.has(msg.senderId) && msg.senderId !== userId) {
              io.to(userSockets.get(msg.senderId)).emit('message:read', {
                messageId: msg.id,
                userId,
                timestamp: new Date()
              });
            }
          });
        }
      } catch (error) {
        console.error('Erro ao marcar mensagem como lida:', error);
      }
    });

    // Evento: Indicador de digitação
    socket.on('typing:start', (data) => {
      try {
        const { conversationId } = data;

        if (!typingUsers.has(conversationId)) {
          typingUsers.set(conversationId, new Set());
        }
        typingUsers.get(conversationId).add(userId);

        // Notificar outros usuários na conversa
        const group = mockGroups.find(g => g.id === conversationId);
        if (group) {
          socket.to(`group:${conversationId}`).emit('typing:start', {
            conversationId,
            userId,
            userName: socket.userInfo.displayName
          });
        } else {
          // Conversa 1:1 - encontrar o outro participante
          const conversation = mockMessages.find(m => m.conversationId === conversationId);
          if (conversation) {
            const otherUserId = conversation.senderId === userId 
              ? conversation.recipientId 
              : conversation.senderId;
            
            if (otherUserId && userSockets.has(otherUserId)) {
              io.to(userSockets.get(otherUserId)).emit('typing:start', {
                conversationId,
                userId,
                userName: socket.userInfo.displayName
              });
            }
          }
        }
      } catch (error) {
        console.error('Erro no indicador de digitação:', error);
      }
    });

    // Evento: Parar de digitar
    socket.on('typing:stop', (data) => {
      try {
        const { conversationId } = data;

        if (typingUsers.has(conversationId)) {
          typingUsers.get(conversationId).delete(userId);
        }

        // Notificar outros usuários
        const group = mockGroups.find(g => g.id === conversationId);
        if (group) {
          socket.to(`group:${conversationId}`).emit('typing:stop', {
            conversationId,
            userId
          });
        } else {
          const conversation = mockMessages.find(m => m.conversationId === conversationId);
          if (conversation) {
            const otherUserId = conversation.senderId === userId 
              ? conversation.recipientId 
              : conversation.senderId;
            
            if (otherUserId && userSockets.has(otherUserId)) {
              io.to(userSockets.get(otherUserId)).emit('typing:stop', {
                conversationId,
                userId
              });
            }
          }
        }
      } catch (error) {
        console.error('Erro ao parar indicador de digitação:', error);
      }
    });

    // Evento: Entrar em um grupo
    socket.on('group:join', (data) => {
      try {
        const { groupId } = data;
        const group = mockGroups.find(g => g.id === groupId);

        if (group && group.members.includes(userId)) {
          socket.join(`group:${groupId}`);
          socket.emit('group:joined', { groupId });
        }
      } catch (error) {
        console.error('Erro ao entrar no grupo:', error);
      }
    });

    // Evento: Sair de um grupo
    socket.on('group:leave', (data) => {
      try {
        const { groupId } = data;
        socket.leave(`group:${groupId}`);
        socket.emit('group:left', { groupId });
      } catch (error) {
        console.error('Erro ao sair do grupo:', error);
      }
    });

    // Desconexão
    socket.on('disconnect', () => {
      console.log(`Usuário desconectado: ${socket.userInfo.displayName} (${userId})`);

      // Remover socket do usuário
      userSockets.delete(userId);

      // Atualizar status para offline
      const user = mockUsers.find(u => u.id === userId);
      if (user) {
        user.status = 'offline';
        user.lastSeen = new Date();

        // Notificar todos sobre o status offline
        io.emit('user:status', {
          userId,
          status: 'offline',
          lastSeen: user.lastSeen
        });
      }

      // Limpar indicadores de digitação
      typingUsers.forEach((users, conversationId) => {
        if (users.has(userId)) {
          users.delete(userId);
          io.emit('typing:stop', { conversationId, userId });
        }
      });
    });
  });

  return io;
};

module.exports = socketHandler;

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from '../hooks/useSocket';
import { messagesAPI, groupsAPI, usersAPI } from '../services/api';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat deve ser usado dentro de um ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const token = localStorage.getItem('token');
  const { socket, connected, emit, on, off } = useSocket(isAuthenticated ? token : null);

  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [messages, setMessages] = useState({});
  const [activeConversation, setActiveConversation] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});

  // Carregar usuários e grupos
  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
      loadGroups();
    }
  }, [isAuthenticated]);

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const loadGroups = async () => {
    try {
      const response = await groupsAPI.getAll();
      setGroups(response.data);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    }
  };

  // Carregar mensagens de uma conversa
  const loadMessages = useCallback(async (conversationId) => {
    try {
      const response = await messagesAPI.getByConversation(conversationId);
      setMessages(prev => ({
        ...prev,
        [conversationId]: response.data
      }));
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  }, []);

  // Enviar mensagem
  const sendMessage = useCallback((conversationId, content, recipientId = null) => {
    if (!socket || !content.trim()) return;

    emit('message:send', {
      conversationId,
      recipientId,
      content: content.trim(),
      type: 'text'
    });
  }, [socket, emit]);

  // Marcar mensagem como lida
  const markAsRead = useCallback((messageId, conversationId) => {
    if (!socket) return;

    emit('message:read', { messageId, conversationId });
  }, [socket, emit]);

  // Iniciar indicador de digitação
  const startTyping = useCallback((conversationId) => {
    if (!socket) return;
    emit('typing:start', { conversationId });
  }, [socket, emit]);

  // Parar indicador de digitação
  const stopTyping = useCallback((conversationId) => {
    if (!socket) return;
    emit('typing:stop', { conversationId });
  }, [socket, emit]);

  // Criar grupo
  const createGroup = async (groupData) => {
    try {
      const response = await groupsAPI.create(groupData);
      setGroups(prev => [...prev, response.data]);
      
      // Entrar na sala do grupo
      if (socket) {
        emit('group:join', { groupId: response.data.id });
      }
      
      return { success: true, group: response.data };
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      return { success: false, error: error.response?.data?.error || 'Erro ao criar grupo' };
    }
  };

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      setMessages(prev => ({
        ...prev,
        [message.conversationId]: [
          ...(prev[message.conversationId] || []),
          message
        ]
      }));

      // Atualizar contador de não lidas
      if (message.senderId !== user?.id && message.conversationId !== activeConversation) {
        setUnreadCounts(prev => ({
          ...prev,
          [message.conversationId]: (prev[message.conversationId] || 0) + 1
        }));
      }
    };

    const handleMessageRead = (data) => {
      const { messageId, userId } = data;
      
      setMessages(prev => {
        const newMessages = { ...prev };
        Object.keys(newMessages).forEach(convId => {
          newMessages[convId] = newMessages[convId].map(msg => {
            if (msg.id === messageId && !msg.readBy.includes(userId)) {
              return {
                ...msg,
                readBy: [...msg.readBy, userId]
              };
            }
            return msg;
          });
        });
        return newMessages;
      });
    };

    const handleTypingStart = (data) => {
      const { conversationId, userId, userName } = data;
      setTypingUsers(prev => ({
        ...prev,
        [conversationId]: { userId, userName }
      }));
    };

    const handleTypingStop = (data) => {
      const { conversationId } = data;
      setTypingUsers(prev => {
        const newTyping = { ...prev };
        delete newTyping[conversationId];
        return newTyping;
      });
    };

    const handleUserStatus = (data) => {
      const { userId, status, lastSeen } = data;
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status, lastSeen } : u
      ));
    };

    on('message:new', handleNewMessage);
    on('message:read', handleMessageRead);
    on('typing:start', handleTypingStart);
    on('typing:stop', handleTypingStop);
    on('user:status', handleUserStatus);

    return () => {
      off('message:new', handleNewMessage);
      off('message:read', handleMessageRead);
      off('typing:start', handleTypingStart);
      off('typing:stop', handleTypingStop);
      off('user:status', handleUserStatus);
    };
  }, [socket, on, off, user, activeConversation]);

  // Marcar como lidas ao abrir conversa
  useEffect(() => {
    if (activeConversation) {
      setUnreadCounts(prev => ({
        ...prev,
        [activeConversation]: 0
      }));
    }
  }, [activeConversation]);

  const value = {
    users,
    groups,
    messages,
    activeConversation,
    setActiveConversation,
    typingUsers,
    unreadCounts,
    connected,
    loadMessages,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    createGroup,
    loadUsers,
    loadGroups
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../hooks/useChat';

const MessageList = ({ conversationId }) => {
  const { user } = useAuth();
  const { messages, users, groups } = useChat();
  const messagesEndRef = useRef(null);

  const conversationMessages = messages[conversationId] || [];

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserName = (userId) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser?.displayName || 'Usuário';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const isGroup = groups.some(g => g.id === conversationId);

  if (conversationMessages.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">💬</div>
        <div className="empty-state-text">Nenhuma mensagem ainda</div>
        <div className="empty-state-subtext">Seja o primeiro a enviar uma mensagem!</div>
      </div>
    );
  }

  return (
    <div className="message-list">
      {conversationMessages.map((message) => {
        const isOwn = message.senderId === user.id;
        const senderName = getUserName(message.senderId);
        const readCount = message.readBy?.length || 0;

        return (
          <div key={message.id} className={`message ${isOwn ? 'own' : ''}`}>
            {!isOwn && (
              <div className="message-avatar">
                {getInitials(senderName)}
              </div>
            )}
            <div className="message-content">
              {!isOwn && isGroup && (
                <div className="message-header">
                  <span className="message-sender">{senderName}</span>
                  <span className="message-time">{formatTime(message.timestamp)}</span>
                </div>
              )}
              <div className="message-bubble">
                {message.content}
              </div>
              {isOwn && (
                <div className="message-status">
                  {formatTime(message.timestamp)} 
                  {readCount > 1 ? ' ✓✓' : ' ✓'}
                </div>
              )}
            </div>
            {isOwn && (
              <div className="message-avatar">
                {getInitials(user.displayName)}
              </div>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;

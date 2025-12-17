import React, { useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../contexts/AuthContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

const ChatArea = () => {
  const { user } = useAuth();
  const { activeConversation, users, groups, loadMessages, markAsRead } = useChat();

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation);
    }
  }, [activeConversation, loadMessages]);

  if (!activeConversation) {
    return (
      <div className="chat-area">
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <div className="empty-state-text">Selecione uma conversa</div>
          <div className="empty-state-subtext">
            Escolha um usuário ou grupo para começar a conversar
          </div>
        </div>
      </div>
    );
  }

  // Determinar se é grupo ou conversa 1:1
  const group = groups.find(g => g.id === activeConversation);
  let chatTitle = '';
  let chatSubtitle = '';
  let recipientId = null;

  if (group) {
    chatTitle = group.name;
    chatSubtitle = `${group.members.length} membros`;
  } else {
    // Conversa 1:1 - extrair ID do outro usuário
    const userIds = activeConversation.split('-');
    recipientId = userIds.find(id => id !== user.id);
    const recipient = users.find(u => u.id === recipientId);
    
    if (recipient) {
      chatTitle = recipient.displayName;
      chatSubtitle = `${recipient.title} • ${recipient.department}`;
    }
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="chat-area">
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="conversation-avatar">
            {getInitials(chatTitle)}
          </div>
          <div>
            <div className="chat-title">{chatTitle}</div>
            <div className="chat-subtitle">{chatSubtitle}</div>
          </div>
        </div>
      </div>

      <MessageList conversationId={activeConversation} />
      
      <TypingIndicator conversationId={activeConversation} />

      <MessageInput 
        conversationId={activeConversation} 
        recipientId={recipientId}
      />
    </div>
  );
};

export default ChatArea;

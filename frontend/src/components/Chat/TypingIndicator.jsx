import React from 'react';
import { useChat } from '../../contexts/ChatContext';

const TypingIndicator = ({ conversationId }) => {
  const { typingUsers } = useChat();

  const typingUser = typingUsers[conversationId];

  if (!typingUser) {
    return null;
  }

  return (
    <div className="typing-indicator">
      {typingUser.userName} está digitando...
    </div>
  );
};

export default TypingIndicator;

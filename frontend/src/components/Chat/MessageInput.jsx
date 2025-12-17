import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';

const MessageInput = ({ conversationId, recipientId }) => {
  const [message, setMessage] = useState('');
  const { sendMessage, startTyping, stopTyping } = useChat();
  const typingTimeoutRef = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Indicador de digitação
    if (value.trim()) {
      startTyping(conversationId);

      // Limpar timeout anterior
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Parar de digitar após 2 segundos de inatividade
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(conversationId);
      }, 2000);
    } else {
      stopTyping(conversationId);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (message.trim()) {
      sendMessage(conversationId, message, recipientId);
      setMessage('');
      stopTyping(conversationId);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      stopTyping(conversationId);
    };
  }, [conversationId, stopTyping]);

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-input-wrapper">
        <textarea
          className="message-input"
          placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          rows={1}
        />
        <button
          type="submit"
          className="btn-send"
          disabled={!message.trim()}
        >
          Enviar
        </button>
      </form>
    </div>
  );
};

export default MessageInput;

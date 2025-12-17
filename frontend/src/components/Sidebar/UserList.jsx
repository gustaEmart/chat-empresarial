import React, { useState, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI } from '../../services/api';

const UserList = ({ searchQuery }) => {
  const { user: currentUser } = useAuth();
  const { users, setActiveConversation, activeConversation, unreadCounts } = useChat();
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    if (searchQuery) {
      // Buscar usuários pela API
      usersAPI.search(searchQuery)
        .then(response => {
          setFilteredUsers(response.data.filter(u => u.id !== currentUser.id));
        })
        .catch(err => console.error('Erro ao buscar usuários:', err));
    } else {
      // Mostrar todos menos o usuário atual
      setFilteredUsers(users.filter(u => u.id !== currentUser.id));
    }
  }, [searchQuery, users, currentUser]);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleUserClick = (user) => {
    // Criar ID de conversa usando os IDs dos usuários (ordenados)
    const conversationId = [currentUser.id, user.id].sort().join('-');
    setActiveConversation(conversationId);
  };

  const getConversationId = (userId) => {
    return [currentUser.id, userId].sort().join('-');
  };

  if (filteredUsers.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">👥</div>
        <div className="empty-state-text">Nenhum usuário encontrado</div>
      </div>
    );
  }

  return (
    <ul className="conversation-list">
      {filteredUsers.map(user => {
        const conversationId = getConversationId(user.id);
        const isActive = activeConversation === conversationId;
        const unreadCount = unreadCounts[conversationId] || 0;

        return (
          <li
            key={user.id}
            className={`conversation-item ${isActive ? 'active' : ''}`}
            onClick={() => handleUserClick(user)}
          >
            <div className="conversation-avatar">
              {getInitials(user.displayName)}
              <span className={`status-indicator ${user.status || 'offline'}`} />
            </div>
            <div className="conversation-info">
              <div className="conversation-name">{user.displayName}</div>
              <div className="conversation-preview">
                {user.title} • {user.department}
              </div>
            </div>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default UserList;

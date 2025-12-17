import React from 'react';
import { useChat } from '../../hooks/useChat';

const GroupList = () => {
  const { groups, setActiveConversation, activeConversation, unreadCounts } = useChat();

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (groups.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">👥</div>
        <div className="empty-state-text">Nenhum grupo encontrado</div>
        <div className="empty-state-subtext">Crie um grupo para começar</div>
      </div>
    );
  }

  return (
    <ul className="conversation-list">
      {groups.map(group => {
        const isActive = activeConversation === group.id;
        const unreadCount = unreadCounts[group.id] || 0;

        return (
          <li
            key={group.id}
            className={`conversation-item ${isActive ? 'active' : ''}`}
            onClick={() => setActiveConversation(group.id)}
          >
            <div className="conversation-avatar">
              {getInitials(group.name)}
            </div>
            <div className="conversation-info">
              <div className="conversation-name">
                {group.name} {group.type === 'private' && '🔒'}
              </div>
              <div className="conversation-preview">
                {group.members.length} membros • {group.description}
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

export default GroupList;

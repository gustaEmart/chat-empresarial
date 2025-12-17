import React, { useState, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../contexts/AuthContext';

const AdminPanel = ({ onClose }) => {
  const { users, groups } = useChat();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    onlineUsers: 0,
    totalGroups: 0,
    totalMessages: 0
  });

  useEffect(() => {
    setStats({
      totalUsers: users.length,
      onlineUsers: users.filter(u => u.status === 'online').length,
      totalGroups: groups.length,
      totalMessages: 0 // Placeholder
    });
  }, [users, groups]);

  const auditLogs = [
    {
      id: 1,
      action: 'LOGIN',
      description: `${user.displayName} fez login no sistema`,
      timestamp: new Date()
    },
    {
      id: 2,
      action: 'CREATE_GROUP',
      description: 'Novo grupo criado',
      timestamp: new Date()
    }
  ];

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h2 className="modal-title">⚙️ Painel Administrativo</h2>
          <button onClick={onClose} className="btn-close">×</button>
        </div>

        <div className="admin-panel">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total de Usuários</div>
              <div className="stat-value">{stats.totalUsers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Usuários Online</div>
              <div className="stat-value" style={{ color: 'var(--online)' }}>
                {stats.onlineUsers}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total de Grupos</div>
              <div className="stat-value">{stats.totalGroups}</div>
            </div>
          </div>

          <div className="audit-log">
            <div className="audit-log-header">
              📋 Logs de Auditoria
            </div>
            <div className="audit-log-list">
              {auditLogs.map(log => (
                <div key={log.id} className="audit-log-item">
                  <div className="audit-log-details">
                    <div className="audit-log-action">{log.action}</div>
                    <div className="audit-log-description">{log.description}</div>
                  </div>
                  <div className="audit-log-time">{formatTime(log.timestamp)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

import React, { useState } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../contexts/AuthContext';

const CreateGroupModal = ({ onClose }) => {
  const { user } = useAuth();
  const { users, createGroup } = useChat();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('public');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMemberToggle = (userId) => {
    setSelectedMembers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Nome do grupo é obrigatório');
      return;
    }

    setLoading(true);

    const result = await createGroup({
      name: name.trim(),
      description: description.trim(),
      type,
      members: selectedMembers
    });

    setLoading(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Criar Novo Grupo</h2>
          <button onClick={onClose} className="btn-close">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Nome do Grupo *</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Equipe de Desenvolvimento"
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição opcional do grupo"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Tipo do Grupo</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="type"
                  value="public"
                  checked={type === 'public'}
                  onChange={(e) => setType(e.target.value)}
                  disabled={loading}
                />
                <span>Público</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="type"
                  value="private"
                  checked={type === 'private'}
                  onChange={(e) => setType(e.target.value)}
                  disabled={loading}
                />
                <span>Privado</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Selecionar Membros</label>
            <div className="checkbox-group">
              {users
                .filter(u => u.id !== user.id)
                .map(u => (
                  <div key={u.id} className="checkbox-item">
                    <input
                      type="checkbox"
                      id={`member-${u.id}`}
                      checked={selectedMembers.includes(u.id)}
                      onChange={() => handleMemberToggle(u.id)}
                      disabled={loading}
                    />
                    <label htmlFor={`member-${u.id}`} className="checkbox-label">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>
                          {getInitials(u.displayName)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{u.displayName}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {u.title} • {u.department}
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Grupo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;

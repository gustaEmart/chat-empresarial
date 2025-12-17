import React from 'react';

const GroupSettings = ({ group, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Configurações do Grupo</h2>
          <button onClick={onClose} className="btn-close">×</button>
        </div>

        <div className="form-group">
          <label>Nome</label>
          <p style={{ color: 'var(--text-primary)' }}>{group.name}</p>
        </div>

        <div className="form-group">
          <label>Descrição</label>
          <p style={{ color: 'var(--text-primary)' }}>{group.description || 'Sem descrição'}</p>
        </div>

        <div className="form-group">
          <label>Membros</label>
          <p style={{ color: 'var(--text-primary)' }}>{group.members.length} membros</p>
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

export default GroupSettings;

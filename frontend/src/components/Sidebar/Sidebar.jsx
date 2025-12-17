import React, { useState } from 'react';
import SearchBar from './SearchBar';
import UserList from './UserList';
import GroupList from './GroupList';

const Sidebar = ({ onCreateGroup }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="sidebar">
      <SearchBar onSearch={setSearchQuery} />

      <div className="sidebar-tabs">
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Usuários
        </button>
        <button
          className={`tab-btn ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          💬 Grupos
        </button>
      </div>

      {activeTab === 'groups' && (
        <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)' }}>
          <button onClick={onCreateGroup} className="btn btn-primary">
            ➕ Criar Grupo
          </button>
        </div>
      )}

      <div className="sidebar-content">
        {activeTab === 'users' ? (
          <UserList searchQuery={searchQuery} />
        ) : (
          <GroupList />
        )}
      </div>
    </div>
  );
};

export default Sidebar;

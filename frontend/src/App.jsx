import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Header from './components/Layout/Header';
import Sidebar from './components/Sidebar/Sidebar';
import ChatArea from './components/Chat/ChatArea';
import CreateGroupModal from './components/Groups/CreateGroupModal';
import AdminPanel from './components/Admin/AdminPanel';

const App = () => {
  const { isAuthenticated, loading } = useAuth();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  if (loading) {
    return (
      <div className="empty-state">
        <div className="empty-state-text">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="app-container">
      <div className="main-layout">
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <Header onAdminClick={() => setShowAdminPanel(true)} />
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <Sidebar onCreateGroup={() => setShowCreateGroup(true)} />
            <ChatArea />
          </div>
        </div>
      </div>

      {showCreateGroup && (
        <CreateGroupModal onClose={() => setShowCreateGroup(false)} />
      )}

      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}
    </div>
  );
};

export default App;

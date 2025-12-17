import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

const Header = ({ onAdminClick }) => {
  const { user, logout, isAdmin } = useAuth();

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="header">
      <div className="header-left">
        <h1 className="header-title">💬 Chat Empresarial</h1>
      </div>

      <div className="header-right">
        {isAdmin && (
          <button onClick={onAdminClick} className="btn-icon" title="Painel Admin">
            ⚙️
          </button>
        )}

        <ThemeToggle />

        <div className="user-info">
          <div className="user-avatar">{getInitials(user.displayName)}</div>
          <div className="user-details">
            <div className="user-name">{user.displayName}</div>
            <div className="user-role">{user.title}</div>
          </div>
        </div>

        <button onClick={logout} className="btn-icon" title="Sair">
          🚪
        </button>
      </div>
    </div>
  );
};

export default Header;

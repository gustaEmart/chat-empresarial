import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="sidebar-header">
      <input
        type="text"
        className="search-input"
        placeholder="🔍 Buscar por nome, cargo ou departamento..."
        value={query}
        onChange={handleChange}
      />
    </div>
  );
};

export default SearchBar;

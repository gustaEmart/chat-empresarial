const express = require('express');
const { mockUsers } = require('../data/mockData');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// GET /api/users - Listar todos usuários
router.get('/', (req, res) => {
  try {
    const usersWithoutPassword = mockUsers.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json(usersWithoutPassword);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/users/search?q= - Buscar por nome/cargo/departamento
router.get('/search', (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Parâmetro de busca "q" é obrigatório' });
    }

    const searchTerm = q.toLowerCase();

    const filteredUsers = mockUsers.filter(user => {
      return (
        user.displayName.toLowerCase().includes(searchTerm) ||
        user.title.toLowerCase().includes(searchTerm) ||
        user.department.toLowerCase().includes(searchTerm) ||
        user.sAMAccountName.toLowerCase().includes(searchTerm) ||
        user.mail.toLowerCase().includes(searchTerm)
      );
    });

    const usersWithoutPassword = filteredUsers.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json(usersWithoutPassword);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/users/:id - Buscar usuário por ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const user = mockUsers.find(u => u.id === id);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const { password, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

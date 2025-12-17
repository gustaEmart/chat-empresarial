const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { mockUsers, mockAuditLogs } = require('../data/mockData');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'chat-empresarial-secret-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// POST /api/auth/login - Autenticação (Mock AD)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    const user = mockUsers.find(
      u => u.sAMAccountName.toLowerCase() === username.toLowerCase()
    );

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado no Active Directory' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        sAMAccountName: user.sAMAccountName,
        displayName: user.displayName,
        title: user.title,
        department: user.department,
        mail: user.mail,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    mockAuditLogs.push({
      id: uuidv4(),
      action: 'LOGIN',
      userId: user.id,
      details: `Login realizado: ${user.displayName}`,
      timestamp: new Date()
    });

    user.status = 'online';
    user.lastSeen = new Date();

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      
      const user = mockUsers.find(u => u.id === decoded.id);
      if (user) {
        user.status = 'offline';
        user.lastSeen = new Date();
        
        mockAuditLogs.push({
          id: uuidv4(),
          action: 'LOGOUT',
          userId: user.id,
          details: `Logout realizado: ${user.displayName}`,
          timestamp: new Date()
        });
      }
    } catch (err) {}
  }

  res.json({ message: 'Logout realizado com sucesso' });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = mockUsers.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
});

module.exports = router;
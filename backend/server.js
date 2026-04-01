require('dotenv').config();

const express = require('express');
const path = require('path');
const { getUserByCredentials } = require('./data/destinationsStore');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      res.status(400).json({ error: 'Credenziali mancanti' });
      return;
    }
    const user = await getUserByCredentials(username, password);
    if (!user) {
      res.status(401).json({ error: 'Credenziali non valide' });
      return;
    }
    const token = `token-${user.id}`;
    res.status(200).json({ token, userId: user.id, username: user.username });
  } catch (error) {
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

function authMiddleware(req, res, next) {
  try {
    if (req.method === 'GET') { next(); return; }
    const token = req.headers['x-auth-token'];
    if (!token) { res.status(401).json({ error: 'Token mancante' }); return; }
    const userId = parseInt(String(token).replace('token-', ''), 10);
    if (Number.isNaN(userId) || userId <= 0) { res.status(401).json({ error: 'Token non valido' }); return; }
    req.userId = userId;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Errore interno del server' });
  }
}

const port = process.env.PORT || 3000;
app.listen(port);

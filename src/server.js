// /Users/Wander/case-DNC/src/server.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const monsterRoutes = require('./api/routes/monsterRoutes');
const playerRoutes = require('./api/routes/playerRoutes');
const arenaRoutes = require('./api/routes/arenaRoutes');
const testArenaRoutes = require('./api/routes/testArenaRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Exponha io em req.app para os controllers:
let ioInstance = null;
app.use((req, res, next) => {
  if (ioInstance) {
    req.app.io = ioInstance;
  }
  next();
});

// Rotas
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Monster Battle API' });
});

app.use('/api/monsters', monsterRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/arenas', arenaRoutes);
app.use('/api/test-arena', testArenaRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;

let server;
if (require.main === module) {
  server = require('http').createServer(app);
  const io = require('socket.io')(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} else {
  server = app;
}

module.exports = app;

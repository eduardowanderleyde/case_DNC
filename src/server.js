
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const monsterRoutes = require('./api/routes/monsterRoutes');
const playerRoutes = require('./api/routes/playerRoutes');
const arenaRoutes = require('./api/routes/arenaRoutes');
const testArenaRoutes = require('./api/routes/testArenaRoutes');

const app = express();

app.use(cors());
app.use(express.json());

let ioInstance = null;
app.use((req, res, next) => {
  if (ioInstance) {
    req.app.io = ioInstance;
  }
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Monster Battle API' });
});

app.use('/api/monsters', monsterRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/arenas', arenaRoutes);
app.use('/api/test-arena', testArenaRoutes);

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
    // Entrar em sala de arena normal
    socket.on('join-arena', (arenaId) => {
      socket.join(`arena-${arenaId}`);
      console.log(`Socket ${socket.id} joined arena-${arenaId}`);
    });
    // Entrar em sala de testarena (só um por vez normalmente)
    socket.on('join-testarena', () => {
      socket.join('testarena');
      console.log(`Socket ${socket.id} joined testarena`);
    });
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

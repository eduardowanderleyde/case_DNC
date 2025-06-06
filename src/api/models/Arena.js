const mongoose = require('mongoose');

const arenaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  maxPlayers: {
    type: Number,
    required: true,
    min: 2,
    max: 2,
    default: 2
  },
  status: {
    type: String,
    enum: ['WAITING', 'IN_PROGRESS', 'FINISHED'],
    default: 'WAITING'
  },
  players: [{
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true
    },
    monster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Monster',
      required: true
    },
    isReady: {
      type: Boolean,
      default: false
    }
  }],
  currentTurn: {
    type: Number,
    default: 0
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  battleLog: [{
    turn: Number,
    action: String,
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    },
    damage: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Middleware para garantir que não há mais de 2 jogadores
arenaSchema.pre('save', function(next) {
  if (this.players.length > this.maxPlayers) {
    next(new Error('Arena is full'));
  }
  next();
});

module.exports = mongoose.model('Arena', arenaSchema); 
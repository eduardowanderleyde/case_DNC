const mongoose = require('mongoose');

const monsterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['FIRE', 'WATER', 'EARTH', 'AIR', 'LIGHT', 'DARK']
  },
  hp: {
    type: Number,
    required: true,
    min: 1
  },
  attack: {
    type: Number,
    required: true,
    min: 1
  },
  defense: {
    type: Number,
    required: true,
    min: 1
  },
  speed: {
    type: Number,
    required: true,
    min: 1
  },
  imageUrl: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Monster', monsterSchema); 
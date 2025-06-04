const Player = require('../models/Player');

// Get all players
exports.getAllPlayers = async (req, res) => {
  try {
    const players = await Player.find().populate('activeMonster');
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get player by ID
exports.getPlayerById = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id).populate('activeMonster');
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    res.json(player);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new player
exports.createPlayer = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Check if player name already exists
    const existingPlayer = await Player.findOne({ name });
    if (existingPlayer) {
      return res.status(400).json({ message: 'Player name already exists' });
    }

    const player = new Player({ name });
    const newPlayer = await player.save();
    res.status(201).json(newPlayer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update player
exports.updatePlayer = async (req, res) => {
  try {
    const player = await Player.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('activeMonster');

    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    res.json(player);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete player
exports.deletePlayer = async (req, res) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
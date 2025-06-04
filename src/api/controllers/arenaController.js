const Arena = require('../models/Arena');
const Player = require('../models/Player');
const Monster = require('../models/Monster');

// Get all arenas
exports.getAllArenas = async (req, res) => {
  try {
    const arenas = await Arena.find()
      .populate('players.player')
      .populate('players.monster')
      .populate('winner');
    res.json(arenas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get arena by ID
exports.getArenaById = async (req, res) => {
  try {
    const arena = await Arena.findById(req.params.id)
      .populate('players.player')
      .populate('players.monster')
      .populate('winner');
    
    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }
    res.json(arena);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new arena
exports.createArena = async (req, res) => {
  try {
    const { name, maxPlayers } = req.body;
    
    // Check if arena name already exists
    const existingArena = await Arena.findOne({ name });
    if (existingArena) {
      return res.status(400).json({ message: 'Arena name already exists' });
    }

    const arena = new Arena({
      name,
      maxPlayers: maxPlayers || 2
    });
    
    const newArena = await arena.save();
    res.status(201).json(newArena);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Join arena
exports.joinArena = async (req, res) => {
  try {
    const { player_id, monster_id } = req.body;
    const arena = await Arena.findById(req.params.id);
    
    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    if (arena.status !== 'WAITING') {
      return res.status(400).json({ message: 'Arena is not available for joining' });
    }

    if (arena.players.length >= arena.maxPlayers) {
      return res.status(400).json({ message: 'Arena is full' });
    }

    // Check if player is already in the arena
    const playerExists = arena.players.some(p => p.player.toString() === player_id);
    if (playerExists) {
      return res.status(400).json({ message: 'Player is already in this arena' });
    }

    // Verify player and monster exist
    const [player, monster] = await Promise.all([
      Player.findById(player_id),
      Monster.findById(monster_id)
    ]);

    if (!player || !monster) {
      return res.status(404).json({ message: 'Player or monster not found' });
    }

    // Add player to arena
    arena.players.push({
      player: player_id,
      monster: monster_id,
      isReady: false
    });

    await arena.save();
    res.json(arena);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Leave arena
exports.leaveArena = async (req, res) => {
  try {
    const { player_id } = req.body;
    const arena = await Arena.findById(req.params.id);
    
    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    if (arena.status !== 'WAITING') {
      return res.status(400).json({ message: 'Cannot leave arena during battle' });
    }

    // Remove player from arena
    arena.players = arena.players.filter(p => p.player.toString() !== player_id);
    await arena.save();
    
    res.json({ message: 'Player left arena successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Start battle
exports.startBattle = async (req, res) => {
  try {
    const arena = await Arena.findById(req.params.id)
      .populate('players.player')
      .populate('players.monster');
    
    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    if (arena.status !== 'WAITING') {
      return res.status(400).json({ message: 'Battle has already started or finished' });
    }

    if (arena.players.length !== arena.maxPlayers) {
      return res.status(400).json({ message: 'Not enough players to start battle' });
    }

    // Check if all players are ready
    const allReady = arena.players.every(p => p.isReady);
    if (!allReady) {
      return res.status(400).json({ message: 'Not all players are ready' });
    }

    // Start battle
    arena.status = 'IN_PROGRESS';
    arena.currentTurn = 1;
    await arena.save();

    // Update players' battle status
    await Player.updateMany(
      { _id: { $in: arena.players.map(p => p.player._id) } },
      { $set: { isInBattle: true } }
    );

    res.json({
      message: 'Battle started',
      turn: arena.currentTurn,
      battle_state: {
        player_1: {
          monster: arena.players[0].monster.name,
          hp: arena.players[0].monster.hp
        },
        player_2: {
          monster: arena.players[1].monster.name,
          hp: arena.players[1].monster.hp
        }
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 
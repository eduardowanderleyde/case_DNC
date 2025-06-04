const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Player = require('../models/Player');
const Monster = require('../models/Monster');
const BattleService = require('../services/battleService');

// Get all arenas
exports.getAllArenas = async (req, res) => {
  try {
    const arenas = await prisma.arena.findMany({
      include: {
        players: {
          include: {
            player: true,
            monster: true
          }
        }
      }
    });
    res.json(arenas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get arena by ID
exports.getArenaById = async (req, res) => {
  try {
    const arena = await prisma.arena.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        players: {
          include: {
            player: true,
            monster: true
          }
        }
      }
    });
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
    const existingArena = await prisma.arena.findUnique({ where: { name } });
    if (existingArena) {
      return res.status(400).json({ message: 'Arena name already exists' });
    }
    const newArena = await prisma.arena.create({
      data: {
        name,
        maxPlayers: maxPlayers || 2
      }
    });
    res.status(201).json(newArena);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Join arena
exports.joinArena = async (req, res) => {
  try {
    const { player_id, monster_id } = req.body;
    const arenaId = Number(req.params.id);
    const arena = await prisma.arena.findUnique({
      where: { id: arenaId },
      include: { players: true }
    });
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
    const playerExists = arena.players.some(p => p.playerId === Number(player_id));
    if (playerExists) {
      return res.status(400).json({ message: 'Player is already in this arena' });
    }
    // Verify player and monster exist
    const player = await prisma.player.findUnique({ where: { id: Number(player_id) } });
    const monster = await prisma.monster.findUnique({ where: { id: Number(monster_id) } });
    if (!player || !monster) {
      return res.status(404).json({ message: 'Player or monster not found' });
    }
    // Add player to arena
    await prisma.arenaPlayer.create({
      data: {
        arenaId,
        playerId: Number(player_id),
        monsterId: Number(monster_id),
        isReady: false
      }
    });
    // Retornar arena atualizada
    const updatedArena = await prisma.arena.findUnique({
      where: { id: arenaId },
      include: {
        players: {
          include: { player: true, monster: true }
        }
      }
    });
    res.json(updatedArena);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Leave arena
exports.leaveArena = async (req, res) => {
  try {
    const { player_id } = req.body;
    const arenaId = Number(req.params.id);
    const arena = await prisma.arena.findUnique({
      where: { id: arenaId },
      include: { players: true }
    });
    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }
    if (arena.status !== 'WAITING') {
      return res.status(400).json({ message: 'Cannot leave arena during battle' });
    }
    // Remove player from arena
    await prisma.arenaPlayer.deleteMany({
      where: {
        arenaId,
        playerId: Number(player_id)
      }
    });
    res.json({ message: 'Player left arena successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Start battle
exports.startBattle = async (req, res) => {
  try {
    const arenaId = Number(req.params.id);
    const arena = await prisma.arena.findUnique({
      where: { id: arenaId },
      include: {
        players: {
          include: { player: true, monster: true }
        }
      }
    });
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
    await prisma.arena.update({
      where: { id: arenaId },
      data: {
        status: 'IN_PROGRESS',
        currentTurn: 1
      }
    });
    res.json({
      message: 'Battle started',
      turn: 1,
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

// Process battle action
exports.processAction = async (req, res) => {
  try {
    const { player_id, action } = req.body;
    const result = await BattleService.processAction(req.params.id, player_id, action);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get battle state
exports.getBattleState = async (req, res) => {
  try {
    const arenaId = Number(req.params.id);
    const arena = await prisma.arena.findUnique({
      where: { id: arenaId },
      include: {
        players: {
          include: { player: true, monster: true }
        }
      }
    });
    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }
    res.json({
      status: arena.status,
      currentTurn: arena.currentTurn,
      battleState: {
        player_1: {
          player: arena.players[0].player.name,
          monster: arena.players[0].monster.name,
          hp: arena.players[0].monster.hp
        },
        player_2: {
          player: arena.players[1].player.name,
          monster: arena.players[1].monster.name,
          hp: arena.players[1].monster.hp
        }
      },
      // battleLog e winner podem ser implementados conforme a lógica do novo banco
      battleLog: [],
      winner: null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
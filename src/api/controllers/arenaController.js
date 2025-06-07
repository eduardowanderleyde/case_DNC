
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const arenaService = require('../services/arenaService');

exports.getAllArenas = async (req, res) => {
  try {
    const arenas = await prisma.arena.findMany({
      include: {
        players: {
          include: {
            player: true,
            monster: true
          }
        },
        player1: true,
        player2: true
      }
    });
    res.json(arenas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
        },
        player1: true,
        player2: true
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

async function getUniqueArenaName(baseName) {
  let name = baseName;
  let count = 1;
  while (await prisma.arena.findUnique({ where: { name } })) {
    name = `${baseName}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    count++;
  }
  return name;
}

exports.createArena = async (req, res) => {
  try {
    let { name, maxPlayers } = req.body;
    if (!name) name = `Arena-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Limpa arenas antigas com o mesmo nome
    const arenasDuplicadas = await prisma.arena.findMany({ where: { name } });
    for (const arena of arenasDuplicadas) {
      await prisma.arenaPlayer.deleteMany({ where: { arenaId: arena.id } });
      await prisma.arena.delete({ where: { id: arena.id } });
    }

    // Tenta criar
    let newArena;
    try {
      newArena = await prisma.arena.create({
        data: {
          name,
          maxPlayers: maxPlayers || 2,
          battleLog: []
        }
      });
    } catch (err) {
      // Se ainda assim der erro, tenta com nome random
      const fallbackName = `Arena-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
      newArena = await prisma.arena.create({
        data: {
          name: fallbackName,
          maxPlayers: maxPlayers || 2,
          battleLog: []
        }
      });
    }

    res.status(201).json(newArena);
  } catch (error) {
    console.error('Erro ao criar arena:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.joinArena = async (req, res) => {
  try {
    const result = await arenaService.joinArena(req.body, req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

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
    // Remove player da arena
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

exports.startBattle = async (req, res) => {
  try {
    const { id } = req.params;
    const arena = await prisma.arena.findUnique({
      where: { id: parseInt(id) },
      include: {
        players: {
          include: { player: true, monster: true }
        },
        player1: true,
        player2: true
      }
    });

    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }
    if (arena.status !== 'WAITING') {
      return res.status(400).json({ message: 'Arena is not in waiting state' });
    }
    if (!arena.player1 || !arena.player2) {
      return res.status(400).json({ message: 'Arena needs two players to start' });
    }
    if (!arena.player1Id || !arena.player2Id || arena.player1Id === arena.player2Id) {
      return res.status(400).json({ message: 'Arena needs two different players to start' });
    }

    // Reset monsters' HP to their maxHp (from model)
    for (const p of arena.players) {
      await prisma.monster.update({
        where: { id: p.monsterId },
        data: { hp: p.monster.hp } // Se quiser um campo maxHp, troque para maxHp
      });
    }

    // Buscar os dois jogadores e seus monstros
    const player1 = arena.players.find(p => p.playerId === arena.player1Id);
    const player2 = arena.players.find(p => p.playerId === arena.player2Id);
    if (!player1 || !player2) {
      return res.status(400).json({ message: 'Jogadores não encontrados na arena.' });
    }
    // Buscar atributos de speed dos monstros
    const player1Speed = player1.monster.speed;
    const player2Speed = player2.monster.speed;
    let firstTurnId = player1.playerId;
    if (player2Speed > player1Speed) {
      firstTurnId = player2.playerId;
    }

    // Atualiza status, currentTurn e battleLog
    const updatedArena = await prisma.arena.update({
      where: { id: parseInt(id) },
      data: {
        status: 'IN_PROGRESS',
        currentTurn: firstTurnId,
        battleLog: [
          `Battle started between ${arena.player1.name} and ${arena.player2.name}`
        ]
      },
      include: {
        players: {
          include: { player: true, monster: true }
        },
        player1: true,
        player2: true
      }
    });

    res.json({
      message: 'Battle started',
      turn: 1,
      battle_state: {
        player_1: {
          monster: updatedArena.players[0].monster.name,
          hp: updatedArena.players[0].monster.hp
        },
        player_2: {
          monster: updatedArena.players[1].monster.name,
          hp: updatedArena.players[1].monster.hp
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error starting battle' });
  }
};

exports.processAction = async (req, res) => {
  try {
    const { player_id, action } = req.body;
    const arenaId = Number(req.params.id);
    const arena = await prisma.arena.findUnique({
      where: { id: arenaId },
      include: {
        players: { include: { player: true, monster: true } },
        player1: true,
        player2: true
      }
    });
    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }
    if (arena.status !== 'IN_PROGRESS') {
      return res.status(400).json({ message: 'Battle is not in progress' });
    }

    let battleStateTemp = arena.battleStateTemp || {};
    const currentPlayer = arena.players.find((p) => p.playerId === Number(player_id));
    const opponent = arena.players.find((p) => p.playerId !== Number(player_id));
    if (!currentPlayer || !opponent) {
      return res.status(400).json({ message: 'Player not found in arena' });
    }

    let message = '';
    let damage = 0;
    const newBattleLog = Array.isArray(arena.battleLog) ? [...arena.battleLog] : [];

    if (arena.currentTurn !== currentPlayer.playerId) {
      return res.status(400).json({ message: "It's not your turn!" });
    }

    switch (action) {
      case 'attack': {
        let defending = battleStateTemp.defendingPlayerId === opponent.playerId;
        damage = Math.max(1, currentPlayer.monster.attack - opponent.monster.defense);
        if (defending) {
          damage = Math.ceil(damage / 2);
          message = `${opponent.player.name} was defending! Damage halved.`;
          newBattleLog.push(message);
          battleStateTemp.defendingPlayerId = null;
        }
        opponent.monster.hp = Math.max(0, opponent.monster.hp - damage);
        message = `${currentPlayer.player.name} attacked ${opponent.player.name} causing ${damage} damage!`;
        break;
      }
      case 'defend': {
        battleStateTemp.defendingPlayerId = currentPlayer.playerId;
        message = `${currentPlayer.player.name} defended! The next attack received will have halved damage.`;
        break;
      }
      case 'special': {
        const temp = currentPlayer.monster.hp;
        currentPlayer.monster.hp = opponent.monster.hp;
        opponent.monster.hp = temp;
        message = `${currentPlayer.player.name} used SPECIAL: invert HP! Now ${currentPlayer.monster.name} has ${currentPlayer.monster.hp} and ${opponent.monster.name} has ${opponent.monster.hp}.`;
        break;
      }
      default:
        message = 'Invalid action';
    }
    newBattleLog.push(message);

    // Atualiza HP dos monstros no banco
    await prisma.monster.update({
      where: { id: opponent.monsterId },
      data: { hp: opponent.monster.hp }
    });
    await prisma.monster.update({
      where: { id: currentPlayer.monsterId },
      data: { hp: currentPlayer.monster.hp }
    });

    const nextTurn = opponent.playerId;
    let winner = null;
    if (opponent.monster.hp <= 0) {
      winner = currentPlayer.player;
      newBattleLog.push(`Battle finished! Winner: ${winner.name}`);
      await prisma.arena.update({
        where: { id: Number(arenaId) },
        data: {
          status: 'FINISHED',
          battleLog: newBattleLog,
          battleStateTemp: {},
        }
      });
      return res.json({ winner, battleLog: newBattleLog });
    } else {
      await prisma.arena.update({
        where: { id: Number(arenaId) },
        data: {
          currentTurn: nextTurn,
          battleLog: newBattleLog,
          battleStateTemp: battleStateTemp,
        }
      });
      // Simulação de bot: se o próximo turno for de um jogador seed (nome não igual ao player_id do request), faz ação automática
      const botPlayer = opponent;
      if (botPlayer && botPlayer.playerId !== Number(player_id) && botPlayer.player.name !== 'Edu' && botPlayer.player.name !== 'Iu' && botPlayer.player.name !== 'Wander') {
        // Escolhe ação aleatória para o bot
        const botActions = ['attack', 'defend', 'special'];
        const botAction = botActions[Math.floor(Math.random() * botActions.length)];
        // Chama recursivamente processAction para o bot
        req.body = { player_id: botPlayer.playerId, action: botAction };
        return exports.processAction(req, res);
      }
      return res.json({ currentTurn: nextTurn, battleLog: newBattleLog });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

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
      battleLog: arena.battleLog || [],
      winner: arena.status === 'FINISHED' ? arena.battleLog.slice(-1)[0] : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.performAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { player_id, action } = req.body;
    const arena = await prisma.arena.findUnique({
      where: { id: parseInt(id) },
      include: {
        players: { include: { player: true, monster: true } },
        player1: true,
        player2: true
      }
    });
    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }
    if (arena.status !== 'IN_PROGRESS') {
      return res.status(400).json({ message: 'Battle is not in progress' });
    }
    if (arena.currentTurn !== parseInt(player_id)) {
      return res.status(400).json({ message: "It's not your turn" });
    }
    const currentPlayer = arena.player1.id === parseInt(player_id) ? arena.player1 : arena.player2;
    const opponent = arena.player1.id === parseInt(player_id) ? arena.player2 : arena.player1;
    let damage = 0;
    let logMessage = '';
    const newBattleLog = Array.isArray(arena.battleLog) ? [...arena.battleLog] : [];
    switch (action) {
      case 'attack':
        damage = Math.max(1, currentPlayer.monster.attack - opponent.monster.defense);
        opponent.monster.hp = Math.max(0, opponent.monster.hp - damage);
        logMessage = `${currentPlayer.name} attacked ${opponent.name} causing ${damage} damage!`;
        break;
      case 'defend':
        logMessage = `${currentPlayer.name} defended!`;
        break;
      case 'special':
        const temp = currentPlayer.monster.hp;
        currentPlayer.monster.hp = opponent.monster.hp;
        opponent.monster.hp = temp;
        logMessage = `${currentPlayer.name} used SPECIAL: invert HP! Now ${currentPlayer.monster.name} has ${currentPlayer.monster.hp} and ${opponent.monster.name} has ${opponent.monster.hp}.`;
        break;
      case 'forfeit':
        logMessage = `${currentPlayer.name} forfeited the battle`;
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }
    newBattleLog.push(logMessage);
    // Atualiza HP dos monstros no banco
    await prisma.monster.update({
      where: { id: opponent.monsterId },
      data: { hp: opponent.monster.hp }
    });
    await prisma.monster.update({
      where: { id: currentPlayer.monsterId },
      data: { hp: currentPlayer.monster.hp }
    });
    const updatedArena = await prisma.arena.update({
      where: { id: parseInt(id) },
      data: {
        currentTurn: opponent.id,
        battleLog: newBattleLog
      },
      include: {
        players: { include: { player: true, monster: true } },
        player1: true,
        player2: true
      }
    });
    if (req.app && req.app.io) {
      req.app.io.to(`arena-${arena.id}`).emit('battle:action', updatedArena);
    }
    res.json(updatedArena);
  } catch (error) {
    res.status(500).json({ message: 'Error performing action' });
  }
};

exports.endBattle = async (req, res) => {
  try {
    const { id } = req.params;
    const arena = await prisma.arena.findUnique({
      where: { id: parseInt(id) },
      include: {
        players: { include: { player: true, monster: true } },
        player1: true,
        player2: true
      }
    });

    if (!arena) {
      return res.status(404).json({ message: 'Arena não encontrada' });
    }

    if (arena.status !== 'IN_PROGRESS') {
      return res.status(400).json({ message: 'Arena não está em batalha' });
    }

    const updatedArena = await prisma.arena.update({
      where: { id: parseInt(id) },
      data: {
        status: 'FINISHED',
        battleLog: [...(arena.battleLog || []), 'Batalha finalizada explicitamente']
      },
      include: {
        players: { include: { player: true, monster: true } },
        player1: true,
        player2: true
      }
    });

    // Buscar HPs finais de ambos os monstros
    const finalMonsters = await prisma.monster.findMany({
      where: {
        id: {
          in: [arena.players[0].monsterId, arena.players[1].monsterId]
        }
      }
    });
    let hpPlayer1 = null;
    let hpPlayer2 = null;
    const fm1 = arena.players[0].monsterId === finalMonsters[0].id
      ? finalMonsters[0]
      : finalMonsters[1];
    const fm2 = arena.players[1].monsterId === finalMonsters[0].id
      ? finalMonsters[0]
      : finalMonsters[1];
    hpPlayer1 = fm1.hp;
    hpPlayer2 = fm2.hp;

    if (req.app && req.app.io) {
      req.app.io.to(`arena-${arena.id}`).emit('battle:ended', {
        winner: null,
        hpPlayer1,
        hpPlayer2,
        battleLog: updatedArena.battleLog
      });
    }

    res.json(updatedArena);
  } catch (error) {
    console.error('Erro ao finalizar batalha:', error);
    res.status(500).json({ message: 'Erro ao finalizar batalha' });
  }
};

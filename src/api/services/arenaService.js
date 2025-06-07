const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function joinArena(body, arenaId) {
  const { player_id, monster_id } = body;
  arenaId = Number(arenaId);

  // Find existing arena
  const arena = await prisma.arena.findUnique({
    where: { id: arenaId },
    include: { players: true }
  });
  if (!arena) {
    throw new Error('Arena not found');
  }
  if (arena.status !== 'WAITING') {
    throw new Error('Arena is not available for joining');
  }
  if (arena.players.length >= arena.maxPlayers) {
    throw new Error('Arena is full');
  }

  // Check if player is already in the arena
  const playerExists = arena.players.some(p => p.playerId === Number(player_id));
  if (playerExists) {
    throw new Error('Player is already in this arena');
  }

  // Check if player and monster exist
  const player = await prisma.player.findUnique({ where: { id: Number(player_id) } });
  const monster = await prisma.monster.findUnique({ where: { id: Number(monster_id) } });
  if (!player || !monster) {
    throw new Error('Player or monster not found');
  }

  // Add player to arena (arenaPlayer)
  await prisma.arenaPlayer.create({
    data: {
      arenaId,
      playerId: Number(player_id),
      monsterId: Number(monster_id),
      isReady: false
    }
  });

  // Re-fetch arena to get player1Id / player2Id
  let arenaAfterJoin = await prisma.arena.findUnique({
    where: { id: arenaId },
    include: { players: true, player1: true, player2: true }
  });

  // Set player1Id if not set
  if (!arenaAfterJoin.player1Id) {
    await prisma.arena.update({
      where: { id: arenaId },
      data: { player1Id: Number(player_id) }
    });
  }

  // Re-fetch after update
  arenaAfterJoin = await prisma.arena.findUnique({
    where: { id: arenaId },
    include: { players: true, player1: true }
  });
  // Set player2Id if not set and player_id is different from player1Id
  if (!arenaAfterJoin.player2Id && arenaAfterJoin.player1Id !== Number(player_id)) {
    await prisma.arena.update({
      where: { id: arenaId },
      data: { player2Id: Number(player_id) }
    });
  }

  // Final fetch with all relationships
  const arenaWithPlayers = await prisma.arena.findUnique({
    where: { id: arenaId },
    include: {
      players: { include: { player: true, monster: true } },
      player1: true,
      player2: true
    }
  });

  return arenaWithPlayers;
}

module.exports = {
  joinArena,
}; 
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function joinArena(body, arenaId) {
  const { player_id, monster_id } = body;
  arenaId = Number(arenaId);

  console.log('[joinArena] Tentando entrar na arena:', arenaId, 'com player:', player_id, 'e monstro:', monster_id);

  // Buscar arena
  const arena = await prisma.arena.findUnique({
    where: { id: arenaId },
    include: { players: true }
  });
  if (!arena) {
    console.log('[joinArena] Arena não encontrada:', arenaId);
    throw new Error('Arena not found');
  }
  console.log('[joinArena] Arena encontrada:', arena.name, 'Status:', arena.status, 'Players:', arena.players.length, '/', arena.maxPlayers);

  if (arena.status !== 'WAITING') {
    console.log('[joinArena] Arena não está disponível para entrar:', arenaId, 'Status:', arena.status);
    throw new Error('Arena is not available for joining');
  }
  if (arena.players.length >= arena.maxPlayers) {
    console.log('[joinArena] Arena cheia:', arenaId);
    throw new Error('Arena is full');
  }

  // Buscar player e monstro
  const player = await prisma.player.findUnique({ where: { id: Number(player_id) } });
  const monster = await prisma.monster.findUnique({ where: { id: Number(monster_id) } });
  if (!player || !monster) {
    console.log('[joinArena] Player ou monstro não encontrado:', player_id, monster_id);
    throw new Error('Player or monster not found');
  }
  // Checar se o player já está na arena
  const alreadyInArena = arena.players.some(ap => ap.playerId === player.id);
  if (alreadyInArena) {
    console.log('[joinArena] Player já está na arena:', player.id);
    throw new Error('Player already in arena');
  }

  // Adicionar player à arena
  const arenaPlayer = await prisma.arenaPlayer.create({
    data: {
      arenaId: arena.id,
      playerId: player.id,
      monsterId: monster.id,
      isReady: false
    }
  });
  console.log('[joinArena] Player adicionado à arena:', arena.id, 'Player:', player.id, 'Monstro:', monster.id);

  // Atualizar player1Id e player2Id se necessário
  const updatedArena = await prisma.arena.findUnique({ where: { id: arena.id } });
  let updateData = {};
  if (!updatedArena.player1Id) {
    updateData.player1Id = player.id;
  } else if (!updatedArena.player2Id && updatedArena.player1Id !== player.id) {
    updateData.player2Id = player.id;
  }
  if (Object.keys(updateData).length > 0) {
    await prisma.arena.update({ where: { id: arena.id }, data: updateData });
    console.log('[joinArena] Atualizado player1Id/player2Id:', updateData);
  }

  return arenaPlayer;
}

/**
 * Cria uma arena com 1 jogador e um monstro do jogador
 * @param {number} playerId
 */
async function createArenaWithPlayer(playerId) {
  // Busca um monstro do jogador
  const monster = await prisma.monster.findFirst({ where: { ownerId: playerId } });
  if (!monster) return null;
  // Cria arena
  const arena = await prisma.arena.create({
    data: {
      name: `Arena ${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      maxPlayers: 2,
      battleLog: []
    }
  });
  // Adiciona o jogador e o monstro à arena
  await prisma.arenaPlayer.create({
    data: {
      arenaId: arena.id,
      playerId: playerId,
      monsterId: monster.id,
      isReady: false
    }
  });
  // Atualiza player1Id
  await prisma.arena.update({
    where: { id: arena.id },
    data: { player1Id: playerId }
  });
  return arena;
}

module.exports = {
  joinArena,
  createArenaWithPlayer,
}; 
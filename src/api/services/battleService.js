const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class BattleService {
  static calculateDamage(attacker, defender, action) {
    let damage = 0;
    
    switch (action) {
      case 'attack':
        // Base damage = attack - defense
        damage = Math.max(1, attacker.attack - defender.defense);
        break;
      
      case 'special':
        // Special damage = attack * 1.5 - defense
        damage = Math.max(1, Math.floor(attacker.attack * 1.5) - defender.defense);
        break;
      
      default:
        damage = 0;
    }
    
    return damage;
  }

  static async processAction(arenaId, playerId, action) {
    const arena = await prisma.arena.findUnique({
      where: { id: Number(arenaId) },
      include: {
        players: {
          include: { player: true, monster: true }
        }
      }
    });
    
    if (!arena) {
      throw new Error('Arena not found');
    }

    if (arena.status !== 'IN_PROGRESS') {
      throw new Error('Battle is not in progress');
    }

    // Find current player and opponent
    const currentPlayerIndex = arena.players.findIndex(p => p.playerId === Number(playerId));
    if (currentPlayerIndex === -1) {
      throw new Error('Player not in this arena');
    }

    const opponentIndex = currentPlayerIndex === 0 ? 1 : 0;
    const currentPlayer = arena.players[currentPlayerIndex];
    const opponent = arena.players[opponentIndex];

    // Check if it's the player's turn
    const isPlayerTurn = (arena.currentTurn - 1) % 2 === currentPlayerIndex;
    console.log('Current Turn:', arena.currentTurn);
    console.log('Current Player Index:', currentPlayerIndex);
    console.log('Is Player Turn:', isPlayerTurn);
    if (!isPlayerTurn) {
      throw new Error('Not your turn');
    }

    let damage = 0;
    let battleLog = {
      turn: arena.currentTurn,
      action,
      player: playerId,
      damage: 0,
      timestamp: new Date()
    };

    // Process action
    switch (action) {
      case 'attack':
        damage = this.calculateDamage(
          currentPlayer.monster,
          opponent.monster,
          'attack'
        );
        opponent.monster.hp -= damage;
        battleLog.damage = damage;
        break;

      case 'defend':
        // Temporarily increase defense
        currentPlayer.monster.defense = Math.floor(currentPlayer.monster.defense * 1.5);
        battleLog.message = 'Defense increased';
        break;

      case 'special':
        // Check special ability cooldown
        const lastSpecialTurn = arena.battleLog
          .filter(log => log.player.toString() === playerId && log.action === 'special')
          .pop()?.turn || 0;

        if (arena.currentTurn - lastSpecialTurn < 3) {
          throw new Error('Special ability is on cooldown');
        }

        damage = this.calculateDamage(
          currentPlayer.monster,
          opponent.monster,
          'special'
        );
        opponent.monster.hp -= damage;
        battleLog.damage = damage;
        break;

      case 'forfeit':
        await prisma.arena.update({
          where: { id: arena.id },
          data: { status: 'FINISHED', winner: opponent.playerId }
        });
        await this.endBattle(arena, opponent.playerId, currentPlayer.playerId);
        return {
          message: 'Player forfeited',
          winner: opponent.player.name
        };

      default:
        throw new Error('Invalid action');
    }

    // Adicionar log da batalha
    const updatedBattleLog = Array.isArray(arena.battleLog) ? [...arena.battleLog, JSON.stringify(battleLog)] : [JSON.stringify(battleLog)];
    await prisma.arena.update({
      where: { id: arena.id },
      data: { battleLog: updatedBattleLog }
    });

    // Check if the battle is over
    if (opponent.monster.hp <= 0) {
      await prisma.arena.update({
        where: { id: arena.id },
        data: { status: 'FINISHED', winner: currentPlayer.playerId }
      });
      await this.endBattle(arena, currentPlayer.playerId, opponent.playerId);
      return {
        message: 'Battle finished',
        winner: currentPlayer.player.name,
        battleLog: []
      };
    }

    // Update monsters' HP and advance turn
    await prisma.monster.update({
      where: { id: opponent.monsterId },
      data: { hp: opponent.monster.hp }
    });
    await prisma.arena.update({
      where: { id: arena.id },
      data: { currentTurn: arena.currentTurn + 1 }
    });

    return {
      message: 'Action processed',
      currentTurn: arena.currentTurn + 1,
      battleState: {
        player_1: {
          monster: arena.players[0].monster.name,
          hp: arena.players[0].monster.hp
        },
        player_2: {
          monster: arena.players[1].monster.name,
          hp: arena.players[1].monster.hp
        }
      },
      battleLog: []
    };
  }

  static async endBattle(arena, winnerId, loserId) {
    await prisma.player.update({
      where: { id: winnerId },
      data: { wins: { increment: 1 } }
    });
    await prisma.player.update({
      where: { id: loserId },
      data: { losses: { increment: 1 } }
    });
  }
}

module.exports = BattleService; 
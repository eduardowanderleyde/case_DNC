const Arena = require('../models/Arena');
const Player = require('../models/Player');

class BattleService {
  static calculateDamage(attacker, defender, action) {
    let damage = 0;
    
    switch (action) {
      case 'attack':
        // Dano base = ataque - defesa
        damage = Math.max(1, attacker.attack - defender.defense);
        break;
      
      case 'special':
        // Dano especial = ataque * 1.5 - defesa
        damage = Math.max(1, Math.floor(attacker.attack * 1.5) - defender.defense);
        break;
      
      default:
        damage = 0;
    }
    
    return damage;
  }

  static async processAction(arenaId, playerId, action) {
    const arena = await Arena.findById(arenaId)
      .populate('players.player')
      .populate('players.monster');
    
    if (!arena) {
      throw new Error('Arena not found');
    }

    if (arena.status !== 'IN_PROGRESS') {
      throw new Error('Battle is not in progress');
    }

    // Encontrar jogador atual e oponente
    const currentPlayerIndex = arena.players.findIndex(p => p.player._id.toString() === playerId);
    if (currentPlayerIndex === -1) {
      throw new Error('Player not in this arena');
    }

    const opponentIndex = currentPlayerIndex === 0 ? 1 : 0;
    const currentPlayer = arena.players[currentPlayerIndex];
    const opponent = arena.players[opponentIndex];

    // Verificar se é o turno do jogador
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

    // Processar ação
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
        // Aumenta a defesa temporariamente
        currentPlayer.monster.defense *= 1.5;
        battleLog.message = 'Defense increased';
        break;

      case 'special':
        // Verificar cooldown da habilidade especial
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
        arena.status = 'FINISHED';
        arena.winner = opponent.player._id;
        await this.endBattle(arena);
        return {
          message: 'Player forfeited',
          winner: opponent.player.name
        };

      default:
        throw new Error('Invalid action');
    }

    // Adicionar log da batalha
    arena.battleLog.push(battleLog);

    // Verificar se a batalha terminou
    if (opponent.monster.hp <= 0) {
      arena.status = 'FINISHED';
      arena.winner = currentPlayer.player._id;
      await this.endBattle(arena);
      return {
        message: 'Battle finished',
        winner: currentPlayer.player.name,
        battleLog: arena.battleLog
      };
    }

    // Avançar turno
    arena.currentTurn++;
    await arena.save();

    return {
      message: 'Action processed',
      currentTurn: arena.currentTurn,
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
      battleLog: arena.battleLog
    };
  }

  static async endBattle(arena) {
    // Atualizar estatísticas dos jogadores
    const winner = arena.players.find(p => p.player._id.equals(arena.winner));
    const loser = arena.players.find(p => !p.player._id.equals(arena.winner));

    await Player.findByIdAndUpdate(winner.player._id, {
      $inc: { wins: 1 },
      isInBattle: false
    });

    await Player.findByIdAndUpdate(loser.player._id, {
      $inc: { losses: 1 },
      isInBattle: false
    });

    await arena.save();
  }
}

module.exports = BattleService; 
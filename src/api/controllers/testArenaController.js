const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Inicia ou reseta a TestArena
exports.startTestArena = async (req, res) => {
  try {
    // Sempre reseta: deleta todas as arenas de teste
    await prisma.testArena.deleteMany();
    // Cria uma nova arena de teste com bot fixo
    const botName = 'Bot Teste';
    const playerName = req.body.playerName || 'Player';
    const playerMonster = req.body.playerMonster || 'Pikachu';
    const playerMonsterId = req.body.playerMonsterId;

    // Buscar atributos reais do monstro do player
    let playerMonsterData = await prisma.monster.findUnique({ where: { id: Number(playerMonsterId) } });
    if (!playerMonsterData) {
      // fallback para Pikachu
      playerMonsterData = await prisma.monster.findFirst({ where: { name: 'Pikachu' } });
    }

    // Buscar monstro do bot (usar Pikachu se não houver Rattata)
    let botMonsterData = await prisma.monster.findFirst({ where: { name: 'Rattata' } });
    if (!botMonsterData) {
      botMonsterData = await prisma.monster.findFirst({ where: { name: 'Pikachu' } });
    }

    // Definir quem começa pelo atributo speed
    let firstTurn = 'player';
    if (botMonsterData.speed > playerMonsterData.speed) {
      firstTurn = 'bot';
    }

    const arena = await prisma.testArena.create({
      data: {
        playerName,
        playerMonster: playerMonsterData.name,
        botName,
        botMonster: botMonsterData.name,
        playerHp: playerMonsterData.hp,
        botHp: botMonsterData.hp,
        status: 'IN_PROGRESS',
        currentTurn: firstTurn,
        battleLog: ['Batalha de teste iniciada!'],
      }
    });

    let finalArena = arena;
    let playerHp = playerMonsterData.hp;
    let botHp = botMonsterData.hp;
    let battleLog = ['Batalha de teste iniciada!'];
    let defendingBot = false;
    let defendingPlayer = false;
    if (firstTurn === 'bot') {
      // Bot faz ação aleatória
      const botActions = ['attack', 'defend', 'special'];
      const botAction = botActions[Math.floor(Math.random() * botActions.length)];
      let botLog = '';
      switch (botAction) {
        case 'attack': {
          let danoBot = Math.max(1, botMonsterData.attack - playerMonsterData.defense);
          playerHp = Math.max(0, playerHp - danoBot);
          botLog = `${botName} atacou ${playerName} causando ${danoBot} de dano!`;
          break;
        }
        case 'defend': {
          defendingBot = true;
          botLog = `${botName} defendeu! O próximo ataque recebido terá dano reduzido.`;
          break;
        }
        case 'special': {
          [playerHp, botHp] = [botHp, playerHp];
          botLog = `${botName} usou especial: inverteu os HPs!`;
          break;
        }
      }
      battleLog.push(botLog);
      // Atualiza arena após ação do bot
      finalArena = await prisma.testArena.update({
        where: { id: arena.id },
        data: {
          playerHp,
          botHp,
          currentTurn: 'player',
          battleLog,
          defendingBot,
          defendingPlayer
        }
      });
    }
    // Enviar atributos completos para o frontend
    res.json({
      ...finalArena,
      playerMonsterData: {
        name: playerMonsterData.name,
        hp: playerMonsterData.hp,
        attack: playerMonsterData.attack,
        defense: playerMonsterData.defense,
        speed: playerMonsterData.speed,
        special: playerMonsterData.special,
        imageUrl: playerMonsterData.imageUrl
      },
      botMonsterData: {
        name: botMonsterData.name,
        hp: botMonsterData.hp,
        attack: botMonsterData.attack,
        defense: botMonsterData.defense,
        speed: botMonsterData.speed,
        special: botMonsterData.special,
        imageUrl: botMonsterData.imageUrl
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Processa ação na TestArena
exports.actionTestArena = async (req, res) => {
  try {
    const arena = await prisma.testArena.findFirst({ orderBy: { createdAt: 'desc' } });
    if (!arena || arena.status !== 'IN_PROGRESS') {
      return res.status(400).json({ message: 'Nenhuma batalha de teste em andamento.' });
    }
    const { action } = req.body;
    let { playerHp, botHp, currentTurn, battleLog } = arena;
    let log = '';
    if (arena.currentTurn !== 'player') {
      return res.status(400).json({ message: 'Não é o turno do jogador.' });
    }
    // Buscar atributos reais dos monstros
    const playerMonsterData = await prisma.monster.findFirst({ where: { name: arena.playerMonster } });
    const botMonsterData = await prisma.monster.findFirst({ where: { name: arena.botMonster } });
    // Estado temporário de defesa
    let defendingBot = arena.defendingBot || false;
    let defendingPlayer = arena.defendingPlayer || false;

    switch (action) {
      case 'attack': {
        let dano = Math.max(1, playerMonsterData.attack - botMonsterData.defense);
        if (defendingBot) {
          dano = Math.ceil(dano / 2);
          log = `${arena.botName} defendeu! Dano reduzido pela metade.`;
          battleLog.push(log);
          defendingBot = false;
        }
        botHp = Math.max(0, botHp - dano);
        log = `${arena.playerName} atacou ${arena.botName} causando ${dano} de dano!`;
        break;
      }
      case 'defend': {
        defendingPlayer = true;
        log = `${arena.playerName} defendeu! O próximo ataque recebido terá dano reduzido.`;
        break;
      }
      case 'special': {
        [playerHp, botHp] = [botHp, playerHp];
        log = `${arena.playerName} usou especial: inverteu os HPs!`;
        break;
      }
      default:
        return res.status(400).json({ message: 'Ação inválida.' });
    }
    battleLog.push(log);
    // Verifica se o bot perdeu
    if (botHp <= 0) {
      battleLog.push(`Vitória do jogador!`);
      await prisma.testArena.delete({ where: { id: arena.id } });
      return res.json({ status: 'FINISHED', battleLog, playerHp, botHp });
    }
    // Turno do bot
    // Bot faz ação aleatória
    const botActions = ['attack', 'defend', 'special'];
    const botAction = botActions[Math.floor(Math.random() * botActions.length)];
    let botLog = '';
    switch (botAction) {
      case 'attack': {
        let danoBot = Math.max(1, botMonsterData.attack - playerMonsterData.defense);
        if (defendingPlayer) {
          danoBot = Math.ceil(danoBot / 2);
          botLog = `${arena.playerName} defendeu! Dano reduzido pela metade.`;
          battleLog.push(botLog);
          defendingPlayer = false;
        }
        playerHp = Math.max(0, playerHp - danoBot);
        botLog = `${arena.botName} atacou ${arena.playerName} causando ${danoBot} de dano!`;
        break;
      }
      case 'defend': {
        defendingBot = true;
        botLog = `${arena.botName} defendeu! O próximo ataque recebido terá dano reduzido.`;
        break;
      }
      case 'special': {
        [playerHp, botHp] = [botHp, playerHp];
        botLog = `${arena.botName} usou especial: inverteu os HPs!`;
        break;
      }
    }
    battleLog.push(botLog);
    let status = 'IN_PROGRESS';
    if (playerHp <= 0) {
      battleLog.push(`Vitória do bot!`);
      status = 'FINISHED';
      await prisma.testArena.delete({ where: { id: arena.id } });
      return res.json({ status, battleLog, playerHp, botHp });
    }
    await prisma.testArena.update({ where: { id: arena.id }, data: { playerHp, botHp, currentTurn: 'player', status, battleLog, defendingBot, defendingPlayer } });
    res.json({ status, battleLog, playerHp, botHp });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Retorna o estado atual da TestArena
exports.stateTestArena = async (req, res) => {
  try {
    const arena = await prisma.testArena.findFirst({ orderBy: { createdAt: 'desc' } });
    if (!arena) {
      return res.json({ status: 'NONE' });
    }
    // Buscar atributos reais dos monstros
    const playerMonsterData = await prisma.monster.findFirst({ where: { name: arena.playerMonster } });
    const botMonsterData = await prisma.monster.findFirst({ where: { name: arena.botMonster } });
    res.json({
      ...arena,
      playerMonsterData: playerMonsterData ? {
        name: playerMonsterData.name,
        hp: playerMonsterData.hp,
        attack: playerMonsterData.attack,
        defense: playerMonsterData.defense,
        speed: playerMonsterData.speed,
        special: playerMonsterData.special,
        imageUrl: playerMonsterData.imageUrl
      } : {},
      botMonsterData: botMonsterData ? {
        name: botMonsterData.name,
        hp: botMonsterData.hp,
        attack: botMonsterData.attack,
        defense: botMonsterData.defense,
        speed: botMonsterData.speed,
        special: botMonsterData.special,
        imageUrl: botMonsterData.imageUrl
      } : {}
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
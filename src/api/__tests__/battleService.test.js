const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const BattleService = require('../services/battleService');

describe('BattleService', () => {
  let player1, player2, monster1, monster2, arena;

  beforeAll(async () => {
    // Limpar dados antigos
    await prisma.arenaPlayer.deleteMany();
    await prisma.monster.deleteMany();
    await prisma.player.deleteMany();
    await prisma.arena.deleteMany();
    // Criar jogadores de teste
    player1 = await prisma.player.create({ data: { name: 'Player1' } });
    player2 = await prisma.player.create({ data: { name: 'Player2' } });
    // Criar monstros de teste
    monster1 = await prisma.monster.create({
      data: {
        name: 'Dragon',
        type: 'FIRE',
        imageUrl: 'https://img.com/dragon.png',
        hp: 100,
        attack: 20,
        defense: 10,
        speed: 50,
        special: 'fireblast',
        ownerId: player1.id
      }
    });
    monster2 = await prisma.monster.create({
      data: {
        name: 'Phoenix',
        type: 'FIRE',
        imageUrl: 'https://img.com/phoenix.png',
        hp: 80,
        attack: 25,
        defense: 5,
        speed: 60,
        special: 'rebirth',
        ownerId: player2.id
      }
    });
    // Criar arena de teste
    arena = await prisma.arena.create({
      data: {
        name: 'Test Arena',
        maxPlayers: 2,
        status: 'IN_PROGRESS',
        currentTurn: 1
      }
    });
    // Vincular jogadores à arena
    await prisma.arenaPlayer.createMany({
      data: [
        {
          arenaId: arena.id,
          playerId: player1.id,
          monsterId: monster1.id,
          isReady: true
        },
        {
          arenaId: arena.id,
          playerId: player2.id,
          monsterId: monster2.id,
          isReady: true
        }
      ]
    });
  });

  afterAll(async () => {
    await prisma.arenaPlayer.deleteMany();
    await prisma.monster.deleteMany();
    await prisma.player.deleteMany();
    await prisma.arena.deleteMany();
    await prisma.$disconnect();
  });

  it('deve calcular o dano corretamente', () => {
    const dano = BattleService.calculateDamage(monster1, monster2, 'attack');
    expect(dano).toBe(15); // 20 (atk) - 5 (def) = 15
  });
}); 
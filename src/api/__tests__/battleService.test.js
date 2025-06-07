const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const BattleService = require('../services/battleService');

describe('BattleService', () => {
  let player1, player2, monster1, monster2, arena;

  beforeEach(async () => {
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

  it('deve calcular o dano mínimo como 1', () => {
    const dano = BattleService.calculateDamage({ attack: 5 }, { defense: 10 }, 'attack');
    expect(dano).toBe(1);
  });

  it('deve calcular o dano do ataque especial corretamente', () => {
    const dano = BattleService.calculateDamage(monster1, monster2, 'special');
    expect(dano).toBe(Math.max(1, Math.floor(monster1.attack * 1.5) - monster2.defense));
  });

  it('deve aumentar defesa ao defender', async () => {
    // Simula ação de defesa
    const arenaId = arena.id;
    await BattleService.processAction(arenaId, player1.id, 'defend');
    const updated = await prisma.monster.findUnique({ where: { id: monster1.id } });
    expect(updated.defense).toBeGreaterThan(monster1.defense);
  });

  it('deve alternar turno corretamente', async () => {
    const arenaId = arena.id;
    // Player1 ataca
    await BattleService.processAction(arenaId, player1.id, 'attack');
    const updatedArena = await prisma.arena.findUnique({ where: { id: arenaId } });
    expect(updatedArena.currentTurn).toBe(2);
  });

  it('não permite ação fora do turno', async () => {
    const arenaId = arena.id;
    // Player2 tenta agir fora do turno
    await expect(BattleService.processAction(arenaId, player2.id, 'attack')).rejects.toThrow('Not your turn');
  });

  it('finaliza batalha quando HP chega a zero', async () => {
    // Reduz HP do oponente para 1
    await prisma.monster.update({ where: { id: monster2.id }, data: { hp: 1 } });
    const arenaId = arena.id;
    const result = await BattleService.processAction(arenaId, player1.id, 'attack');
    expect(result.message).toMatch(/Battle finished/);
    const updatedArena = await prisma.arena.findUnique({ where: { id: arenaId } });
    expect(updatedArena.status).toBe('FINISHED');
  });
}); 
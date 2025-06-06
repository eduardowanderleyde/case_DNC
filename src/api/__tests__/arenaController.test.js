const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = require('../../server');
// Mock apenas o app.io.emit para não emitir eventos reais durante os testes
if (!app.io) app.io = {};
app.io.emit = jest.fn();
const arenaController = require('../controllers/arenaController');

describe('Arena Controller', () => {
  let player1, player2, monster1, monster2, arena, arenaId;

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
        ownerId: player1.id,
        special: 'fireblast'
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
        ownerId: player2.id,
        special: 'rebirth'
      }
    });
    // Criar arena de teste
    arena = await prisma.arena.create({
      data: {
        name: 'Test Arena',
        maxPlayers: 2,
        player1: { connect: { id: player1.id } },
        player2: { connect: { id: player2.id } }
      }
    });
    arenaId = arena.id;
  });

  afterAll(async () => {
    await prisma.arenaPlayer.deleteMany();
    await prisma.monster.deleteMany();
    await prisma.player.deleteMany();
    await prisma.arena.delete({ where: { id: arenaId } });
    await prisma.$disconnect();
  });

  describe('GET /api/arenas', () => {
    it('should get all arenas', async () => {
      const response = await request(app).get('/api/arenas');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/arenas/:id', () => {
    it('should get arena by id', async () => {
      const response = await request(app).get(`/api/arenas/${arena.id}`);
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Test Arena');
    });

    it('should return 404 for non-existent arena', async () => {
      const response = await request(app).get(`/api/arenas/99999`);
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/arenas', () => {
    it('should create new arena', async () => {
      const response = await request(app)
        .post('/api/arenas')
        .send({
          name: 'New Arena',
          maxPlayers: 2
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('New Arena');
    });

    it('should not create arena with duplicate name', async () => {
      const response = await request(app)
        .post('/api/arenas')
        .send({
          name: 'Test Arena',
          maxPlayers: 2
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/arenas/:id/join', () => {
    it('should allow player to join arena', async () => {
      const response = await request(app)
        .post(`/api/arenas/${arena.id}/join`)
        .send({
          player_id: player1.id,
          monster_id: monster1.id
        });

      expect(response.status).toBe(200);
      expect(response.body.players.length).toBe(1);
    });

    it('should not allow player to join full arena', async () => {
      // Add second player
      await request(app)
        .post(`/api/arenas/${arena.id}/join`)
        .send({
          player_id: player2.id,
          monster_id: monster2.id
        });

      // Try to add third player
      const response = await request(app)
        .post(`/api/arenas/${arena.id}/join`)
        .send({
          player_id: 99999,
          monster_id: 99999
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/arenas/:id/start', () => {
    it('should start battle when all players are ready', async () => {
      // Mark players as ready
      await prisma.arenaPlayer.updateMany({
        where: {
          arenaId: arena.id,
          playerId: {
            in: [player1.id, player2.id]
          }
        },
        data: {
          isReady: true
        }
      });
      // Log players state after join
      const arenaAfterJoin = await prisma.arena.findUnique({
        where: { id: arena.id },
        include: {
          players: {
            include: {
              player: true,
              monster: true
            }
          }
        }
      });
      console.log('Players após join:', JSON.stringify(arenaAfterJoin.players, null, 2));
      // Start the battle
      const response = await request(app)
        .post(`/api/arenas/${arena.id}/start`);
      // Log arena state after start
      const arenaAfterStart = await prisma.arena.findUnique({
        where: { id: arena.id },
        include: {
          players: {
            include: {
              player: true,
              monster: true
            }
          }
        }
      });
      console.log('Arena após start:', JSON.stringify(arenaAfterStart, null, 2));
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Battle started');
      expect(response.body.turn).toBe(1);
    });

    it('should not start battle if not all players are ready', async () => {
      // Create new arena
      const newArena = await prisma.arena.create({
        data: {
          name: 'New Battle Arena',
          maxPlayers: 2,
          players: {
            create: [
              {
                playerId: player1.id,
                monsterId: monster1.id,
                isReady: false
              }
            ]
          }
        }
      });

      const response = await request(app)
        .post(`/api/arenas/${newArena.id}/start`);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/arenas/:id/action', () => {
    it('should process battle action', async () => {
      // Criar arena com player1 e player2 conectados
      const isolatedArena = await prisma.arena.create({
        data: {
          name: 'Arena Battle Action',
          maxPlayers: 2,
          player1: { connect: { id: player1.id } },
          player2: { connect: { id: player2.id } }
        }
      });
      // Adicionar ambos jogadores à arena
      await prisma.arenaPlayer.create({
        data: {
          arenaId: isolatedArena.id,
          playerId: player1.id,
          monsterId: monster1.id,
          isReady: true
        }
      });
      await prisma.arenaPlayer.create({
        data: {
          arenaId: isolatedArena.id,
          playerId: player2.id,
          monsterId: monster2.id,
          isReady: true
        }
      });
      // Iniciar a batalha
      await request(app)
        .post(`/api/arenas/${isolatedArena.id}/start`);
      // Buscar estado da arena para saber o turno
      const arenaState = await prisma.arena.findUnique({
        where: { id: isolatedArena.id },
        include: {
          players: true
        }
      });
      const turnPlayerId = arenaState.currentTurn;
      // Processar ação de ataque com o jogador do turno
      const response = await request(app)
        .post(`/api/arenas/${isolatedArena.id}/action`)
        .send({
          player_id: turnPlayerId,
          action: 'attack'
        });
      if (response.status !== 200) {
        console.log('Resposta erro:', response.body);
      }
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Action processed');
    });

    it('should not allow action if battle is not in progress', async () => {
      // Create waiting arena
      const waitingArena = await prisma.arena.create({
        data: {
          name: 'Waiting Arena',
          maxPlayers: 2,
          status: 'WAITING'
        }
      });

      const response = await request(app)
        .post(`/api/arenas/${waitingArena.id}/action`)
        .send({
          player_id: player1.id,
          action: 'attack'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/arenas/:id/battle', () => {
    it('should get battle state', async () => {
      const response = await request(app)
        .get(`/api/arenas/${arena.id}/battle`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('currentTurn');
      expect(response.body).toHaveProperty('battleState');
    });

    it('should return 404 for non-existent arena', async () => {
      const response = await request(app)
        .get(`/api/arenas/99999/battle`);

      expect(response.status).toBe(404);
    });
  });

  it('should start a battle and emit WebSocket event', async () => {
    // Garantir que a arena tenha player1 e player2 conectados
    const battleArena = await prisma.arena.create({
      data: {
        name: 'Emit Arena',
        maxPlayers: 2,
        player1: { connect: { id: player1.id } },
        player2: { connect: { id: player2.id } }
      }
    });
    await prisma.arenaPlayer.create({
      data: {
        arenaId: battleArena.id,
        playerId: player1.id,
        monsterId: monster1.id,
        isReady: true
      }
    });
    await prisma.arenaPlayer.create({
      data: {
        arenaId: battleArena.id,
        playerId: player2.id,
        monsterId: monster2.id,
        isReady: true
      }
    });
    const response = await request(app)
      .post(`/api/arenas/${battleArena.id}/start`)
      .expect(200);
    expect(response.body.message).toBe('Battle started');
    expect(response.body.turn).toBe(1);
  });

  it('should perform an action and emit WebSocket event', async () => {
    // Garantir que a arena tenha player1 e player2 conectados
    const battleArena = await prisma.arena.create({
      data: {
        name: 'Emit Arena Action',
        maxPlayers: 2,
        player1: { connect: { id: player1.id } },
        player2: { connect: { id: player2.id } }
      }
    });
    await prisma.arenaPlayer.create({
      data: {
        arenaId: battleArena.id,
        playerId: player1.id,
        monsterId: monster1.id,
        isReady: true
      }
    });
    await prisma.arenaPlayer.create({
      data: {
        arenaId: battleArena.id,
        playerId: player2.id,
        monsterId: monster2.id,
        isReady: true
      }
    });
    await request(app)
      .post(`/api/arenas/${battleArena.id}/start`);
    // Buscar estado da arena para saber o turno
    const arenaState = await prisma.arena.findUnique({
      where: { id: battleArena.id },
      include: {
        players: true
      }
    });
    const turnPlayerId = arenaState.currentTurn;
    const response = await request(app)
      .post(`/api/arenas/${battleArena.id}/action`)
      .send({ player_id: turnPlayerId, action: 'attack' })
      .expect(200);
    expect(response.body.message).toBe('Action processed');
  });

  it('should end a battle and emit WebSocket event', async () => {
    const response = await request(app)
      .post(`/api/arenas/${arenaId}/end`)
      .expect(200);

    expect(response.body.status).toBe('FINISHED');
    expect(response.body.battleLog).toContain('Batalha finalizada explicitamente');
  });
}); 
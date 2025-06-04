const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../server');
const Arena = require('../models/Arena');
const Player = require('../models/Player');
const Monster = require('../models/Monster');

describe('Arena Controller', () => {
  let player1, player2, monster1, monster2, arena;

  beforeAll(async () => {
    // Criar jogadores de teste
    player1 = await Player.create({
      name: 'Player1',
      email: 'player1@test.com',
      password: 'password123'
    });

    player2 = await Player.create({
      name: 'Player2',
      email: 'player2@test.com',
      password: 'password123'
    });

    // Criar monstros de teste
    monster1 = await Monster.create({
      name: 'Dragon',
      type: 'FIRE',
      hp: 100,
      attack: 20,
      defense: 10,
      imageUrl: 'https://img.com/dragon.png',
      speed: 50
    });

    monster2 = await Monster.create({
      name: 'Phoenix',
      type: 'FIRE',
      hp: 80,
      attack: 25,
      defense: 5,
      imageUrl: 'https://img.com/phoenix.png',
      speed: 60
    });

    // Criar arena de teste
    arena = await Arena.create({
      name: 'Test Arena',
      maxPlayers: 2
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
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
      const response = await request(app).get(`/api/arenas/${arena._id}`);
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Test Arena');
    });

    it('should return 404 for non-existent arena', async () => {
      const response = await request(app).get(`/api/arenas/${new mongoose.Types.ObjectId()}`);
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
        .post(`/api/arenas/${arena._id}/join`)
        .send({
          player_id: player1._id,
          monster_id: monster1._id
        });

      expect(response.status).toBe(200);
      expect(response.body.players.length).toBe(1);
    });

    it('should not allow player to join full arena', async () => {
      // Adicionar segundo jogador
      await request(app)
        .post(`/api/arenas/${arena._id}/join`)
        .send({
          player_id: player2._id,
          monster_id: monster2._id
        });

      // Tentar adicionar terceiro jogador
      const response = await request(app)
        .post(`/api/arenas/${arena._id}/join`)
        .send({
          player_id: new mongoose.Types.ObjectId(),
          monster_id: new mongoose.Types.ObjectId()
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/arenas/:id/start', () => {
    it('should start battle when all players are ready', async () => {
      // Marcar jogadores como prontos
      await Arena.findByIdAndUpdate(arena._id, {
        $set: {
          'players.0.isReady': true,
          'players.1.isReady': true
        }
      });
      // Log do estado dos jogadores após join
      const arenaAfterJoin = await Arena.findById(arena._id);
      console.log('Players após join:', JSON.stringify(arenaAfterJoin.players, null, 2));
      // Iniciar a batalha
      const response = await request(app)
        .post(`/api/arenas/${arena._id}/start`);
      // Log do estado da arena após o start
      const arenaAfterStart = await Arena.findById(arena._id);
      console.log('Arena após start:', JSON.stringify(arenaAfterStart, null, 2));
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Battle started');
      expect(response.body.turn).toBe(1);
    });

    it('should not start battle if not all players are ready', async () => {
      // Criar nova arena
      const newArena = await Arena.create({
        name: 'New Battle Arena',
        maxPlayers: 2,
        players: [
          {
            player: player1._id,
            monster: monster1._id,
            isReady: false
          }
        ]
      });

      const response = await request(app)
        .post(`/api/arenas/${newArena._id}/start`);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/arenas/:id/action', () => {
    it('should process battle action', async () => {
      // Criar nova arena isolada
      const isolatedArena = await Arena.create({
        name: 'Arena Battle Action',
        maxPlayers: 2
      });
      // Adicionar os dois jogadores na arena
      await request(app)
        .post(`/api/arenas/${isolatedArena._id}/join`)
        .send({
          player_id: player1._id,
          monster_id: monster1._id
        });
      await request(app)
        .post(`/api/arenas/${isolatedArena._id}/join`)
        .send({
          player_id: player2._id,
          monster_id: monster2._id
        });
      // Marcar ambos como prontos
      await Arena.findByIdAndUpdate(isolatedArena._id, {
        $set: {
          'players.0.isReady': true,
          'players.1.isReady': true
        }
      });
      // Iniciar a batalha
      await request(app)
        .post(`/api/arenas/${isolatedArena._id}/start`);
      // Buscar estado da arena para saber de quem é o turno
      const arenaState = await Arena.findById(isolatedArena._id);
      const turnIndex = (arenaState.currentTurn - 1) % 2;
      const playerIdTurn = arenaState.players[turnIndex].player;
      console.log('Jogador do turno:', playerIdTurn);
      // Processar ação de batalha com o jogador do turno
      const response = await request(app)
        .post(`/api/arenas/${isolatedArena._id}/action`)
        .send({
          player_id: playerIdTurn,
          action: 'attack'
        });
      if (response.status !== 200) {
        console.log('Resposta erro:', response.body);
      }
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Action processed');
    });

    it('should not allow action if battle is not in progress', async () => {
      // Criar arena em estado de espera
      const waitingArena = await Arena.create({
        name: 'Waiting Arena',
        maxPlayers: 2,
        status: 'WAITING'
      });

      const response = await request(app)
        .post(`/api/arenas/${waitingArena._id}/action`)
        .send({
          player_id: player1._id,
          action: 'attack'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/arenas/:id/battle', () => {
    it('should get battle state', async () => {
      const response = await request(app)
        .get(`/api/arenas/${arena._id}/battle`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('currentTurn');
      expect(response.body).toHaveProperty('battleState');
    });

    it('should return 404 for non-existent arena', async () => {
      const response = await request(app)
        .get(`/api/arenas/${new mongoose.Types.ObjectId()}/battle`);

      expect(response.status).toBe(404);
    });
  });
}); 
const mongoose = require('mongoose');
const Monster = require('../models/Monster');
const monsterController = require('../controllers/monsterController');

// Mock response object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Monster Controller Test', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/monster-battle-test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Monster.deleteMany({});
  });

  describe('getAllMonsters', () => {
    it('should return empty array when no monsters exist', async () => {
      const req = {};
      const res = mockResponse();

      await monsterController.getAllMonsters(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return all monsters', async () => {
      const monster = await Monster.create({
        name: 'Test Monster',
        type: 'FIRE',
        hp: 100,
        attack: 50,
        defense: 30,
        speed: 40,
        imageUrl: 'https://example.com/monster.jpg'
      });

      const req = {};
      const res = mockResponse();

      await monsterController.getAllMonsters(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([expect.objectContaining({
        name: monster.name,
        type: monster.type
      })]);
    });
  });

  describe('createMonster', () => {
    it('should create a new monster', async () => {
      const req = {
        body: {
          name: 'New Monster',
          type: 'WATER',
          hp: 100,
          attack: 50,
          defense: 30,
          speed: 40,
          imageUrl: 'https://example.com/monster.jpg'
        }
      };
      const res = mockResponse();

      await monsterController.createMonster(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        name: req.body.name,
        type: req.body.type
      }));
    });

    it('should return 400 for invalid monster data', async () => {
      const req = {
        body: {
          name: 'Invalid Monster'
          // Missing required fields
        }
      };
      const res = mockResponse();

      await monsterController.createMonster(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
}); 
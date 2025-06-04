const mongoose = require('mongoose');
const Monster = require('../models/Monster');

describe('Monster Model Test', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/monster-battle-test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('should create & save monster successfully', async () => {
    const validMonster = new Monster({
      name: 'Test Monster',
      type: 'FIRE',
      hp: 100,
      attack: 50,
      defense: 30,
      speed: 40,
      imageUrl: 'https://example.com/monster.jpg'
    });
    const savedMonster = await validMonster.save();
    
    expect(savedMonster._id).toBeDefined();
    expect(savedMonster.name).toBe(validMonster.name);
    expect(savedMonster.type).toBe(validMonster.type);
    expect(savedMonster.hp).toBe(validMonster.hp);
  });

  it('should fail to save monster without required fields', async () => {
    const monsterWithoutRequiredField = new Monster({ name: 'Test Monster' });
    let err;
    
    try {
      await monsterWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should fail to save monster with invalid type', async () => {
    const monsterWithInvalidType = new Monster({
      name: 'Test Monster',
      type: 'INVALID_TYPE',
      hp: 100,
      attack: 50,
      defense: 30,
      speed: 40,
      imageUrl: 'https://example.com/monster.jpg'
    });
    
    let err;
    try {
      await monsterWithInvalidType.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });
}); 
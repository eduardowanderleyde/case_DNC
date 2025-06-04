const mongoose = require('mongoose');
const Player = require('../../src/api/models/Player');

describe('Player Model Test', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/monster-battle-test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('should create & save player successfully', async () => {
    const validPlayer = new Player({
      name: 'Test Player'
    });
    const savedPlayer = await validPlayer.save();
    
    expect(savedPlayer._id).toBeDefined();
    expect(savedPlayer.name).toBe(validPlayer.name);
    expect(savedPlayer.wins).toBe(0);
    expect(savedPlayer.losses).toBe(0);
    expect(savedPlayer.isInBattle).toBe(false);
  });

  it('should fail to save player without required fields', async () => {
    const playerWithoutRequiredField = new Player({});
    let err;
    
    try {
      await playerWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should fail to save player with name shorter than 2 characters', async () => {
    const playerWithShortName = new Player({
      name: 'A'
    });
    
    let err;
    try {
      await playerWithShortName.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });
}); 
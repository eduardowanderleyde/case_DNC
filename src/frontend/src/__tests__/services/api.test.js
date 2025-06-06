import React from 'react';
import axios from 'axios';
import { playerService, monsterService, arenaService } from '../../services/api';

jest.mock('axios');

describe('API Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('playerService', () => {
    it('should list players', async () => {
      const mockPlayers = [{ id: 1, name: 'Player 1' }];
      axios.get.mockResolvedValueOnce({ data: mockPlayers });

      const result = await playerService.list();
      expect(result).toEqual(mockPlayers);
      expect(axios.get).toHaveBeenCalledWith('/players');
    });

    it('should create player', async () => {
      const mockPlayer = { name: 'New Player' };
      const mockResponse = { id: 1, ...mockPlayer };
      axios.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await playerService.create(mockPlayer);
      expect(result).toEqual(mockResponse);
      expect(axios.post).toHaveBeenCalledWith('/players', mockPlayer);
    });
  });

  describe('monsterService', () => {
    it('should list monsters', async () => {
      const mockMonsters = [{ id: 1, name: 'Dragon' }];
      axios.get.mockResolvedValueOnce({ data: mockMonsters });

      const result = await monsterService.list();
      expect(result).toEqual(mockMonsters);
      expect(axios.get).toHaveBeenCalledWith('/monsters');
    });

    it('should create monster', async () => {
      const mockMonster = { name: 'New Monster', hp: 100 };
      const mockResponse = { id: 1, ...mockMonster };
      axios.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await monsterService.create(mockMonster);
      expect(result).toEqual(mockResponse);
      expect(axios.post).toHaveBeenCalledWith('/monsters', mockMonster);
    });
  });

  describe('arenaService', () => {
    it('should create arena', async () => {
      const mockArena = {
        player1Id: 1,
        player2Id: 2,
        monster1Id: 1,
        monster2Id: 2
      };
      const mockResponse = { id: 1, ...mockArena };
      axios.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await arenaService.create(mockArena);
      expect(result).toEqual(mockResponse);
      expect(axios.post).toHaveBeenCalledWith('/arenas', mockArena);
    });

    it('should get arena by id', async () => {
      const mockArena = { id: 1, status: 'active' };
      axios.get.mockResolvedValueOnce({ data: mockArena });

      const result = await arenaService.get(1);
      expect(result).toEqual(mockArena);
      expect(axios.get).toHaveBeenCalledWith('/arenas/1');
    });

    it('should end battle', async () => {
      const mockResponse = { id: 1, status: 'finished' };
      axios.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await arenaService.endBattle(1);
      expect(result).toEqual(mockResponse);
      expect(axios.post).toHaveBeenCalledWith('/arenas/1/end');
    });
  });
}); 
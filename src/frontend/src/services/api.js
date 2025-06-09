import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const playerService = {
  async list() {
    const response = await api.get('/players');
    return response.data;
  },

  async create(player) {
    const response = await api.post('/players', player);
    return response.data;
  },
};

export const monsterService = {
  async list() {
    const response = await api.get('/monsters');
    return response.data;
  },

  async create(monster) {
    const response = await api.post('/monsters', monster);
    return response.data;
  },
};

export const arenaService = {
  async create(arena) {
    console.log('[arenaService] Criando arena:', arena);
    const response = await api.post('/arenas', arena);
    return response.data;
  },

  async getArena(id) {
    console.log('[arenaService] Buscando arena por id:', id);
    const response = await api.get(`/arenas/${id}`);
    console.log('[arenaService] Arena recebida:', response.data);
    return response.data;
  },

  async getArenas() {
    console.log('[arenaService] Buscando todas as arenas');
    const response = await api.get('/arenas');
    console.log('[arenaService] Arenas recebidas:', response.data);
    return response.data;
  },

  async endBattle(id) {
    console.log('[arenaService] Encerrando batalha da arena:', id);
    const response = await api.post(`/arenas/${id}/end`);
    return response.data;
  },

  async join(id, data) {
    console.log('[arenaService] Entrando na arena:', id, 'com dados:', data);
    const response = await api.post(`/arenas/${id}/join`, data);
    return response.data;
  },

  async startBattle(id) {
    console.log('[arenaService] Iniciando batalha na arena:', id);
    const response = await api.post(`/arenas/${id}/start`);
    return response.data;
  },

  async processAction(id, data) {
    console.log('[arenaService] Processando ação na arena:', id, data);
    const response = await api.post(`/arenas/${id}/action`, data);
    return response.data;
  },
};

export const testArenaService = {
  async getState() {
    const response = await api.get('/test-arena/state');
    return response.data;
  },
  async start(playerName, playerMonster, playerMonsterId) {
    const response = await api.post('/test-arena/start', { playerName, playerMonster, playerMonsterId });
    return response.data;
  },
  async action(action) {
    const response = await api.post('/test-arena/action', { action });
    return response.data;
  },
}; 
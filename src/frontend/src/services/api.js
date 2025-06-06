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
    const response = await api.post('/arenas', arena);
    return response.data;
  },

  async get(id) {
    const response = await api.get(`/arenas/${id}`);
    return response.data;
  },

  async endBattle(id) {
    const response = await api.post(`/arenas/${id}/end`);
    return response.data;
  },

  async join(id, data) {
    const response = await api.post(`/arenas/${id}/join`, data);
    return response.data;
  },

  async start(id) {
    const response = await api.post(`/arenas/${id}/start`);
    return response.data;
  },

  async processAction(id, data) {
    const response = await api.post(`/arenas/${id}/action`, data);
    return response.data;
  },
}; 
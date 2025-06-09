import axios from 'axios';

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function joinArena(arenaId, playerId, monsterId) {
  return axios.post(
    `/api/arenas/${arenaId}/join`,
    {
      player_id: playerId,
      monster_id: monsterId
    },
    { headers: getAuthHeader() }
  );
}

export async function startBattle(arenaId) {
  return axios.post(
    `/api/arenas/${arenaId}/start`,
    {},
    { headers: getAuthHeader() }
  );
}

const axios = require('axios');

const API = 'http://localhost:3001/api';

async function main() {
  try {
    // 1. Cria dois jogadores
    const player1 = (await axios.post(`${API}/players`, { name: 'Tester1' })).data;
    const player2 = (await axios.post(`${API}/players`, { name: 'Tester2' })).data;

    // 2. Cria dois monstros
    const monster1 = (await axios.post(`${API}/monsters`, {
      name: 'Fênix', type: 'FIRE', imageUrl: '', hp: 80, attack: 18, defense: 8, speed: 22, special: 'Renascimento', ownerId: player1.id
    })).data;
    const monster2 = (await axios.post(`${API}/monsters`, {
      name: 'Golem', type: 'EARTH', imageUrl: '', hp: 120, attack: 12, defense: 25, speed: 8, special: 'Muralha de Pedra', ownerId: player2.id
    })).data;

    // 3. Cria arena
    const arena = (await axios.post(`${API}/arenas`, { name: 'Arena Teste', maxPlayers: 2 })).data;

    // 4. Jogadores entram na arena
    await axios.post(`${API}/arenas/${arena.id}/join`, { player_id: player1.id, monster_id: monster1.id });
    await axios.post(`${API}/arenas/${arena.id}/join`, { player_id: player2.id, monster_id: monster2.id });

    // 5. Inicia batalha
    await axios.post(`${API}/arenas/${arena.id}/start`);

    // 6. Simula ações alternadas
    let currentTurn = player1.id;
    let log = [];
    // Turno 1: player1 ataca
    let resp = (await axios.post(`${API}/arenas/${arena.id}/action`, { player_id: currentTurn, action: 'attack' })).data;
    log = resp.battleLog;
    currentTurn = player2.id;
    // Turno 2: player2 defende
    resp = (await axios.post(`${API}/arenas/${arena.id}/action`, { player_id: currentTurn, action: 'defend' })).data;
    log = resp.battleLog;
    currentTurn = player1.id;
    // Turno 3: player1 ataca (deve pegar defesa)
    resp = (await axios.post(`${API}/arenas/${arena.id}/action`, { player_id: currentTurn, action: 'attack' })).data;
    log = resp.battleLog;
    currentTurn = player2.id;
    // Turno 4: player2 usa especial (inverter HP)
    resp = (await axios.post(`${API}/arenas/${arena.id}/action`, { player_id: currentTurn, action: 'special' })).data;
    log = resp.battleLog;
    currentTurn = player1.id;
    // Turno 5: player1 ataca
    resp = (await axios.post(`${API}/arenas/${arena.id}/action`, { player_id: currentTurn, action: 'attack' })).data;
    log = resp.battleLog;

    // Mostra o log final da batalha
    console.log('--- LOG DA BATALHA ---');
    log.forEach((entry, i) => console.log(`${i + 1}. ${entry}`));
  } catch (err) {
    console.error('Erro no teste:', err.response?.data || err.message);
  }
}

main(); 
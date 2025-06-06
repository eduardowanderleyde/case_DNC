import React, { useState, useEffect } from 'react';
import BattleSetup from '../components/BattleSetup';
import axios from 'axios';

export default function SetupPage({ onBattleStart }) {
  const [players, setPlayers] = useState([]);
  const [monsters, setMonsters] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([null, null]);
  const [selectedMonsters, setSelectedMonsters] = useState([null, null]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [arenaId, setArenaId] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get('/api/players'),
      axios.get('/api/monsters')
    ])
      .then(([playersRes, monstersRes]) => {
        setPlayers(playersRes.data);
        setMonsters(monstersRes.data);
        fetchArenas();
        setLoading(false);
      })
      .catch((err) => {
        setError('Error loading API data');
        setLoading(false);
      });
  }, []);

  const fetchArenas = async () => {
    try {
      const arenasRes = await axios.get('/api/arenas');
      const waitingArena = arenasRes.data.find(a => a.status === 'WAITING' && a.players.length < (a.maxPlayers || 2));
      if (waitingArena) {
        setArenaId(waitingArena.id);
      } else {
        setArenaId(null);
      }
    } catch (err) {
      setError('Error fetching arenas');
    }
  };

  const handlePlayerSelect = (idx, playerId) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    if (selectedPlayers.some((p, i) => p && p.id === playerId && i !== idx)) return;
    const newSelected = [...selectedPlayers];
    newSelected[idx] = player;
    setSelectedPlayers(newSelected);
  };

  const handleMonsterSelect = (idx, monsterId) => {
    const monster = monsters.find(m => m.id === monsterId);
    if (!monster) return;
    if (selectedMonsters.some((m, i) => m && m.id === monsterId && i !== idx)) return;
    const newSelected = [...selectedMonsters];
    newSelected[idx] = monster;
    setSelectedMonsters(newSelected);
  };

  const startBattle = async () => {
    if (!selectedPlayers[0] || !selectedPlayers[1] || !selectedMonsters[0] || !selectedMonsters[1]) {
      setError('Select 2 players and 2 monsters.');
      return;
    }
    let currentArenaId = arenaId;
    let arenaFull = false;
    if (currentArenaId) {
      try {
        const arenaRes = await axios.get(`/api/arenas/${currentArenaId}`);
        const currentPlayers = arenaRes.data.players.length;
        const maxPlayers = arenaRes.data.maxPlayers || 2;
        if (currentPlayers >= maxPlayers) {
          arenaFull = true;
        }
      } catch {
        arenaFull = true;
      }
    }
    if (!currentArenaId || arenaFull) {
      const newArena = await axios.post('/api/arenas', {
        name: `Arena ${Date.now()}`,
        maxPlayers: 2
      });
      currentArenaId = newArena.data.id;
      setArenaId(currentArenaId);
    }
    try {
      for (let i = 0; i < 2; i++) {
        await axios.post(`/api/arenas/${currentArenaId}/join`, {
          player_id: selectedPlayers[i].id,
          monster_id: selectedMonsters[i].id
        });
      }
      await axios.post(`/api/arenas/${currentArenaId}/start`);
      setSelectedPlayers([null, null]);
      setSelectedMonsters([null, null]);
      fetchArenas();
      if (onBattleStart) onBattleStart();
    } catch (err) {
      setError('Error starting battle: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <BattleSetup
      players={players}
      monsters={monsters}
      selectedPlayers={selectedPlayers}
      selectedMonsters={selectedMonsters}
      onPlayerSelect={handlePlayerSelect}
      onMonsterSelect={handleMonsterSelect}
      onStartBattle={startBattle}
      loading={loading}
      error={error}
    />
  );
} 
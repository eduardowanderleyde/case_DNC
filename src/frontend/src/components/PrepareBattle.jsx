import React, { useState, useEffect } from 'react';
import { joinArena, startBattle } from '../services/arenaService';
import MonsterSelect from './MonsterSelect';

export default function PrepareBattle({ arenaId, player1Id, player2Id }) {
  const [monster1Id, setMonster1Id] = useState(null);
  const [monster2Id, setMonster2Id] = useState(null);
  const [error, setError] = useState('');

  const handleStart = async () => {
    if (!monster1Id || !monster2Id) {
      setError('Select both monsters before starting.');
      return;
    }
    try {
      await joinArena(arenaId, player1Id, monster1Id);
      await joinArena(arenaId, player2Id, monster2Id);
      await startBattle(arenaId);
      // here you can redirect or update state after starting
    } catch (e) {
      console.error(e);
      setError('Error starting battle.');
    }
  };

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <MonsterSelect
        playerLabel="Player 1"
        onChange={(id) => setMonster1Id(id)}
      />
      <MonsterSelect
        playerLabel="Player 2"
        onChange={(id) => setMonster2Id(id)}
      />
      <button onClick={handleStart}>Start Battle</button>
    </div>
  );
}

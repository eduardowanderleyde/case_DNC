import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:3000');

function App() {
  const [players, setPlayers] = useState([]);
  const [monsters, setMonsters] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedMonster, setSelectedMonster] = useState(null);
  const [battleState, setBattleState] = useState(null);

  useEffect(() => {
    // Fetch players and monsters
    axios.get('/api/players').then(response => setPlayers(response.data));
    axios.get('/api/monsters').then(response => setMonsters(response.data));

    // Listen for battle updates
    socket.on('battle:started', (data) => {
      setBattleState(data);
    });

    socket.on('battle:action', (data) => {
      setBattleState(data);
    });

    socket.on('battle:ended', (data) => {
      setBattleState(data);
    });

    return () => {
      socket.off('battle:started');
      socket.off('battle:action');
      socket.off('battle:ended');
    };
  }, []);

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player);
  };

  const handleMonsterSelect = (monster) => {
    setSelectedMonster(monster);
  };

  const startBattle = () => {
    if (selectedPlayer && selectedMonster) {
      axios.post(`/api/arenas/1/join`, {
        player_id: selectedPlayer.id,
        monster_id: selectedMonster.id
      }).then(() => {
        axios.post(`/api/arenas/1/start`);
      });
    }
  };

  const performAction = (action) => {
    if (battleState && selectedPlayer) {
      axios.post(`/api/arenas/1/action`, {
        player_id: selectedPlayer.id,
        action: action
      });
    }
  };

  return (
    <div className="App">
      <h1>Monster Battle</h1>
      <div className="selection">
        <h2>Select Player</h2>
        <ul>
          {players.map(player => (
            <li key={player.id} onClick={() => handlePlayerSelect(player)}>
              {player.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="selection">
        <h2>Select Monster</h2>
        <ul>
          {monsters.map(monster => (
            <li key={monster.id} onClick={() => handleMonsterSelect(monster)}>
              {monster.name}
            </li>
          ))}
        </ul>
      </div>
      <button onClick={startBattle}>Start Battle</button>
      {battleState && (
        <div className="battle">
          <h2>Battle State</h2>
          <pre>{JSON.stringify(battleState, null, 2)}</pre>
          <div className="actions">
            <button onClick={() => performAction('attack')}>Attack</button>
            <button onClick={() => performAction('defend')}>Defend</button>
            <button onClick={() => performAction('special')}>Special</button>
            <button onClick={() => performAction('forfeit')}>Forfeit</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App; 
import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import PlayerListPage from './pages/PlayerListPage';
import MonsterListPage from './pages/MonsterListPage';
import BattlePage from './pages/BattlePage';

function App() {
  const [step, setStep] = useState(1);
  const [players, setPlayers] = useState([]);
  const [monsters, setMonsters] = useState([]);

  const handleRestart = () => {
    setStep(1);
    setPlayers([]);
    setMonsters([]);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <PlayerListPage 
            onNext={playersList => { 
              setPlayers(playersList); 
              setStep(2); 
            }} 
          />
        );
      case 2:
        return (
          <MonsterListPage 
            players={players} 
            onNext={monstersList => { 
              setMonsters(monstersList); 
              setStep(3); 
            }} 
          />
        );
      case 3:
        return (
          <Box>
            <BattlePage 
              players={players} 
              monsters={monsters} 
            />
            <Box mt={2} display="flex" justifyContent="center">
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={handleRestart}
              >
                New Battle
              </Button>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {renderStep()}
    </Box>
  );
}

export default App;
 
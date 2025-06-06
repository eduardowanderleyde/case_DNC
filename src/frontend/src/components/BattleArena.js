import React from 'react';
import { Grid, Typography, Button, Box, Paper } from '@mui/material';
import MonsterCard from './MonsterCard';

export default function BattleArena({ battleState, selectedPlayers, performAction }) {
  return (
    <Box mt={4}>
      <Typography variant="h4" align="center" color="#d32f2f" gutterBottom>
        Battle Arena
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <MonsterCard
            monster={battleState.player1Monster || { name: '???', hp: 0, attack: 0, defense: 0, speed: 0, special: '-' }}
            selected={battleState.currentTurn === 1}
          />
          <Typography align="center" fontWeight={600} color="#1976d2">
            {selectedPlayers[0]?.name || 'Player 1'}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <MonsterCard
            monster={battleState.player2Monster || { name: '???', hp: 0, attack: 0, defense: 0, speed: 0, special: '-' }}
            selected={battleState.currentTurn === 2}
          />
          <Typography align="center" fontWeight={600} color="#d32f2f">
            {selectedPlayers[1]?.name || 'Player 2'}
          </Typography>
        </Grid>
      </Grid>
      <Box mt={3} display="flex" justifyContent="center" gap={2}>
        <Button variant="contained" color="primary" onClick={() => performAction('attack')}>Attack</Button>
        <Button variant="contained" color="info" onClick={() => performAction('defend')}>Defend</Button>
        <Button variant="contained" color="secondary" onClick={() => performAction('special')}>Special</Button>
        <Button variant="outlined" color="error" onClick={() => performAction('forfeit')}>Forfeit</Button>
      </Box>
      <Box mt={4}>
        <Typography variant="h6" fontWeight={700} gutterBottom>Battle Log</Typography>
        <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto', p: 2, background: '#fafafa' }}>
          <pre style={{ margin: 0, fontFamily: 'inherit' }}>{JSON.stringify(battleState.battleLog, null, 2)}</pre>
        </Paper>
      </Box>
    </Box>
  );
} 
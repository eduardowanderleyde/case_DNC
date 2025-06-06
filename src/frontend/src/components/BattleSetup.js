import React from 'react';
import { Grid, Typography, Button, Box, MenuItem, Select, FormControl, InputLabel, Paper } from '@mui/material';
import MonsterCard from './MonsterCard';

export default function BattleSetup({ players, monsters, selectedPlayers, selectedMonsters, onPlayerSelect, onMonsterSelect, onStartBattle, loading, error }) {
  return (
    <Paper elevation={3} sx={{ p: 3, background: 'linear-gradient(120deg, #e3f2fd 0%, #fffde7 100%)' }}>
      <Typography variant="h3" align="center" gutterBottom fontWeight={700} color="#1976d2">
        Monster Battle
      </Typography>
      {loading && <Typography>Loading data...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} md={5}>
          <Typography variant="h5" align="center" gutterBottom>Player 1</Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="player1-label">Player</InputLabel>
            <Select
              labelId="player1-label"
              id="player1-select"
              value={selectedPlayers[0]?.id || ''}
              label="Player"
              onChange={e => onPlayerSelect(0, e.target.value)}
            >
              {players.filter(p => !selectedPlayers[1] || p.id !== selectedPlayers[1]?.id).map(player => (
                <MenuItem key={player.id} value={player.id}>{player.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="monster1-label">Monster</InputLabel>
            <Select
              labelId="monster1-label"
              id="monster1-select"
              value={selectedMonsters[0]?.id || ''}
              label="Monster"
              onChange={e => onMonsterSelect(0, e.target.value)}
            >
              {monsters.filter(m => !selectedMonsters[1] || m.id !== selectedMonsters[1]?.id).map(monster => (
                <MenuItem key={monster.id} value={monster.id}>{monster.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedMonsters[0] && <MonsterCard monster={selectedMonsters[0]} selected />}
        </Grid>
        <Grid item xs={12} md={2} display="flex" justifyContent="center" alignItems="center">
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onStartBattle}
            disabled={!selectedPlayers[0] || !selectedPlayers[1] || !selectedMonsters[0] || !selectedMonsters[1]}
            sx={{ minWidth: 200, fontWeight: 700 }}
          >
            Start Battle
          </Button>
        </Grid>
        <Grid item xs={12} md={5}>
          <Typography variant="h5" align="center" gutterBottom>Player 2</Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="player2-label">Player</InputLabel>
            <Select
              labelId="player2-label"
              id="player2-select"
              value={selectedPlayers[1]?.id || ''}
              label="Player"
              onChange={e => onPlayerSelect(1, e.target.value)}
            >
              {players.filter(p => !selectedPlayers[0] || p.id !== selectedPlayers[0]?.id).map(player => (
                <MenuItem key={player.id} value={player.id}>{player.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="monster2-label">Monster</InputLabel>
            <Select
              labelId="monster2-label"
              id="monster2-select"
              value={selectedMonsters[1]?.id || ''}
              label="Monster"
              onChange={e => onMonsterSelect(1, e.target.value)}
            >
              {monsters.filter(m => !selectedMonsters[0] || m.id !== selectedMonsters[0]?.id).map(monster => (
                <MenuItem key={monster.id} value={monster.id}>{monster.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedMonsters[1] && <MonsterCard monster={selectedMonsters[1]} selected />}
        </Grid>
      </Grid>
    </Paper>
  );
} 
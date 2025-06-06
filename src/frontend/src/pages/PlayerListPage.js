import React, { useState } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, IconButton, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { playerService } from '../services/api';

export default function PlayerListPage({ onNext }) {
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState([]);

  const handleAddPlayer = async () => {
    const name = playerName.trim();
    if (!name || players.some(p => p.name === name)) return;
    try {
      const newPlayer = await playerService.create({ name });
      setPlayers([...players, newPlayer]);
      setPlayerName('');
    } catch (err) {
      // Tratar erro se necessário
    }
  };

  const handleRemovePlayer = (id) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const handleNext = () => {
    if (players.length < 2) return;
    if (onNext) onNext(players);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 500, mx: 'auto', mt: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>Player Registration</Typography>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          id="player-name-input"
          label="Player Name"
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={handleAddPlayer} disabled={!playerName.trim()}>
          Add
        </Button>
      </Box>
      <List>
        {players.map(player => (
          <ListItem key={player.id} secondaryAction={
            <IconButton edge="end" aria-label="delete" onClick={() => handleRemovePlayer(player.id)}>
              <DeleteIcon />
            </IconButton>
          }>
            <ListItemText primary={player.name} />
          </ListItem>
        ))}
      </List>
      <Button
        variant="contained"
        color="success"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleNext}
        disabled={players.length < 2}
      >
        Next
      </Button>
    </Paper>
  );
} 
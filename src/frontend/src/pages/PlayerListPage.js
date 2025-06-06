import React, { useState } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, IconButton, Paper, Fade } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { playerService } from '../services/api';

const pokeballUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';

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
    <Fade in timeout={800}>
      <Paper elevation={6} sx={{
        p: 4,
        maxWidth: 500,
        mx: 'auto',
        mt: 8,
        border: '4px solid #FFCB05',
        borderRadius: 4,
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        background: 'linear-gradient(120deg, #fff 60%, #3B4CCA 100%)',
        fontFamily: '"Press Start 2P", Arial, sans-serif',
        position: 'relative',
        overflow: 'visible',
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <img src={pokeballUrl} alt="Pokébola" width={60} style={{ marginBottom: 12, filter: 'drop-shadow(0 2px 8px #3B4CCA88)' }} />
          <Typography variant="h4" align="center" gutterBottom sx={{
            color: '#FF0000',
            fontFamily: '"Press Start 2P", Arial, sans-serif',
            textShadow: '2px 2px 0 #FFCB05, 4px 4px 0 #3B4CCA',
            mb: 2
          }}>
            Player Registration
          </Typography>
        </Box>
        <Box display="flex" gap={2} mb={2}>
          <TextField
            id="player-name-input"
            label="Player Name"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            fullWidth
            sx={{
              background: '#fff',
              borderRadius: 2,
              fontFamily: '"Press Start 2P", Arial, sans-serif',
            }}
            InputProps={{ style: { fontFamily: '"Press Start 2P", Arial, sans-serif' } }}
          />
          <Button variant="contained" onClick={handleAddPlayer} disabled={!playerName.trim()} sx={{
            background: '#FFCB05',
            color: '#3B4CCA',
            fontWeight: 700,
            fontFamily: '"Press Start 2P", Arial, sans-serif',
            boxShadow: '0 2px 8px #3B4CCA44',
            '&:hover': { background: '#FF0000', color: '#fff' }
          }}>
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
              <ListItemText primary={player.name} primaryTypographyProps={{
                fontFamily: '"Press Start 2P", Arial, sans-serif',
                color: '#3B4CCA',
                fontWeight: 700
              }} />
            </ListItem>
          ))}
        </List>
        <Button
          variant="contained"
          fullWidth
          sx={{
            mt: 2,
            background: '#3B4CCA',
            color: '#FFCB05',
            fontFamily: '"Press Start 2P", Arial, sans-serif',
            fontWeight: 700,
            fontSize: 18,
            boxShadow: '0 2px 8px #3B4CCA44',
            '&:hover': { background: '#FF0000', color: '#fff' }
          }}
          onClick={handleNext}
          disabled={players.length < 2}
        >
          Next
        </Button>
      </Paper>
    </Fade>
  );
} 
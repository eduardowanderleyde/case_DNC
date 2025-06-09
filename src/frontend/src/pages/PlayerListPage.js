import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Fade } from '@mui/material';
import { playerService } from '../services/api';

const pokeballUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';

export default function PlayerListPage({ onNext }) {
  const [playerName, setPlayerName] = useState('');
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const name = playerName.trim();
    if (!name) return;
    setLoading(true);
    try {
      const newPlayer = await playerService.create({ name });
      setPlayer(newPlayer);
      setPlayerName('');
      if (newPlayer && newPlayer.id) {
        localStorage.setItem('playerId', newPlayer.id);
      }
      if (onNext) onNext([newPlayer]);
    } catch (err) {
      // Tratar erro se necessário
    } finally {
      setLoading(false);
    }
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
            disabled={!!player || loading}
        />
          <Button variant="contained" onClick={handleRegister} disabled={!playerName.trim() || !!player || loading} sx={{
            background: '#FFCB05',
            color: '#3B4CCA',
            fontWeight: 700,
            fontFamily: '"Press Start 2P", Arial, sans-serif',
            boxShadow: '0 2px 8px #3B4CCA44',
            '&:hover': { background: '#FF0000', color: '#fff' }
          }}>
            Register
        </Button>
      </Box>
    </Paper>
    </Fade>
  );
} 
import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, Grid, Avatar, Chip, Fade, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { arenaService, testArenaService } from '../services/api';

const pokeballUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';

export default function LobbyPage({ onEnterArena, player, monster }) {
  const [arenas, setArenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [testArena, setTestArena] = useState(null);
  const [loadingTestArena, setLoadingTestArena] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [arenaName, setArenaName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function fetchArenas() {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/arenas');
      const data = await res.json();
      setArenas(data);
      setLoading(false);
    }
    async function fetchTestArena() {
      setLoadingTestArena(true);
      const data = await testArenaService.getState();
      setTestArena(data);
      setLoadingTestArena(false);
    }
    fetchArenas();
    fetchTestArena();
  }, []);

  const handleEnterTestArena = async () => {
    if (!monster?.id) {
      alert('Selecione um monstro antes de entrar na Arena de Teste!');
      return;
    }
    setJoining(true);
    try {
      const playerName = player?.name || 'Player';
      const playerMonster = monster?.name || 'Pikachu';
      const playerMonsterId = monster?.id;
      console.log('Iniciando TestArena com:', { playerName, playerMonster, playerMonsterId });
      await testArenaService.start(playerName, playerMonster, playerMonsterId);
      const data = await testArenaService.getState();
      setTestArena(data);
      if (onEnterArena) onEnterArena({ isTestArena: true });
    } catch (err) {
      // Tratar erro se necessário
    } finally {
      setJoining(false);
    }
  };

  const handleEnterArena = async (arena) => {
    if (!player || !monster) return;
    setJoining(true);
    try {
      await arenaService.join(arena.id, {
        player_id: player.id,
        monster_id: monster.id
      });
      onEnterArena(arena);
    } catch (err) {
      // Tratar erro se necessário
    } finally {
      setJoining(false);
    }
  };

  const handleOpenCreateArenaModal = () => setCreateOpen(true);
  const handleCloseCreateArenaModal = () => {
    setCreateOpen(false);
    setArenaName('');
    setMaxPlayers(2);
  };

  const handleCreateArena = async () => {
    setCreating(true);
    try {
      await fetch('http://localhost:3001/api/arenas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: arenaName, maxPlayers })
      });
      setCreateOpen(false);
      setArenaName('');
      setMaxPlayers(2);
      // Atualiza arenas
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/arenas');
      const data = await res.json();
      setArenas(data);
      setLoading(false);
    } catch (err) {
      // Tratar erro se necessário
    } finally {
      setCreating(false);
    }
  };

  const normalArenas = arenas.filter(a => a.name !== 'Arena de Teste');

  return (
    <Fade in timeout={800}>
      <Paper elevation={6} sx={{
        p: 4,
        maxWidth: 900,
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
            color: '#3B4CCA',
            fontFamily: '"Press Start 2P", Arial, sans-serif',
            textShadow: '2px 2px 0 #FFCB05, 4px 4px 0 #FF0000',
            mb: 1
          }}>
            Pokémon Battle Lobby
          </Typography>
          <Typography align="center" sx={{ mb: 2, color: '#FF0000', fontFamily: 'inherit', fontSize: 14 }}>
            Choose a room to join or watch!
          </Typography>
        </Box>
        {loading ? (
          <Typography align="center">Loading arenas...</Typography>
        ) : (
          <>
            {/* Arena de Teste */}
            <Box mb={4}>
              <Paper elevation={4} sx={{
                p: 3,
                border: '3px dashed #FF0000',
                borderRadius: 3,
                background: 'linear-gradient(90deg, #fff 60%, #FFCB05 100%)',
                fontFamily: 'inherit',
                boxShadow: '0 4px 16px #FF000044',
                mb: 2,
                textAlign: 'center',
                position: 'relative',
              }}>
                <Typography variant="h5" sx={{ color: '#FF0000', fontFamily: 'inherit', mb: 2, textShadow: '1px 1px 0 #FFCB05' }}>
                  🧪 Arena de Teste
                </Typography>
                <Box display="flex" gap={2} mb={2} justifyContent="center">
                  {loadingTestArena ? (
                    <Typography variant="body2" sx={{ color: '#888', fontFamily: 'inherit' }}>Carregando...</Typography>
                  ) : testArena && testArena.status === 'IN_PROGRESS' ? (
                    <>
                      <Box display="flex" flexDirection="column" alignItems="center" mr={2}>
                        <Avatar src={testArena.playerMonsterData?.imageUrl} alt={testArena.playerMonsterData?.name} sx={{ width: 56, height: 56, mb: 1, border: '2px solid #3B4CCA', background: '#fff' }} />
                        <Chip label={testArena.playerName} sx={{ fontFamily: 'inherit', background: '#3B4CCA', color: '#FFCB05', fontWeight: 700, mb: 1 }} />
                        <Typography variant="caption" sx={{ fontFamily: 'inherit', color: '#3B4CCA' }}>{testArena.playerMonsterData?.name}</Typography>
                      </Box>
                      <Box display="flex" flexDirection="column" alignItems="center" mr={2}>
                        <Avatar src={testArena.botMonsterData?.imageUrl} alt={testArena.botMonsterData?.name} sx={{ width: 56, height: 56, mb: 1, border: '2px solid #3B4CCA', background: '#fff' }} />
                        <Chip label={testArena.botName} sx={{ fontFamily: 'inherit', background: '#3B4CCA', color: '#FFCB05', fontWeight: 700, mb: 1 }} />
                        <Typography variant="caption" sx={{ fontFamily: 'inherit', color: '#3B4CCA' }}>{testArena.botMonsterData?.name}</Typography>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Box display="flex" flexDirection="column" alignItems="center" mr={2}>
                        <Avatar src={monster?.imageUrl} alt={monster?.name} sx={{ width: 56, height: 56, mb: 1, border: '2px solid #3B4CCA', background: '#fff' }} />
                        <Chip label={player?.name} sx={{ fontFamily: 'inherit', background: '#3B4CCA', color: '#FFCB05', fontWeight: 700, mb: 1 }} />
                        <Typography variant="caption" sx={{ fontFamily: 'inherit', color: '#3B4CCA' }}>{monster?.name}</Typography>
                      </Box>
                      <Box display="flex" flexDirection="column" alignItems="center" mr={2}>
                        <Avatar src="https://assets.pokemon.com/assets/cms2/img/pokedex/full/019.png" alt="Rattata" sx={{ width: 56, height: 56, mb: 1, border: '2px solid #3B4CCA', background: '#fff' }} />
                        <Chip label="Bot Teste" sx={{ fontFamily: 'inherit', background: '#3B4CCA', color: '#FFCB05', fontWeight: 700, mb: 1 }} />
                        <Typography variant="caption" sx={{ fontFamily: 'inherit', color: '#3B4CCA' }}>Rattata</Typography>
                      </Box>
                    </>
                  )}
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    background: '#FF0000',
                    color: '#fff',
                    fontFamily: 'inherit',
                    fontWeight: 700,
                    fontSize: 16,
                    boxShadow: '0 2px 8px #FF000044',
                    '&:hover': { background: '#3B4CCA', color: '#FFCB05' }
                  }}
                  onClick={handleEnterTestArena}
                  disabled={joining}
                >
                  {joining ? 'Entrando...' : 'Enter'}
                </Button>
              </Paper>
            </Box>
            {/* Botão Criar Arena */}
            <Box display="flex" justifyContent="center" mb={2}>
              <Button
                variant="contained"
                sx={{
                  background: '#3B4CCA',
                  color: '#FFCB05',
                  fontFamily: 'inherit',
                  fontWeight: 700,
                  fontSize: 16,
                  boxShadow: '0 2px 8px #3B4CCA44',
                  '&:hover': { background: '#FF0000', color: '#fff' }
                }}
                onClick={handleOpenCreateArenaModal}
              >
                Create Arena
              </Button>
            </Box>
            <Grid container spacing={4}>
              {normalArenas.map((arena) => (
                <Grid item xs={12} md={6} key={arena.id}>
                  <Paper elevation={3} sx={{
                    p: 3,
                    border: '2px solid #3B4CCA',
                    borderRadius: 3,
                    background: 'linear-gradient(90deg, #fff 60%, #FFCB05 100%)',
                    fontFamily: 'inherit',
                    boxShadow: '0 2px 8px #3B4CCA44',
                    mb: 2
                  }}>
                    <Typography variant="h6" sx={{ color: '#FF0000', fontFamily: 'inherit', mb: 2 }}>
                      {arena.name}
                    </Typography>
                    <Box display="flex" gap={2} mb={2}>
                      {arena.players && arena.players.length > 0 ? (
                        arena.players.map((ap, idx) => (
                          <Box key={ap.id || idx} display="flex" flexDirection="column" alignItems="center" mr={2}>
                            <Avatar src={ap.monster?.imageUrl} alt={ap.monster?.name} sx={{ width: 56, height: 56, mb: 1, border: '2px solid #3B4CCA', background: '#fff' }} />
                            <Chip label={ap.player?.name} sx={{ fontFamily: 'inherit', background: '#3B4CCA', color: '#FFCB05', fontWeight: 700, mb: 1 }} />
                            <Typography variant="caption" sx={{ fontFamily: 'inherit', color: '#3B4CCA' }}>{ap.monster?.name}</Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ color: '#888', fontFamily: 'inherit' }}>No players yet</Typography>
                      )}
                    </Box>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        background: '#3B4CCA',
                        color: '#FFCB05',
                        fontFamily: 'inherit',
                        fontWeight: 700,
                        fontSize: 16,
                        boxShadow: '0 2px 8px #3B4CCA44',
                        '&:hover': { background: '#FF0000', color: '#fff' }
                      }}
                      onClick={() => handleEnterArena(arena)}
                      disabled={arena.players && arena.players.length >= arena.maxPlayers || joining}
                    >
                      {arena.players && arena.players.length >= arena.maxPlayers ? 'Full' : (joining ? 'Entering...' : 'Enter')}
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            {/* Modal de criação de arena */}
            <Dialog open={createOpen} onClose={handleCloseCreateArenaModal}>
              <DialogTitle sx={{ fontFamily: 'inherit', color: '#3B4CCA' }}>Create New Arena</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Arena Name"
                  fullWidth
                  value={arenaName}
                  onChange={e => setArenaName(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="dense"
                  label="Max Players"
                  type="number"
                  fullWidth
                  value={maxPlayers}
                  onChange={e => setMaxPlayers(Number(e.target.value))}
                  inputProps={{ min: 2, max: 4 }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseCreateArenaModal} sx={{ fontFamily: 'inherit' }}>Cancel</Button>
                <Button onClick={handleCreateArena} variant="contained" sx={{ fontFamily: 'inherit', background: '#3B4CCA', color: '#FFCB05' }} disabled={creating || !arenaName.trim()}>
                  {creating ? 'Creating...' : 'Create'}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Paper>
    </Fade>
  );
} 
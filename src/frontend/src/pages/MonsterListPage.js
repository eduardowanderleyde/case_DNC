import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, List, ListItem, Paper, MenuItem, Select, FormControl, InputLabel, Card, CardContent, Fade } from '@mui/material';
import { monsterService } from '../services/api';

const pokeballUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';

export default function MonsterListPage({ players, onNext }) {
  const [monsters, setMonsters] = useState([]);
  const [selectedMonsters, setSelectedMonsters] = useState(players.map(() => null));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMonsters() {
      setLoading(true);
      const data = await monsterService.list();
      setMonsters(data);
      setLoading(false);
    }
    fetchMonsters();
  }, []);

  const handleMonsterSelect = (idx, monsterId) => {
    const monster = monsters.find(m => m.id === monsterId);
    if (!monster) return;
    // Prevent duplicate selection
    if (selectedMonsters.some((m, i) => m && m.id === monsterId && i !== idx)) return;
    const newSelected = [...selectedMonsters];
    newSelected[idx] = monster;
    setSelectedMonsters(newSelected);
  };

  const handleRemoveMonster = (idx) => {
    const newSelected = [...selectedMonsters];
    newSelected[idx] = null;
    setSelectedMonsters(newSelected);
  };

  const handleNext = () => {
    if (selectedMonsters.some(m => !m)) return;
    if (onNext) onNext(selectedMonsters);
  };

  return (
    <Fade in timeout={800}>
      <Paper elevation={6} sx={{
        p: 4,
        maxWidth: 600,
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
            Monster Registration
          </Typography>
          <Typography align="center" sx={{ mb: 2, color: '#FF0000', fontFamily: 'inherit', fontSize: 14 }}>
            Choose a ready monster for each player:
          </Typography>
        </Box>
        <List>
          {players.map((player, idx) => (
            <ListItem key={player.id} alignItems="flex-start">
              <Box flex={1}>
                <Typography fontWeight={700} sx={{ color: '#FFCB05', fontFamily: 'inherit', fontSize: 16, mb: 1 }}>{player.name}</Typography>
                {selectedMonsters[idx] ? (
                  <Box display="flex" alignItems="center" gap={2} mt={1}>
                    <Card variant="outlined" sx={{
                      minWidth: 200,
                      border: '2px solid #3B4CCA',
                      background: 'linear-gradient(90deg, #fff 60%, #FFCB05 100%)',
                      fontFamily: 'inherit',
                      boxShadow: '0 2px 8px #3B4CCA44',
                    }}>
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ color: '#3B4CCA', fontFamily: 'inherit', fontWeight: 700 }}>{selectedMonsters[idx].name}</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'inherit' }}>HP: {selectedMonsters[idx].hp}</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'inherit' }}>ATK: {selectedMonsters[idx].attack}</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'inherit' }}>DEF: {selectedMonsters[idx].defense}</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'inherit' }}>SPD: {selectedMonsters[idx].speed}</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'inherit' }}>Special: {selectedMonsters[idx].special}</Typography>
                      </CardContent>
                    </Card>
                    <Button color="error" variant="contained" onClick={() => handleRemoveMonster(idx)} sx={{ fontFamily: 'inherit', fontWeight: 700, background: '#FF0000', color: '#fff', '&:hover': { background: '#3B4CCA' } }}>Remove</Button>
                  </Box>
                ) : (
                  <FormControl fullWidth sx={{ mt: 1 }}>
                    <InputLabel id={`monster-select-label-${idx}`} sx={{ fontFamily: 'inherit' }}>Monster</InputLabel>
                    <Select
                      labelId={`monster-select-label-${idx}`}
                      id={`monster-select-${idx}`}
                      label="Monster"
                      value={''}
                      onChange={e => handleMonsterSelect(idx, e.target.value)}
                      disabled={loading}
                      sx={{ fontFamily: 'inherit', background: '#fff', borderRadius: 2 }}
                    >
                      {monsters.filter(m => !selectedMonsters.some(sel => sel && sel.id === m.id)).map(monster => (
                        <MenuItem key={monster.id} value={monster.id} sx={{ fontFamily: 'inherit' }}>
                          {monster.name} (HP: {monster.hp}, ATK: {monster.attack}, DEF: {monster.defense}, SPD: {monster.speed})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Box>
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
          disabled={selectedMonsters.some(m => !m)}
        >
          Next
        </Button>
      </Paper>
    </Fade>
  );
} 
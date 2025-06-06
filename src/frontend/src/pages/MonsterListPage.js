import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, List, ListItem, Paper, MenuItem, Select, FormControl, InputLabel, Card, CardContent } from '@mui/material';
import { monsterService } from '../services/api';

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
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>Monster Registration</Typography>
      <Typography align="center" sx={{ mb: 2 }}>Choose a ready monster for each player:</Typography>
      <List>
        {players.map((player, idx) => (
          <ListItem key={player.id} alignItems="flex-start">
            <Box flex={1}>
              <Typography fontWeight={600}>{player.name}</Typography>
              {selectedMonsters[idx] ? (
                <Box display="flex" alignItems="center" gap={2} mt={1}>
                  <Card variant="outlined" sx={{ minWidth: 180 }}>
                    <CardContent>
                      <Typography variant="subtitle1">{selectedMonsters[idx].name}</Typography>
                      <Typography variant="body2">HP: {selectedMonsters[idx].hp}</Typography>
                      <Typography variant="body2">ATK: {selectedMonsters[idx].attack}</Typography>
                      <Typography variant="body2">DEF: {selectedMonsters[idx].defense}</Typography>
                      <Typography variant="body2">SPD: {selectedMonsters[idx].speed}</Typography>
                      <Typography variant="body2">Special: {selectedMonsters[idx].special}</Typography>
                    </CardContent>
                  </Card>
                  <Button color="error" onClick={() => handleRemoveMonster(idx)}>Remove</Button>
                </Box>
              ) : (
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <InputLabel id={`monster-select-label-${idx}`}>Monster</InputLabel>
                  <Select
                    labelId={`monster-select-label-${idx}`}
                    id={`monster-select-${idx}`}
                    label="Monster"
                    value={''}
                    onChange={e => handleMonsterSelect(idx, e.target.value)}
                    disabled={loading}
                  >
                    {monsters.filter(m => !selectedMonsters.some(sel => sel && sel.id === m.id)).map(monster => (
                      <MenuItem key={monster.id} value={monster.id}>
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
        color="success"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleNext}
        disabled={selectedMonsters.some(m => !m)}
      >
        Next
      </Button>
    </Paper>
  );
} 
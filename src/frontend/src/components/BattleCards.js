import React from 'react';
import { Grid, Typography } from '@mui/material';
import MonsterCard from './MonsterCard';

function getEffectForPlayer(lastAction, playerIndex, players) {
  if (!lastAction) return undefined;
  const lower = lastAction.toLowerCase();
  if (lower.includes('used special') || lower.includes('used special:') || lower.includes('invert hp')) {
    return 'special';
  }
  if (lower.includes('defended')) {
    if (lower.includes(players[playerIndex]?.name?.toLowerCase())) return 'defend';
  }
  if (lower.includes('causing') || lower.includes('damage')) {
    if (playerIndex === 1 && lower.includes(players[1]?.name?.toLowerCase())) return 'damage';
    if (playerIndex === 0 && lower.includes(players[0]?.name?.toLowerCase())) return 'damage';
  }
  return undefined;
}

export default function BattleCards({ players, monsters, currentTurn, status, lastAction }) {
  // Player 1 sempre à esquerda, Player 2 à direita
  return (
    <Grid container columnSpacing={4} rowSpacing={2} alignItems="center" justifyContent="center">
      <Grid item xs={12} md={6}>
        <Typography align="center" fontWeight={900} fontSize={28} color="#1976d2" sx={{ mb: 1, fontFamily: 'inherit', letterSpacing: 1 }}>
          {players[0]?.name || 'Player 1'}
        </Typography>
        <MonsterCard
          monster={monsters[0] || { name: '???', hp: 0, maxHp: 1, attack: 0, defense: 0, speed: 0, special: '-' }}
          selected
          isCurrentTurn={status === 'IN_PROGRESS' && currentTurn === players[0]?.id}
          effect={getEffectForPlayer(lastAction, 0, players)}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography align="center" fontWeight={900} fontSize={28} color="#d32f2f" sx={{ mb: 1, fontFamily: 'inherit', letterSpacing: 1 }}>
          {players[1]?.name || 'Player 2'}
          </Typography>
          <MonsterCard
          monster={monsters[1] || { name: '???', hp: 0, maxHp: 1, attack: 0, defense: 0, speed: 0, special: '-' }}
            selected
          isCurrentTurn={status === 'IN_PROGRESS' && currentTurn === players[1]?.id}
          effect={getEffectForPlayer(lastAction, 1, players)}
          />
        </Grid>
    </Grid>
  );
} 
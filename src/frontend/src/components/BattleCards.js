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
  return (
    <Grid container columnSpacing={4} rowSpacing={2} alignItems="center">
      {[0, 1].map(i => (
        <Grid item columns={6} key={i}>
          <Typography align="center" fontWeight={600} color={i === 0 ? '#1976d2' : '#d32f2f'}>
            {players[i]?.name || `Player ${i + 1}`}
          </Typography>
          <MonsterCard
            monster={monsters[i] || { name: '???', hp: 0, maxHp: 1, attack: 0, defense: 0, speed: 0, special: '-' }}
            selected
            isCurrentTurn={status === 'IN_PROGRESS' && currentTurn === players[i]?.id}
            effect={getEffectForPlayer(lastAction, i, players)}
          />
        </Grid>
      ))}
    </Grid>
  );
} 
// /src/pages/BattlePage.js

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { arenaService } from '../services/api';
import BattleHeader from '../components/BattleHeader';
import BattleCards from '../components/BattleCards';
import BattleLog from '../components/BattleLog';
import BattleActions from '../components/BattleActions';

export default function BattlePage({ players, monsters }) {
  const [arena, setArena] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attackModalOpen, setAttackModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [winner, setWinner] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (players.length !== 2 || monsters.length !== 2) return;
    const startBattle = async () => {
      try {
        setLoading(true);
        const newArena = await arenaService.create({
          name: `Arena ${Date.now()}`,
          maxPlayers: 2
        });
        await arenaService.join(newArena.id, {
          player_id: players[0].id,
          monster_id: monsters[0].id
        });
        await arenaService.join(newArena.id, {
          player_id: players[1].id,
          monster_id: monsters[1].id
        });
        await arenaService.start(newArena.id);
        const arenaState = await arenaService.get(newArena.id);
        setArena({
          id: newArena.id,
          status: arenaState.status,
          currentTurn: arenaState.currentTurn,
          players: [
            { player: players[0], monster: { ...monsters[0], hp: arenaState?.battleState?.player_1?.hp ?? monsters[0].hp, maxHp: monsters[0].hp } },
            { player: players[1], monster: { ...monsters[1], hp: arenaState?.battleState?.player_2?.hp ?? monsters[1].hp, maxHp: monsters[1].hp } }
          ],
          battleLog: arenaState.battleLog || [],
          winner: null
        });
        setWinner(null);
      } catch (err) {
        const msg = err.response?.data?.message || err.message;
        setError('Error starting battle: ' + msg);
      } finally {
        setLoading(false);
      }
    };
    startBattle();
  }, [players, monsters]);

  const handleAction = async (action) => {
    if (!arena || winner || arena.status !== 'IN_PROGRESS' || isProcessing) return;
    setIsProcessing(true);
    try {
      await arenaService.processAction(arena.id, {
        player_id: arena.currentTurn,
        action
      });
      setFeedbackMsg(
        action === 'attack' ? 'You chose Normal Attack' :
        action === 'special' ? 'You chose Special Attack' :
        'You chose to Defend'
      );
      setTimeout(async () => {
        const newState = await arenaService.get(arena.id);
        setArena({
          id: newState.id,
          status: newState.status,
          currentTurn: newState.currentTurn,
          players: newState.players.map((p, i) => ({
            player: p.player,
            monster: {
              ...p.monster,
              maxHp: monsters.find(m => m.id === p.monster.id)?.hp || p.monster.hp
            }
          })),
          battleLog: newState.battleLog || [],
          winner: newState.status === 'FINISHED' ? { name: (newState.battleLog || []).slice(-1)[0]?.replace('Battle finished! Winner: ', '') } : null
        });
        setWinner(newState.status === 'FINISHED' ? { name: (newState.battleLog || []).slice(-1)[0]?.replace('Battle finished! Winner: ', '') } : null);
        setFeedbackMsg('');
        setIsProcessing(false);
      }, 2000);
    } catch (err) {
      setIsProcessing(false);
      console.error('Error in handleAction:', err);
    }
  };

  const handleAttackClick = () => {
    setAttackModalOpen(true);
  };

  const handleAttackType = (type) => {
    setAttackModalOpen(false);
    handleAction(type);
  };

  const handleEndBattle = async () => {
    if (!arena) return;
    try {
      await arenaService.end(arena.id);
    } catch (err) {
      setError('Error ending battle: ' + err.message);
    }
  };

  const currentPlayerName = arena && arena.currentTurn
    ? players.find(p => p.id === arena.currentTurn)?.name
    : null;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 6 }}>
      <BattleHeader
        status={arena?.status}
        currentPlayerName={currentPlayerName}
        winner={winner}
      />
      <BattleCards
        players={players}
        monsters={arena?.players?.map(p => p.monster) || []}
        currentTurn={arena?.currentTurn}
        status={arena?.status}
        lastAction={arena?.battleLog?.slice(-1)[0] || ''}
      />
      {!winner && arena?.status === 'IN_PROGRESS' && (
        <BattleActions
          currentTurn={arena.currentTurn}
          players={players}
          onAttackClick={handleAttackClick}
          onDefend={() => handleAction('defend')}
          onSpecial={() => handleAttackType('special')}
          attackModalOpen={attackModalOpen}
          onAttackType={handleAttackType}
          onCloseAttackModal={() => setAttackModalOpen(false)}
          feedbackMsg={feedbackMsg}
          disabled={isProcessing}
        />
      )}
      {winner && (
        <Box mt={4} textAlign="center">
          <Typography variant="h5" color="primary" gutterBottom>
            Winner: {winner.name}!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleEndBattle}
          >
            End Battle
          </Button>
        </Box>
      )}
      <Box mt={4}>
        <BattleLog log={arena?.battleLog || []} />
      </Box>
    </Paper>
  );
}

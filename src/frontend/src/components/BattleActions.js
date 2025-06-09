import React from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

export default function BattleActions({
  currentTurn,
  players,
  onAttackClick,
  onDefend,
  onSpecial,
  onForfeit,
  attackModalOpen,
  onAttackType,
  onCloseAttackModal,
  feedbackMsg
}) {
  // Detecta se é modo TestArena (turno é string 'player' ou 'bot')
  const isTestArenaTurn = typeof currentTurn === 'string' && currentTurn === 'player';
  const isTurn = isTestArenaTurn || currentTurn === players[0]?.id || currentTurn === players[1]?.id;
  return (
    <>
      <Box mt={4} display="flex" flexDirection="column" alignItems="center">
        <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 2 }}>
          Choose an action for your monster when it's your turn!
        </Typography>
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" align="center">
            <b>Available actions:</b><br />
            <span style={{ color: '#1976d2' }}>⚔️ Attack</span>: damage = attack - opponent's defense<br />
            <span style={{ color: '#d32f2f' }}>🛡️ Defend</span>: reduces next damage received<br />
            <span style={{ color: '#388e3c' }}>✨ Special</span>: unique monster action, 3-turn cooldown<br />
            <span style={{ color: '#888' }}>🏳️ Forfeit</span>: give up the battle
          </Typography>
        </Box>
      </Box>
      {feedbackMsg && (
        <Box display="flex" justifyContent="center" mb={2}>
          <Typography variant="body1" color="primary" fontWeight={700}>
            {feedbackMsg}
          </Typography>
        </Box>
      )}
      <Box display="flex" justifyContent="center" gap={3}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ minWidth: 120, fontWeight: 700 }}
          onClick={onAttackClick}
          disabled={!isTurn}
        >
          ⚔️ Attack
        </Button>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          sx={{ minWidth: 120, fontWeight: 700 }}
          onClick={onDefend}
          disabled={!isTurn}
        >
          🛡️ Defend
        </Button>
        <Button
          variant="contained"
          color="success"
          size="large"
          sx={{ minWidth: 120, fontWeight: 700 }}
          onClick={onSpecial}
          disabled={!isTurn}
        >
          ✨ Special
        </Button>
        <Button
          variant="outlined"
          color="error"
          size="large"
          sx={{ minWidth: 120, fontWeight: 700 }}
          onClick={onForfeit}
          disabled={!isTurn}
        >
          🏳️ Forfeit
        </Button>
      </Box>
      <Dialog open={attackModalOpen} onClose={onCloseAttackModal}>
        <DialogTitle>Choose attack type</DialogTitle>
        <DialogContent>
          <Button fullWidth sx={{ my: 1 }} variant="contained" color="primary" onClick={() => onAttackType('attack')}>
            Normal Attack
          </Button>
          <Button fullWidth sx={{ my: 1 }} variant="contained" color="success" onClick={() => onAttackType('special')}>
            Special Attack
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseAttackModal}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 
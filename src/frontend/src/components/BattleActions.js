import React from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

export default function BattleActions({
  currentTurn,
  players,
  onAttackClick,
  onDefend,
  onSpecial,
  attackModalOpen,
  onAttackType,
  onCloseAttackModal,
  feedbackMsg
}) {
  const isTurn = currentTurn === players[0]?.id || currentTurn === players[1]?.id;
  return (
    <>
      <Box mt={4} display="flex" justifyContent="center">
        <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 2 }}>
          Choose an action for your monster when it's your turn!
        </Typography>
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
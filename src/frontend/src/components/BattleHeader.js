import React from 'react';
import { Typography, Box, Button } from '@mui/material';

export default function BattleHeader({ status, currentPlayerName, winner }) {
  return (
    <>
      <Typography variant="h4" align="center" gutterBottom>
        Battle!
      </Typography>
      {currentPlayerName && status === 'IN_PROGRESS' && !winner && (
        <Typography variant="h6" align="center" color="primary" sx={{ mb: 2 }}>
          It's <b>{currentPlayerName}</b>'s turn!
        </Typography>
      )}
      {winner && (
        <Box mt={4} textAlign="center">
          <Typography variant="h5" color="primary" gutterBottom>
            Winner: {winner.name}!
          </Typography>
        </Box>
      )}
    </>
  );
} 
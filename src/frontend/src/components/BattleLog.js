import React from 'react';
import { Typography, Paper } from '@mui/material';

export default function BattleLog({ log }) {
  return (
    <>
      <Typography variant="h6" gutterBottom>Battle Log:</Typography>
      <Paper elevation={1} sx={{ p: 2, maxHeight: 200, overflow: 'auto', bgcolor: '#f5f5f5' }}>
        {log.map((entry, index) => (
          <Typography key={index} variant="body2" gutterBottom>
            {entry}
          </Typography>
        ))}
      </Paper>
    </>
  );
} 
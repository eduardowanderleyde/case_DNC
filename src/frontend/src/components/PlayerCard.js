import React from 'react';
import { Card, CardActionArea, CardContent, Typography } from '@mui/material';

export default function PlayerCard({ player, selected, onClick }) {
  return (
    <Card
      sx={{
        border: selected ? '2px solid #1976d2' : '1px solid #ccc',
        boxShadow: selected ? 6 : 1,
        mb: 2,
        background: selected ? 'linear-gradient(90deg, #e3f2fd 0%, #bbdefb 100%)' : '#fff',
        transition: '0.2s',
        cursor: 'pointer'
      }}
    >
      <CardActionArea {...(typeof onClick === 'function' ? { onClick } : {})}>
        <CardContent>
          <Typography variant="h6" align="center">{player.name}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
 
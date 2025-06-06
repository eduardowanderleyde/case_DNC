import React, { useEffect, useRef } from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Grid } from '@mui/material';

export default function MonsterCard({ monster, selected, isCurrentTurn, effect }) {
  const { name, hp, maxHp, attack, defense, speed, special } = monster;
  const hpPercentage = (hp / maxHp) * 100;
  const barRef = useRef();

  useEffect(() => {
    if (!effect) return;
    const bar = barRef.current;
    if (!bar) return;
    bar.classList.remove('damage', 'defend', 'special');
    void bar.offsetWidth;
    bar.classList.add(effect);
    const timeout = setTimeout(() => {
      bar.classList.remove('damage', 'defend', 'special');
    }, 700);
    return () => clearTimeout(timeout);
  }, [effect, hp]);

  return (
    <Card 
      role="article"
      elevation={selected ? 8 : 1}
      sx={{ 
        position: 'relative',
        border: isCurrentTurn ? '2px solid #4caf50' : 'none',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
        }
      }}
    >
      {isCurrentTurn && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: '#4caf50',
            color: 'white',
            px: 2.5,
            py: 1,
            borderRadius: 2,
            fontSize: '1rem',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px #0002',
            zIndex: 2,
          }}
        >
          Current Turn
        </Box>
      )}
      <CardContent sx={{ mt: isCurrentTurn ? 4 : 0 }}>
        {/* Imagem do monstro */}
        {monster.imageUrl && (
          <Box display="flex" justifyContent="center" mb={2}>
            <img
              src={monster.imageUrl}
              alt={name}
              style={{ maxWidth: 100, maxHeight: 100, objectFit: 'contain', borderRadius: 12, boxShadow: '0 2px 12px #0002' }}
            />
          </Box>
        )}
        <Typography variant="h5" component="div" gutterBottom>
          {name}
        </Typography>
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            HP: {hp}/{maxHp}
          </Typography>
          <Box ref={barRef} sx={{ transition: 'box-shadow 0.3s', borderRadius: 4 }}>
            <LinearProgress 
              variant="determinate" 
              value={hpPercentage} 
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: '#e0e0e0',
                transition: 'all 0.7s cubic-bezier(.4,2,.6,1)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: hpPercentage > 50 ? '#4caf50' : hpPercentage > 25 ? '#ff9800' : '#f44336',
                  transition: 'all 0.7s cubic-bezier(.4,2,.6,1)',
                }
              }}
            />
          </Box>
        </Box>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Attack: {attack}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Defense: {defense}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Speed: {speed}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Special: {special}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
      <style>{`
        .damage { box-shadow: 0 0 0 4px #f4433688 !important; animation: shake 0.5s; }
        .defend { box-shadow: 0 0 0 4px #2196f388 !important; }
        .special { box-shadow: 0 0 0 4px #ffeb3b88 !important; }
        @keyframes shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
          100% { transform: translateX(0); }
        }
        /* Melhoria visual: sombra suave e borda arredondada */
        .MuiCard-root {
          border-radius: 18px !important;
          box-shadow: 0 4px 24px #0001 !important;
        }
      `}</style>
    </Card>
  );
}

import React from 'react';
import { render, screen } from '@testing-library/react';
import MonsterCard from '../../components/MonsterCard';

describe('MonsterCard', () => {
  const mockMonster = {
    name: 'Dragon',
    hp: 80,
    maxHp: 100,
    attack: 15,
    defense: 10,
    speed: 8,
    special: 'Fire'
  };

  it('should render correctly with all monster data', () => {
    render(<MonsterCard monster={mockMonster} selected={false} isCurrentTurn={false} />);
    
    expect(screen.getByText('Dragon')).toBeInTheDocument();
    expect(screen.getByText('HP: 80/100')).toBeInTheDocument();
    expect(screen.getByText('Attack: 15')).toBeInTheDocument();
    expect(screen.getByText('Defense: 10')).toBeInTheDocument();
    expect(screen.getByText('Speed: 8')).toBeInTheDocument();
    expect(screen.getByText('Special: Fire')).toBeInTheDocument();
  });

  it('should show current turn indicator when isCurrentTurn is true', () => {
    render(<MonsterCard monster={mockMonster} selected={false} isCurrentTurn={true} />);
    
    expect(screen.getByText('Current Turn')).toBeInTheDocument();
  });

  it('should have higher elevation when selected is true', () => {
    render(<MonsterCard monster={mockMonster} selected={true} isCurrentTurn={false} />);
    
    const card = screen.getByRole('article');
    expect(card).toHaveStyle({ boxShadow: expect.stringContaining('8px') });
  });
}); 
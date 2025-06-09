const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.arenaPlayer.deleteMany();
  await prisma.monster.deleteMany();
  await prisma.player.deleteMany();
  await prisma.arena.deleteMany();

  // Criação dos jogadores
  const players = await prisma.player.createMany({
    data: [
      { name: 'Ash' },  // 0
      { name: 'Misty' }, // 1
      { name: 'Brock' }, // 2
      { name: 'Gary' },  // 3
      { name: 'Erika' }, // 4
      { name: 'Sabrina' } // 5
    ]
  });
  const allPlayers = await prisma.player.findMany();

  // Criação dos monstros
  const monstersData = [
    { name: 'Pikachu', type: 'ELECTRIC', imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png', hp: 60, attack: 18, defense: 8, speed: 22, special: 'Thunderbolt', ownerId: allPlayers[0].id },
    { name: 'Charizard', type: 'FIRE', imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/006.png', hp: 78, attack: 24, defense: 14, speed: 20, special: 'Flamethrower', ownerId: allPlayers[0].id },
    { name: 'Blastoise', type: 'WATER', imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/009.png', hp: 79, attack: 20, defense: 20, speed: 15, special: 'Hydro Pump', ownerId: allPlayers[1].id },
    { name: 'Bulbasaur', type: 'GRASS', imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/001.png', hp: 45, attack: 14, defense: 12, speed: 16, special: 'Solar Beam', ownerId: allPlayers[2].id },
    { name: 'Gengar', type: 'GHOST', imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/094.png', hp: 60, attack: 22, defense: 10, speed: 21, special: 'Shadow Ball', ownerId: allPlayers[3].id },
    { name: 'Snorlax', type: 'NORMAL', imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/143.png', hp: 160, attack: 18, defense: 18, speed: 6, special: 'Body Slam', ownerId: allPlayers[4].id },
    { name: 'Jolteon', type: 'ELECTRIC', imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/135.png', hp: 65, attack: 16, defense: 10, speed: 25, special: 'Thunder Wave', ownerId: allPlayers[1].id },
    { name: 'Lapras', type: 'WATER', imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/131.png', hp: 130, attack: 17, defense: 15, speed: 12, special: 'Ice Beam', ownerId: allPlayers[5].id },
    { name: 'Machamp', type: 'FIGHTING', imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/068.png', hp: 90, attack: 25, defense: 15, speed: 13, special: 'Dynamic Punch', ownerId: allPlayers[2].id },
    { name: 'Alakazam', type: 'PSYCHIC', imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/065.png', hp: 55, attack: 20, defense: 8, speed: 24, special: 'Psychic', ownerId: allPlayers[3].id },
    // Rattata para o bot da Test Arena
    { name: 'Rattata', type: 'NORMAL', imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/019.png', hp: 30, attack: 10, defense: 6, speed: 20, special: 'Quick Attack', ownerId: allPlayers[0].id }
  ];
  const createdMonsters = [];
  for (const monster of monstersData) {
    const m = await prisma.monster.create({ data: monster });
    createdMonsters.push(m);
  }

  // Criação das arenas padrão
  const arena1 = await prisma.arena.create({ data: { name: 'Arena 1', maxPlayers: 2 } });
  const arena2 = await prisma.arena.create({ data: { name: 'Arena 2', maxPlayers: 2 } });
  const arena3 = await prisma.arena.create({ data: { name: 'Arena 3', maxPlayers: 2 } });
  const arena4 = await prisma.arena.create({ data: { name: 'Arena 4', maxPlayers: 2 } });
  const arena5 = await prisma.arena.create({ data: { name: 'Arena 5', maxPlayers: 2 } });

  // Arena 1 cheia
  await prisma.arenaPlayer.createMany({
    data: [
      { arenaId: arena1.id, playerId: allPlayers[0].id, monsterId: createdMonsters[0].id, isReady: false }, // Ash - Pikachu
      { arenaId: arena1.id, playerId: allPlayers[1].id, monsterId: createdMonsters[2].id, isReady: false }  // Misty - Blastoise
    ]
  });

  // Arena 2 a 5 com 1 jogador cada
  await prisma.arenaPlayer.create({
    data: { arenaId: arena2.id, playerId: allPlayers[2].id, monsterId: createdMonsters[3].id, isReady: false } // Brock - Bulbasaur
  });
  await prisma.arenaPlayer.create({
    data: { arenaId: arena3.id, playerId: allPlayers[3].id, monsterId: createdMonsters[4].id, isReady: false } // Gary - Gengar
  });
  await prisma.arenaPlayer.create({
    data: { arenaId: arena4.id, playerId: allPlayers[4].id, monsterId: createdMonsters[5].id, isReady: false } // Erika - Snorlax
  });
  await prisma.arenaPlayer.create({
    data: { arenaId: arena5.id, playerId: allPlayers[5].id, monsterId: createdMonsters[7].id, isReady: false } // Sabrina - Lapras
  });

  // Arena de Teste vazia
  await prisma.arena.create({ data: { name: 'Arena de Teste', maxPlayers: 2 } });

  console.log('Seeds criadas: Arena 1 cheia, Arena 2-5 com 1 jogador, Arena de Teste vazia!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

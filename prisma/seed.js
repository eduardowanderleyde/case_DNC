const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clean database
  await prisma.arenaPlayer.deleteMany();
  await prisma.monster.deleteMany();
  await prisma.player.deleteMany();
  await prisma.arena.deleteMany();

  // Create players
  const ash = await prisma.player.create({ data: { name: 'Ash' } });
  const misty = await prisma.player.create({ data: { name: 'Misty' } });
  console.log('Players created:', ash, misty);

  // Create 10 Pokémon-inspired monsters
  const monsters = [
    {
      name: 'Pikachu',
      type: 'ELECTRIC',
      imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png',
      hp: 60,
      attack: 18,
      defense: 8,
      speed: 22,
      special: 'Thunderbolt',
      ownerId: ash.id
    },
    {
      name: 'Charizard',
      type: 'FIRE',
      imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/006.png',
      hp: 78,
      attack: 24,
      defense: 14,
      speed: 20,
      special: 'Flamethrower',
      ownerId: ash.id
    },
    {
      name: 'Blastoise',
      type: 'WATER',
      imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/009.png',
      hp: 79,
      attack: 20,
      defense: 20,
      speed: 15,
      special: 'Hydro Pump',
      ownerId: misty.id
    },
    {
      name: 'Bulbasaur',
      type: 'GRASS',
      imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/001.png',
      hp: 45,
      attack: 14,
      defense: 12,
      speed: 16,
      special: 'Solar Beam',
      ownerId: ash.id
    },
    {
      name: 'Gengar',
      type: 'GHOST',
      imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/094.png',
      hp: 60,
      attack: 22,
      defense: 10,
      speed: 21,
      special: 'Shadow Ball',
      ownerId: misty.id
    },
    {
      name: 'Snorlax',
      type: 'NORMAL',
      imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/143.png',
      hp: 160,
      attack: 18,
      defense: 18,
      speed: 6,
      special: 'Body Slam',
      ownerId: ash.id
    },
    {
      name: 'Jolteon',
      type: 'ELECTRIC',
      imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/135.png',
      hp: 65,
      attack: 16,
      defense: 10,
      speed: 25,
      special: 'Thunder Wave',
      ownerId: misty.id
    },
    {
      name: 'Lapras',
      type: 'WATER',
      imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/131.png',
      hp: 130,
      attack: 17,
      defense: 15,
      speed: 12,
      special: 'Ice Beam',
      ownerId: misty.id
    },
    {
      name: 'Machamp',
      type: 'FIGHTING',
      imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/068.png',
      hp: 90,
      attack: 25,
      defense: 15,
      speed: 13,
      special: 'Dynamic Punch',
      ownerId: ash.id
    },
    {
      name: 'Alakazam',
      type: 'PSYCHIC',
      imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/065.png',
      hp: 55,
      attack: 20,
      defense: 8,
      speed: 24,
      special: 'Psychic',
      ownerId: misty.id
    }
  ];

  const createdMonsters = [];
  for (const monster of monsters) {
    const m = await prisma.monster.create({ data: monster });
    createdMonsters.push(m);
  }
  console.log('Monsters created:', createdMonsters);

  // Create arena and link first two monsters
  const arena = await prisma.arena.create({
    data: {
      name: 'Pokémon Arena',
      maxPlayers: 2
    }
  });
  await prisma.arenaPlayer.createMany({
    data: [
      {
        arenaId: arena.id,
        playerId: ash.id,
        monsterId: createdMonsters[0].id,
        isReady: false
      },
      {
        arenaId: arena.id,
        playerId: misty.id,
        monsterId: createdMonsters[2].id,
        isReady: false
      }
    ]
  });
  console.log('Players linked to arena.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

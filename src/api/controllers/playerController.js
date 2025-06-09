const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { createArenaWithPlayer } = require('../services/arenaService');

exports.getAllPlayers = async (req, res) => {
  try {
    const players = await prisma.player.findMany();
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPlayerById = async (req, res) => {
  try {
    const player = await prisma.player.findUnique({
      where: { id: Number(req.params.id) }
    });
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    res.json(player);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPlayer = async (req, res) => {
  try {
    const { name } = req.body;
    // Sempre cria um novo player, mesmo que o nome já exista
    const newPlayer = await prisma.player.create({ data: { name } });

    // Crie um monstro padrão para o novo player, se ele não tiver nenhum
    const existingMonsters = await prisma.monster.findMany({ where: { ownerId: newPlayer.id } });
    if (existingMonsters.length === 0) {
      await prisma.monster.create({
        data: {
          name: 'Pikachu',
          type: 'ELECTRIC',
          imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png',
          hp: 60,
          attack: 18,
          defense: 8,
          speed: 22,
          special: 'Thunderbolt',
          ownerId: newPlayer.id
        }
      });
    }

    // Não cria mais arenas artificiais!
    res.status(201).json(newPlayer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updatePlayer = async (req, res) => {
  try {
    const player = await prisma.player.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.json(player);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePlayer = async (req, res) => {
  try {
    await prisma.player.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
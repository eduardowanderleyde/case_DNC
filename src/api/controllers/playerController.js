const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
    // Se já existe, atualiza o jogador existente
    let player = await prisma.player.findUnique({ where: { name } });
    if (player) {
      player = await prisma.player.update({ where: { id: player.id }, data: { name } });
      return res.status(200).json(player);
    }
    // Se não existe, cria novo
    const newPlayer = await prisma.player.create({ data: { name } });
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
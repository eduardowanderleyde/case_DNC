const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all monsters
exports.getAllMonsters = async (req, res) => {
  try {
    const monsters = await prisma.monster.findMany();
    res.json(monsters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get monster by ID
exports.getMonsterById = async (req, res) => {
  try {
    const monster = await prisma.monster.findUnique({
      where: { id: Number(req.params.id) }
    });
    if (!monster) {
      return res.status(404).json({ message: 'Monster not found' });
    }
    res.json(monster);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new monster
exports.createMonster = async (req, res) => {
  try {
    const newMonster = await prisma.monster.create({ data: req.body });
    res.status(201).json(newMonster);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update monster
exports.updateMonster = async (req, res) => {
  try {
    const monster = await prisma.monster.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.json(monster);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete monster
exports.deleteMonster = async (req, res) => {
  try {
    await prisma.monster.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ message: 'Monster deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
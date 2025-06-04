const Monster = require('../models/Monster');

// Get all monsters
exports.getAllMonsters = async (req, res) => {
  try {
    const monsters = await Monster.find();
    res.json(monsters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get monster by ID
exports.getMonsterById = async (req, res) => {
  try {
    const monster = await Monster.findById(req.params.id);
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
  const monster = new Monster(req.body);
  try {
    const newMonster = await monster.save();
    res.status(201).json(newMonster);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update monster
exports.updateMonster = async (req, res) => {
  try {
    const monster = await Monster.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!monster) {
      return res.status(404).json({ message: 'Monster not found' });
    }
    res.json(monster);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete monster
exports.deleteMonster = async (req, res) => {
  try {
    const monster = await Monster.findByIdAndDelete(req.params.id);
    if (!monster) {
      return res.status(404).json({ message: 'Monster not found' });
    }
    res.json({ message: 'Monster deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
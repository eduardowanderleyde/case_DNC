const express = require('express');
const router = express.Router();
const monsterController = require('../controllers/monsterController');

router.get('/', monsterController.getAllMonsters);
router.get('/:id', monsterController.getMonsterById);
router.post('/', monsterController.createMonster);
router.put('/:id', monsterController.updateMonster);
router.delete('/:id', monsterController.deleteMonster);

module.exports = router; 
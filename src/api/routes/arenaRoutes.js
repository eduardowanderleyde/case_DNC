const express = require('express');
const router = express.Router();
const arenaController = require('../controllers/arenaController');

// Get all arenas
router.get('/', arenaController.getAllArenas);

// Get arena by ID
router.get('/:id', arenaController.getArenaById);

// Create new arena
router.post('/', arenaController.createArena);

// Join arena
router.post('/:id/join', arenaController.joinArena);

// Leave arena
router.post('/:id/leave', arenaController.leaveArena);

// Start battle
router.post('/:id/start', arenaController.startBattle);

// Process battle action
router.post('/:id/action', arenaController.processAction);

// Get battle state
router.get('/:id/battle', arenaController.getBattleState);

// End battle
router.post('/:id/end', arenaController.endBattle);

module.exports = router; 
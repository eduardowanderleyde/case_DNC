const express = require('express');
const router = express.Router();
const arenaController = require('../controllers/arenaController');

// Arena routes
router.get('/', arenaController.getAllArenas);
router.get('/:id', arenaController.getArenaById);
router.post('/', arenaController.createArena);
router.post('/:id/join', arenaController.joinArena);
router.post('/:id/leave', arenaController.leaveArena);
router.post('/:id/start', arenaController.startBattle);

module.exports = router; 
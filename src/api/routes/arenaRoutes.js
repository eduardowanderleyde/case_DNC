const express = require('express');
const router = express.Router();
const arenaController = require('../controllers/arenaController');

router.get('/', arenaController.getAllArenas);

router.get('/:id', arenaController.getArenaById);

router.post('/', arenaController.createArena);

router.post('/:id/join', arenaController.joinArena);

router.post('/:id/leave', arenaController.leaveArena);

router.post('/:id/start', arenaController.startBattle);

router.post('/:id/action', arenaController.processAction);

router.get('/:id/battle', arenaController.getBattleState);

router.post('/:id/end', arenaController.endBattle);

module.exports = router; 
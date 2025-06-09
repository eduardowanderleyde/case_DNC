const express = require('express');
const router = express.Router();
const testArenaController = require('../controllers/testArenaController');

router.post('/start', testArenaController.startTestArena);
router.post('/action', testArenaController.actionTestArena);
router.get('/state', testArenaController.stateTestArena);

module.exports = router; 
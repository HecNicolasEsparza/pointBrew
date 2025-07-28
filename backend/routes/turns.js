const express = require('express');
const router = express.Router();
const turnController = require('../controllers/turnController');

// GET /turns - Get all turns
router.get('/', turnController.getAllTurns);

// GET /turns/:id - Get turn by ID
router.get('/:id', turnController.getTurnById);

// POST /turns - Create new turn
router.post('/', turnController.createTurn);

// PUT /turns/:id/status - Update turn status
router.put('/:id/status', turnController.updateTurnStatus);

// GET /turns/branch/:branchId - Get turns by branch (today)
router.get('/branch/:branchId', turnController.getTurnsByBranch);

// GET /turns/user/:userId - Get turns by user
router.get('/user/:userId', turnController.getTurnsByUser);

module.exports = router;

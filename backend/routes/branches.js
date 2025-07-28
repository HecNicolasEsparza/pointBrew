const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');

// GET /branches - Get all branches
router.get('/', branchController.getAllBranches);

// GET /branches/:id - Get branch by ID
router.get('/:id', branchController.getBranchById);

// POST /branches - Create new branch
router.post('/', branchController.createBranch);

// PUT /branches/:id - Update branch
router.put('/:id', branchController.updateBranch);

// DELETE /branches/:id - Delete branch
router.delete('/:id', branchController.deleteBranch);

// GET /branches/:id/stores - Get stores by branch
router.get('/:id/stores', branchController.getStoresByBranch);

module.exports = router;

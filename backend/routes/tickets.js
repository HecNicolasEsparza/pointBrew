const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

// GET /tickets - Get all tickets
router.get('/', ticketController.getAllTickets);

// GET /tickets/:id - Get ticket by ID with details
router.get('/:id', ticketController.getTicketById);

// POST /tickets - Create new ticket
router.post('/', ticketController.createTicket);

// GET /tickets/user/:userId - Get tickets by user
router.get('/user/:userId', ticketController.getTicketsByUser);

module.exports = router;

const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');

// Return full booking (all items)
router.post('/:bookingId', returnController.returnBooking);

// Partial return with payment tracking
router.post('/:bookingId/partial', returnController.partialReturn);

// Restock specific items (partial return)
router.post('/:bookingId/restock', returnController.restockItems);

// Get pending returns (not yet returned)
router.get('/pending', returnController.getPendingReturns);

// Get returned bookings history
router.get('/history', returnController.getReturnedBookings);

module.exports = router;

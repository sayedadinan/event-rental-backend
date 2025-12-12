const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.post('/', bookingController.createBooking);
router.get('/', bookingController.getAllBookings);
router.get('/active', bookingController.getActiveBookings);
router.get('/returned', bookingController.getReturnedBookings); // Old bookings
router.get('/pending-returns', bookingController.getPendingReturns); // Not returned
router.get('/due-today', bookingController.getDueToday);
router.get('/overdue', bookingController.getOverdueBookings);
router.get('/:id', bookingController.getBooking);

module.exports = router;

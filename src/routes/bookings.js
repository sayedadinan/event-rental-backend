const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// IMPORTANT: Specific routes MUST come before dynamic /:id route
router.post('/', bookingController.createBooking);
router.get('/', bookingController.getAllBookings);
router.get('/returned', bookingController.getReturnedBookings);
router.get('/pending-returns', bookingController.getPendingReturns);
router.get('/due-today', bookingController.getDueToday);
router.get('/overdue', bookingController.getOverdueBookings);

// Dynamic route MUST be last
router.get('/:id', bookingController.getBooking);
router.patch('/:id/payment', bookingController.updatePayment);
router.put('/:id/edit-payment', bookingController.editPayment);
router.put('/:id/discount', bookingController.updateDiscount);

module.exports = router;

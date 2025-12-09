const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');

router.post('/:bookingId', returnController.returnBooking);
router.get('/pending', returnController.getPendingReturns);

module.exports = router;

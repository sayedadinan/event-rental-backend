const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Specific routes first
router.get('/search', customerController.searchCustomer);
router.get('/frequent', customerController.getFrequentCustomers);
router.get('/', customerController.getAllCustomers);
router.post('/', customerController.createCustomer);

// Dynamic routes last (must be after specific routes)
router.get('/:customerId/ledger', customerController.getCustomerLedger);
router.post('/:customerId/payment', customerController.recordPayment);
router.get('/:id', customerController.getCustomer);
router.put('/:id', customerController.updateCustomer);

module.exports = router;

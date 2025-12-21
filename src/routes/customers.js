const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Specific routes first (MUST be before dynamic :id routes)
router.get('/search', customerController.searchCustomer);
router.get('/frequent', customerController.getFrequentCustomers);
router.get('/', customerController.getAllCustomers);
router.post('/', customerController.createCustomer);

// Specific :id routes (MUST be before generic :id)
router.get('/:id/ledger', customerController.getCustomerLedger);
router.get('/:id/ledger-summary', customerController.getLedgerSummary);
router.post('/:id/payment', customerController.recordPayment);
router.post('/:id/manual-entry', customerController.addManualEntry);

// Generic dynamic routes last
router.get('/:id', customerController.getCustomer);
router.put('/:id', customerController.updateCustomer);

module.exports = router;

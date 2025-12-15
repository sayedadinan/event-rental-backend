const mongoose = require('mongoose');

const customerTransactionSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
        index: true
    },
    customerName: {
        type: String,
        required: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        default: null
    },
    transactionType: {
        type: String,
        enum: ['booking', 'payment', 'return'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    balanceBefore: {
        type: Number,
        required: true,
        default: 0
    },
    balanceAfter: {
        type: Number,
        required: true,
        default: 0
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'upi', 'card', 'bank_transfer', null],
        default: null
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
customerTransactionSchema.index({ customerId: 1, createdAt: -1 });
customerTransactionSchema.index({ bookingId: 1 });

module.exports = mongoose.model('CustomerTransaction', customerTransactionSchema);

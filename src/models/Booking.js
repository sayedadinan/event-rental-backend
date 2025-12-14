const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    customerPhone: {
        type: String,
        required: true
    },
    bookingDate: {
        type: Date,
        required: [true, 'Booking date is required']
    },
    returnDate: {
        type: Date,
        required: [true, 'Return date is required'],
        validate: {
            validator: function (v) {
                return v > this.bookingDate;
            },
            message: 'Return date must be after booking date'
        }
    },
    actualReturnDate: {
        type: Date,
        default: null
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        productName: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1']
        },
        returnedQuantity: {
            type: Number,
            default: 0,
            min: 0
        },
        pendingQuantity: {
            type: Number,
            default: function() { return this.quantity; }
        },
        perDayRent: {
            type: Number,
            required: true
        },
        totalDays: {
            type: Number,
            required: true
        },
        itemTotal: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Total amount cannot be negative']
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'full'],
        default: 'pending'
    },
    amountPaid: {
        type: Number,
        default: 0,
        min: 0
    },
    amountPending: {
        type: Number,
        default: function() { return this.totalAmount; }
    },
    status: {
        type: String,
        enum: ['active', 'returned', 'overdue'],
        default: 'active'
    },
    notes: {
        type: String
    },
    invoiceUrl: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes for common queries
bookingSchema.index({ customerId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ returnDate: 1 });

// Virtual to check if booking is overdue
bookingSchema.virtual('isOverdue').get(function () {
    if (this.status === 'returned') return false;
    return new Date() > this.returnDate;
});

module.exports = mongoose.model('Booking', bookingSchema);

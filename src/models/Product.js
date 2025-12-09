const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    totalQuantity: {
        type: Number,
        required: [true, 'Total quantity is required'],
        min: [0, 'Quantity cannot be negative']
    },
    availableQuantity: {
        type: Number,
        required: true,
        min: [0, 'Available quantity cannot be negative']
    },
    perDayRent: {
        type: Number,
        required: [true, 'Per day rent is required'],
        min: [0, 'Rent cannot be negative']
    },
    category: {
        type: String,
        trim: true,
        default: 'General'
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index for faster queries
productSchema.index({ name: 1 });

module.exports = mongoose.model('Product', productSchema);

const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^\+?[\d\s-()]+$/.test(v);
            },
            message: 'Please enter a valid phone number'
        }
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    address: {
        type: String,
        trim: true
    },
    aadharNumber: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return /^\d{12}$/.test(v);
            },
            message: 'Aadhar number must be 12 digits'
        }
    },
    totalBookings: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for faster phone number lookups
customerSchema.index({ phoneNumber: 1 });

module.exports = mongoose.model('Customer', customerSchema);

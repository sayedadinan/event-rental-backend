const Customer = require('../models/Customer');
const Booking = require('../models/Booking');

// Get all customers
exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find().sort({ name: 1 });
        res.json({ success: true, data: customers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single customer with booking history
exports.getCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        // Get customer's bookings
        const bookings = await Booking.find({ customerId: req.params.id })
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            success: true,
            data: {
                customer,
                recentBookings: bookings
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Find or create customer (used internally by booking controller)
exports.findOrCreateCustomer = async (name, phoneNumber) => {
    try {
        // Try to find existing customer by phone number
        let customer = await Customer.findOne({ phoneNumber });

        if (customer) {
            // Update name if it has changed
            if (customer.name !== name) {
                customer.name = name;
                await customer.save();
            }
        } else {
            // Create new customer
            customer = await Customer.create({ name, phoneNumber });
        }

        return customer;
    } catch (error) {
        throw new Error(`Customer creation failed: ${error.message}`);
    }
};

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

// Search customer by phone
exports.searchCustomer = async (req, res) => {
    try {
        const { phone } = req.query;
        
        if (!phone) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        const customer = await Customer.findOne({ phoneNumber: phone });
        
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Get recent bookings
        const bookings = await Booking.find({ customerId: customer._id })
            .sort({ createdAt: -1 })
            .limit(5);

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

// Get frequent customers
exports.getFrequentCustomers = async (req, res) => {
    try {
        const customers = await Customer.find()
            .sort({ totalBookings: -1 })
            .limit(10);

        res.json({
            success: true,
            count: customers.length,
            data: customers
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create customer
exports.createCustomer = async (req, res) => {
    try {
        const { name, phone, email, address } = req.body;

        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Name and phone are required'
            });
        }

        // Check if customer exists
        const existingCustomer = await Customer.findOne({ phoneNumber: phone });
        if (existingCustomer) {
            return res.status(400).json({
                success: false,
                message: 'Customer with this phone number already exists'
            });
        }

        const customer = await Customer.create({
            name,
            phoneNumber: phone,
            email,
            address
        });

        res.status(201).json({
            success: true,
            data: customer
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update customer
exports.updateCustomer = async (req, res) => {
    try {
        const { name, phone, email, address } = req.body;

        const customer = await Customer.findById(req.params.id);
        
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Update fields
        if (name) customer.name = name;
        if (phone) customer.phoneNumber = phone;
        if (email !== undefined) customer.email = email;
        if (address !== undefined) customer.address = address;

        await customer.save();

        res.json({
            success: true,
            data: customer
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

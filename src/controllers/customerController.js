const Customer = require('../models/Customer');
const Booking = require('../models/Booking');
const CustomerTransaction = require('../models/CustomerTransaction');

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

// Get customer ledger (transaction history and balance)
exports.getCustomerLedger = async (req, res) => {
    try {
        const customerId = req.params.id;

        const customer = await Customer.findById(customerId);
        
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Get all transactions for this customer
        const transactions = await CustomerTransaction.find({ customerId })
            .sort({ createdAt: -1 })
            .populate('bookingId', 'bookingDate returnDate status');

        // Calculate totals
        let totalBookings = 0;
        let totalPaid = 0;

        transactions.forEach(transaction => {
            if (transaction.transactionType === 'booking') {
                totalBookings += transaction.amount;
            } else if (transaction.transactionType === 'payment' || transaction.transactionType === 'return') {
                totalPaid += transaction.amount;
            }
        });

        const totalPending = totalBookings - totalPaid;

        res.json({
            success: true,
            data: {
                customerId: customer._id,
                customerName: customer.name,
                customerPhone: customer.phoneNumber,
                totalBookings,
                totalPaid,
                totalPending,
                transactions
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Record customer payment
exports.recordPayment = async (req, res) => {
    try {
        const customerId = req.params.id;
        const { amount, paymentMethod, bookingId, notes } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid payment amount is required'
            });
        }

        if (!paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Payment method is required'
            });
        }

        const customer = await Customer.findById(customerId);
        
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Calculate current balance
        const transactions = await CustomerTransaction.find({ customerId });
        let currentBalance = 0;

        transactions.forEach(transaction => {
            if (transaction.transactionType === 'booking') {
                currentBalance += transaction.amount;
            } else if (transaction.transactionType === 'payment' || transaction.transactionType === 'return') {
                currentBalance -= transaction.amount;
            }
        });

        // Create payment transaction
        const transaction = await CustomerTransaction.create({
            customerId,
            customerName: customer.name,
            bookingId: bookingId || null,
            transactionType: 'payment',
            amount,
            balanceBefore: currentBalance,
            balanceAfter: currentBalance - amount,
            paymentMethod,
            notes: notes || 'Payment received'
        });

        // Update booking payment if bookingId provided
        if (bookingId) {
            const booking = await Booking.findById(bookingId);
            if (booking) {
                booking.amountPaid += amount;
                booking.amountPending = Math.max(0, booking.totalAmount - booking.amountPaid);
                
                if (booking.amountPaid >= booking.totalAmount) {
                    booking.paymentStatus = 'full';
                } else if (booking.amountPaid > 0) {
                    booking.paymentStatus = 'partial';
                }
                
                await booking.save();
            }
        }

        res.json({
            success: true,
            message: 'Payment recorded successfully',
            data: transaction
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper function to create transaction (used by other controllers)
exports.createTransaction = async (customerId, customerName, transactionType, amount, bookingId = null, paymentMethod = null, notes = '') => {
    try {
        // Calculate current balance
        const transactions = await CustomerTransaction.find({ customerId });
        let currentBalance = 0;

        transactions.forEach(transaction => {
            if (transaction.transactionType === 'booking') {
                currentBalance += transaction.amount;
            } else if (transaction.transactionType === 'payment' || transaction.transactionType === 'return') {
                currentBalance -= transaction.amount;
            }
        });

        // Calculate new balance
        let balanceAfter;
        if (transactionType === 'booking') {
            balanceAfter = currentBalance + amount;
        } else {
            balanceAfter = currentBalance - amount;
        }

        // Create transaction
        const transaction = await CustomerTransaction.create({
            customerId,
            customerName,
            bookingId,
            transactionType,
            amount,
            balanceBefore: currentBalance,
            balanceAfter,
            paymentMethod,
            notes
        });

        return transaction;
    } catch (error) {
        console.error('Error creating transaction:', error);
        return null;
    }
};

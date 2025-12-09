const Booking = require('../models/Booking');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { findOrCreateCustomer } = require('./customerController');
const whatsappService = require('../config/whatsapp');

// Create new booking
exports.createBooking = async (req, res) => {
    try {
        const { customerName, customerPhone, bookingDate, returnDate, items } = req.body;

        // Validate required fields
        if (!customerName || !customerPhone || !bookingDate || !returnDate || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Calculate total days
        const booking = new Date(bookingDate);
        const returning = new Date(returnDate);
        const totalDays = Math.ceil((returning - booking) / (1000 * 60 * 60 * 24));

        if (totalDays <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Return date must be after booking date'
            });
        }

        // Find or create customer
        const customer = await findOrCreateCustomer(customerName, customerPhone);

        // Validate and prepare items
        const bookingItems = [];
        let totalAmount = 0;

        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.productId}`
                });
            }

            // Check if enough quantity is available
            if (product.availableQuantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.availableQuantity}`
                });
            }

            // Calculate item total
            const itemTotal = product.perDayRent * item.quantity * totalDays;

            bookingItems.push({
                productId: product._id,
                productName: product.name,
                quantity: item.quantity,
                perDayRent: product.perDayRent,
                totalDays,
                itemTotal
            });

            totalAmount += itemTotal;

            // Decrease available quantity
            product.availableQuantity -= item.quantity;
            await product.save();
        }

        // Create booking
        const newBooking = await Booking.create({
            customerId: customer._id,
            customerName: customer.name,
            customerPhone: customer.phoneNumber,
            bookingDate,
            returnDate,
            items: bookingItems,
            totalAmount,
            status: 'active'
        });

        // Update customer booking count
        customer.totalBookings += 1;
        await customer.save();

        // Populate product details
        await newBooking.populate('items.productId');

        // Send WhatsApp invoice
        const invoiceDetails = {
            bookingId: newBooking._id,
            customerName: customer.name,
            items: bookingItems,
            totalAmount,
            bookingDate,
            returnDate
        };

        const whatsappResult = await whatsappService.sendInvoice(
            customer.phoneNumber,
            invoiceDetails
        );

        res.status(201).json({
            success: true,
            data: newBooking,
            whatsappSent: whatsappResult.success
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('customerId', 'name phoneNumber')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single booking
exports.getBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('customerId', 'name phoneNumber');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get active bookings
exports.getActiveBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ status: 'active' })
            .populate('customerId', 'name phoneNumber')
            .sort({ returnDate: 1 });

        res.json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get bookings due today
exports.getDueToday = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const bookings = await Booking.find({
            status: 'active',
            returnDate: { $gte: today, $lt: tomorrow }
        }).populate('customerId', 'name phoneNumber');

        res.json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get overdue bookings
exports.getOverdueBookings = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const bookings = await Booking.find({
            status: 'active',
            returnDate: { $lt: today }
        }).populate('customerId', 'name phoneNumber');

        // Update status to overdue
        for (const booking of bookings) {
            if (booking.status === 'active') {
                booking.status = 'overdue';
                await booking.save();
            }
        }

        res.json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

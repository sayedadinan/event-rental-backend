const Booking = require('../models/Booking');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { findOrCreateCustomer } = require('./customerController');
const whatsappService = require('../config/whatsapp');

// Helper function to format booking with remaining items info
const formatBookingWithRemainingInfo = (booking) => {
    const bookingObj = booking.toObject ? booking.toObject() : booking;
    
    // Calculate remaining items summary
    const itemsSummary = {
        totalItems: bookingObj.items.length,
        fullyReturnedItems: 0,
        partiallyReturnedItems: 0,
        pendingItems: 0,
        remainingItems: []
    };

    bookingObj.items.forEach(item => {
        if (item.returnedQuantity === item.quantity) {
            itemsSummary.fullyReturnedItems++;
        } else if (item.returnedQuantity > 0 && item.returnedQuantity < item.quantity) {
            itemsSummary.partiallyReturnedItems++;
            itemsSummary.remainingItems.push({
                productName: item.productName,
                totalQuantity: item.quantity,
                returnedQuantity: item.returnedQuantity,
                pendingQuantity: item.pendingQuantity
            });
        } else {
            itemsSummary.pendingItems++;
            itemsSummary.remainingItems.push({
                productName: item.productName,
                totalQuantity: item.quantity,
                returnedQuantity: 0,
                pendingQuantity: item.quantity
            });
        }
    });

    return {
        ...bookingObj,
        itemsSummary
    };
};

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

        // Create booking with payment tracking
        const bookingItemsWithTracking = bookingItems.map(item => ({
            ...item,
            returnedQuantity: 0,
            pendingQuantity: item.quantity
        }));

        const newBooking = await Booking.create({
            customerId: customer._id,
            customerName: customer.name,
            customerPhone: customer.phoneNumber,
            bookingDate,
            returnDate,
            items: bookingItemsWithTracking,
            totalAmount,
            paymentStatus: 'pending',
            amountPaid: 0,
            amountPending: totalAmount,
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

        const formattedBookings = bookings.map(booking => formatBookingWithRemainingInfo(booking));

        res.json({ success: true, data: formattedBookings });
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

        const formattedBooking = formatBookingWithRemainingInfo(booking);

        res.json({ success: true, data: formattedBooking });
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

        const formattedBookings = bookings.map(booking => formatBookingWithRemainingInfo(booking));

        res.json({ success: true, data: formattedBookings });
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

        const formattedBookings = bookings.map(booking => formatBookingWithRemainingInfo(booking));

        res.json({ success: true, data: formattedBookings });
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

        const formattedBookings = bookings.map(booking => formatBookingWithRemainingInfo(booking));

        res.json({ success: true, data: formattedBookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get returned bookings (old bookings / history)
exports.getReturnedBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ status: 'returned' })
            .populate('customerId', 'name phoneNumber')
            .sort({ actualReturnDate: -1 }); // Latest returns first

        const formattedBookings = bookings.map(booking => formatBookingWithRemainingInfo(booking));

        res.json({ 
            success: true, 
            count: bookings.length,
            data: formattedBookings 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get pending returns (active + overdue, not yet returned)
exports.getPendingReturns = async (req, res) => {
    try {
        const bookings = await Booking.find({
            status: { $in: ['active', 'overdue'] }
        })
            .populate('customerId', 'name phoneNumber')
            .sort({ returnDate: 1 }); // Earliest due date first

        const formattedBookings = bookings.map(booking => formatBookingWithRemainingInfo(booking));

        res.json({ 
            success: true,
            count: bookings.length, 
            data: formattedBookings 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update payment
exports.updatePayment = async (req, res) => {
    try {
        const { amountPaid, paymentStatus } = req.body;

        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Update payment
        if (amountPaid !== undefined) {
            booking.amountPaid = amountPaid;
            booking.amountPending = booking.totalAmount - amountPaid;
        }

        if (paymentStatus) {
            booking.paymentStatus = paymentStatus;
        }

        // Auto-set payment status based on amount
        if (booking.amountPaid >= booking.totalAmount) {
            booking.paymentStatus = 'full';
            booking.amountPending = 0;
        } else if (booking.amountPaid > 0) {
            booking.paymentStatus = 'partial';
        }

        await booking.save();

        res.json({
            success: true,
            message: 'Payment updated successfully',
            data: booking
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

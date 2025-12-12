const Booking = require('../models/Booking');
const Product = require('../models/Product');

// Mark entire booking as returned (restock all items)
exports.returnBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (booking.status === 'returned') {
            return res.status(400).json({
                success: false,
                message: 'Booking already marked as returned'
            });
        }

        // Restock all items
        for (const item of booking.items) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.availableQuantity += item.quantity;
                await product.save();
            }
        }

        // Update booking status
        booking.status = 'returned';
        booking.actualReturnDate = new Date();
        await booking.save();

        res.json({
            success: true,
            message: 'All items returned and restocked successfully',
            data: booking
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Restock specific items (partial return)
exports.restockItems = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { items } = req.body; // Array of {productId, quantity}

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No items provided for restocking'
            });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (booking.status === 'returned') {
            return res.status(400).json({
                success: false,
                message: 'Booking already fully returned'
            });
        }

        const restockedItems = [];

        // Restock specified items
        for (const returnItem of items) {
            const product = await Product.findById(returnItem.productId);
            
            if (!product) {
                continue; // Skip if product not found
            }

            // Verify item exists in booking
            const bookingItem = booking.items.find(
                item => item.productId.toString() === returnItem.productId
            );

            if (!bookingItem) {
                continue; // Skip if item not in booking
            }

            // Validate quantity
            const quantityToReturn = Math.min(
                returnItem.quantity || bookingItem.quantity,
                bookingItem.quantity
            );

            // Restock the product
            product.availableQuantity += quantityToReturn;
            await product.save();

            restockedItems.push({
                productId: product._id,
                productName: product.name,
                quantity: quantityToReturn
            });
        }

        // Check if all items are returned
        const allReturned = booking.items.every(bookingItem => {
            const returnedItem = items.find(
                item => item.productId === bookingItem.productId.toString()
            );
            return returnedItem && returnedItem.quantity >= bookingItem.quantity;
        });

        // Update booking status if all items returned
        if (allReturned) {
            booking.status = 'returned';
            booking.actualReturnDate = new Date();
            await booking.save();
        }

        res.json({
            success: true,
            message: 'Items restocked successfully',
            restocked: restockedItems,
            bookingFullyReturned: allReturned,
            data: booking
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get pending returns (not yet returned bookings)
exports.getPendingReturns = async (req, res) => {
    try {
        const bookings = await Booking.find({
            status: { $in: ['active', 'overdue'] }
        })
            .populate('customerId', 'name phoneNumber')
            .sort({ returnDate: 1 });

        res.json({ 
            success: true,
            count: bookings.length, 
            data: bookings 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get returned bookings history
exports.getReturnedBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ status: 'returned' })
            .populate('customerId', 'name phoneNumber')
            .sort({ actualReturnDate: -1 });

        res.json({ 
            success: true,
            count: bookings.length,
            data: bookings 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

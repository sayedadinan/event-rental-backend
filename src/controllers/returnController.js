const Booking = require('../models/Booking');
const Product = require('../models/Product');

// Mark booking as returned
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
            message: 'Booking marked as returned and stock updated',
            data: booking
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get pending returns
exports.getPendingReturns = async (req, res) => {
    try {
        const bookings = await Booking.find({
            status: { $in: ['active', 'overdue'] }
        })
            .populate('customerId', 'name phoneNumber')
            .sort({ returnDate: 1 });

        res.json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Simple mock server for testing without MongoDB
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (temporary)
let products = [];
let customers = [];
let bookings = [];
let productIdCounter = 1;
let customerIdCounter = 1;
let bookingIdCounter = 1;

// Products endpoints
app.get('/api/products', (req, res) => {
    res.json({ success: true, data: products });
});

app.post('/api/products', (req, res) => {
    const product = {
        _id: String(productIdCounter++),
        ...req.body,
        availableQuantity: req.body.totalQuantity,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    products.push(product);
    res.status(201).json({ success: true, data: product });
});

app.delete('/api/products/:id', (req, res) => {
    products = products.filter(p => p._id !== req.params.id);
    res.json({ success: true, message: 'Product deleted' });
});

// Customers endpoints
app.get('/api/customers', (req, res) => {
    res.json({ success: true, data: customers });
});

// Bookings endpoints
app.post('/api/bookings', (req, res) => {
    const { customerName, customerPhone, bookingDate, returnDate, items } = req.body;

    // Find or create customer
    let customer = customers.find(c => c.phoneNumber === customerPhone);
    if (!customer) {
        customer = {
            _id: String(customerIdCounter++),
            name: customerName,
            phoneNumber: customerPhone,
            totalBookings: 0
        };
        customers.push(customer);
    }
    customer.totalBookings++;

    // Calculate totals
    const booking = new Date(bookingDate);
    const returning = new Date(returnDate);
    const totalDays = Math.ceil((returning - booking) / (1000 * 60 * 60 * 24));

    const bookingItems = items.map(item => {
        const product = products.find(p => p._id === item.productId);
        if (!product) throw new Error('Product not found');

        // Decrease stock
        product.availableQuantity -= item.quantity;

        const itemTotal = product.perDayRent * item.quantity * totalDays;
        return {
            productId: product._id,
            productName: product.name,
            quantity: item.quantity,
            perDayRent: product.perDayRent,
            totalDays,
            itemTotal
        };
    });

    const totalAmount = bookingItems.reduce((sum, item) => sum + item.itemTotal, 0);

    const newBooking = {
        _id: String(bookingIdCounter++),
        customerId: customer._id,
        customerName: customer.name,
        customerPhone: customer.phoneNumber,
        bookingDate,
        returnDate,
        items: bookingItems,
        totalAmount,
        status: 'active',
        createdAt: new Date()
    };

    bookings.push(newBooking);

    res.status(201).json({
        success: true,
        data: newBooking,
        whatsappSent: false // Mock - WhatsApp disabled
    });
});

app.get('/api/bookings/active', (req, res) => {
    const activeBookings = bookings.filter(b => b.status === 'active');
    res.json({ success: true, data: activeBookings });
});

app.get('/api/bookings/due-today', (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueToday = bookings.filter(b => {
        const returnDate = new Date(b.returnDate);
        return b.status === 'active' && returnDate >= today && returnDate < tomorrow;
    });

    res.json({ success: true, data: dueToday });
});

app.get('/api/returns/pending', (req, res) => {
    const pending = bookings.filter(b => b.status === 'active' || b.status === 'overdue');
    res.json({ success: true, data: pending });
});

app.post('/api/returns/:bookingId', (req, res) => {
    const booking = bookings.find(b => b._id === req.params.bookingId);
    if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Restock items
    booking.items.forEach(item => {
        const product = products.find(p => p._id === item.productId);
        if (product) {
            product.availableQuantity += item.quantity;
        }
    });

    booking.status = 'returned';
    booking.actualReturnDate = new Date();

    res.json({ success: true, message: 'Booking returned', data: booking });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Event Rental Shop API (Mock Mode - No Database)',
        note: 'Data is stored in memory and will be lost on restart'
    });
});

app.listen(PORT, () => {
    console.log(`\n🚀 Mock Server running on port ${PORT}`);
    console.log(`📝 Mode: In-Memory (No Database Required)`);
    console.log(`⚠️  Note: Data will be lost when server restarts\n`);
});

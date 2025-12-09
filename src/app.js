const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const productRoutes = require('./routes/products');
const customerRoutes = require('./routes/customers');
const bookingRoutes = require('./routes/bookings');
const returnRoutes = require('./routes/returns');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Routes
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Event Rental Shop API',
        version: '1.0.0'
    });
});

app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/returns', returnRoutes);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;

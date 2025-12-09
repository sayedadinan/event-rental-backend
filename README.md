# Event Rental Shop - Backend API

Complete REST API for managing event rental inventory, bookings, and returns.

## Features

- ✅ Product/Stock Management (CRUD)
- ✅ Auto Customer Management (created during booking)
- ✅ Booking/Rental System
- ✅ Return Management with Auto Stock Restocking
- ✅ WhatsApp Invoice Integration (Meta Cloud API)
- ✅ Overdue Tracking
- ✅ MongoDB Database

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- WhatsApp Cloud API
- CORS enabled for Flutter app

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your MongoDB URI
# For local: mongodb://localhost:27017/event-rental-shop
# For Atlas: mongodb+srv://username:password@cluster.mongodb.net/event-rental-shop
```

### Running Locally

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Products

- `GET /api/products` - Get all products
- `GET /api/products/available` - Get products with available stock
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Customers (Auto-managed)

- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer with booking history

### Bookings

- `POST /api/bookings` - Create booking (auto-creates customer, sends WhatsApp)
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/active` - Get active bookings
- `GET /api/bookings/due-today` - Get bookings due today
- `GET /api/bookings/overdue` - Get overdue bookings
- `GET /api/bookings/:id` - Get single booking

### Returns

- `POST /api/returns/:bookingId` - Mark as returned (restocks inventory)
- `GET /api/returns/pending` - Get pending returns

## WhatsApp Integration (Optional)

To enable WhatsApp invoice sending:

1. Create Meta Business Account
2. Set up WhatsApp Business API
3. Get credentials from Meta Developer Portal
4. Update `.env`:

```env
WHATSAPP_ENABLED=true
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
```

## Deployment

See [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed deployment instructions.

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database & WhatsApp config
│   ├── models/          # MongoDB models
│   ├── controllers/     # Business logic
│   ├── routes/          # API routes
│   ├── middleware/      # Error handling
│   └── app.js          # Express app
├── server.js           # Entry point
├── .env               # Environment variables
└── package.json
```

## License

MIT

# 🚀 Event Rental Shop - Complete API Documentation
**Production Base URL:** `https://event-rental-backend-943e.onrender.com/api`

**Last Updated:** December 15, 2025

---

## 📋 Table of Contents
1. [Products API](#-products-api)
2. [Customers API](#-customers-api)
3. [Customer Ledger API](#-customer-ledger-api-new)
4. [Bookings API](#-bookings-api)
5. [Returns API](#-returns-api)
6. [Payment Tracking](#-payment-tracking)

---

## 🛍️ Products API

### Get All Products
```http
GET /api/products
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "675a123...",
      "name": "Tent",
      "category": "Camping",
      "totalQuantity": 10,
      "availableQuantity": 8,
      "perDayRent": 500,
      "description": "Large camping tent",
      "createdAt": "2025-12-01T00:00:00.000Z"
    }
  ]
}
```

### Search Products 🆕
```http
GET /api/products/search?query={searchTerm}&category={categoryName}
```

**Query Parameters:**
- `query` (optional) - Search by product name or description (case-insensitive)
- `category` (optional) - Filter by category (case-insensitive)
- At least one parameter required

**Example Requests:**
```http
GET /api/products/search?query=tent
GET /api/products/search?category=Camping
GET /api/products/search?query=chair&category=Furniture
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "675a123...",
      "name": "Camping Tent",
      "category": "Camping",
      "totalQuantity": 10,
      "availableQuantity": 8,
      "perDayRent": 500,
      "description": "Large camping tent for 6 people"
    },
    {
      "_id": "675a456...",
      "name": "Small Tent",
      "category": "Camping",
      "totalQuantity": 5,
      "availableQuantity": 3,
      "perDayRent": 300,
      "description": "Compact tent for 2 people"
    }
  ]
}
```

**Flutter Example:**
```dart
// Product search
Future<List<Product>> searchProducts(String query, {String? category}) async {
  final queryParams = <String, String>{};
  if (query.isNotEmpty) queryParams['query'] = query;
  if (category != null && category.isNotEmpty) queryParams['category'] = category;
  
  final uri = Uri.parse('$baseUrl/products/search').replace(queryParameters: queryParams);
  final response = await http.get(uri);
  
  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return (data['data'] as List).map((json) => Product.fromJson(json)).toList();
  }
  throw Exception('Failed to search products');
}
```

### Create Product
```http
POST /api/products
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Tent",
  "category": "Camping",
  "totalQuantity": 10,
  "perDayRent": 500,
  "description": "Large camping tent"
}
```

### Update Product
```http
PUT /api/products/:id
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Tent",
  "totalQuantity": 15,
  "perDayRent": 600,
  "category": "Outdoor",
  "description": "Updated description"
}
```

### Delete Product
```http
DELETE /api/products/:id
```

---

## 👥 Customers API

### Get All Customers
```http
GET /api/customers
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "675b456...",
      "name": "John Doe",
      "phoneNumber": "9876543210",
      "email": "john@example.com",
      "address": "123 Main St",
      "totalBookings": 5,
      "createdAt": "2025-12-01T00:00:00.000Z"
    }
  ]
}
```

### Get Single Customer
```http
GET /api/customers/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customer": {
      "_id": "675b456...",
      "name": "John Doe",
      "phoneNumber": "9876543210",
      "totalBookings": 5
    },
    "recentBookings": [...]
  }
}
```

### Search Customer by Phone
```http
GET /api/customers/search?phone=9876543210
```

**Response (Single Customer):**
```json
{
  "success": true,
  "data": {
    "customer": {
      "_id": "675b456...",
      "name": "John Doe",
      "phoneNumber": "9876543210"
    },
    "recentBookings": [...]
  }
}
```

**Response (Multiple Customers):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "675b456...",
      "name": "John Doe",
      "phoneNumber": "9876543210"
    },
    {
      "_id": "675b789...",
      "name": "Johnny Smith",
      "phoneNumber": "9876543211"
    }
  ]
}
```

**Enhanced Features:** 🆕
- Now supports search by name: `?name=John`
- Search by phone: `?phone=9876543210`
- Combined search: `?name=John&phone=9876543210`
- Name search is case-insensitive and partial match
- Phone search is exact match
- Returns single customer with bookings if only one match
- Returns list of customers if multiple matches

**Flutter Example:**
```dart
// Search by name
Future<List<Customer>> searchCustomersByName(String name) async {
  final response = await http.get(
    Uri.parse('$baseUrl/customers/search?name=$name'),
  );
  
  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    if (data['data'] is List) {
      return (data['data'] as List).map((json) => Customer.fromJson(json)).toList();
    } else {
      return [Customer.fromJson(data['data']['customer'])];
    }
  }
  throw Exception('No customers found');
}

// Search by phone (existing)
Future<Customer> searchCustomerByPhone(String phone) async {
  final response = await http.get(
    Uri.parse('$baseUrl/customers/search?phone=$phone'),
  );
  
  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return Customer.fromJson(data['data']['customer']);
  }
  throw Exception('Customer not found');
}
```

### Get Frequent Customers
```http
GET /api/customers/frequent
```

**Description:** Returns top 10 customers sorted by total bookings

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "675b456...",
      "name": "John Doe",
      "phoneNumber": "9876543210",
      "totalBookings": 15,
      "createdAt": "2025-11-01T00:00:00.000Z"
    }
  ]
}
```

### Create Customer
```http
POST /api/customers
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "address": "123 Main St"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "675b456...",
    "name": "John Doe",
    "phoneNumber": "9876543210",
    "email": "john@example.com",
    "address": "123 Main St",
    "totalBookings": 0,
    "createdAt": "2025-12-15T00:00:00.000Z"
  }
}
```

### Update Customer
```http
PUT /api/customers/:id
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Smith",
  "phone": "9876543210",
  "email": "john.smith@example.com",
  "address": "456 New St"
}
```

---

## 💰 Customer Ledger API ✨ NEW

### Get Customer Ledger
```http
GET /api/customers/:id/ledger
```

**Description:** Returns complete transaction history and balance for a customer

**Response:**
```json
{
  "success": true,
  "data": {
    "customerId": "675b456...",
    "customerName": "John Doe",
    "customerPhone": "9876543210",
    "totalBookings": 5000.00,
    "totalPaid": 3500.00,
    "totalPending": 1500.00,
    "transactions": [
      {
        "_id": "675c789...",
        "customerId": "675b456...",
        "customerName": "John Doe",
        "bookingId": "675d012...",
        "transactionType": "booking",
        "amount": 2000.00,
        "balanceBefore": 0.00,
        "balanceAfter": 2000.00,
        "paymentMethod": null,
        "notes": "New booking created - 3 items",
        "createdAt": "2025-12-10T10:00:00.000Z"
      },
      {
        "_id": "675c790...",
        "customerId": "675b456...",
        "customerName": "John Doe",
        "bookingId": "675d012...",
        "transactionType": "payment",
        "amount": 1000.00,
        "balanceBefore": 2000.00,
        "balanceAfter": 1000.00,
        "paymentMethod": "cash",
        "notes": "Payment received",
        "createdAt": "2025-12-11T14:30:00.000Z"
      },
      {
        "_id": "675c791...",
        "customerId": "675b456...",
        "customerName": "John Doe",
        "bookingId": "675d012...",
        "transactionType": "return",
        "amount": 500.00,
        "balanceBefore": 1000.00,
        "balanceAfter": 500.00,
        "paymentMethod": "cash",
        "notes": "Partial return - 2 items returned",
        "createdAt": "2025-12-12T16:00:00.000Z"
      }
    ]
  }
}
```

**Transaction Types:**
- `booking` - New booking created (increases balance)
- `payment` - Payment received (decreases balance)
- `return` - Items returned with payment (decreases balance)

### Record Customer Payment
```http
POST /api/customers/:id/payment
Content-Type: application/json
```

**Description:** Records a payment from customer and updates their balance

**Request Body:**
```json
{
  "amount": 500.00,
  "paymentMethod": "cash",
  "bookingId": "675d012...",
  "notes": "Received payment for booking #123"
}
```

**Payment Methods:** `cash`, `upi`, `card`, `bank_transfer`

**Response:**
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "_id": "675c792...",
    "customerId": "675b456...",
    "customerName": "John Doe",
    "bookingId": "675d012...",
    "transactionType": "payment",
    "amount": 500.00,
    "balanceBefore": 1500.00,
    "balanceAfter": 1000.00,
    "paymentMethod": "cash",
    "notes": "Received payment for booking #123",
    "createdAt": "2025-12-15T10:30:00.000Z"
  }
}
```

---

## 📅 Bookings API

### Create Booking
```http
POST /api/bookings
Content-Type: application/json
```

**Request Body:**
```json
{
  "customerName": "John Doe",
  "customerPhone": "9876543210",
  "bookingDate": "2025-12-20",
  "returnDate": "2025-12-25",
  "items": [
    {
      "productId": "675a123...",
      "quantity": 2
    },
    {
      "productId": "675a124...",
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "675d012...",
    "customerId": "675b456...",
    "customerName": "John Doe",
    "customerPhone": "9876543210",
    "bookingDate": "2025-12-20",
    "returnDate": "2025-12-25",
    "items": [
      {
        "productId": "675a123...",
        "productName": "Tent",
        "quantity": 2,
        "returnedQuantity": 0,
        "pendingQuantity": 2,
        "perDayRent": 500,
        "totalDays": 5,
        "itemTotal": 5000
      }
    ],
    "totalAmount": 5000,
    "paymentStatus": "pending",
    "amountPaid": 0,
    "amountPending": 5000,
    "status": "active",
    "itemsSummary": {
      "totalItems": 2,
      "fullyReturnedItems": 0,
      "partiallyReturnedItems": 0,
      "pendingItems": 2,
      "remainingItems": [...]
    }
  },
  "whatsappSent": true
}
```

**Note:** Creating a booking automatically creates a ledger transaction for the customer.

### Get All Bookings
```http
GET /api/bookings
```

**Response includes `itemsSummary` with remaining items info**

### Get Active Bookings
```http
GET /api/bookings/active
```

**Description:** Returns only bookings with status `active`

### Get Pending Returns
```http
GET /api/bookings/pending-returns
```

**Description:** Returns bookings with status `active` or `overdue` (not yet returned)

### Get Returned Bookings
```http
GET /api/bookings/returned
```

**Description:** Returns all completed bookings (history/old bookings)

### Get Overdue Bookings
```http
GET /api/bookings/overdue
```

**Description:** Returns bookings past their return date

### Get Bookings Due Today
```http
GET /api/bookings/due-today
```

### Get Single Booking
```http
GET /api/bookings/:id
```

### Update Booking Payment
```http
PATCH /api/bookings/:id/payment
Content-Type: application/json
```

**Request Body:**
```json
{
  "amountPaid": 2500,
  "paymentStatus": "partial",
  "paymentMethod": "upi"
}
```

**Note:** Updating payment automatically creates a ledger transaction.

---

## 🔄 Returns API

### Return Full Booking (All Items)
```http
POST /api/returns/:bookingId
```

**Description:** Marks entire booking as returned and restocks ALL items

**Response:**
```json
{
  "success": true,
  "message": "All items returned and restocked successfully",
  "data": {
    "status": "returned",
    "actualReturnDate": "2025-12-15T10:00:00.000Z"
  }
}
```

### Partial Return ✨ ENHANCED
```http
POST /api/returns/:bookingId/partial
Content-Type: application/json
```

**Description:** Return specific items with payment tracking

**Request Body:**
```json
{
  "returnedItems": [
    {
      "productId": "675a123...",
      "quantity": 1,
      "returned": true
    }
  ],
  "amountReceived": 1000.00,
  "notes": "Returned grinder, chair still pending"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Partial return processed",
  "data": {
    "booking": {
      "_id": "675d012...",
      "status": "active",
      "items": [
        {
          "productName": "Chair",
          "quantity": 2,
          "returnedQuantity": 0,
          "pendingQuantity": 2
        },
        {
          "productName": "Grinder",
          "quantity": 1,
          "returnedQuantity": 1,
          "pendingQuantity": 0
        }
      ]
    },
    "processedItems": [
      {
        "productId": "675a123...",
        "productName": "Grinder",
        "returned": 1,
        "pending": 0
      }
    ],
    "remainingItems": [
      {
        "productName": "Chair",
        "totalQuantity": 2,
        "returnedQuantity": 0,
        "pendingQuantity": 2
      }
    ],
    "allItemsReturned": false,
    "paymentSummary": {
      "totalAmount": 3100,
      "amountPaid": 1000,
      "amountPending": 2100,
      "paymentStatus": "partial"
    }
  }
}
```

**Note:** Partial return with payment automatically creates a ledger transaction.

### Restock Specific Items
```http
POST /api/returns/:bookingId/restock
Content-Type: application/json
```

**Request Body:**
```json
{
  "items": [
    {
      "productId": "675a123...",
      "quantity": 1
    }
  ]
}
```

### Get Pending Returns
```http
GET /api/returns/pending
```

**Description:** Returns bookings that are not yet returned (active + overdue)

### Get Return History
```http
GET /api/returns/history
```

**Description:** Returns all completed bookings (returned status)

---

## 💳 Payment Tracking

### Payment Status Types
- `pending` - No payment received yet
- `partial` - Partial payment received
- `full` - Full payment received

### Automatic Ledger Updates

**When Creating Booking:**
- Automatically creates transaction with type `booking`
- Increases customer balance

**When Recording Payment:**
- Use `POST /api/customers/:id/payment` OR
- Use `PATCH /api/bookings/:id/payment`
- Automatically creates transaction with type `payment`
- Decreases customer balance
- Updates booking payment status

**When Processing Partial Return with Payment:**
- Automatically creates transaction with type `return`
- Decreases customer balance
- Updates booking payment status

---

## 🎯 Flutter/Dart Integration Examples

### Get Customer Ledger
```dart
Future<Map<String, dynamic>> getCustomerLedger(String customerId) async {
  final response = await http.get(
    Uri.parse('$baseUrl/api/customers/$customerId/ledger'),
  );

  if (response.statusCode == 200) {
    return json.decode(response.body)['data'];
  }
  throw Exception('Failed to load ledger');
}
```

### Record Payment
```dart
Future<void> recordPayment(String customerId, double amount, String method) async {
  final response = await http.post(
    Uri.parse('$baseUrl/api/customers/$customerId/payment'),
    headers: {'Content-Type': 'application/json'},
    body: json.encode({
      'amount': amount,
      'paymentMethod': method,
      'notes': 'Payment recorded from app',
    }),
  );

  if (response.statusCode != 200) {
    throw Exception('Failed to record payment');
  }
}
```

### Create Booking
```dart
Future<Map<String, dynamic>> createBooking(Map<String, dynamic> bookingData) async {
  final response = await http.post(
    Uri.parse('$baseUrl/api/bookings'),
    headers: {'Content-Type': 'application/json'},
    body: json.encode(bookingData),
  );

  if (response.statusCode == 201) {
    return json.decode(response.body)['data'];
  }
  throw Exception('Failed to create booking');
}
```

### Partial Return with Payment
```dart
Future<void> processPartialReturn(
  String bookingId,
  List<Map<String, dynamic>> items,
  double payment,
) async {
  final response = await http.post(
    Uri.parse('$baseUrl/api/returns/$bookingId/partial'),
    headers: {'Content-Type': 'application/json'},
    body: json.encode({
      'returnedItems': items,
      'amountReceived': payment,
      'notes': 'Partial return from app',
    }),
  );

  if (response.statusCode != 200) {
    throw Exception('Failed to process return');
  }
}
```

---

## 📊 Response Structures

### Booking with Items Summary
All booking endpoints now include `itemsSummary`:
```json
{
  "itemsSummary": {
    "totalItems": 3,
    "fullyReturnedItems": 1,
    "partiallyReturnedItems": 1,
    "pendingItems": 1,
    "remainingItems": [
      {
        "productName": "Chair",
        "totalQuantity": 2,
        "returnedQuantity": 1,
        "pendingQuantity": 1
      }
    ]
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🔍 Common Use Cases

### 1. Create New Booking with Automatic Ledger
```
POST /api/bookings → Creates booking
                  → Creates ledger transaction (type: booking)
                  → Customer balance increases
```

### 2. Record Payment
```
POST /api/customers/:id/payment → Records payment
                                → Creates ledger transaction (type: payment)
                                → Updates booking if bookingId provided
                                → Customer balance decreases
```

### 3. Partial Return with Payment
```
POST /api/returns/:bookingId/partial → Returns specific items
                                     → Restocks products
                                     → Records payment if provided
                                     → Creates ledger transaction (type: return)
                                     → Shows remaining items
```

### 4. View Customer Financial History
```
GET /api/customers/:id/ledger → Complete transaction history
                               → Total bookings, paid, pending
                               → All transactions with balance tracking
```

---

## ✅ Testing Checklist

- [ ] Products CRUD operations
- [ ] Customer creation and search
- [ ] Frequent customers list
- [ ] Customer ledger retrieval
- [ ] Payment recording
- [ ] Booking creation (with ledger transaction)
- [ ] Payment update (with ledger transaction)
- [ ] Partial return (with payment & ledger)
- [ ] Full return
- [ ] Remaining items tracking
- [ ] Balance calculations

---

## 🚀 Production URL

**Base:** `https://event-rental-backend-943e.onrender.com/api`

**Health Check:** `https://event-rental-backend-943e.onrender.com/health`

---

## 📝 Notes

1. **Free Tier Limitations:**
   - Server sleeps after 15 min inactivity
   - First request after sleep takes 30-60s to wake up
   - 512MB storage limit

2. **Security:**
   - Rate limiting: 100 requests per 15 minutes per IP
   - Input sanitization enabled
   - CORS configured for all origins

3. **WhatsApp Integration:**
   - Automatically sends invoice on booking creation (if configured)
   - Handled by backend, no frontend action needed

4. **Automatic Features:**
   - Ledger transactions created automatically
   - Customer balance updated automatically
   - Booking payment status synced automatically
   - Product inventory managed automatically

---

**Last Updated:** December 15, 2025
**Version:** 2.0 (with Customer Ledger System)

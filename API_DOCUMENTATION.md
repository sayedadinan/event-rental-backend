# 📚 Event Rental Shop - API Documentation

**Base URL (Production):** `https://event-rental-backend-943e.onrender.com/api`

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
      "_id": "...",
      "name": "Tent",
      "category": "Camping",
      "totalQuantity": 10,
      "availableQuantity": 8,
      "perDayRent": 500
    }
  ]
}
```

### Create Product
```http
POST /api/products
Content-Type: application/json

{
  "name": "Tent",
  "category": "Camping",
  "totalQuantity": 10,
  "perDayRent": 500
}
```

### Update Product
```http
PUT /api/products/:id
Content-Type: application/json

{
  "name": "Updated Tent",
  "perDayRent": 600
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

### Get Single Customer
```http
GET /api/customers/:id
```

---

## 📅 Bookings API

### Create Booking
```http
POST /api/bookings
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerPhone": "9876543210",
  "bookingDate": "2025-12-15",
  "returnDate": "2025-12-20",
  "items": [
    {
      "productId": "675a1234...",
      "quantity": 2
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "customerName": "John Doe",
    "customerPhone": "9876543210",
    "bookingDate": "2025-12-15",
    "returnDate": "2025-12-20",
    "items": [...],
    "totalAmount": 5000,
    "status": "active"
  },
  "whatsappSent": true
}
```

### Get All Bookings
```http
GET /api/bookings
```
Returns all bookings (active, overdue, and returned).

### Get Active Bookings
```http
GET /api/bookings/active
```
Returns only bookings with status `active`.

### Get Returned Bookings (Old Bookings/History)
```http
GET /api/bookings/returned
```
Returns all completed bookings that have been returned.

**Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "...",
      "status": "returned",
      "actualReturnDate": "2025-12-10",
      ...
    }
  ]
}
```

### Get Pending Returns (Not Yet Returned)
```http
GET /api/bookings/pending-returns
```
Returns bookings with status `active` or `overdue` (not yet returned).

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "status": "active",
      "returnDate": "2025-12-15",
      ...
    }
  ]
}
```

### Get Overdue Bookings
```http
GET /api/bookings/overdue
```
Returns bookings past their return date.

### Get Bookings Due Today
```http
GET /api/bookings/due-today
```
Returns bookings that should be returned today.

### Get Single Booking
```http
GET /api/bookings/:id
```

---

## 🔄 Returns API

### Return Full Booking (All Items)
```http
POST /api/returns/:bookingId
```
Marks entire booking as returned and restocks **ALL items**.

**Response:**
```json
{
  "success": true,
  "message": "All items returned and restocked successfully",
  "data": {
    "status": "returned",
    "actualReturnDate": "2025-12-12"
  }
}
```

### Restock Specific Items (Partial Return)
```http
POST /api/returns/:bookingId/restock
Content-Type: application/json

{
  "items": [
    {
      "productId": "675a1234...",
      "quantity": 1
    }
  ]
}
```
Restocks only specified items. If all items are returned, booking status changes to `returned`.

**Response:**
```json
{
  "success": true,
  "message": "Items restocked successfully",
  "restocked": [
    {
      "productId": "...",
      "productName": "Tent",
      "quantity": 1
    }
  ],
  "bookingFullyReturned": false
}
```

### Get Pending Returns
```http
GET /api/returns/pending
```
Returns bookings that are not yet returned (active + overdue).

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

### Get Returned Bookings History
```http
GET /api/returns/history
```
Returns all completed bookings (returned status).

**Response:**
```json
{
  "success": true,
  "count": 20,
  "data": [...]
}
```

---

## 📊 Status Types

| Status | Description |
|--------|-------------|
| `active` | Booking is active, items rented out |
| `overdue` | Booking passed return date, not yet returned |
| `returned` | All items returned, booking completed |

---

## 🚀 Usage Examples (Flutter/Dart)

### Get All Bookings
```dart
final response = await http.get(
  Uri.parse('https://event-rental-backend-943e.onrender.com/api/bookings')
);
```

### Get Only Active Bookings
```dart
final response = await http.get(
  Uri.parse('https://event-rental-backend-943e.onrender.com/api/bookings/active')
);
```

### Get Pending Returns (Not Returned)
```dart
final response = await http.get(
  Uri.parse('https://event-rental-backend-943e.onrender.com/api/bookings/pending-returns')
);
// OR
final response = await http.get(
  Uri.parse('https://event-rental-backend-943e.onrender.com/api/returns/pending')
);
```

### Get Old Bookings (Returned/History)
```dart
final response = await http.get(
  Uri.parse('https://event-rental-backend-943e.onrender.com/api/bookings/returned')
);
// OR
final response = await http.get(
  Uri.parse('https://event-rental-backend-943e.onrender.com/api/returns/history')
);
```

### Return Full Booking (All Items)
```dart
final response = await http.post(
  Uri.parse('https://event-rental-backend-943e.onrender.com/api/returns/$bookingId'),
);
// This will restock ALL items and mark booking as returned
```

### Restock Specific Items
```dart
final response = await http.post(
  Uri.parse('https://event-rental-backend-943e.onrender.com/api/returns/$bookingId/restock'),
  headers: {'Content-Type': 'application/json'},
  body: json.encode({
    'items': [
      {'productId': '675a...', 'quantity': 2}
    ]
  }),
);
// This will restock only specified items
```

### Create Booking
```dart
final response = await http.post(
  Uri.parse('https://event-rental-backend-943e.onrender.com/api/bookings'),
  headers: {'Content-Type': 'application/json'},
  body: json.encode({
    'customerName': 'John Doe',
    'customerPhone': '9876543210',
    'bookingDate': '2025-12-15',
    'returnDate': '2025-12-20',
    'items': [
      {'productId': 'product_id_here', 'quantity': 2}
    ]
  }),
);
```

---

## 🔍 Quick Reference

### Show All Bookings (Any Status)
```
GET /api/bookings
```

### Show Active Bookings Only
```
GET /api/bookings/active
```

### Show Pending Returns (Not Returned Yet)
```
GET /api/bookings/pending-returns
GET /api/returns/pending
```

### Show Old/Completed Bookings
```
GET /api/bookings/returned
GET /api/returns/history
```

### Mark Product as Returned & Restock
```
POST /api/returns/:bookingId (full return)
POST /api/returns/:bookingId/restock (partial return)
```

---

## 📝 Notes

1. **Pending Returns** = Active + Overdue bookings (not yet returned)
2. **Returned Bookings** = Completed bookings (all items returned)
3. When you mark booking as returned, items automatically restock
4. Partial returns supported - restock specific items one by one
5. WhatsApp invoice sent automatically on booking creation (if enabled)

---

## 🎯 Your Backend is Live!

**Production URL:** https://event-rental-backend-943e.onrender.com

Test it now:
- https://event-rental-backend-943e.onrender.com/health
- https://event-rental-backend-943e.onrender.com/api/products
- https://event-rental-backend-943e.onrender.com/api/bookings

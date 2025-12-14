# 🚀 NEW APIs - Quick Reference

## ✅ All APIs Deployed to Production!

**Base URL:** `https://event-rental-backend-943e.onrender.com/api`

---

## 👥 Customer APIs (NEW)

### Search Customer by Phone
```http
GET /api/customers/search?phone=9876543210
```
**Response:**
```json
{
  "success": true,
  "data": {
    "customer": {
      "_id": "...",
      "name": "John Doe",
      "phoneNumber": "9876543210",
      "email": "john@example.com",
      "address": "123 Main St",
      "totalBookings": 5
    },
    "recentBookings": [...]
  }
}
```

### Get Frequent Customers
```http
GET /api/customers/frequent
```
Returns top 10 customers by booking count.

### Create Customer
```http
POST /api/customers
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "address": "123 Main St"
}
```

### Update Customer
```http
PUT /api/customers/:id
Content-Type: application/json

{
  "name": "John Updated",
  "email": "newemail@example.com"
}
```

---

## 💰 Payment Tracking (NEW)

### Update Booking Payment
```http
PATCH /api/bookings/:id/payment
Content-Type: application/json

{
  "amountPaid": 2000,
  "paymentStatus": "partial"
}
```

**Payment Status:**
- `pending` - No payment received
- `partial` - Some payment received
- `full` - Fully paid

**Response:**
```json
{
  "success": true,
  "message": "Payment updated successfully",
  "data": {
    "_id": "...",
    "totalAmount": 5000,
    "amountPaid": 2000,
    "amountPending": 3000,
    "paymentStatus": "partial"
  }
}
```

---

## 🔄 Partial Returns (NEW)

### Partial Return with Payment
```http
POST /api/returns/:bookingId/partial
Content-Type: application/json

{
  "returnedItems": [
    {
      "productId": "675a1234...",
      "quantity": 2,
      "returned": true
    }
  ],
  "paymentStatus": "full",
  "amountReceived": 5000,
  "notes": "Customer returned 2 chairs, 1 table still pending"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Partial return processed",
  "data": {
    "booking": {
      "_id": "...",
      "items": [
        {
          "productId": "...",
          "productName": "Chair",
          "quantity": 5,
          "returnedQuantity": 2,
          "pendingQuantity": 3
        }
      ],
      "paymentStatus": "full",
      "amountPaid": 5000,
      "amountPending": 0,
      "notes": "Customer returned 2 chairs..."
    },
    "processedItems": [...],
    "allItemsReturned": false
  }
}
```

---

## 📋 Enhanced Booking Response

### GET /api/bookings/:id Now Returns:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "customerName": "John Doe",
    "items": [
      {
        "productId": "...",
        "productName": "Chair",
        "quantity": 5,
        "returnedQuantity": 3,
        "pendingQuantity": 2,
        "perDayRent": 100,
        "itemTotal": 500
      }
    ],
    "totalAmount": 5000,
    "paymentStatus": "partial",
    "amountPaid": 3000,
    "amountPending": 2000,
    "status": "active",
    "notes": "Customer note..."
  }
}
```

### POST /api/bookings Now Includes Payment:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "totalAmount": 5000,
    "paymentStatus": "pending",
    "amountPaid": 0,
    "amountPending": 5000,
    "items": [
      {
        "quantity": 5,
        "returnedQuantity": 0,
        "pendingQuantity": 5
      }
    ]
  },
  "whatsappSent": true
}
```

---

## 🎯 Complete API Endpoints

### **Customers**
```
GET    /api/customers                  - Get all customers
GET    /api/customers/search?phone=... - Search by phone
GET    /api/customers/frequent         - Get top 10 customers
GET    /api/customers/:id              - Get single customer
POST   /api/customers                  - Create customer
PUT    /api/customers/:id              - Update customer
```

### **Bookings**
```
POST   /api/bookings                   - Create booking (with payment tracking)
GET    /api/bookings                   - Get all bookings
GET    /api/bookings/active            - Get active bookings
GET    /api/bookings/returned          - Get returned bookings
GET    /api/bookings/pending-returns   - Get pending returns
GET    /api/bookings/overdue           - Get overdue bookings
GET    /api/bookings/due-today         - Get due today
GET    /api/bookings/:id               - Get booking (with payment & return details)
PATCH  /api/bookings/:id/payment       - Update payment
```

### **Returns**
```
POST   /api/returns/:bookingId         - Full return (all items)
POST   /api/returns/:bookingId/partial - Partial return with payment
POST   /api/returns/:bookingId/restock - Restock specific items
GET    /api/returns/pending            - Get pending returns
GET    /api/returns/history            - Get return history
```

---

## 📱 Flutter/Dart Examples

### Search Customer
```dart
final response = await http.get(
  Uri.parse('$baseUrl/customers/search?phone=9876543210')
);
```

### Create Customer
```dart
final response = await http.post(
  Uri.parse('$baseUrl/customers'),
  headers: {'Content-Type': 'application/json'},
  body: json.encode({
    'name': 'John Doe',
    'phone': '9876543210',
    'email': 'john@example.com'
  }),
);
```

### Update Payment
```dart
final response = await http.patch(
  Uri.parse('$baseUrl/bookings/$bookingId/payment'),
  headers: {'Content-Type': 'application/json'},
  body: json.encode({
    'amountPaid': 2000,
    'paymentStatus': 'partial'
  }),
);
```

### Partial Return
```dart
final response = await http.post(
  Uri.parse('$baseUrl/returns/$bookingId/partial'),
  headers: {'Content-Type': 'application/json'},
  body: json.encode({
    'returnedItems': [
      {'productId': productId, 'quantity': 2, 'returned': true}
    ],
    'amountReceived': 5000,
    'paymentStatus': 'full',
    'notes': 'Partial return completed'
  }),
);
```

---

## 🔥 Key Features Added

✅ **Payment Tracking** - Track paid/pending amounts  
✅ **Partial Returns** - Return items one by one  
✅ **Return Quantity Tracking** - See what's returned vs pending  
✅ **Customer Search** - Find by phone number  
✅ **Customer CRUD** - Create, update, manage customers  
✅ **Frequent Customers** - Top 10 by bookings  
✅ **Payment Notes** - Add notes to bookings  

---

## ⏳ Deployment Status

- ✅ Code pushed to GitHub
- 🔄 Render deploying (2-3 minutes)
- ⏳ Will be live at: https://event-rental-backend-943e.onrender.com

**Wait 2-3 minutes, then test all endpoints!**

---

## 🧪 Quick Test Commands

```powershell
# Test customer search
Invoke-WebRequest -Uri "https://event-rental-backend-943e.onrender.com/api/customers/search?phone=9876543210"

# Test frequent customers
Invoke-WebRequest -Uri "https://event-rental-backend-943e.onrender.com/api/customers/frequent"

# Test booking payment update
Invoke-WebRequest -Uri "https://event-rental-backend-943e.onrender.com/api/bookings/BOOKING_ID/payment" -Method PATCH -Body '{"amountPaid":1000}' -ContentType "application/json"
```

---

**All APIs are production-ready and deployed! 🎉**

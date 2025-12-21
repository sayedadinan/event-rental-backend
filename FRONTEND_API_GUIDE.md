# 🚀 Event Rental Shop - Complete Frontend API Guide

**Production Base URL:** `https://event-rental-backend-943e.onrender.com/api`

**Last Updated:** December 21, 2025

---

## 📋 Quick Navigation
- [New Features](#-new-features-december-2025)
- [Products API](#-products-api)
- [Customers API](#-customers-api)
- [Customer Ledger API](#-customer-ledger-api)
- [Bookings API](#-bookings-api)
- [Payment & Discount](#-payment--discount-management)
- [Returns API](#-returns-api)
- [Error Handling](#-error-handling)

---

## 🆕 NEW FEATURES (December 2025)

### What's New:
1. **Product Search** - Search products by name/category
2. **Customer Search Enhancement** - Search by name or phone
3. **Payment Editing** - Edit payment amounts after booking
4. **Discount System** - Add discounts with reasons to bookings
5. **Aadhar Integration** - Store customer Aadhar numbers
6. **Manual Ledger Entries** - Add old debts/credits to customer ledger
7. **Ledger Summary** - Generate shareable customer ledger summary
8. **Removed Active Bookings** - Use `/pending-returns` instead (reduces storage)

---

## 🛍️ Products API

### 1. Get All Products
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
      "description": "Large camping tent"
    }
  ]
}
```

### 2. Search Products 🆕
```http
GET /api/products/search?query={searchTerm}&category={categoryName}
```

**Query Parameters:**
- `query` (optional) - Search by name/description (case-insensitive)
- `category` (optional) - Filter by category
- At least one parameter required

**Example:**
```javascript
// Flutter/Dart
final response = await http.get(
  Uri.parse('$baseUrl/products/search?query=tent')
);

// JavaScript/React
const response = await fetch(`${baseUrl}/products/search?query=tent&category=Camping`);
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
      "perDayRent": 500
    }
  ]
}
```

### 3. Get Available Products
```http
GET /api/products/available
```
Returns only products with `availableQuantity > 0`

### 4. Create Product
```http
POST /api/products
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Tent",
  "category": "Camping",
  "totalQuantity": 10,
  "perDayRent": 500,
  "description": "Large camping tent"
}
```

### 5. Update Product
```http
PUT /api/products/:id
```

### 6. Delete Product
```http
DELETE /api/products/:id
```

---

## 👥 Customers API

### 1. Get All Customers
```http
GET /api/customers
```

### 2. Search Customer 🆕 ENHANCED
```http
GET /api/customers/search?phone={phone}&name={name}
```

**Query Parameters:**
- `phone` (optional) - Exact phone match
- `name` (optional) - Partial name match (case-insensitive)
- At least one parameter required

**Examples:**
```javascript
// Search by phone (exact match)
GET /api/customers/search?phone=9876543210

// Search by name (partial match) 🆕
GET /api/customers/search?name=sayed

// Combined search 🆕
GET /api/customers/search?name=john&phone=9876543210
```

**Response (Single Customer):**
```json
{
  "success": true,
  "data": {
    "customer": {
      "_id": "675b456...",
      "name": "Sayed",
      "phoneNumber": "9876543210",
      "aadharNumber": "123456789012"
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
      "name": "Sayed Adinan",
      "phoneNumber": "9876543210"
    },
    {
      "_id": "675b789...",
      "name": "Sayed Ali",
      "phoneNumber": "9876543211"
    }
  ]
}
```

### 3. Get Frequent Customers
```http
GET /api/customers/frequent
```
Returns top 10 customers by booking count

### 4. Create Customer
```http
POST /api/customers
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Sayed",
  "phone": "9876543210",
  "email": "sayed@example.com",
  "address": "123 Street",
  "aadharNumber": "123456789012"
}
```

**Fields:**
- `name` (required)
- `phone` (required)
- `email` (optional)
- `address` (optional)
- `aadharNumber` (optional) - Must be 12 digits 🆕

### 5. Update Customer
```http
PUT /api/customers/:id
```

**Request:**
```json
{
  "name": "Sayed Updated",
  "phone": "9876543210",
  "aadharNumber": "123456789012"
}
```

### 6. Get Customer Details
```http
GET /api/customers/:id
```

---

## 💰 Customer Ledger API

### 1. Get Customer Ledger (Full History)
```http
GET /api/customers/:id/ledger
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customerId": "675b456...",
    "customerName": "Sayed",
    "customerPhone": "9876543210",
    "totalBookings": 2500,
    "totalPaid": 1500,
    "totalPending": 1000,
    "transactions": [
      {
        "_id": "675d123...",
        "transactionType": "booking",
        "amount": 1500,
        "balanceBefore": 0,
        "balanceAfter": 1500,
        "notes": "New booking - 3 items",
        "createdAt": "2025-12-15T10:00:00Z"
      },
      {
        "_id": "675d124...",
        "transactionType": "manual_debit",
        "amount": 1000,
        "balanceBefore": 1500,
        "balanceAfter": 2500,
        "notes": "Old debt from before app - 2 products pending",
        "createdAt": "2025-12-16T09:00:00Z"
      },
      {
        "_id": "675d125...",
        "transactionType": "payment",
        "amount": 1500,
        "balanceBefore": 2500,
        "balanceAfter": 1000,
        "paymentMethod": "cash",
        "notes": "Payment received",
        "createdAt": "2025-12-17T11:00:00Z"
      }
    ]
  }
}
```

**Transaction Types:**
- `booking` - New booking created (increases balance)
- `payment` - Customer made payment (decreases balance)
- `return` - Products returned with payment (decreases balance)
- `manual_debit` 🆕 - Old debt added manually (increases balance)
- `manual_credit` 🆕 - Old payment added manually (decreases balance)
- `adjustment` 🆕 - Balance adjustment (no effect on balance)

### 2. Get Ledger Summary (Shareable) 🆕
```http
GET /api/customers/:id/ledger-summary
```

**Use Case:** Generate a clean summary to share with customer via WhatsApp/Email

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "customerName": "Sayed",
      "customerPhone": "9876543210",
      "totalBookings": 5,
      "activeBookings": 1,
      "currentBalance": 1000,
      "totalDebits": 2500,
      "totalCredits": 1500,
      "manualDebits": 1000,
      "manualCredits": 0,
      "status": "pending"
    },
    "recentTransactions": [
      {
        "date": "2025-12-17T11:00:00Z",
        "type": "payment",
        "amount": 1500,
        "balance": 1000,
        "notes": "Payment received",
        "paymentMethod": "cash"
      }
    ],
    "generatedAt": "2025-12-21T10:00:00Z"
  }
}
```

**Status Values:**
- `clear` - Balance is 0 or negative (customer has no pending amount)
- `pending` - Balance is positive (customer owes money)

### 3. Record Payment
```http
POST /api/customers/:id/payment
Content-Type: application/json
```

**Request:**
```json
{
  "amount": 500,
  "paymentMethod": "cash",
  "bookingId": "675d012...",
  "notes": "Partial payment"
}
```

**Payment Methods:** `cash`, `upi`, `card`, `bank_transfer`

### 4. Add Manual Ledger Entry 🆕
```http
POST /api/customers/:id/manual-entry
Content-Type: application/json
```

**Use Case:** Add old debts or credits from before the app was implemented

**Request (Add Old Debt):**
```json
{
  "type": "debit",
  "amount": 1000,
  "description": "Old debt - Sayed borrowed 2 chairs in November, not yet returned"
}
```

**Request (Add Old Payment):**
```json
{
  "type": "credit",
  "amount": 500,
  "description": "Old payment - Cash received on Dec 10 before app"
}
```

**Fields:**
- `type` (required) - `"debit"` (customer owes) or `"credit"` (customer paid)
- `amount` (required) - Positive number
- `description` (required) - Clear explanation of the entry

**Response:**
```json
{
  "success": true,
  "message": "Manual ledger entry added successfully",
  "data": {
    "_id": "675d126...",
    "customerId": "675b456...",
    "transactionType": "manual_debit",
    "amount": 1000,
    "balanceBefore": 1500,
    "balanceAfter": 2500,
    "notes": "Old debt - Sayed borrowed 2 chairs in November",
    "createdAt": "2025-12-21T10:00:00Z"
  }
}
```

---

## 📅 Bookings API

### 1. Create Booking
```http
POST /api/bookings
Content-Type: application/json
```

**Request:**
```json
{
  "customerName": "Sayed",
  "customerPhone": "9876543210",
  "bookingDate": "2025-12-20",
  "returnDate": "2025-12-25",
  "discount": 200,
  "discountReason": "Loyal customer - 10% off",
  "aadharNumber": "123456789012",
  "items": [
    {
      "productId": "675a123...",
      "quantity": 2
    }
  ]
}
```

**New Fields:** 🆕
- `discount` (optional, default 0) - Discount amount in ₹
- `discountReason` (optional) - Reason for discount
- `aadharNumber` (optional) - Customer's 12-digit Aadhar number

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "675d012...",
    "customerName": "Sayed",
    "totalAmount": 5000,
    "discount": 200,
    "finalAmount": 4800,
    "amountPaid": 0,
    "amountPending": 4800,
    "paymentStatus": "pending",
    "aadharNumber": "123456789012",
    "items": [...]
  }
}
```

### 2. Get All Bookings
```http
GET /api/bookings
```

### 3. Get Pending Returns (Replaces Active Bookings) 🆕
```http
GET /api/bookings/pending-returns
```

**Note:** The `/active` endpoint has been removed. Use `/pending-returns` instead to get all bookings that need to be returned (status: active or overdue).

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "675d012...",
      "customerName": "Sayed",
      "status": "active",
      "returnDate": "2025-12-25",
      "totalAmount": 5000,
      "finalAmount": 4800,
      "amountPaid": 2000,
      "amountPending": 2800,
      "itemsSummary": {
        "totalItems": 3,
        "fullyReturnedItems": 0,
        "partiallyReturnedItems": 1,
        "pendingItems": 2
      }
    }
  ]
}
```

### 4. Get Returned Bookings
```http
GET /api/bookings/returned
```

### 5. Get Due Today
```http
GET /api/bookings/due-today
```

### 6. Get Overdue Bookings
```http
GET /api/bookings/overdue
```

### 7. Get Single Booking
```http
GET /api/bookings/:id
```

---

## 💳 Payment & Discount Management

### 1. Update Payment (Legacy)
```http
PATCH /api/bookings/:id/payment
```

**Request:**
```json
{
  "amountPaid": 2000,
  "paymentStatus": "partial",
  "paymentMethod": "upi"
}
```

### 2. Edit Payment Amount 🆕
```http
PUT /api/bookings/:id/edit-payment
Content-Type: application/json
```

**Use Case:** Correct/modify payment amount after booking creation

**Request:**
```json
{
  "newAmountPaid": 2500,
  "paymentMethod": "cash"
}
```

**Validation:**
- `newAmountPaid` cannot exceed `finalAmount`
- Automatically updates `paymentStatus` based on amount

**Response:**
```json
{
  "success": true,
  "message": "Payment edited successfully",
  "data": {
    "booking": {...},
    "previousAmount": 2000,
    "newAmount": 2500,
    "difference": 500
  }
}
```

### 3. Add/Update Discount 🆕
```http
PUT /api/bookings/:id/discount
Content-Type: application/json
```

**Use Case:** Add or modify discount after booking creation

**Request:**
```json
{
  "discount": 500,
  "discountReason": "Frequent customer - special discount"
}
```

**Validation:**
- `discount` cannot exceed `totalAmount`
- Automatically recalculates `finalAmount`, `amountPending`, and `paymentStatus`

**Response:**
```json
{
  "success": true,
  "message": "Discount updated successfully",
  "data": {
    "booking": {...},
    "summary": {
      "totalAmount": 5000,
      "previousDiscount": 200,
      "newDiscount": 500,
      "previousFinalAmount": 4800,
      "newFinalAmount": 4500,
      "amountPaid": 2000,
      "amountPending": 2500
    }
  }
}
```

---

## 🔄 Returns API

### 1. Full Return
```http
POST /api/returns/full
Content-Type: application/json
```

**Request:**
```json
{
  "bookingId": "675d012...",
  "returnDate": "2025-12-25",
  "amountReceived": 2800
}
```

### 2. Partial Return
```http
POST /api/returns/partial
Content-Type: application/json
```

**Request:**
```json
{
  "bookingId": "675d012...",
  "itemReturns": [
    {
      "productId": "675a123...",
      "returnedQuantity": 1
    }
  ],
  "returnDate": "2025-12-23",
  "amountReceived": 1000
}
```

---

## ❌ Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Server Error

**Example Error Response:**
```json
{
  "success": false,
  "message": "Aadhar number must be 12 digits"
}
```

---

## 🎯 Common Use Cases

### Use Case 1: Add Old Customer with Existing Debt

**Scenario:** Customer "Sayed" has old debt of ₹1000 from before app implementation

```javascript
// Step 1: Create/Find customer
const customerResponse = await fetch(`${baseUrl}/customers`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Sayed',
    phone: '9876543210',
    aadharNumber: '123456789012'
  })
});

const customer = await customerResponse.json();
const customerId = customer.data._id;

// Step 2: Add old debt as manual entry
const debtResponse = await fetch(`${baseUrl}/customers/${customerId}/manual-entry`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'debit',
    amount: 1000,
    description: 'Old debt - 2 chairs borrowed in November, not returned yet'
  })
});

// Step 3: Create new booking (if needed)
const bookingResponse = await fetch(`${baseUrl}/bookings`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerName: 'Sayed',
    customerPhone: '9876543210',
    bookingDate: '2025-12-20',
    returnDate: '2025-12-25',
    items: [{ productId: '675a123...', quantity: 1 }]
  })
});

// Step 4: Check total balance
const ledgerResponse = await fetch(`${baseUrl}/customers/${customerId}/ledger`);
const ledger = await ledgerResponse.json();
console.log('Total Pending:', ledger.data.totalPending); // Shows old debt + new booking
```

### Use Case 2: Apply Discount After Booking

```javascript
// Customer wants discount after booking created
const response = await fetch(`${baseUrl}/bookings/${bookingId}/discount`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    discount: 500,
    discountReason: 'Customer complained about product quality'
  })
});
```

### Use Case 3: Generate Shareable Ledger Summary

```javascript
// Get summary to share with customer
const response = await fetch(`${baseUrl}/customers/${customerId}/ledger-summary`);
const summary = await response.json();

// Use summary.data to generate WhatsApp message:
const message = `
Dear ${summary.data.summary.customerName},

Current Balance: ₹${summary.data.summary.currentBalance}
Total Bookings: ${summary.data.summary.totalBookings}
Active Bookings: ${summary.data.summary.activeBookings}
Status: ${summary.data.summary.status}

Thank you!
`;
```

---

## 📱 Flutter/Dart Examples

### Search Products
```dart
Future<List<Product>> searchProducts(String query) async {
  final response = await http.get(
    Uri.parse('$baseUrl/products/search?query=$query'),
  );
  
  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return (data['data'] as List)
        .map((json) => Product.fromJson(json))
        .toList();
  }
  throw Exception('Failed to search products');
}
```

### Add Manual Ledger Entry
```dart
Future<void> addOldDebt(String customerId, double amount, String description) async {
  final response = await http.post(
    Uri.parse('$baseUrl/customers/$customerId/manual-entry'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'type': 'debit',
      'amount': amount,
      'description': description,
    }),
  );
  
  if (response.statusCode != 201) {
    throw Exception('Failed to add debt');
  }
}
```

### Create Booking with Discount
```dart
Future<Booking> createBookingWithDiscount({
  required String customerName,
  required String customerPhone,
  required String bookingDate,
  required String returnDate,
  required List<BookingItem> items,
  double discount = 0,
  String discountReason = '',
  String? aadharNumber,
}) async {
  final response = await http.post(
    Uri.parse('$baseUrl/bookings'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'customerName': customerName,
      'customerPhone': customerPhone,
      'bookingDate': bookingDate,
      'returnDate': returnDate,
      'items': items.map((i) => i.toJson()).toList(),
      'discount': discount,
      'discountReason': discountReason,
      'aadharNumber': aadharNumber,
    }),
  );
  
  if (response.statusCode == 201) {
    return Booking.fromJson(jsonDecode(response.body)['data']);
  }
  throw Exception('Failed to create booking');
}
```

---

## 🔑 Key Points for Frontend Developer

1. **Active Bookings Removed:** Use `/api/bookings/pending-returns` instead of `/api/bookings/active`

2. **Search is Case-Insensitive:** All search endpoints (products, customers) support partial matching

3. **Aadhar Validation:** Must be exactly 12 digits if provided

4. **Discount Logic:**
   - `finalAmount = totalAmount - discount`
   - `amountPending = finalAmount - amountPaid`
   - Payment status auto-updates based on amounts

5. **Manual Entries:** Use for old debts/credits from before app implementation
   - Type `"debit"` = customer owes money
   - Type `"credit"` = customer paid money

6. **Ledger Summary:** Designed for sharing - contains clean, formatted data

7. **Payment Editing:** Use `/edit-payment` endpoint to modify payment amounts after creation

8. **Error Messages:** Always check `success` field and display `message` to users

---

## 📞 Support

For any questions or issues, contact the backend team.

**Base URL:** `https://event-rental-backend-943e.onrender.com/api`

**Documentation Version:** 2.0  
**Last Updated:** December 21, 2025

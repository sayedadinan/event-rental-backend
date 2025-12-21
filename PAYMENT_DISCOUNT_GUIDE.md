# 💰 Payment Editing & Discount Management Guide

## Overview
This guide covers the new payment editing, discount management, and Aadhar card integration features added to the Event Rental Shop backend.

## 🎯 New Features

### 1. **Edit Payment Amount**
Edit or modify payment amounts after booking creation.

### 2. **Add/Update Discounts**
Apply discounts to bookings with reasons.

### 3. **Aadhar Card Integration**
Store customer Aadhar card numbers (12 digits) for ID verification.

---

## 📋 Storage Decision: Why No Image Upload?

### Analysis
- **Free MongoDB Atlas**: 512MB total storage
- **Image Size**: 500KB - 2MB per booking (2 photos)
- **Storage Consumption**: 
  - 1000 bookings = 500MB - 2GB just for images
  - This would exceed free tier limits immediately

### Solution: Aadhar Number Only ✅
- Store only 12-digit Aadhar number (text)
- Size: ~50 bytes per booking
- 1000 bookings = 50KB (negligible)
- **Result**: 10,000x more efficient!

---

## 🆕 New API Endpoints

### 1. Edit Payment Amount

**Endpoint:** `PUT /api/bookings/:id/edit-payment`

**Purpose:** Modify payment amount (increase or decrease)

**Request:**
```json
{
  "newAmountPaid": 3000,
  "paymentMethod": "cash"
}
```

**Features:**
- ✅ Validates new amount ≤ final amount
- ✅ Auto-updates payment status
- ✅ Creates ledger transaction for difference
- ✅ Shows comparison (previous vs new)

**Example:**
```bash
curl -X PUT https://event-rental-backend-943e.onrender.com/api/bookings/675d012.../edit-payment \
  -H "Content-Type: application/json" \
  -d '{
    "newAmountPaid": 3500,
    "paymentMethod": "upi"
  }'
```

---

### 2. Add/Update Discount

**Endpoint:** `PUT /api/bookings/:id/discount`

**Purpose:** Add or modify discount for a booking

**Request:**
```json
{
  "discount": 500,
  "discountReason": "Festival offer - 10% off"
}
```

**Features:**
- ✅ Validates discount ≤ total amount
- ✅ Recalculates final amount
- ✅ Updates pending amount
- ✅ Auto-adjusts payment status
- ✅ Set discount=0 to remove

**Example:**
```bash
curl -X PUT https://event-rental-backend-943e.onrender.com/api/bookings/675d012.../discount \
  -H "Content-Type: application/json" \
  -d '{
    "discount": 200,
    "discountReason": "Loyal customer discount"
  }'
```

---

## 📊 Booking Model Updates

### New Fields

```javascript
{
  // Existing fields...
  "totalAmount": 5000,        // Original amount
  
  // NEW FIELDS
  "discount": 200,            // Discount in ₹
  "discountReason": "10% off", // Why discount given
  "finalAmount": 4800,        // After discount
  "aadharNumber": "123456789012", // 12-digit Aadhar
  
  "amountPaid": 2000,
  "amountPending": 2800       // Based on finalAmount
}
```

### Calculation Logic

```
finalAmount = totalAmount - discount
amountPending = finalAmount - amountPaid

Payment Status:
- amountPaid = 0            → pending
- 0 < amountPaid < finalAmount → partial
- amountPaid >= finalAmount    → full
```

---

## 👤 Customer Model Updates

### New Fields

```javascript
{
  "name": "John Doe",
  "phoneNumber": "9876543210",
  "email": "john@example.com",
  "address": "123 Street",
  
  // NEW FIELD
  "aadharNumber": "123456789012"  // Optional, 12 digits
}
```

### Validation

- **Format**: Exactly 12 digits
- **Optional**: Can be empty
- **Example**: `"123456789012"`

---

## 📱 Flutter Integration Examples

### 1. Create Booking with Discount & Aadhar

```dart
Future<Booking> createBookingWithDiscount({
  required String customerName,
  required String customerPhone,
  required DateTime bookingDate,
  required DateTime returnDate,
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
      'bookingDate': bookingDate.toIso8601String(),
      'returnDate': returnDate.toIso8601String(),
      'items': items.map((item) => {
        'productId': item.productId,
        'quantity': item.quantity,
      }).toList(),
      'discount': discount,
      'discountReason': discountReason,
      'aadharNumber': aadharNumber,
    }),
  );

  if (response.statusCode == 201) {
    final data = jsonDecode(response.body);
    return Booking.fromJson(data['data']);
  }
  throw Exception('Failed to create booking');
}
```

### 2. Edit Payment

```dart
Future<void> editPaymentAmount(String bookingId, double newAmount) async {
  try {
    final response = await http.put(
      Uri.parse('$baseUrl/bookings/$bookingId/edit-payment'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'newAmountPaid': newAmount,
        'paymentMethod': 'cash',
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final difference = data['data']['difference'];
      
      if (difference > 0) {
        print('Payment increased by ₹$difference');
      } else if (difference < 0) {
        print('Payment decreased by ₹${difference.abs()}');
      } else {
        print('No change in payment amount');
      }
    }
  } catch (e) {
    print('Error editing payment: $e');
  }
}
```

### 3. Apply Discount

```dart
Future<void> applyDiscount({
  required String bookingId,
  required double discount,
  required String reason,
}) async {
  final response = await http.put(
    Uri.parse('$baseUrl/bookings/$bookingId/discount'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'discount': discount,
      'discountReason': reason,
    }),
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    final summary = data['data']['summary'];
    
    print('Discount Applied!');
    print('Total: ₹${summary['totalAmount']}');
    print('Discount: -₹${summary['newDiscount']}');
    print('Final: ₹${summary['newFinalAmount']}');
    print('Paid: ₹${summary['amountPaid']}');
    print('Pending: ₹${summary['amountPending']}');
  }
}
```

### 4. Update Customer with Aadhar

```dart
Future<void> updateCustomerAadhar(String customerId, String aadharNumber) async {
  // Validate Aadhar format
  if (aadharNumber.length != 12 || !RegExp(r'^\d{12}$').hasMatch(aadharNumber)) {
    throw Exception('Aadhar number must be exactly 12 digits');
  }

  final response = await http.put(
    Uri.parse('$baseUrl/customers/$customerId'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'aadharNumber': aadharNumber,
    }),
  );

  if (response.statusCode == 200) {
    print('Aadhar number updated successfully');
  }
}
```

---

## 🎯 Use Cases

### Use Case 1: Apply Loyalty Discount
**Scenario:** Regular customer deserves 10% discount

```
1. Customer creates booking: ₹5000
2. Admin applies discount:
   PUT /bookings/:id/discount
   {
     "discount": 500,
     "discountReason": "Loyal customer - 10% off"
   }
3. Final amount: ₹4500
4. Payment pending: ₹4500
```

### Use Case 2: Correct Payment Entry
**Scenario:** Entered ₹2000, should be ₹2500

```
1. Current payment: ₹2000
2. Edit payment:
   PUT /bookings/:id/edit-payment
   {
     "newAmountPaid": 2500,
     "paymentMethod": "cash"
   }
3. Ledger transaction created: +₹500
4. New pending: ₹2000 (if finalAmount = ₹4500)
```

### Use Case 3: Add Aadhar During Booking
**Scenario:** Customer provides Aadhar at time of booking

```
POST /bookings
{
  "customerName": "Rahul Kumar",
  "customerPhone": "9876543210",
  "bookingDate": "2025-12-20",
  "returnDate": "2025-12-25",
  "aadharNumber": "123456789012",
  "items": [...]
}
```

### Use Case 4: Remove Discount
**Scenario:** Need to remove previously applied discount

```
PUT /bookings/:id/discount
{
  "discount": 0,
  "discountReason": "Discount removed"
}
```

---

## ⚠️ Validation Rules

### Payment Editing
- ✅ `newAmountPaid >= 0`
- ✅ `newAmountPaid <= finalAmount`
- ❌ Cannot exceed final amount

### Discount
- ✅ `discount >= 0`
- ✅ `discount <= totalAmount`
- ❌ Cannot exceed total amount

### Aadhar Number
- ✅ Exactly 12 digits
- ✅ Optional (can be empty)
- ❌ No letters or special characters
- ✅ Regex: `/^\d{12}$/`

---

## 🔄 Ledger Integration

### Payment Edit Creates Transaction
When payment is edited, a ledger transaction is automatically created:

```javascript
// If payment increased by ₹500
{
  "transactionType": "payment",
  "amount": 500,
  "notes": "Payment edited: increased by ₹500"
}

// If payment decreased by ₹300
{
  "transactionType": "booking",
  "amount": 300,
  "notes": "Payment edited: decreased by ₹300"
}
```

### Discount Doesn't Create Transaction
Discounts modify the booking but don't create separate ledger entries. The initial booking transaction uses `finalAmount` (after discount).

---

## 📊 Response Examples

### Edit Payment Response
```json
{
  "success": true,
  "message": "Payment edited successfully",
  "data": {
    "booking": {
      "_id": "675d012...",
      "totalAmount": 5000,
      "discount": 200,
      "finalAmount": 4800,
      "amountPaid": 3000,
      "amountPending": 1800,
      "paymentStatus": "partial"
    },
    "previousAmount": 2000,
    "newAmount": 3000,
    "difference": 1000
  }
}
```

### Add Discount Response
```json
{
  "success": true,
  "message": "Discount updated successfully",
  "data": {
    "booking": {...},
    "summary": {
      "totalAmount": 5000,
      "previousDiscount": 0,
      "newDiscount": 500,
      "previousFinalAmount": 5000,
      "newFinalAmount": 4500,
      "amountPaid": 2000,
      "amountPending": 2500
    }
  }
}
```

---

## 🚀 Deployment

All new features are deployed to:
```
https://event-rental-backend-943e.onrender.com/api
```

### Test Endpoints
```bash
# Health check
curl https://event-rental-backend-943e.onrender.com/health

# Edit payment
curl -X PUT https://event-rental-backend-943e.onrender.com/api/bookings/BOOKING_ID/edit-payment \
  -H "Content-Type: application/json" \
  -d '{"newAmountPaid": 3000, "paymentMethod": "cash"}'

# Add discount
curl -X PUT https://event-rental-backend-943e.onrender.com/api/bookings/BOOKING_ID/discount \
  -H "Content-Type: application/json" \
  -d '{"discount": 500, "discountReason": "Festival offer"}'
```

---

## 📚 Summary

### ✅ What Was Added
1. **Payment Editing** - Modify payment amounts with validation
2. **Discount Management** - Add/update/remove discounts
3. **Aadhar Integration** - Store 12-digit Aadhar numbers
4. **Ledger Integration** - Payment edits create transactions
5. **Auto-calculation** - Final amount, pending amount, payment status

### ❌ What Was Skipped
- **Image Upload** - Avoided due to free tier storage limits (512MB)

### 🎯 Benefits
- ✅ Flexible payment management
- ✅ Discount tracking with reasons
- ✅ ID verification via Aadhar
- ✅ Storage-efficient (text only)
- ✅ Full ledger integration

---

**Last Updated:** December 19, 2025

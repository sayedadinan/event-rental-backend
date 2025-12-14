# 📦 Partial Return Guide - Event Rental Shop

## 🎯 How Partial Returns Work

### Scenario Example:

**Original Booking:**
- **Customer:** John Doe
- **Items:** 
  - Chair: 2 qty @ ₹50/day
  - Grinder: 1 qty @ ₹200/day
- **Duration:** 5 days
- **Total Amount:** ₹3100 (Chair: ₹500, Grinder: ₹1000)

---

## 📊 Booking Response Structure

### All booking list endpoints now include `itemsSummary`:

```json
{
  "success": true,
  "data": [
    {
      "_id": "booking123",
      "customerName": "John Doe",
      "customerPhone": "9876543210",
      "items": [
        {
          "productName": "Chair",
          "quantity": 2,
          "returnedQuantity": 0,
          "pendingQuantity": 2,
          "perDayRent": 50,
          "itemTotal": 500
        },
        {
          "productName": "Grinder",
          "quantity": 1,
          "returnedQuantity": 0,
          "pendingQuantity": 1,
          "perDayRent": 200,
          "itemTotal": 1000
        }
      ],
      "totalAmount": 3100,
      "amountPaid": 0,
      "amountPending": 3100,
      "paymentStatus": "pending",
      "status": "active",
      "itemsSummary": {
        "totalItems": 2,
        "fullyReturnedItems": 0,
        "partiallyReturnedItems": 0,
        "pendingItems": 2,
        "remainingItems": [
          {
            "productName": "Chair",
            "totalQuantity": 2,
            "returnedQuantity": 0,
            "pendingQuantity": 2
          },
          {
            "productName": "Grinder",
            "totalQuantity": 1,
            "returnedQuantity": 0,
            "pendingQuantity": 1
          }
        ]
      }
    }
  ]
}
```

---

## 🔄 Partial Return API

### Endpoint:
```
POST /api/returns/:bookingId/partial
```

### Example 1: Customer returns Grinder only + pays ₹1000

**Request:**
```json
{
  "returnedItems": [
    {
      "productId": "675a1234...",
      "quantity": 1,
      "returned": true
    }
  ],
  "amountReceived": 1000,
  "notes": "Customer returned grinder, chair still pending"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Partial return processed",
  "data": {
    "booking": {
      "_id": "booking123",
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
      ],
      "status": "active",
      "totalAmount": 3100,
      "amountPaid": 1000,
      "amountPending": 2100,
      "paymentStatus": "partial"
    },
    "processedItems": [
      {
        "productId": "675a1234...",
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

---

### Example 2: Customer returns 1 Chair (partial quantity)

**Request:**
```json
{
  "returnedItems": [
    {
      "productId": "675a5678...",
      "quantity": 1,
      "returned": true
    }
  ],
  "amountReceived": 500,
  "notes": "Returned 1 chair out of 2"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Partial return processed",
  "data": {
    "booking": {
      "items": [
        {
          "productName": "Chair",
          "quantity": 2,
          "returnedQuantity": 1,
          "pendingQuantity": 1
        },
        {
          "productName": "Grinder",
          "quantity": 1,
          "returnedQuantity": 1,
          "pendingQuantity": 0
        }
      ],
      "amountPaid": 1500,
      "amountPending": 1600,
      "paymentStatus": "partial"
    },
    "remainingItems": [
      {
        "productName": "Chair",
        "totalQuantity": 2,
        "returnedQuantity": 1,
        "pendingQuantity": 1
      }
    ],
    "allItemsReturned": false
  }
}
```

---

### Example 3: Customer returns remaining Chair (full return)

**Request:**
```json
{
  "returnedItems": [
    {
      "productId": "675a5678...",
      "quantity": 1,
      "returned": true
    }
  ],
  "amountReceived": 1600,
  "notes": "Final chair returned, all items back"
}
```

**Response:**
```json
{
  "success": true,
  "message": "All items returned",
  "data": {
    "booking": {
      "status": "returned",
      "actualReturnDate": "2025-12-14T11:30:00.000Z",
      "items": [
        {
          "productName": "Chair",
          "quantity": 2,
          "returnedQuantity": 2,
          "pendingQuantity": 0
        },
        {
          "productName": "Grinder",
          "quantity": 1,
          "returnedQuantity": 1,
          "pendingQuantity": 0
        }
      ],
      "amountPaid": 3100,
      "amountPending": 0,
      "paymentStatus": "full"
    },
    "remainingItems": [],
    "allItemsReturned": true,
    "paymentSummary": {
      "totalAmount": 3100,
      "amountPaid": 3100,
      "amountPending": 0,
      "paymentStatus": "full"
    }
  }
}
```

---

## 📱 Flutter Integration

### Display Remaining Items in Booking List

```dart
class BookingListItem extends StatelessWidget {
  final Map<String, dynamic> booking;

  @override
  Widget build(BuildContext context) {
    final itemsSummary = booking['itemsSummary'];
    final remainingItems = itemsSummary['remainingItems'] as List;

    return Card(
      child: ListTile(
        title: Text(booking['customerName']),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Total: ₹${booking['totalAmount']}'),
            Text('Paid: ₹${booking['amountPaid']} | Pending: ₹${booking['amountPending']}'),
            
            // Show items summary
            if (itemsSummary['fullyReturnedItems'] > 0)
              Text('✅ ${itemsSummary['fullyReturnedItems']} items returned'),
            if (itemsSummary['pendingItems'] > 0)
              Text('⏳ ${itemsSummary['pendingItems']} items pending'),
            
            // Show remaining items details
            if (remainingItems.isNotEmpty) ...[
              SizedBox(height: 8),
              Text('Remaining Items:', style: TextStyle(fontWeight: FontWeight.bold)),
              ...remainingItems.map((item) => Padding(
                padding: EdgeInsets.only(left: 16),
                child: Text(
                  '• ${item['productName']}: ${item['pendingQuantity']}/${item['totalQuantity']} pending',
                  style: TextStyle(color: Colors.orange),
                ),
              )),
            ],
          ],
        ),
      ),
    );
  }
}
```

### Partial Return Screen

```dart
Future<void> processPartialReturn() async {
  final response = await http.post(
    Uri.parse('$baseUrl/api/returns/$bookingId/partial'),
    headers: {'Content-Type': 'application/json'},
    body: json.encode({
      'returnedItems': [
        {
          'productId': selectedProductId,
          'quantity': returnQuantity,
          'returned': true
        }
      ],
      'amountReceived': amountPaid,
      'notes': notesController.text
    }),
  );

  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    final remainingItems = data['data']['remainingItems'] as List;
    
    if (remainingItems.isEmpty) {
      // All items returned
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          title: Text('✅ Booking Complete'),
          content: Text('All items have been returned!'),
        ),
      );
    } else {
      // Show remaining items
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          title: Text('⏳ Partial Return Processed'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Remaining items to return:'),
              ...remainingItems.map((item) => Text(
                '• ${item['productName']}: ${item['pendingQuantity']} qty'
              )),
            ],
          ),
        ),
      );
    }
  }
}
```

---

## 🎯 Key Features

### ✅ Item-Level Tracking
- Each item tracks `returnedQuantity` and `pendingQuantity`
- Supports partial quantity returns (e.g., return 1 chair out of 2)

### 💰 Payment Tracking
- `amountPaid`: Total amount received so far
- `amountPending`: Remaining amount to be paid
- `paymentStatus`: pending | partial | full

### 📊 Smart Summary
All booking endpoints include:
- `totalItems`: Total number of product types
- `fullyReturnedItems`: Count of completely returned products
- `partiallyReturnedItems`: Count of partially returned products
- `pendingItems`: Count of not-yet-returned products
- `remainingItems`: Array of items still pending return

### 🔄 Auto-Complete
- Booking automatically changes to `returned` status when all items are back
- `actualReturnDate` is set when booking completes

---

## 🚀 Live Endpoints

**Base URL:** `https://event-rental-backend-943e.onrender.com/api`

- `GET /bookings` - All bookings with items summary
- `GET /bookings/active` - Active bookings with remaining items
- `GET /bookings/pending-returns` - Bookings with pending items
- `GET /bookings/:id` - Single booking with detailed tracking
- `POST /returns/:bookingId/partial` - Process partial return

---

## 📝 Notes

1. **Multiple Partial Returns**: You can call the partial return endpoint multiple times for the same booking
2. **Automatic Stock Update**: Product inventory is restocked automatically on each return
3. **Payment Flexibility**: Accept payments in multiple installments
4. **Clear History**: Returned bookings maintain full history of what was returned when

---

**Your partial return system is now production-ready! 🎉**

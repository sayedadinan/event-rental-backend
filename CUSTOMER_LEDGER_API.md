# 💰 Customer Ledger API Documentation

## Overview
The Customer Ledger system automatically tracks all financial transactions between customers and your business. Every booking, payment, and return creates a transaction record, maintaining a complete financial history.

---

## 📊 How It Works

### Automatic Transaction Creation

**1. When Booking is Created:**
```
Transaction Type: 'booking'
Amount: Total booking amount
Effect: Increases customer balance (what they owe)
```

**2. When Payment is Received:**
```
Transaction Type: 'payment'
Amount: Payment received
Effect: Decreases customer balance (reduces what they owe)
```

**3. When Items are Returned with Payment:**
```
Transaction Type: 'return'
Amount: Payment received during return
Effect: Decreases customer balance
```

---

## 🔌 API Endpoints

### 1. Get Customer Ledger
**Endpoint:** `GET /api/customers/:customerId/ledger`

**Description:** Returns complete transaction history and balance summary for a customer

**Example Request:**
```bash
GET https://event-rental-backend-943e.onrender.com/api/customers/675a123.../ledger
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customerId": "675a123...",
    "customerName": "John Doe",
    "customerPhone": "9876543210",
    "totalBookings": 5000.00,
    "totalPaid": 3500.00,
    "totalPending": 1500.00,
    "transactions": [
      {
        "_id": "675b456...",
        "customerId": "675a123...",
        "customerName": "John Doe",
        "bookingId": "675c789...",
        "transactionType": "booking",
        "amount": 2000.00,
        "balanceBefore": 0.00,
        "balanceAfter": 2000.00,
        "paymentMethod": null,
        "notes": "New booking created - 3 items",
        "createdAt": "2025-12-10T10:00:00.000Z"
      },
      {
        "_id": "675b457...",
        "customerId": "675a123...",
        "customerName": "John Doe",
        "bookingId": "675c789...",
        "transactionType": "payment",
        "amount": 1000.00,
        "balanceBefore": 2000.00,
        "balanceAfter": 1000.00,
        "paymentMethod": "cash",
        "notes": "Payment received",
        "createdAt": "2025-12-11T14:30:00.000Z"
      },
      {
        "_id": "675b458...",
        "customerId": "675a123...",
        "customerName": "John Doe",
        "bookingId": "675c789...",
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

**Balance Calculation:**
- `totalBookings`: Sum of all 'booking' transactions
- `totalPaid`: Sum of all 'payment' and 'return' transactions
- `totalPending`: totalBookings - totalPaid

---

### 2. Record Customer Payment
**Endpoint:** `POST /api/customers/:customerId/payment`

**Description:** Records a payment from customer and updates their balance. Can be linked to a specific booking or general payment.

**Request Body:**
```json
{
  "amount": 500.00,
  "paymentMethod": "cash",
  "bookingId": "675c789...",
  "notes": "Received payment for booking #123"
}
```

**Payment Methods:**
- `cash`
- `upi`
- `card`
- `bank_transfer`

**Fields:**
- `amount` (required): Payment amount
- `paymentMethod` (required): How payment was received
- `bookingId` (optional): Link payment to specific booking
- `notes` (optional): Additional notes about payment

**Response:**
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "_id": "675b459...",
    "customerId": "675a123...",
    "customerName": "John Doe",
    "bookingId": "675c789...",
    "transactionType": "payment",
    "amount": 500.00,
    "balanceBefore": 1500.00,
    "balanceAfter": 1000.00,
    "paymentMethod": "cash",
    "notes": "Received payment for booking #123",
    "createdAt": "2025-12-14T10:30:00.000Z"
  }
}
```

**What Happens:**
1. Creates a transaction record
2. Updates customer balance
3. If `bookingId` provided, updates booking payment status
4. Booking `paymentStatus` auto-updates to 'partial' or 'full'

---

## 📱 Flutter Integration Examples

### Display Customer Ledger

```dart
class CustomerLedgerScreen extends StatefulWidget {
  final String customerId;
  
  @override
  _CustomerLedgerScreenState createState() => _CustomerLedgerScreenState();
}

class _CustomerLedgerScreenState extends State<CustomerLedgerScreen> {
  Map<String, dynamic>? ledgerData;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchCustomerLedger();
  }

  Future<void> fetchCustomerLedger() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/customers/${widget.customerId}/ledger'),
      );

      if (response.statusCode == 200) {
        setState(() {
          ledgerData = json.decode(response.body)['data'];
          isLoading = false;
        });
      }
    } catch (e) {
      print('Error fetching ledger: $e');
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) return CircularProgressIndicator();
    if (ledgerData == null) return Text('No data');

    return Column(
      children: [
        // Balance Summary
        Card(
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              children: [
                Text('${ledgerData!['customerName']}',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    Column(
                      children: [
                        Text('Total Bookings'),
                        Text('₹${ledgerData!['totalBookings']}',
                            style: TextStyle(fontSize: 18, color: Colors.red)),
                      ],
                    ),
                    Column(
                      children: [
                        Text('Total Paid'),
                        Text('₹${ledgerData!['totalPaid']}',
                            style: TextStyle(fontSize: 18, color: Colors.green)),
                      ],
                    ),
                    Column(
                      children: [
                        Text('Pending'),
                        Text('₹${ledgerData!['totalPending']}',
                            style: TextStyle(fontSize: 18, color: Colors.orange)),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),

        // Transaction List
        Expanded(
          child: ListView.builder(
            itemCount: ledgerData!['transactions'].length,
            itemBuilder: (context, index) {
              final transaction = ledgerData!['transactions'][index];
              return TransactionTile(transaction: transaction);
            },
          ),
        ),
      ],
    );
  }
}

class TransactionTile extends StatelessWidget {
  final Map<String, dynamic> transaction;

  const TransactionTile({required this.transaction});

  @override
  Widget build(BuildContext context) {
    final type = transaction['transactionType'];
    final isDebit = type == 'booking';
    
    IconData icon;
    Color color;
    String title;

    switch (type) {
      case 'booking':
        icon = Icons.shopping_cart;
        color = Colors.red;
        title = 'New Booking';
        break;
      case 'payment':
        icon = Icons.payment;
        color = Colors.green;
        title = 'Payment Received';
        break;
      case 'return':
        icon = Icons.assignment_return;
        color = Colors.blue;
        title = 'Return Payment';
        break;
      default:
        icon = Icons.monetization_on;
        color = Colors.grey;
        title = 'Transaction';
    }

    return Card(
      margin: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color,
          child: Icon(icon, color: Colors.white),
        ),
        title: Text(title),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(transaction['notes'] ?? ''),
            Text(
              DateFormat('MMM dd, yyyy - hh:mm a').format(
                DateTime.parse(transaction['createdAt'])
              ),
              style: TextStyle(fontSize: 12),
            ),
          ],
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              '${isDebit ? '+' : '-'}₹${transaction['amount']}',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: isDebit ? Colors.red : Colors.green,
              ),
            ),
            Text(
              'Bal: ₹${transaction['balanceAfter']}',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
}
```

### Record Payment

```dart
class RecordPaymentDialog extends StatefulWidget {
  final String customerId;
  final String? bookingId;

  @override
  _RecordPaymentDialogState createState() => _RecordPaymentDialogState();
}

class _RecordPaymentDialogState extends State<RecordPaymentDialog> {
  final amountController = TextEditingController();
  final notesController = TextEditingController();
  String paymentMethod = 'cash';
  bool isLoading = false;

  Future<void> recordPayment() async {
    if (amountController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please enter amount')),
      );
      return;
    }

    setState(() => isLoading = true);

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/customers/${widget.customerId}/payment'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'amount': double.parse(amountController.text),
          'paymentMethod': paymentMethod,
          'bookingId': widget.bookingId,
          'notes': notesController.text,
        }),
      );

      if (response.statusCode == 200) {
        Navigator.pop(context, true); // Return true to indicate success
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Payment recorded successfully')),
        );
      } else {
        throw Exception('Failed to record payment');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Record Payment'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            controller: amountController,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              labelText: 'Amount',
              prefixText: '₹',
            ),
          ),
          SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: paymentMethod,
            decoration: InputDecoration(labelText: 'Payment Method'),
            items: [
              DropdownMenuItem(value: 'cash', child: Text('Cash')),
              DropdownMenuItem(value: 'upi', child: Text('UPI')),
              DropdownMenuItem(value: 'card', child: Text('Card')),
              DropdownMenuItem(value: 'bank_transfer', child: Text('Bank Transfer')),
            ],
            onChanged: (value) {
              setState(() => paymentMethod = value!);
            },
          ),
          SizedBox(height: 16),
          TextField(
            controller: notesController,
            decoration: InputDecoration(labelText: 'Notes (optional)'),
            maxLines: 2,
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: isLoading ? null : recordPayment,
          child: isLoading
              ? SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : Text('Record Payment'),
        ),
      ],
    );
  }
}
```

---

## 🎯 Use Cases

### 1. Customer Balance Overview
Show customer their total bookings vs payments at a glance

### 2. Payment History
Complete audit trail of all transactions

### 3. Flexible Payment Collection
- Record payments anytime
- Link to specific bookings or general account
- Support multiple payment methods

### 4. Business Analytics
- Track customer payment patterns
- Identify customers with pending balances
- Generate financial reports

---

## 🔄 Automatic Integration

The ledger system works automatically:

1. **Create Booking** → Transaction created automatically
2. **Update Payment** → Transaction created for payment difference
3. **Partial Return** → Transaction created if payment received
4. **Manual Payment** → Use POST /payment endpoint

---

## 📝 Transaction Types Explained

### `booking`
- Created when new booking is made
- Increases customer balance (what they owe)
- Links to specific booking

### `payment`
- Created when payment is received
- Decreases customer balance
- Can link to specific booking or be general payment

### `return`
- Created during partial/full return if payment received
- Decreases customer balance
- Links to booking being returned

---

## ✅ Testing Checklist

- [ ] GET /api/customers/:id/ledger returns transaction history
- [ ] POST /api/customers/:id/payment creates transaction
- [ ] Creating booking creates transaction automatically
- [ ] Updating payment creates transaction
- [ ] Partial return with payment creates transaction
- [ ] Balance calculations are correct
- [ ] Booking payment status updates when payment received

---

## 🚀 Live Endpoints

**Base URL:** `https://event-rental-backend-943e.onrender.com`

- `GET /api/customers/:customerId/ledger`
- `POST /api/customers/:customerId/payment`

---

**Your customer ledger system is now fully operational! 💰**

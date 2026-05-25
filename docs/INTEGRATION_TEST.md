# Hall Booking Integration Test

## Testing the Backend Integration

### 1. Start the Backend Server
```bash
cd backend
go run main.go
```

The server should start on `http://localhost:8080`

### 2. Test the API Endpoint

#### Test with curl:
```bash
curl -X POST $NEXT_PUBLIC_API_URL/api/v1/hall-bookings \
  -H "Content-Type: application/json" \
  -d '{
    "organizer_name": "John Doe",
    "organizer_email": "john.doe@example.com",
    "organizer_phone": "+447123456789",
    "event_type": "party",
    "guest_count": 50,
    "special_requests": "Extra tables and decorations needed",
    "booking_date": "2024-02-15",
    "start_time": "18:00",
    "end_time": "22:00",
    "total_price": 150.00,
    "deposit_required": 100.00,
    "payment_method": "cash"
  }'
```

#### Expected Response:
```json
{
  "message": "Hall booking created successfully",
  "data": {
    "id": 123,
    "booking_id": "HB-20240215-001",
    "organizer_name": "John Doe",
    "organizer_email": "john.doe@example.com",
    "organizer_phone": "+447123456789",
    "event_type": "party",
    "guest_count": 50,
    "special_requests": "Extra tables and decorations needed",
    "booking_date": "2024-02-15",
    "start_time": "18:00",
    "end_time": "22:00",
    "total_price": 150.00,
    "deposit_required": 100.00,
    "payment_method": "cash",
    "status": "pending",
    "created_at": "2024-01-29T18:39:00Z",
    "updated_at": "2024-01-29T18:39:00Z",
    "payments": [
      {
        "id": 456,
        "payment_type": "deposit",
        "payment_method": "cash",
        "amount": 100.00,
        "status": "pending",
        "due_date": "2024-02-08T00:00:00Z",
        "created_at": "2024-01-29T18:39:00Z"
      },
      {
        "id": 457,
        "payment_type": "balance",
        "payment_method": "cash",
        "amount": 50.00,
        "status": "pending",
        "due_date": "2024-02-15T00:00:00Z",
        "created_at": "2024-01-29T18:39:00Z"
      }
    ],
    "invoice": {
      "id": 789,
      "invoice_number": "INV-456789",
      "invoice_date": "2024-01-29T00:00:00Z",
      "due_date": "2024-02-08T00:00:00Z",
      "total_amount": 150.00,
      "status": "sent"
    }
  }
}
```

### 3. Frontend Integration Test

#### Open the Hall Booking Modal:
1. Navigate to your frontend application
2. Click on a date in the hall calendar
3. Fill in all the required fields:
   - Organizer Name: "John Doe"
   - Email: "john.doe@example.com"
   - Phone: "+447123456789"
   - Event Type: "Party"
   - Guest Count: 50
   - Special Requests: "Extra tables and decorations needed"
   - Payment Method: "Pay Cash (On-site)"
4. Agree to terms and conditions
5. Click "Pay Cash"

#### Expected Behavior:
1. The form data is sent to `${process.env.NEXT_PUBLIC_API_URL}/api/v1/hall-bookings`
2. The backend creates the booking and returns the response
3. The InvoiceModal opens showing:
   - Booking ID: "HB-20240215-001"
   - Payment schedule with deposit and balance
   - Invoice details
   - Status: "pending"

### 4. Check Browser Console

Open browser dev tools and check the console for:
- Successful booking creation log
- Any error messages if the request fails
- Network tab to see the actual HTTP request

### 5. Verify Database Records

If you have database access, check that:
- Hall booking record was created
- Payment records were generated (deposit + balance)
- Invoice record was created

### 6. Test Different Payment Methods

#### Test "Pay On-site (Card)":
```json
{
  "payment_method": "onsite"
}
```

#### Test "Pay Online (Bank Transfer)":
```json
{
  "payment_method": "online"
}
```

### 7. Test Error Handling

#### Test Validation Errors:
```bash
curl -X POST $NEXT_PUBLIC_API_URL/api/v1/hall-bookings \
  -H "Content-Type: application/json" \
  -d '{
    "organizer_name": "",
    "organizer_email": "invalid-email",
    "guest_count": 0,
    "booking_date": "2024-01-01",
    "payment_method": "invalid"
  }'
```

Expected Response (400):
```json
{
  "message": "Failed to create hall booking",
  "errors": "validation error details..."
}
```

#### Test Slot Unavailability:
Try to book the same time slot twice to get a 409 conflict.

### 8. Integration Checklist

- [ ] Backend server starts successfully
- [ ] API endpoint responds correctly
- [ ] Frontend sends correct JSON payload
- [ ] InvoiceModal displays backend data correctly
- [ ] Payment schedule is generated for cash payments
- [ ] Error handling works as expected
- [ ] Booking ID is displayed in invoice
- [ ] Status badges show correct colors

### 9. Common Issues & Solutions

#### CORS Issues:
If you get CORS errors, make sure the backend has CORS middleware configured.

#### Connection Refused:
Ensure the backend is running on port 8080 and the frontend is pointing to the correct URL.

#### Validation Errors:
Check that all required fields are included and properly formatted.

#### Time Slot Conflicts:
The backend should prevent double bookings. Test this by trying to book the same slot twice.

### 10. Success Indicators

The integration is successful when:
1. Frontend form submission creates a booking in the database
2. InvoiceModal shows real booking data with booking ID
3. Payment schedule is displayed correctly
4. No console errors
5. Network requests show 201 Created status

This completes the Hall Booking backend integration with cash payment processing!

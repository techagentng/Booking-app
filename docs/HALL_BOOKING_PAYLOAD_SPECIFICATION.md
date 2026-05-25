# Hall Booking API Payload Specification
## Frontend to Backend Communication

## Current Frontend Payload Structure

### FormData Payload (Currently Sent)
The frontend currently sends `FormData` with the following fields:

```javascript
const formData = new FormData();
formData.append('organizer_name', organizerName);
formData.append('organizer_email', organizerEmail);
formData.append('organizer_phone', organizerPhone);
formData.append('event_type', eventType);
formData.append('guest_count', guestCount.toString());
formData.append('special_requests', specialRequests);
formData.append('booking_date', format(selectedDate, 'yyyy-MM-dd'));
formData.append('start_time', startTime);
formData.append('end_time', endTime);
formData.append('total_price', pricing.totalPrice.toString());
formData.append('deposit_required', pricing.deposit.toString());
formData.append('payment_method', paymentMethod);
```

### Raw JSON Payload (Recommended)
For better API design, we should convert this to JSON payload:

```json
{
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
}
```

## Backend Request Structure

### Go Struct for JSON Binding
```go
type CreateHallBookingRequest struct {
    OrganizerName   string  `json:"organizer_name" binding:"required,min=2,max=100"`
    OrganizerEmail  string  `json:"organizer_email" binding:"required,email,max=100"`
    OrganizerPhone  string  `json:"organizer_phone" binding:"required,min=10,max=20"`
    EventType       string  `json:"event_type" binding:"required,oneof=party wedding meeting christening funeral corporate fete other"`
    GuestCount      int     `json:"guest_count" binding:"required,min=1,max=100"`
    SpecialRequests string  `json:"special_requests" binding:"max=500"`
    BookingDate     string  `json:"booking_date" binding:"required,datetime=2006-01-02"`
    StartTime       string  `json:"start_time" binding:"required,oneof=08:00 09:00 10:00 11:00 12:00 13:00 14:00 15:00 16:00 17:00 18:00 19:00 20:00 21:00 22:00 23:00"`
    EndTime         string  `json:"end_time" binding:"required,oneof=08:00 09:00 10:00 11:00 12:00 13:00 14:00 15:00 16:00 17:00 18:00 19:00 20:00 21:00 22:00 23:00"`
    TotalPrice      float64 `json:"total_price" binding:"required,min=0"`
    DepositRequired float64 `json:"deposit_required" binding:"required,min=0"`
    PaymentMethod   string  `json:"payment_method" binding:"required,oneof=cash onsite online"`
}
```

## Backend Response Structure

### Success Response
```json
{
  "success": true,
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
      "status": "sent",
      "download_url": "/api/v1/invoices/789/download"
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "organizer_email": "Invalid email format",
      "guest_count": "Guest count must be between 1 and 100",
      "booking_date": "Booking date must be in the future"
    }
  }
}
```

## API Endpoint Specification

### Create Hall Booking
```
POST /api/v1/hall-bookings
Content-Type: application/json
Authorization: Bearer <jwt_token>

Request Body:
{
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
}
```

### Response Codes
- `201 Created`: Booking created successfully
- `400 Bad Request`: Validation errors
- `409 Conflict`: Slot not available
- `500 Internal Server Error`: Server error

## Frontend Integration Updates

### Update HallBookingModal to Send JSON
```typescript
const handleOnsitePayment = async () => {
    setIsSubmitting(true);
    
    const bookingData = {
        organizer_name: organizerName,
        organizer_email: organizerEmail,
        organizer_phone: organizerPhone,
        event_type: eventType,
        guest_count: guestCount,
        special_requests: specialRequests,
        booking_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: startTime,
        end_time: endTime,
        total_price: pricing.totalPrice,
        deposit_required: pricing.deposit,
        payment_method: paymentMethod,
    };
    
    try {
        const response = await fetch('/api/v1/hall-bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // If using auth
            },
            body: JSON.stringify(bookingData),
        });
        
        const result = await response.json();
        
        if (result.success) {
            setShowInvoiceModal(true);
        } else {
            throw new Error(result.error?.message || 'Booking failed');
        }
    } catch (error) {
        console.error('Booking failed:', error);
        alert('Booking failed: ' + error.message);
    } finally {
        setIsSubmitting(false);
    }
};
```

## Data Validation Rules

### Field Validation
```go
// Validation rules for each field
var validationRules = map[string]string{
    "organizer_name":   "required,min=2,max=100,alpha_space",
    "organizer_email":  "required,email,max=100",
    "organizer_phone":  "required,min=10,max=20,phone",
    "event_type":       "required,oneof=party wedding meeting christening funeral corporate fete other",
    "guest_count":      "required,min=1,max=100,numeric",
    "special_requests": "max=500",
    "booking_date":     "required,datetime=2006-01-02,future",
    "start_time":       "required,time_format",
    "end_time":         "required,time_format,after_start_time",
    "total_price":      "required,min=0,numeric",
    "deposit_required": "required,min=0,numeric",
    "payment_method":   "required,oneof=cash onsite online",
}
```

### Business Logic Validation
```go
func (s *hallBookingService) validateBookingRequest(req *CreateHallBookingRequest) error {
    // 1. Date validation
    bookingDate, err := time.Parse("2006-01-02", req.BookingDate)
    if err != nil {
        return errors.New("invalid booking date format")
    }
    
    if bookingDate.Before(time.Now().Truncate(24 * time.Hour)) {
        return errors.New("booking date must be in the future")
    }
    
    // 2. Time validation
    if req.StartTime >= req.EndTime {
        return errors.New("end time must be after start time")
    }
    
    // 3. Guest count validation
    if req.GuestCount > 100 {
        return errors.New("maximum capacity is 100 guests")
    }
    
    // 4. Event type validation
    validEventTypes := []string{"party", "wedding", "meeting", "christening", "funeral", "corporate", "fete", "other"}
    if !contains(validEventTypes, req.EventType) {
        return errors.New("invalid event type")
    }
    
    // 5. Payment method validation
    validPaymentMethods := []string{"cash", "onsite", "online"}
    if !contains(validPaymentMethods, req.PaymentMethod) {
        return errors.New("invalid payment method")
    }
    
    return nil
}
```

## Error Handling

### Validation Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "fields": {
      "organizer_email": ["Invalid email format"],
      "guest_count": ["Guest count must be between 1 and 100"],
      "booking_date": ["Booking date must be in the future"]
    }
  }
}
```

### Business Logic Error Response
```json
{
  "success": false,
  "error": {
    "code": "SLOT_UNAVAILABLE",
    "message": "Selected time slot is not available",
    "details": {
      "requested_date": "2024-02-15",
      "requested_time": "18:00-22:00",
      "available_slots": ["09:00-13:00", "14:00-17:00"]
    }
  }
}
```

## Payment Processing Flow

### Cash Payment Payload
When `payment_method` is "cash", the backend will:
1. Create hall booking record
2. Generate payment schedule (deposit + balance)
3. Create invoice
4. Return complete booking data with payment details

### Payment Schedule Generation
```go
func (s *hallBookingService) generatePaymentSchedule(booking *models.HallBooking) error {
    // Deposit payment (due 7 days before event)
    depositDueDate := booking.BookingDate.AddDate(0, 0, -7)
    deposit := &models.Payment{
        HallBookingID: booking.ID,
        PaymentType:   "deposit",
        PaymentMethod: "cash",
        Amount:        booking.DepositRequired,
        Status:        "pending",
        DueDate:       depositDueDate,
    }
    
    // Balance payment (due on event day)
    balanceDueDate := booking.BookingDate
    balance := &models.Payment{
        HallBookingID: booking.ID,
        PaymentType:   "balance",
        PaymentMethod: "cash",
        Amount:        booking.TotalPrice - booking.DepositRequired,
        Status:        "pending",
        DueDate:       balanceDueDate,
    }
    
    return s.paymentRepo.CreatePayments([]models.Payment{deposit, balance})
}
```

This payload specification ensures clear, structured communication between the frontend and backend with proper validation, error handling, and business logic enforcement.

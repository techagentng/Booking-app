# Hall Booking System Implementation Plan
## Backend Integration for Cash Payment Processing

## Overview
This document outlines the comprehensive plan for implementing the Hall Booking system backend integration, specifically focusing on the "Pay Cash" payment option. The system will seamlessly consume booking data from the frontend and process cash payments with proper tracking and management.

## Current State Analysis

### Existing Backend Structure
- **Technology Stack**: Go, Gin Framework, GORM, PostgreSQL
- **Current Models**: Guest, Reservation, Room, ServiceRequest, etc.
- **Architecture**: RESTful API with `/api/v1/` prefix
- **Database**: PostgreSQL with GORM ORM

### Frontend Booking Data Flow
The HallBookingModal sends the following data:
```json
{
  "organizer_name": "John Doe",
  "organizer_email": "john@example.com", 
  "organizer_phone": "1234567890",
  "event_type": "party",
  "guest_count": 50,
  "special_requests": "Extra tables needed",
  "booking_date": "2024-02-15",
  "start_time": "18:00",
  "end_time": "22:00",
  "total_price": 150.00,
  "deposit_required": 100.00,
  "payment_method": "cash"
}
```

## Implementation Plan

### Phase 1: Database Models Extension

#### 1.1 Add Hall Booking Models
```go
// HallBooking represents a hall booking reservation
type HallBooking struct {
    ID              uint      `gorm:"primaryKey" json:"id"`
    BookingID       string    `gorm:"uniqueIndex" json:"booking_id"`
    OrganizerName   string    `json:"organizer_name"`
    OrganizerEmail  string    `json:"organizer_email"`
    OrganizerPhone  string    `json:"organizer_phone"`
    EventType       string    `json:"event_type"`
    GuestCount      int       `json:"guest_count"`
    SpecialRequests string    `gorm:"type:text" json:"special_requests"`
    BookingDate     time.Time `json:"booking_date"`
    StartTime       string    `json:"start_time"`
    EndTime         string    `json:"end_time"`
    TotalPrice      float64   `json:"total_price"`
    DepositRequired float64   `json:"deposit_required"`
    PaymentMethod   string    `json:"payment_method"` // cash, onsite, online
    Status          string    `json:"status"` // pending, confirmed, cancelled, completed
    CreatedAt       time.Time `json:"created_at"`
    UpdatedAt       time.Time `json:"updated_at"`

    // Relations
    Payments        []Payment `gorm:"foreignKey:HallBookingID" json:"payments,omitempty"`
    Invoice         Invoice   `gorm:"foreignKey:HallBookingID" json:"invoice,omitempty"`
}

// Payment represents a payment record
type Payment struct {
    ID              uint      `gorm:"primaryKey" json:"id"`
    HallBookingID   uint      `json:"hall_booking_id"`
    PaymentType     string    `json:"payment_type"` // deposit, balance, full
    PaymentMethod   string    `json:"payment_method"` // cash, card, bank_transfer
    Amount          float64   `json:"amount"`
    Status          string    `json:"status"` // pending, paid, overdue
    DueDate         time.Time `json:"due_date"`
    PaidDate        *time.Time `json:"paid_date"`
    PaymentNotes    string    `gorm:"type:text" json:"payment_notes"`
    CreatedAt       time.Time `json:"created_at"`
    UpdatedAt       time.Time `json:"updated_at"`

    // Relations
    HallBooking     HallBooking `gorm:"foreignKey:HallBookingID" json:"hall_booking,omitempty"`
}

// Invoice represents an invoice for hall booking
type Invoice struct {
    ID              uint      `gorm:"primaryKey" json:"id"`
    HallBookingID   uint      `gorm:"uniqueIndex" json:"hall_booking_id"`
    InvoiceNumber   string    `gorm:"uniqueIndex" json:"invoice_number"`
    InvoiceDate     time.Time `json:"invoice_date"`
    DueDate         time.Time `json:"due_date"`
    Subtotal        float64   `json:"subtotal"`
    TaxAmount       float64   `json:"tax_amount"`
    TotalAmount     float64   `json:"total_amount"`
    Status          string    `json:"status"` // draft, sent, paid, overdue
    CreatedAt       time.Time `json:"created_at"`
    UpdatedAt       time.Time `json:"updated_at"`

    // Relations
    HallBooking     HallBooking `gorm:"foreignKey:HallBookingID" json:"hall_booking,omitempty"`
}
```

#### 1.2 Update Database Migration
- Add new tables to database migration
- Create indexes for performance
- Set up foreign key constraints

### Phase 2: Repository Layer

#### 2.1 Hall Booking Repository
```go
// HallBookingRepository interface
type HallBookingRepository interface {
    CreateHallBooking(booking *models.HallBooking) error
    GetHallBookingByID(id uint) (*models.HallBooking, error)
    GetHallBookingsByDate(date time.Time) ([]models.HallBooking, error)
    GetHallBookingsByOrganizer(email string) ([]models.HallBooking, error)
    UpdateHallBooking(booking *models.HallBooking) error
    DeleteHallBooking(id uint) error
    CheckAvailability(date time.Time, startTime, endTime string) (bool, error)
}

// Implementation
type hallBookingRepository struct {
    db *gorm.DB
}

func (r *hallBookingRepository) CreateHallBooking(booking *models.HallBooking) error {
    // Generate unique booking ID
    booking.BookingID = generateBookingID()
    
    // Set initial status
    booking.Status = "pending"
    
    return r.db.Create(booking).Error
}
```

#### 2.2 Payment Repository
```go
// PaymentRepository interface
type PaymentRepository interface {
    CreatePayment(payment *models.Payment) error
    GetPaymentsByBookingID(bookingID uint) ([]models.Payment, error)
    UpdatePayment(payment *models.Payment) error
    GetOverduePayments() ([]models.Payment, error)
}

// Implementation for cash payment tracking
func (r *paymentRepository) CreateCashPayment(bookingID uint, paymentType string, amount float64, dueDate time.Time) error {
    payment := &models.Payment{
        HallBookingID: bookingID,
        PaymentType:   paymentType,
        PaymentMethod: "cash",
        Amount:        amount,
        Status:        "pending",
        DueDate:       dueDate,
    }
    
    return r.db.Create(payment).Error
}
```

### Phase 3: Service Layer

#### 3.1 Hall Booking Service
```go
// HallBookingService interface
type HallBookingService interface {
    CreateHallBooking(req *CreateHallBookingRequest) (*models.HallBooking, error)
    ProcessCashPayment(bookingID uint) (*models.HallBooking, error)
    ConfirmBooking(bookingID uint) error
    CancelBooking(bookingID uint, reason string) error
    GetBookingDetails(bookingID uint) (*models.HallBooking, error)
}

// CreateHallBookingRequest structure
type CreateHallBookingRequest struct {
    OrganizerName   string  `json:"organizer_name" binding:"required"`
    OrganizerEmail  string  `json:"organizer_email" binding:"required,email"`
    OrganizerPhone  string  `json:"organizer_phone" binding:"required"`
    EventType       string  `json:"event_type" binding:"required"`
    GuestCount      int     `json:"guest_count" binding:"required,min=1,max=100"`
    SpecialRequests string  `json:"special_requests"`
    BookingDate     string  `json:"booking_date" binding:"required"`
    StartTime       string  `json:"start_time" binding:"required"`
    EndTime         string  `json:"end_time" binding:"required"`
    PaymentMethod   string  `json:"payment_method" binding:"required,oneof=cash onsite online"`
}

// Service implementation
func (s *hallBookingService) CreateHallBooking(req *CreateHallBookingRequest) (*models.HallBooking, error) {
    // 1. Validate booking date and time
    bookingDate, err := time.Parse("2006-01-02", req.BookingDate)
    if err != nil {
        return nil, errors.New("invalid booking date format")
    }
    
    // 2. Check availability
    available, err := s.repo.CheckAvailability(bookingDate, req.StartTime, req.EndTime)
    if err != nil {
        return nil, err
    }
    if !available {
        return nil, errors.New("slot not available")
    }
    
    // 3. Calculate pricing
    pricing := s.calculatePricing(req.EventType, bookingDate, req.StartTime, req.EndTime)
    
    // 4. Create booking
    booking := &models.HallBooking{
        OrganizerName:   req.OrganizerName,
        OrganizerEmail:  req.OrganizerEmail,
        OrganizerPhone:  req.OrganizerPhone,
        EventType:       req.EventType,
        GuestCount:      req.GuestCount,
        SpecialRequests: req.SpecialRequests,
        BookingDate:     bookingDate,
        StartTime:       req.StartTime,
        EndTime:         req.EndTime,
        TotalPrice:      pricing.TotalPrice,
        DepositRequired: pricing.DepositRequired,
        PaymentMethod:   req.PaymentMethod,
        Status:          "pending",
    }
    
    err = s.repo.CreateHallBooking(booking)
    if err != nil {
        return nil, err
    }
    
    // 5. Create payment records for cash payment
    if req.PaymentMethod == "cash" {
        err = s.createCashPaymentSchedule(booking)
        if err != nil {
            return nil, err
        }
    }
    
    // 6. Generate invoice
    err = s.generateInvoice(booking)
    if err != nil {
        return nil, err
    }
    
    return booking, nil
}

func (s *hallBookingService) createCashPaymentSchedule(booking *models.HallBooking) error {
    // Create deposit payment record
    depositDueDate := time.Now().AddDate(0, 0, 7) // 7 days from now
    err := s.paymentRepo.CreatePayment(&models.Payment{
        HallBookingID: booking.ID,
        PaymentType:   "deposit",
        PaymentMethod: "cash",
        Amount:        booking.DepositRequired,
        Status:        "pending",
        DueDate:       depositDueDate,
    })
    if err != nil {
        return err
    }
    
    // Create balance payment record
    balanceDueDate := booking.BookingDate
    err = s.paymentRepo.CreatePayment(&models.Payment{
        HallBookingID: booking.ID,
        PaymentType:   "balance",
        PaymentMethod: "cash",
        Amount:        booking.TotalPrice - booking.DepositRequired,
        Status:        "pending",
        DueDate:       balanceDueDate,
    })
    
    return err
}
```

### Phase 4: Handler Layer

#### 4.1 Hall Booking Handlers
```go
// Hall booking handlers
func (h *HallBookingHandler) CreateHallBooking(c *gin.Context) {
    var req CreateHallBookingRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "success": false,
            "error":   err.Error(),
        })
        return
    }
    
    booking, err := h.service.CreateHallBooking(&req)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "success": false,
            "error":   err.Error(),
        })
        return
    }
    
    c.JSON(http.StatusCreated, gin.H{
        "success": true,
        "message": "Hall booking created successfully",
        "data":    booking,
    })
}

func (h *HallBookingHandler) ProcessCashPayment(c *gin.Context) {
    bookingID := c.Param("id")
    id, err := strconv.ParseUint(bookingID, 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "success": false,
            "error":   "Invalid booking ID",
        })
        return
    }
    
    booking, err := h.service.ProcessCashPayment(uint(id))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "success": false,
            "error":   err.Error(),
        })
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "message": "Cash payment processed successfully",
        "data":    booking,
    })
}
```

### Phase 5: API Routes

#### 5.1 Hall Booking Routes
```go
// Add to routes.go
func SetupHallBookingRoutes(router *gin.Engine, handler *handlers.HallBookingHandler) {
    v1 := router.Group("/api/v1")
    {
        // Hall booking endpoints
        hallBookings := v1.Group("/hall-bookings")
        {
            hallBookings.POST("", handler.CreateHallBooking)
            hallBookings.GET("/:id", handler.GetHallBooking)
            hallBookings.PUT("/:id", handler.UpdateHallBooking)
            hallBookings.DELETE("/:id", handler.DeleteHallBooking)
            hallBookings.GET("/date/:date", handler.GetBookingsByDate)
            hallBookings.GET("/organizer/:email", handler.GetBookingsByOrganizer)
            
            // Payment endpoints
            hallBookings.POST("/:id/payments/cash", handler.ProcessCashPayment)
            hallBookings.GET("/:id/payments", handler.GetBookingPayments)
            hallBookings.PUT("/:id/payments/:paymentId", handler.UpdatePayment)
            
            // Invoice endpoints
            hallBookings.GET("/:id/invoice", handler.GetInvoice)
            hallBookings.POST("/:id/invoice/send", handler.SendInvoice)
        }
        
        // Availability check
        v1.GET("/hall-availability/:date", handler.CheckAvailability)
    }
}
```

### Phase 6: Cash Payment Processing Flow

#### 6.1 Cash Payment Workflow
1. **Booking Creation**: When user selects "Pay Cash", create booking with payment_method="cash"
2. **Payment Schedule**: Auto-generate deposit and balance payment records
3. **Invoice Generation**: Create invoice with payment terms
4. **Status Tracking**: Track payment status (pending, paid, overdue)
5. **Notifications**: Send payment reminders for cash payments

#### 6.2 Payment Status Management
```go
func (s *hallBookingService) UpdateCashPaymentStatus(paymentID uint, status string, notes string) error {
    payment, err := s.paymentRepo.GetPaymentByID(paymentID)
    if err != nil {
        return err
    }
    
    payment.Status = status
    payment.PaymentNotes = notes
    
    if status == "paid" {
        now := time.Now()
        payment.PaidDate = &now
        
        // Check if all payments are completed
        booking, err := s.repo.GetHallBookingByID(payment.HallBookingID)
        if err != nil {
            return err
        }
        
        if s.isAllPaymentsPaid(booking.ID) {
            booking.Status = "confirmed"
            s.repo.UpdateHallBooking(booking)
        }
    }
    
    return s.paymentRepo.UpdatePayment(payment)
}
```

### Phase 7: Integration Points

#### 7.1 Frontend Integration
- **Endpoint**: `POST /api/v1/hall-bookings`
- **Request Format**: JSON as shown above
- **Response Format**: Standard API response with booking details

#### 7.2 Invoice Integration
- **Invoice Generation**: Auto-generate after booking creation
- **Invoice Format**: PDF or HTML template
- **Delivery**: Email or download link

#### 7.3 Payment Tracking
- **Deposit Tracking**: 7 days before event
- **Balance Tracking**: On event day
- **Overdue Management**: Automated reminders

### Phase 8: Testing Strategy

#### 8.1 Unit Tests
- Repository layer tests
- Service layer tests
- Handler tests

#### 8.2 Integration Tests
- API endpoint tests
- Database integration tests
- Payment flow tests

#### 8.3 End-to-End Tests
- Complete booking flow
- Payment processing
- Invoice generation

### Phase 9: Deployment Considerations

#### 9.1 Database Migration
- Run migration scripts
- Backup existing data
- Validate schema changes

#### 9.2 Environment Configuration
- Database connection
- Email settings for invoices
- File storage for invoices

#### 9.3 Monitoring
- Booking metrics
- Payment status tracking
- Error logging

## Implementation Timeline

### Week 1: Database & Repository Layer
- [ ] Add new models to models.go
- [ ] Create database migration
- [ ] Implement repository interfaces
- [ ] Write unit tests

### Week 2: Service Layer
- [ ] Implement hall booking service
- [ ] Add payment processing logic
- [ ] Implement invoice generation
- [ ] Write service tests

### Week 3: Handler & API Layer
- [ ] Create booking handlers
- [ ] Set up API routes
- [ ] Implement validation
- [ ] Write integration tests

### Week 4: Testing & Deployment
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Documentation
- [ ] Production deployment

## Success Metrics

1. **Booking Success Rate**: >95% of bookings processed successfully
2. **Payment Accuracy**: 100% accurate payment tracking
3. **Invoice Generation**: <5 seconds generation time
4. **API Response Time**: <200ms average response time
5. **Error Rate**: <1% API error rate

## Risk Mitigation

1. **Data Validation**: Strict input validation and sanitization
2. **Concurrency**: Handle simultaneous booking attempts
3. **Payment Tracking**: Robust payment status management
4. **Backup**: Regular database backups
5. **Monitoring**: Real-time error tracking and alerts

This comprehensive plan ensures seamless integration of the Hall Booking system with robust cash payment processing, maintaining the existing backend architecture while extending functionality for hall bookings.

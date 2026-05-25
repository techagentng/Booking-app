# 📅 Hall Booking Calendar Availability - Backend Implementation Plan

## 🎯 **Objective**

Create backend endpoints to provide calendar availability status for hall booking system, supporting both frontend calendar display and admin dashboard management.

---

## 📊 **Data Models**

### **1. Calendar Availability Model**

```go
// models/calendar_availability.go
package models

import (
    "time"
    "gorm.io/gorm"
)

// CalendarAvailability represents daily availability status
type CalendarAvailability struct {
    ID          uint      `gorm:"primaryKey" json:"id"`
    Date        time.Time `gorm:"uniqueIndex;not null" json:"date"`
    Status      string    `gorm:"not null" json:"status"` // available, booked, pending, closed, maintenance
    TotalSlots  int       `gorm:"default:0" json:"total_slots"`
    BookedSlots int       `gorm:"default:0" json:"booked_slots"`
    AvailableSlots int     `gorm:"default:0" json:"available_slots"`
    Notes       string    `gorm:"type:text" json:"notes"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
    
    // Relations
    HallBookings []HallBooking `gorm:"foreignKey:booking_date" json:"hall_bookings,omitempty"`
}

// Status constants
const (
    StatusAvailable    = "available"
    StatusBooked       = "booked" 
    StatusPending      = "pending"
    StatusClosed       = "closed"
    StatusMaintenance  = "maintenance"
)

// TableName specifies the table name
func (CalendarAvailability) TableName() string {
    return "calendar_availability"
}
```

### **2. Time Slot Model**

```go
// models/time_slot.go
package models

import (
    "time"
    "gorm.io/gorm"
)

// TimeSlot represents available time slots for a specific date
type TimeSlot struct {
    ID           uint      `gorm:"primaryKey" json:"id"`
    Date         time.Time `gorm:"not null;index" json:"date"`
    StartTime    string    `gorm:"not null" json:"start_time"` // "09:00"
    EndTime      string    `gorm:"not null" json:"end_time"`   // "10:00"
    Status       string    `gorm:"not null" json:"status"`    // available, booked, pending
    MaxCapacity  int       `gorm:"default:100" json:"max_capacity"`
    CurrentUsage int       `gorm:"default:0" json:"current_usage"`
    Price        float64   `gorm:"default:0" json:"price"`
    CreatedAt    time.Time `json:"created_at"`
    UpdatedAt    time.Time `json:"updated_at"`
    
    // Relations
    CalendarAvailabilityID uint                 `gorm:"index" json:"calendar_availability_id"`
    CalendarAvailability   *CalendarAvailability `gorm:"foreignKey:CalendarAvailabilityID" json:"calendar_availability,omitempty"`
    HallBookings         []HallBooking         `gorm:"foreignKey:booking_date;references:date" json:"hall_bookings,omitempty"`
}

// TableName specifies the table name
func (TimeSlot) TableName() string {
    return "time_slots"
}
```

### **3. Enhanced Hall Booking Model**

```go
// Update existing HallBooking model to include calendar relations
type HallBooking struct {
    // ... existing fields ...
    
    // New relations for calendar
    CalendarAvailability *CalendarAvailability `gorm:"foreignKey:booking_date;references:date" json:"calendar_availability,omitempty"`
    TimeSlot            *TimeSlot             `gorm:"foreignKey:booking_date,StartTime;references:date,StartTime" json:"time_slot,omitempty"`
}
```

---

## 🔧 **Repository Layer**

### **1. Calendar Availability Repository**

```go
// db/calendar_repository.go
package db

import (
    "fmt"
    "time"
    "gorm.io/gorm"
    "your-project/models"
)

type CalendarRepository interface {
    // Daily availability
    GetAvailabilityByDate(date time.Time) (*models.CalendarAvailability, error)
    GetAvailabilityByDateRange(startDate, endDate time.Time) ([]models.CalendarAvailability, error)
    CreateOrUpdateAvailability(availability *models.CalendarAvailability) error
    
    // Time slot management
    GetTimeSlotsByDate(date time.Time) ([]models.TimeSlot, error)
    CreateTimeSlots(slots []models.TimeSlot) error
    UpdateTimeSlot(slot *models.TimeSlot) error
    
    // Calendar generation
    GenerateMonthlyCalendar(year int, month time.Month) error
    UpdateAvailabilityFromBookings(date time.Time) error
    
    // Statistics
    GetMonthlyStats(year int, month time.Month) (map[string]interface{}, error)
    GetAvailabilitySummary(startDate, endDate time.Time) (map[string]interface{}, error)
}

type calendarRepository struct {
    db *gorm.DB
}

func NewCalendarRepository(db *gorm.DB) CalendarRepository {
    return &calendarRepository{db: db}
}

// GetAvailabilityByDate retrieves availability for a specific date
func (r *calendarRepository) GetAvailabilityByDate(date time.Time) (*models.CalendarAvailability, error) {
    var availability models.CalendarAvailability
    
    // Normalize date to start of day
    normalizedDate := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
    
    err := r.db.Where("date = ?", normalizedDate).First(&availability).Error
    if err == gorm.ErrRecordNotFound {
        // Create default availability if not found
        availability = models.CalendarAvailability{
            Date:           normalizedDate,
            Status:         models.StatusAvailable,
            TotalSlots:     calculateTotalSlots(normalizedDate),
            AvailableSlots: calculateTotalSlots(normalizedDate),
        }
        err = r.db.Create(&availability).Error
    }
    
    return &availability, err
}

// GetAvailabilityByDateRange retrieves availability for a date range
func (r *calendarRepository) GetAvailabilityByDateRange(startDate, endDate time.Time) ([]models.CalendarAvailability, error) {
    var availabilities []models.CalendarAvailability
    
    // Normalize dates
    startDate = time.Date(startDate.Year(), startDate.Month(), startDate.Day(), 0, 0, 0, 0, startDate.Location())
    endDate = time.Date(endDate.Year(), endDate.Month(), endDate.Day(), 0, 0, 0, 0, endDate.Location())
    
    err := r.db.Where("date BETWEEN ? AND ?", startDate, endDate).
        Order("date ASC").
        Find(&availabilities).Error
    
    return availabilities, err
}

// CreateOrUpdateAvailability creates or updates availability
func (r *calendarRepository) CreateOrUpdateAvailability(availability *models.CalendarAvailability) error {
    // Normalize date
    availability.Date = time.Date(availability.Date.Year(), availability.Date.Month(), availability.Date.Day(), 0, 0, 0, 0, availability.Date.Location())
    
    var existing models.CalendarAvailability
    err := r.db.Where("date = ?", availability.Date).First(&existing).Error
    
    if err == gorm.ErrRecordNotFound {
        return r.db.Create(availability).Error
    }
    
    availability.ID = existing.ID
    return r.db.Save(availability).Error
}

// GetTimeSlotsByDate retrieves all time slots for a date
func (r *calendarRepository) GetTimeSlotsByDate(date time.Time) ([]models.TimeSlot, error) {
    var slots []models.TimeSlot
    
    normalizedDate := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
    
    err := r.db.Where("date = ?", normalizedDate).
        Order("start_time ASC").
        Find(&slots).Error
    
    return slots, err
}

// GenerateMonthlyCalendar creates availability records for a month
func (r *calendarRepository) GenerateMonthlyCalendar(year int, month time.Month) error {
    firstDay := time.Date(year, month, 1, 0, 0, 0, 0, time.UTC)
    lastDay := firstDay.AddDate(0, 1, -1)
    
    for date := firstDay; date.After(lastDay) == false; date = date.AddDate(0, 0, 1) {
        availability := models.CalendarAvailability{
            Date:           date,
            Status:         models.StatusAvailable,
            TotalSlots:     calculateTotalSlots(date),
            AvailableSlots: calculateTotalSlots(date),
        }
        
        // Create or update
        r.CreateOrUpdateAvailability(&availability)
        
        // Generate time slots
        r.generateTimeSlotsForDate(date)
    }
    
    return nil
}

// Helper functions
func calculateTotalSlots(date time.Time) int {
    dayOfWeek := date.Weekday()
    
    switch dayOfWeek {
    case time.Sunday:
        return 6 // 12:00 - 18:00 (6 slots)
    case time.Saturday:
        return 11 // 12:00 - 23:00 (11 slots)
    default: // Monday - Friday
        return 14 // 08:00 - 22:00 (14 slots)
    }
}

func (r *calendarRepository) generateTimeSlotsForDate(date time.Time) error {
    slots := generateDefaultTimeSlots(date)
    return r.CreateTimeSlots(slots)
}

func generateDefaultTimeSlots(date time.Time) []models.TimeSlot {
    var slots []models.TimeSlot
    dayOfWeek := date.Weekday()
    
    var startHour, endHour int
    
    switch dayOfWeek {
    case time.Sunday:
        startHour, endHour = 12, 18
    case time.Saturday:
        startHour, endHour = 12, 23
    default:
        startHour, endHour = 8, 22
    }
    
    for hour := startHour; hour < endHour; hour++ {
        slots = append(slots, models.TimeSlot{
            Date:        date,
            StartTime:   fmt.Sprintf("%02d:00", hour),
            EndTime:     fmt.Sprintf("%02d:00", hour+1),
            Status:      models.StatusAvailable,
            MaxCapacity: 100,
            Price:       calculateHourlyPrice(date, hour),
        })
    }
    
    return slots
}

func calculateHourlyPrice(date time.Time, hour int) float64 {
    dayOfWeek := date.Weekday()
    
    // Weekend pricing
    if dayOfWeek == time.Saturday || dayOfWeek == time.Sunday {
        return 25.0
    }
    
    // Peak hours (evening)
    if hour >= 17 && hour <= 21 {
        return 20.0
    }
    
    // Standard hours
    return 15.0
}
```

---

## 🎯 **Service Layer**

### **1. Calendar Service**

```go
// services/calendar_service.go
package services

import (
    "time"
    "errors"
    "your-project/db"
    "your-project/models"
)

type CalendarService interface {
    // Public endpoints (no auth required)
    GetCalendarAvailability(year int, month time.Month) ([]models.CalendarAvailability, error)
    GetDailyAvailability(date time.Time) (*models.CalendarAvailability, error)
    GetTimeSlots(date time.Time) ([]models.TimeSlot, error)
    CheckSlotAvailability(date time.Time, startTime, endTime string) (bool, error)
    
    // Admin endpoints (auth required)
    UpdateDailyAvailability(date time.Time, status string, notes string) error
    UpdateTimeSlotStatus(date time.Time, startTime, endTime, status string) error
    GetMonthlyStats(year int, month time.Month) (map[string]interface{}, error)
    GenerateCalendar(year int, month time.Month) error
    BulkUpdateAvailability(updates []CalendarUpdateRequest) error
}

type calendarService struct {
    calendarRepo db.CalendarRepository
    bookingRepo  db.HallBookingRepository
}

type CalendarUpdateRequest struct {
    Date   time.Time `json:"date" binding:"required"`
    Status string    `json:"status" binding:"required"`
    Notes  string    `json:"notes"`
}

func NewCalendarService(calendarRepo db.CalendarRepository, bookingRepo db.HallBookingRepository) CalendarService {
    return &calendarService{
        calendarRepo: calendarRepo,
        bookingRepo:  bookingRepo,
    }
}

// GetCalendarAvailability returns availability for a month
func (s *calendarService) GetCalendarAvailability(year int, month time.Month) ([]models.CalendarAvailability, error) {
    startDate := time.Date(year, month, 1, 0, 0, 0, 0, time.UTC)
    endDate := startDate.AddDate(0, 1, -1)
    
    return s.calendarRepo.GetAvailabilityByDateRange(startDate, endDate)
}

// GetDailyAvailability returns availability for a specific date
func (s *calendarService) GetDailyAvailability(date time.Time) (*models.CalendarAvailability, error) {
    availability, err := s.calendarRepo.GetAvailabilityByDate(date)
    if err != nil {
        return nil, err
    }
    
    // Update availability based on current bookings
    err = s.updateAvailabilityFromBookings(date)
    if err != nil {
        return nil, err
    }
    
    return s.calendarRepo.GetAvailabilityByDate(date)
}

// CheckSlotAvailability checks if a time slot is available
func (s *calendarService) CheckSlotAvailability(date time.Time, startTime, endTime string) (bool, error) {
    // Check if date is available
    dailyAvailability, err := s.calendarRepo.GetAvailabilityByDate(date)
    if err != nil {
        return false, err
    }
    
    if dailyAvailability.Status != models.StatusAvailable {
        return false, errors.New("date not available")
    }
    
    // Check time slots
    slots, err := s.calendarRepo.GetTimeSlotsByDate(date)
    if err != nil {
        return false, err
    }
    
    // Check if all requested slots are available
    for _, slot := range slots {
        if slot.StartTime >= startTime && slot.StartTime < endTime {
            if slot.Status != models.StatusAvailable {
                return false, nil
            }
        }
    }
    
    return true, nil
}

// UpdateDailyAvailability updates daily availability (admin only)
func (s *calendarService) UpdateDailyAvailability(date time.Time, status string, notes string) error {
    availability, err := s.calendarRepo.GetAvailabilityByDate(date)
    if err != nil {
        return err
    }
    
    availability.Status = status
    availability.Notes = notes
    
    // Update available slots based on status
    switch status {
    case models.StatusAvailable:
        availability.AvailableSlots = availability.TotalSlots
    case models.StatusBooked, models.StatusClosed, models.StatusMaintenance:
        availability.AvailableSlots = 0
    case models.StatusPending:
        availability.AvailableSlots = availability.TotalSlots - availability.BookedSlots
    }
    
    return s.calendarRepo.CreateOrUpdateAvailability(availability)
}

// GetMonthlyStats returns statistics for a month
func (s *calendarService) GetMonthlyStats(year int, month time.Month) (map[string]interface{}, error) {
    startDate := time.Date(year, month, 1, 0, 0, 0, 0, time.UTC)
    endDate := startDate.AddDate(0, 1, -1)
    
    availabilities, err := s.calendarRepo.GetAvailabilityByDateRange(startDate, endDate)
    if err != nil {
        return nil, err
    }
    
    stats := map[string]interface{}{
        "total_days":       len(availabilities),
        "available_days":   0,
        "booked_days":      0,
        "pending_days":     0,
        "closed_days":      0,
        "maintenance_days": 0,
        "total_bookings":   0,
        "revenue":          0.0,
    }
    
    for _, availability := range availabilities {
        switch availability.Status {
        case models.StatusAvailable:
            stats["available_days"] = stats["available_days"].(int) + 1
        case models.StatusBooked:
            stats["booked_days"] = stats["booked_days"].(int) + 1
        case models.StatusPending:
            stats["pending_days"] = stats["pending_days"].(int) + 1
        case models.StatusClosed:
            stats["closed_days"] = stats["closed_days"].(int) + 1
        case models.StatusMaintenance:
            stats["maintenance_days"] = stats["maintenance_days"].(int) + 1
        }
        
        stats["total_bookings"] = stats["total_bookings"].(int) + availability.BookedSlots
    }
    
    return stats, nil
}

// Helper method to update availability from bookings
func (s *calendarService) updateAvailabilityFromBookings(date time.Time) error {
    bookings, err := s.bookingRepo.GetBookingsByDate(date)
    if err != nil {
        return err
    }
    
    availability, err := s.calendarRepo.GetAvailabilityByDate(date)
    if err != nil {
        return err
    }
    
    // Update booked slots count
    availability.BookedSlots = len(bookings)
    availability.AvailableSlots = availability.TotalSlots - availability.BookedSlots
    
    // Update status based on availability
    if availability.AvailableSlots <= 0 {
        availability.Status = models.StatusBooked
    } else if availability.BookedSlots > 0 {
        availability.Status = models.StatusPending
    } else {
        availability.Status = models.StatusAvailable
    }
    
    return s.calendarRepo.CreateOrUpdateAvailability(availability)
}
```

---

## 🌐 **API Endpoints**

### **1. Public Calendar Endpoints**

```go
// server/calendar_handlers.go
package server

import (
    "net/http"
    "strconv"
    "time"
    "github.com/gin-gonic/gin"
    "your-project/services"
    "your-project/models"
)

type CalendarHandler struct {
    calendarService services.CalendarService
}

func NewCalendarHandler(calendarService services.CalendarService) *CalendarHandler {
    return &CalendarHandler{
        calendarService: calendarService,
    }
}

// GetCalendarAvailability returns calendar availability for a month
// GET /api/v1/calendar/availability?year=2024&month=2
func (h *CalendarHandler) GetCalendarAvailability(c *gin.Context) {
    year, err := strconv.Atoi(c.Query("year"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid year parameter"})
        return
    }
    
    month, err := strconv.Atoi(c.Query("month"))
    if err != nil || month < 1 || month > 12 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid month parameter"})
        return
    }
    
    availabilities, err := h.calendarService.GetCalendarAvailability(year, time.Month(month))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "message": "Calendar availability retrieved successfully",
        "data":    availabilities,
    })
}

// GetDailyAvailability returns availability for a specific date
// GET /api/v1/calendar/availability/:date
func (h *CalendarHandler) GetDailyAvailability(c *gin.Context) {
    dateStr := c.Param("date")
    date, err := time.Parse("2006-01-02", dateStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
        return
    }
    
    availability, err := h.calendarService.GetDailyAvailability(date)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "message": "Daily availability retrieved successfully",
        "data":    availability,
    })
}

// GetTimeSlots returns available time slots for a date
// GET /api/v1/calendar/time-slots/:date
func (h *CalendarHandler) GetTimeSlots(c *gin.Context) {
    dateStr := c.Param("date")
    date, err := time.Parse("2006-01-02", dateStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
        return
    }
    
    slots, err := h.calendarService.GetTimeSlots(date)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "message": "Time slots retrieved successfully",
        "data":    slots,
    })
}

// CheckSlotAvailability checks if a time slot is available
// GET /api/v1/calendar/check-availability?date=2024-02-15&start_time=18:00&end_time=20:00
func (h *CalendarHandler) CheckSlotAvailability(c *gin.Context) {
    dateStr := c.Query("date")
    startTime := c.Query("start_time")
    endTime := c.Query("end_time")
    
    if dateStr == "" || startTime == "" || endTime == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "date, start_time, and end_time are required"})
        return
    }
    
    date, err := time.Parse("2006-01-02", dateStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
        return
    }
    
    available, err := h.calendarService.CheckSlotAvailability(date, startTime, endTime)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "message": "Slot availability checked successfully",
        "data": gin.H{
            "available": available,
            "date":      dateStr,
            "start_time": startTime,
            "end_time":   endTime,
        },
    })
}
```

### **2. Admin Calendar Endpoints**

```go
// Admin endpoints (require authentication)

// UpdateDailyAvailability updates daily availability
// PUT /api/v1/admin/calendar/availability/:date
func (h *CalendarHandler) UpdateDailyAvailability(c *gin.Context) {
    dateStr := c.Param("date")
    date, err := time.Parse("2006-01-02", dateStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
        return
    }
    
    var req services.CalendarUpdateRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    err = h.calendarService.UpdateDailyAvailability(date, req.Status, req.Notes)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "message": "Daily availability updated successfully",
    })
}

// GetMonthlyStats returns monthly statistics
// GET /api/v1/admin/calendar/stats?year=2024&month=2
func (h *CalendarHandler) GetMonthlyStats(c *gin.Context) {
    year, err := strconv.Atoi(c.Query("year"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid year parameter"})
        return
    }
    
    month, err := strconv.Atoi(c.Query("month"))
    if err != nil || month < 1 || month > 12 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid month parameter"})
        return
    }
    
    stats, err := h.calendarService.GetMonthlyStats(year, time.Month(month))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "message": "Monthly statistics retrieved successfully",
        "data":    stats,
    })
}

// GenerateCalendar generates calendar for a month
// POST /api/v1/admin/calendar/generate
func (h *CalendarHandler) GenerateCalendar(c *gin.Context) {
    var req struct {
        Year  int `json:"year" binding:"required"`
        Month int `json:"month" binding:"required"`
    }
    
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    err := h.calendarService.GenerateCalendar(req.Year, time.Month(req.Month))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "message": "Calendar generated successfully",
    })
}
```

---

## 🔗 **Route Configuration**

```go
// routes/calendar_routes.go
package routes

import (
    "github.com/gin-gonic/gin"
    "your-project/server"
)

func SetupCalendarRoutes(router *gin.Engine, calendarHandler *server.CalendarHandler) {
    v1 := router.Group("/api/v1")
    
    // Public calendar endpoints (no auth required)
    calendar := v1.Group("/calendar")
    {
        calendar.GET("/availability", calendarHandler.GetCalendarAvailability)
        calendar.GET("/availability/:date", calendarHandler.GetDailyAvailability)
        calendar.GET("/time-slots/:date", calendarHandler.GetTimeSlots)
        calendar.GET("/check-availability", calendarHandler.CheckSlotAvailability)
    }
    
    // Admin calendar endpoints (auth required)
    admin := v1.Group("/admin")
    admin.Use(middleware.AuthMiddleware()) // Add auth middleware
    {
        admin.PUT("/calendar/availability/:date", calendarHandler.UpdateDailyAvailability)
        admin.GET("/calendar/stats", calendarHandler.GetMonthlyStats)
        admin.POST("/calendar/generate", calendarHandler.GenerateCalendar)
    }
}
```

---

## 📊 **Database Migration**

```go
// migrations/calendar_migration.go
package migrations

import (
    "gorm.io/gorm"
    "your-project/models"
)

func CreateCalendarTables(db *gorm.DB) error {
    // Create calendar_availability table
    err := db.AutoMigrate(&models.CalendarAvailability{})
    if err != nil {
        return err
    }
    
    // Create time_slots table
    err = db.AutoMigrate(&models.TimeSlot{})
    if err != nil {
        return err
    }
    
    // Add indexes for performance
    err = db.Exec("CREATE INDEX IF NOT EXISTS idx_calendar_availability_date ON calendar_availability(date)").Error
    if err != nil {
        return err
    }
    
    err = db.Exec("CREATE INDEX IF NOT EXISTS idx_time_slots_date ON time_slots(date)").Error
    if err != nil {
        return err
    }
    
    err = db.Exec("CREATE INDEX IF NOT EXISTS idx_time_slots_date_time ON time_slots(date, start_time)").Error
    if err != nil {
        return err
    }
    
    return nil
}
```

---

## 🎯 **API Response Examples**

### **1. Calendar Availability Response**

```json
{
  "message": "Calendar availability retrieved successfully",
  "data": [
    {
      "id": 1,
      "date": "2024-02-01T00:00:00Z",
      "status": "available",
      "total_slots": 14,
      "booked_slots": 0,
      "available_slots": 14,
      "notes": "",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "date": "2024-02-02T00:00:00Z",
      "status": "booked",
      "total_slots": 14,
      "booked_slots": 14,
      "available_slots": 0,
      "notes": "Fully booked for wedding reception",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### **2. Time Slots Response**

```json
{
  "message": "Time slots retrieved successfully",
  "data": [
    {
      "id": 1,
      "date": "2024-02-15T00:00:00Z",
      "start_time": "08:00",
      "end_time": "09:00",
      "status": "available",
      "max_capacity": 100,
      "current_usage": 0,
      "price": 15.0,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "date": "2024-02-15T00:00:00Z",
      "start_time": "18:00",
      "end_time": "19:00",
      "status": "booked",
      "max_capacity": 100,
      "current_usage": 50,
      "price": 20.0,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-10T14:20:00Z"
    }
  ]
}
```

### **3. Monthly Stats Response**

```json
{
  "message": "Monthly statistics retrieved successfully",
  "data": {
    "total_days": 29,
    "available_days": 20,
    "booked_days": 5,
    "pending_days": 3,
    "closed_days": 1,
    "maintenance_days": 0,
    "total_bookings": 45,
    "revenue": 1250.0
  }
}
```

---

## 🚀 **Implementation Steps**

### **Phase 1: Core Models & Database**
1. Create CalendarAvailability and TimeSlot models
2. Run database migrations
3. Set up repository layer
4. Test basic CRUD operations

### **Phase 2: Service Layer**
1. Implement CalendarService
2. Add business logic for availability calculations
3. Create time slot generation logic
4. Add statistics calculations

### **Phase 3: API Endpoints**
1. Create public calendar endpoints
2. Add admin management endpoints
3. Implement authentication for admin routes
4. Add comprehensive error handling

### **Phase 4: Integration**
1. Integrate with existing HallBooking system
2. Update availability when bookings are created/updated
3. Add calendar generation automation
4. Test end-to-end functionality

---

## 🎯 **Frontend Integration Points**

### **1. Calendar Component**
```typescript
// Fetch monthly availability
GET /api/v1/calendar/availability?year=2024&month=2

// Fetch daily details
GET /api/v1/calendar/availability/2024-02-15

// Check slot availability
GET /api/v1/calendar/check-availability?date=2024-02-15&start_time=18:00&end_time=20:00
```

### **2. Admin Dashboard**
```typescript
// Update availability
PUT /api/v1/admin/calendar/availability/2024-02-15

// Get statistics
GET /api/v1/admin/calendar/stats?year=2024&month=2

// Generate calendar
POST /api/v1/admin/calendar/generate
```

---

## ✅ **Success Criteria**

- ✅ Calendar shows correct availability status
- ✅ Time slots accurately reflect bookings
- ✅ Admin can update availability
- ✅ Statistics are accurate and up-to-date
- ✅ API responses are consistent and well-structured
- ✅ Performance is optimized with proper indexing
- ✅ Error handling is comprehensive
- ✅ Authentication protects admin endpoints

This backend plan provides a solid foundation for both the frontend calendar display and admin dashboard management! 🎯

# Backend SSE Notifications Implementation Prompt

## 🎯 Objective
Implement Server-Sent Events (SSE) real-time notifications for hall booking events in the Go backend. This will enable the frontend to receive instant updates when bookings are created, updated, or cancelled.

## 📋 Current Status
- ✅ **Frontend SSE hook** implemented (`useHallBookingNotifications.ts`)
- ✅ **Real-time UI components** ready (`HallBookingRightSection.tsx`)
- ✅ **Mock system** working for demo purposes
- ❌ **Backend SSE endpoint** missing (returns 404)

## 🔧 Implementation Requirements

### **1. SSE Endpoint Implementation**
Create a new SSE endpoint at `/api/v1/notifications/sse` that:
- Accepts authenticated connections
- Sends real-time hall booking notifications
- Maintains connection with heartbeat
- Handles client disconnections gracefully

### **2. Notification Events to Implement**
```go
// Event Types to Emit:
type NotificationEvent struct {
    Type      string                 `json:"type"`
    Title     string                 `json:"title"`
    Message   string                 `json:"message"`
    Priority  string                 `json:"priority"`
    Data      map[string]interface{} `json:"data"`
    Timestamp string                 `json:"timestamp"`
}

// Specific Events:
1. "new_hall_booking"      - When booking is created
2. "hall_booking_updated"  - When booking status changes
3. "hall_booking_cancelled" - When booking is cancelled
```

### **3. SSE Connection Handler**
```go
// In handlers/notifications.go
func (h *NotificationHandler) HandleSSE(c *gin.Context) {
    // 1. Set SSE headers
    c.Header("Content-Type", "text/event-stream")
    c.Header("Cache-Control", "no-cache")
    c.Header("Connection", "keep-alive")
    c.Header("Access-Control-Allow-Origin", "*")
    c.Header("Access-Control-Allow-Headers", "Cache-Control")

    // 2. Create client channel
    client := make(chan NotificationEvent)
    h.AddClient(client)
    defer h.RemoveClient(client)

    // 3. Send initial connection event
    h.sendEvent(client, "connected", map[string]interface{}{
        "message": "Connected to hall booking notifications",
        "client_id": generateClientID(),
    })

    // 4. Start heartbeat goroutine
    heartbeat := time.NewTicker(30 * time.Second)
    defer heartbeat.Stop()

    // 5. Listen for events and send to client
    for {
        select {
        case event := <-client:
            h.sendNotification(c, event)
        case <-heartbeat.C:
            h.sendEvent(client, "heartbeat", map[string]interface{}{
                "timestamp": time.Now().Unix(),
            })
        case <-c.Request.Context().Done():
            return
        }
    }
}
```

### **4. Notification Manager**
```go
// In services/notification_service.go
type NotificationService struct {
    clients map[string]chan NotificationEvent
    mutex   sync.RWMutex
}

func (s *NotificationService) AddClient(client chan NotificationEvent) string {
    clientID := generateClientID()
    s.mutex.Lock()
    defer s.mutex.Unlock()
    s.clients[clientID] = client
    return clientID
}

func (s *NotificationService) RemoveClient(clientID string) {
    s.mutex.Lock()
    defer s.mutex.Unlock()
    if ch, exists := s.clients[clientID]; exists {
        close(ch)
        delete(s.clients, clientID)
    }
}

func (s *NotificationService) BroadcastHallBooking(booking *models.HallBooking, eventType string) {
    event := NotificationEvent{
        Type:      eventType,
        Title:     getEventTitle(eventType),
        Message:   getEventMessage(booking, eventType),
        Priority:  getEventPriority(eventType),
        Timestamp: time.Now().Format(time.RFC3339),
        Data: map[string]interface{}{
            "booking_id":        booking.ID,
            "booking_id_str":    booking.BookingID,
            "organizer_name":    booking.OrganizerName,
            "organizer_email":   booking.OrganizerEmail,
            "organizer_phone":   booking.OrganizerPhone,
            "event_type":        booking.EventType,
            "guest_count":       booking.GuestCount,
            "booking_date":      booking.BookingDate,
            "start_time":        booking.StartTime,
            "end_time":          booking.EndTime,
            "total_price":       booking.TotalPrice,
            "status":            booking.Status,
            "created_by_type":   booking.CreatedByType,
        },
    }

    s.mutex.RLock()
    defer s.mutex.RUnlock()
    
    for _, client := range s.clients {
        select {
        case client <- event:
        default:
            // Client channel is full, skip
        }
    }
}
```

### **5. Integration with Booking Service**
```go
// In services/hall_booking_service.go
func (s *HallBookingService) CreateBooking(req *CreateBookingRequest) (*models.HallBooking, error) {
    // ... existing booking creation logic ...
    
    // AFTER successful creation:
    booking := &models.HallBooking{...}
    
    // Broadcast real-time notification
    s.notificationService.BroadcastHallBooking(booking, "new_hall_booking")
    
    return booking, nil
}

func (s *HallBookingService) UpdateBookingStatus(bookingID uint, status string) error {
    // ... existing update logic ...
    
    // AFTER successful update:
    booking := &models.HallBooking{...}
    
    // Broadcast real-time notification
    s.notificationService.BroadcastHallBooking(booking, "hall_booking_updated")
    
    return nil
}

func (s *HallBookingService) CancelBooking(bookingID uint) error {
    // ... existing cancellation logic ...
    
    // AFTER successful cancellation:
    booking := &models.HallBooking{...}
    
    // Broadcast real-time notification
    s.notificationService.BroadcastHallBooking(booking, "hall_booking_cancelled")
    
    return nil
}
```

### **6. Route Registration**
```go
// In routes/routes.go
func SetupRoutes(r *gin.Engine, handlers *handlers.Handlers) {
    v1 := r.Group("/api/v1")
    
    // ... existing routes ...
    
    // SSE Notifications endpoint
    notifications := v1.Group("/notifications")
    notifications.GET("/sse", handlers.NotificationHandler.HandleSSE)
}
```

### **7. Helper Functions**
```go
// Event title generation
func getEventTitle(eventType string) string {
    switch eventType {
    case "new_hall_booking":
        return "New Hall Booking"
    case "hall_booking_updated":
        return "Hall Booking Updated"
    case "hall_booking_cancelled":
        return "Hall Booking Cancelled"
    default:
        return "Hall Booking Event"
    }
}

// Event message generation
func getEventMessage(booking *models.HallBooking, eventType string) string {
    switch eventType {
    case "new_hall_booking":
        return fmt.Sprintf("%s booked a %s for %d guests on %s", 
            booking.OrganizerName, booking.EventType, booking.GuestCount, booking.BookingDate)
    case "hall_booking_updated":
        return fmt.Sprintf("%s's %s booking status changed to %s", 
            booking.OrganizerName, booking.EventType, booking.Status)
    case "hall_booking_cancelled":
        return fmt.Sprintf("%s's %s booking for %s has been cancelled", 
            booking.OrganizerName, booking.EventType, booking.BookingDate)
    default:
        return "Hall booking event occurred"
    }
}

// Event priority determination
func getEventPriority(eventType string) string {
    switch eventType {
    case "hall_booking_cancelled":
        return "high"
    case "new_hall_booking":
        return "normal"
    case "hall_booking_updated":
        return "normal"
    default:
        return "low"
    }
}

// SSE event sender
func (h *NotificationHandler) sendNotification(c *gin.Context, event NotificationEvent) {
    data, _ := json.Marshal(event)
    fmt.Fprintf(c.Writer, "event: notification\n")
    fmt.Fprintf(c.Writer, "data: %s\n\n", data)
    c.Writer.Flush()
}

func (h *NotificationHandler) sendEvent(client chan NotificationEvent, eventType string, data map[string]interface{}) {
    event := NotificationEvent{
        Type:      eventType,
        Title:     data["title"].(string),
        Message:   data["message"].(string),
        Priority:  "info",
        Timestamp: time.Now().Format(time.RFC3339),
        Data:      data,
    }
    
    select {
    case client <- event:
    default:
        // Client channel is full
    }
}
```

## 🚀 Implementation Steps

### **Step 1: Create Notification Service**
1. Create `services/notification_service.go`
2. Implement client management (add/remove)
3. Implement broadcast functionality
4. Add to main service container

### **Step 2: Create SSE Handler**
1. Create `handlers/notification_handler.go`
2. Implement SSE connection handling
3. Add proper headers and streaming
4. Add heartbeat mechanism

### **Step 3: Integrate with Booking Service**
1. Add notification service to booking service
2. Call broadcast on create/update/cancel
3. Ensure proper error handling

### **Step 4: Register Routes**
1. Add SSE endpoint to routes
2. Test connection with curl/browser
3. Verify proper headers

### **Step 5: Test Integration**
1. Create test booking via API
2. Verify SSE notification appears
3. Test multiple clients
4. Test connection/disconnection

## 🧪 Testing Commands

### **Test SSE Connection:**
```bash
# Test SSE endpoint
curl -N -H "Accept: text/event-stream" http://localhost:8080/api/v1/notifications/sse

# Expected output:
event: connected
data: {"message":"Connected to hall booking notifications","client_id":"abc123"}

event: heartbeat
data: {"timestamp":1643723400}
```

### **Test Booking Creation:**
```bash
# Create booking to trigger notification
curl -X POST http://localhost:8080/api/v1/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "organizer_name": "Test User",
    "organizer_email": "test@example.com",
    "organizer_phone": "+1234567890",
    "event_type": "wedding",
    "guest_count": 50,
    "booking_date": "2026-06-15",
    "start_time": "14:00",
    "end_time": "18:00",
    "total_price": 2500,
    "payment_method": "online"
  }'

# Expected SSE output:
event: notification
data: {"type":"new_hall_booking","title":"New Hall Booking","message":"Test User booked a wedding for 50 guests on 2026-06-15","priority":"normal","data":{...},"timestamp":"2026-01-30T20:45:00Z"}
```

## 📋 Files to Create/Modify

### **New Files:**
- `services/notification_service.go`
- `handlers/notification_handler.go`

### **Modify Files:**
- `services/hall_booking_service.go` (add notification calls)
- `routes/routes.go` (add SSE route)
- `main.go` (initialize notification service)

## 🔧 Dependencies

### **Required Imports:**
```go
import (
    "encoding/json"
    "fmt"
    "sync"
    "time"
    "github.com/gin-gonic/gin"
    "github.com/your-project/models"
)
```

### **No Additional Packages Needed:**
- Uses Go standard library only
- Compatible with existing Gin framework
- No external SSE libraries required

## 🎯 Success Criteria

### **✅ Working Implementation:**
1. SSE endpoint accepts connections
2. Clients receive "connected" event
3. Heartbeat keeps connections alive
4. New bookings trigger real-time notifications
5. Multiple clients receive notifications simultaneously
6. Frontend shows "Live" status and receives events

### **🔍 Verification:**
1. Browser console shows SSE connection
2. Frontend status changes from "Offline" to "Live"
3. New bookings appear instantly in dashboard
4. No 404 errors for `/api/v1/notifications/sse`
5. Real-time updates work without page refresh

## 🚀 Expected Result

After implementation:
- Frontend will automatically switch from mock to real SSE
- Dashboard will show "🟢 Live" status
- New bookings will appear instantly in right sidebar
- Multiple users will see real-time updates simultaneously
- No more 404 errors for SSE endpoint

**The frontend is ready and waiting - just implement the backend SSE!** 🎯✨

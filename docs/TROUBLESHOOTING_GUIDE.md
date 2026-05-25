# Hall Booking API Troubleshooting Guide

## 🔧 "Unauthorized" Error Fix

The "Unauthorized" error means the backend API is requiring authentication, but the frontend isn't sending it. Here's how to fix it:

## **Option 1: Disable Authentication (Quick Fix)**

If you want to test without authentication, update the backend to allow public access:

### Backend Go Code Update:
```go
// In your routes/hall_bookings.go or main.go
// Remove or comment out the auth middleware for hall bookings

// Before (with auth):
hallBookings.Use(middleware.AuthMiddleware()) // Remove this line

// After (without auth):
// hallBookings.Use(middleware.AuthMiddleware()) // Comment out or remove
```

### Or Update Middleware to Skip Auth:
```go
// In your middleware file
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Skip auth for hall bookings (for testing)
        if strings.HasPrefix(c.Request.URL.Path, "/api/v1/hall-bookings") {
            c.Next()
            return
        }
        
        // Your existing auth logic here
        token := c.GetHeader("Authorization")
        if token == "" {
            c.JSON(401, gin.H{"error": "Authorization header required"})
            c.Abort()
            return
        }
        // ... rest of auth logic
    }
}
```

## **Option 2: Add Authentication to Frontend**

### Add JWT Token Handling:
```typescript
// In HallBookingModal.tsx
const handleOnsitePayment = async () => {
    // Get token from localStorage or context
    const token = localStorage.getItem('authToken') || '';
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/hall-bookings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Add this
        },
        body: JSON.stringify(bookingData),
    });
};
```

### Create Mock Token for Testing:
```javascript
// In browser console for testing
localStorage.setItem('authToken', 'mock-jwt-token-for-testing');
```

## **Option 3: Environment Configuration**

### Check .env File:
```bash
# Make sure your .env has the correct API URL
NEXT_PUBLIC_API_URL=http://localhost:8080

# Or if backend runs on different port:
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Restart Development Server:
```bash
# Stop and restart Next.js to pick up .env changes
npm run dev
```

## **🔍 Debugging Steps**

### 1. Check Backend Status:
```bash
# Test backend directly
curl -X POST http://localhost:8080/api/v1/hall-bookings \
  -H "Content-Type: application/json" \
  -d '{
    "organizer_name": "Test User",
    "organizer_email": "test@example.com",
    "organizer_phone": "+447123456789",
    "event_type": "party",
    "guest_count": 10,
    "booking_date": "2024-02-15",
    "start_time": "18:00",
    "end_time": "20:00",
    "total_price": 100.00,
    "deposit_required": 50.00,
    "payment_method": "cash"
  }'
```

### 2. Check Console Logs:
Open browser dev tools and look for:
- `API URL:` - Shows the URL being called
- `Response status:` - Shows HTTP status code
- `Response data:` - Shows backend response

### 3. Check Network Tab:
- Open DevTools → Network tab
- Submit a booking form
- Look for the failed request
- Check status code and response

### 4. Verify Backend is Running:
```bash
# Check if backend is running
curl http://localhost:8080/health

# Or check hall booking endpoint
curl http://localhost:8080/api/v1/hall-bookings
```

## **🚀 Quick Fix for Testing**

If you want to test immediately without authentication:

### Step 1: Update Backend (Go)
```go
// In main.go or routes setup
func SetupRoutes(router *gin.Engine) {
    v1 := router.Group("/api/v1")
    
    // Hall bookings without auth for testing
    hallBookings := v1.Group("/hall-bookings")
    // hallBookings.Use(middleware.AuthMiddleware()) // Comment out this line
    
    hallBookings.POST("", handlers.CreateHallBooking)
    hallBookings.GET("", handlers.GetAllHallBookings)
    hallBookings.GET("/:id", handlers.GetHallBookingByID)
    // ... other routes
}
```

### Step 2: Restart Backend
```bash
cd backend
go run main.go
```

### Step 3: Test Frontend
- Fill out the booking form
- Click "Pay Cash"
- Should work without authorization error

## **🔧 Common Issues**

### CORS Error:
```go
// Add CORS middleware in backend
func main() {
    r := gin.Default()
    
    // Add CORS
    r.Use(func(c *gin.Context) {
        c.Header("Access-Control-Allow-Origin", "*")
        c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        
        c.Next()
    })
    
    // ... rest of setup
}
```

### Port Conflict:
```bash
# Check what's running on port 8080
lsof -i :8080

# Kill process if needed
kill -9 <PID>
```

### Environment Variable Not Loading:
```bash
# Verify .env is being read
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

# Should show: http://localhost:8080
```

## **✅ Success Indicators**

When it's working, you should see:
- Console: `Response status: 201`
- Console: `Booking created successfully:`
- Invoice modal opens with booking data
- No "Unauthorized" error

Choose the option that best fits your setup. For quick testing, Option 1 (disable auth) is fastest. For production, Option 2 (add proper auth) is recommended.

# 🔧 "Failed to fetch" Error - Diagnostic Guide

## 🚨 **Issue: Failed to fetch**

This error means the frontend cannot reach the backend API. Let's diagnose and fix it.

---

## 🔍 **Step 1: Check Backend Server**

### **Is Backend Running?**
```bash
# Check if backend is running on port 8080
curl http://localhost:8080/health

# Or check if anything is running on port 8080
lsof -i :8080
```

### **If Backend is NOT Running:**
```bash
cd backend
go run main.go

# You should see something like:
# Server running on port 8080
# API documentation available at http://localhost:8080/docs
```

### **If Backend is Running on Different Port:**
```bash
# Check what port it's actually running on
lsof -i :3000
lsof -i :3001
lsof -i :8000

# Update your .env file with the correct port
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🔍 **Step 2: Check Environment Variables**

### **Verify .env File:**
```bash
# Check if .env file exists
ls -la .env

# Check contents
cat .env

# Should contain:
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### **Restart Frontend After .env Changes:**
```bash
# Stop the current Next.js server (Ctrl+C)
# Then restart it
npm run dev
```

### **Check if Variable is Loaded in Browser:**
Open browser console and run:
```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
// Should show: http://localhost:8080
```

---

## 🔍 **Step 3: Test API Directly**

### **Test Backend Health:**
```bash
curl http://localhost:8080/health
curl http://localhost:8080/api/v1/hall-bookings/availability?date=2024-02-15&start_time=18:00&end_time=22:00
```

### **Test with Different URL Formats:**
```bash
# Try different endpoints
curl http://localhost:8080/
curl http://localhost:8080/api/v1/
curl http://localhost:8080/api/v1/hall-bookings
```

---

## 🔍 **Step 4: Check CORS Issues**

### **If Backend Responds but Frontend Can't Connect:**
This is likely a CORS issue. Add this to your Go backend:

```go
// In main.go, add CORS middleware
import "github.com/gin-contrib/cors"

func main() {
    r := gin.Default()
    
    // Add CORS middleware
    r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3001"},
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
        MaxAge:           12 * time.Hour,
    }))
    
    // ... rest of your setup
}
```

### **Install CORS Package:**
```bash
go get github.com/gin-contrib/cors
```

---

## 🔍 **Step 5: Network Debugging**

### **Check Browser Network Tab:**
1. Open DevTools → Network tab
2. Submit a booking form
3. Look for the failed request
4. Check the URL being called
5. Check the error details

### **Common Network Issues:**
- **Wrong port**: Backend running on different port
- **CORS blocked**: Browser blocking cross-origin requests
- **Firewall**: Local firewall blocking connections
- **Backend not started**: Server not running

---

## 🚀 **Quick Fix Steps**

### **Option 1: Fix Environment Variable**
```bash
# 1. Create/update .env file
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env

# 2. Restart frontend
npm run dev

# 3. Test in browser console
console.log(process.env.NEXT_PUBLIC_API_URL);
```

### **Option 2: Check Backend Status**
```bash
# 1. Check if backend is running
curl http://localhost:8080/health

# 2. If not running, start it
cd backend && go run main.go

# 3. Test the endpoint
curl "http://localhost:8080/api/v1/hall-bookings/availability?date=2024-02-15&start_time=18:00&end_time=22:00"
```

### **Option 3: Add CORS to Backend**
```go
// Add to main.go
r.Use(cors.New(cors.Config{
    AllowOrigins: []string{"http://localhost:3000"},
    AllowMethods: []string{"GET", "POST", "OPTIONS"},
    AllowHeaders: []string{"Content-Type"},
}))
```

---

## 🔧 **Debugging Code Addition**

Add this to your HallBookingModal to debug:

```typescript
// Add this at the beginning of handleOnsitePayment
const handleOnsitePayment = async () => {
  setIsSubmitting(true);
  
  // DEBUG: Add these logs
  console.log('=== DEBUG INFO ===');
  console.log('Environment variable:', process.env.NEXT_PUBLIC_API_URL);
  console.log('Selected date:', selectedDate);
  console.log('Start time:', startTime);
  console.log('End time:', endTime);
  console.log('Full URL:', `${process.env.NEXT_PUBLIC_API_URL}/api/v1/hall-bookings/availability?date=${format(selectedDate, 'yyyy-MM-dd')}&start_time=${startTime}&end_time=${endTime}`);
  console.log('==================');
  
  // ... rest of your code
};
```

---

## 📋 **Troubleshooting Checklist**

- [ ] Backend server is running on port 8080
- [ ] .env file contains `NEXT_PUBLIC_API_URL=http://localhost:8080`
- [ ] Frontend server restarted after .env changes
- [ ] CORS middleware added to backend
- [ ] No firewall blocking port 8080
- [ ] Browser console shows correct API URL
- [ ] Network tab shows the request being made

---

## 🎯 **Most Common Solutions**

### **90% of the time, it's one of these:**

1. **Backend not running** → Start the Go server
2. **Wrong port** → Check what port backend is actually using
3. **Environment variable not loaded** → Restart frontend after .env changes
4. **CORS issue** → Add CORS middleware to backend

---

## 🚨 **Emergency Fix**

If you need to test immediately, temporarily hardcode the URL:

```typescript
// Temporary fix for testing
const API_URL = 'http://localhost:8080'; // Hardcode for testing

// Then use:
const response = await fetch(`${API_URL}/api/v1/hall-bookings/availability?...`);
```

Once it works, fix the environment variable properly.

---

## ✅ **Success Indicators**

When it's working, you should see:
- ✅ Console shows correct API URL
- ✅ Network tab shows successful requests (status 200)
- ✅ Availability checking works
- ✅ No "Failed to fetch" errors
- ✅ Booking submission works

Run through these steps and let me know what you find! 🚀

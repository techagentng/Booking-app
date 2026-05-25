#!/bin/bash

# TripsBook Real Backend Startup Script
# Phase 2: Real Database Integration

echo "🚀 Starting TripsBook Real Backend..."
echo "📱 Mobile-First Service Discovery Platform"
echo ""

# Check if PostgreSQL is running
if ! pg_isready -q -h localhost -p 5432; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    echo "   Run: brew services start postgresql"
    exit 1
fi

echo "✅ PostgreSQL is running"

# Check if database exists
if ! psql -h localhost -U postgres -lqt | grep -q tripsbook; then
    echo "📊 Creating TripsBook database..."
    createdb -h localhost -U postgres tripsbook
    echo "✅ Database created"
else
    echo "✅ Database already exists"
fi

# Stop mock server if running
if pgrep -f "go run start_mock_server.go" > /dev/null; then
    echo "🛑 Stopping mock server..."
    pkill -f "go run start_mock_server.go"
    echo "✅ Mock server stopped"
fi

# Start real backend
echo ""
echo "🔗 Starting real backend server..."
echo "📡 API Base URL: http://localhost:8080/api/v1/public"
echo "🌐 Frontend should connect to: API_BASE_URL=http://localhost:8080/api/v1/public npm run dev"
echo ""

# Set environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=postgres
export DB_PASSWORD=password
export DB_NAME=tripsbook
export DB_SSLMODE=disable

# Run the real backend
go run main.go

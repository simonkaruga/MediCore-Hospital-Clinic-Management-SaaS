#!/bin/bash

echo "🏥 Starting MediCore Hospital Management System..."

# Kill any existing processes on ports 3001 and 3002
echo "Checking for existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:3002 | xargs kill -9 2>/dev/null

# Start backend
echo "Starting backend server on port 3001..."
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting frontend server on port 3002..."
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ MediCore is starting up!"
echo ""
echo "Backend:  http://localhost:3001 (PID: $BACKEND_PID)"
echo "Frontend: http://localhost:3002 (PID: $FRONTEND_PID)"
echo ""
echo "Login credentials:"
echo "  Email: doctor@demo.medicore.co.ke"
echo "  Password: admin123"
echo ""
echo "Logs are in ./logs/ directory"
echo ""
echo "To stop servers: kill $BACKEND_PID $FRONTEND_PID"
echo ""

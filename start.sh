#!/bin/bash

echo "🏥 Starting MediCore Hospital Management System..."
echo ""

# Start backend
echo "📡 Starting Backend API on port 3001..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "🌐 Starting Frontend on port 3002..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ MediCore is running!"
echo ""
echo "📍 Frontend: http://localhost:3002"
echo "📍 Backend API: http://localhost:3001"
echo ""
echo "🔐 Login with:"
echo "   Email: doctor@demo.medicore.co.ke"
echo "   Password: admin123"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait

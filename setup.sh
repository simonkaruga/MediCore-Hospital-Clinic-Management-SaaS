#!/bin/bash

echo "🏥 Setting up MediCore Hospital Management System..."
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Setup database
echo "🗄️ Setting up database..."
npx prisma db push
npx tsx prisma/seed.ts

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application, run:"
echo "   ./start.sh"
echo ""
echo "Or manually:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm run dev"

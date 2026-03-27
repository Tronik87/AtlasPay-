#!/bin/bash

# AtlasPay Setup Script
# This script automates the initial setup process

set -e

echo "🚀 AtlasPay Setup Script"
echo "========================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9+ first."
    exit 1
fi

echo "✅ Node.js $(node --version) found"
echo "✅ Python $(python3 --version) found"
echo ""

# Setup contract
echo "📦 Setting up smart contract..."
cd contract
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  Please edit contract/.env and add your PRIVATE_KEY"
fi
npm install
echo "✅ Contract dependencies installed"
echo ""

# Setup backend
echo "📦 Setting up backend..."
cd ../backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Python virtual environment created"
fi

source venv/bin/activate
pip install -r requirements.txt
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with PRIVATE_KEY and CONTRACT_ADDRESS"
fi
echo "✅ Backend dependencies installed"
deactivate
echo ""

# Setup frontend
echo "📦 Setting up frontend..."
cd ../frontend
npm install
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  Please edit frontend/.env with CONTRACT_ADDRESS"
fi
echo "✅ Frontend dependencies installed"
echo ""

cd ..

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Get test MATIC from: https://faucet.polygon.technology/"
echo "2. Edit contract/.env with your private key"
echo "3. Deploy contract:"
echo "   cd contract && npx hardhat run scripts/deploy.js --network amoy"
echo "4. Copy the contract address to backend/.env and frontend/.env"
echo "5. Start backend:"
echo "   cd backend && source venv/bin/activate && python main.py"
echo "6. Start frontend (new terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "📖 See README.md for detailed instructions"

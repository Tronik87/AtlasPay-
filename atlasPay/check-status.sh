#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║           🔍 ATLASPAY SERVICE STATUS CHECK                            ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Hardhat node is running
if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ Hardhat Node: RUNNING on port 8545"
else
    echo "❌ Hardhat Node: NOT RUNNING"
    echo "   Start with: cd contract && npx hardhat node"
fi

# Check if backend is running
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ Backend API: RUNNING on port 8000"
else
    echo "❌ Backend API: NOT RUNNING"
    echo "   Start with: cd backend && python main.py"
fi

# Check if frontend is running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ Frontend: RUNNING on port 3000"
else
    echo "❌ Frontend: NOT RUNNING"
    echo "   Start with: cd frontend && npm run dev"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null 2>&1 && \
   lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 && \
   lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "🎉 ALL SERVICES RUNNING! Open http://localhost:3000"
else
    echo "⚠️  Some services are not running. Start them in separate terminals."
    echo ""
    echo "Quick start order:"
    echo "  1. Terminal 1: cd contract && npx hardhat node"
    echo "  2. Terminal 2: cd contract && npx hardhat run scripts/deploy.js --network localhost"
    echo "                 then: cd ../backend && python main.py"
    echo "  3. Terminal 3: cd frontend && npm run dev"
fi
echo ""

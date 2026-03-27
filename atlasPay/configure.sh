#!/bin/bash

# AtlasPay Configuration Helper
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           AtlasPay Configuration Helper                   ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

PROJECT_ROOT="/home/sachithan/compsci/devshouse/atlasPay"

# Check if we're in the right directory
if [ ! -d "$PROJECT_ROOT" ]; then
    echo "❌ Error: AtlasPay project not found at $PROJECT_ROOT"
    exit 1
fi

echo "📝 This script will help you configure AtlasPay"
echo ""
echo "⚠️  IMPORTANT: You need:"
echo "   1. MetaMask wallet installed"
echo "   2. Your private key exported from MetaMask"
echo "   3. Test MATIC from faucet (after entering your address)"
echo ""
read -p "Press Enter to continue..."

# Get private key
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Private Key"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To get your private key from MetaMask:"
echo "1. Click the 3 dots (⋮) next to your account"
echo "2. Select 'Account details'"
echo "3. Click 'Show private key'"
echo "4. Enter your MetaMask password"
echo "5. Copy the private key"
echo ""
read -p "Enter your private key (starts with 0x): " PRIVATE_KEY

if [[ ! $PRIVATE_KEY == 0x* ]]; then
    echo "⚠️  Warning: Private key should start with 0x"
    PRIVATE_KEY="0x$PRIVATE_KEY"
fi

# Get wallet address for faucet
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Get Test MATIC"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Enter your wallet address (to check for MATIC): " WALLET_ADDRESS
echo ""
echo "📍 Get test MATIC from: https://faucet.polygon.technology/"
echo "   - Select: Polygon Amoy"
echo "   - Enter address: $WALLET_ADDRESS"
echo ""
read -p "Press Enter after you've received test MATIC..."

# Configure contract
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Configure Contract Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cat > "$PROJECT_ROOT/contract/.env" << EOF
PRIVATE_KEY=$PRIVATE_KEY
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology
EOF

echo "✅ Created contract/.env"

# Offer to deploy
echo ""
read -p "Deploy smart contract now? (y/n): " DEPLOY_NOW

if [[ $DEPLOY_NOW == "y" || $DEPLOY_NOW == "Y" ]]; then
    cd "$PROJECT_ROOT/contract"
    echo ""
    echo "Installing dependencies..."
    npm install
    echo ""
    echo "Compiling contract..."
    npx hardhat compile
    echo ""
    echo "Deploying to Polygon Amoy..."
    npx hardhat run scripts/deploy.js --network amoy
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📝 COPY THE CONTRACT ADDRESS FROM ABOVE!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    read -p "Enter the deployed contract address: " CONTRACT_ADDRESS
    
    # Configure backend
    cat > "$PROJECT_ROOT/backend/.env" << EOF
PRIVATE_KEY=$PRIVATE_KEY
CONTRACT_ADDRESS=$CONTRACT_ADDRESS
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology
EOF
    
    echo "✅ Created backend/.env"
    
    # Configure frontend
    cat > "$PROJECT_ROOT/frontend/.env" << EOF
VITE_CONTRACT_ADDRESS=$CONTRACT_ADDRESS
EOF
    
    echo "✅ Created frontend/.env"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎉 Configuration Complete!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Next steps:"
    echo "1. Start backend:"
    echo "   cd $PROJECT_ROOT/backend"
    echo "   python3 -m venv venv && source venv/bin/activate"
    echo "   pip install -r requirements.txt"
    echo "   python main.py"
    echo ""
    echo "2. Start frontend (in new terminal):"
    echo "   cd $PROJECT_ROOT/frontend"
    echo "   npm install"
    echo "   npm run dev"
    echo ""
    echo "3. Open http://localhost:3000 in your browser"
    echo ""
else
    echo ""
    echo "⚠️  Skipped deployment. Run manually:"
    echo "   cd $PROJECT_ROOT/contract"
    echo "   npx hardhat run scripts/deploy.js --network amoy"
    echo ""
    echo "Then configure backend/.env and frontend/.env with the contract address"
fi

echo ""
echo "📖 See README.md for complete documentation"

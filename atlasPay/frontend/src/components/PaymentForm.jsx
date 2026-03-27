import React, { useState } from 'react';
import { BrowserProvider, Contract, parseEther } from 'ethers';

const CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_receiver", "type": "address"}, {"internalType": "uint256", "name": "_timeoutBlocks", "type": "uint256"}],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "bytes32", "name": "txId", "type": "bytes32"},
      {"indexed": true, "internalType": "address", "name": "sender", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "receiver", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "timeout", "type": "uint256"}
    ],
    "name": "FundsDeposited",
    "type": "event"
  }
];

// You need to set this after deploying the contract
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0xYourContractAddress';

function PaymentForm({ 
  walletAddress, 
  selectedRoute, 
  onTransactionSubmit,
  showValidation,
  setShowValidation,
  validationComplete,
  setValidationComplete
}) {
  const [receiverAddress, setReceiverAddress] = useState('');
  const [amountMatic, setAmountMatic] = useState('');
  const [status, setStatus] = useState('idle'); // idle, pending, submitted, confirming, settled
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const MATIC_USD_RATE = 0.85;

  const handleAmountUsdChange = (usd) => {
    const matic = (parseFloat(usd) / MATIC_USD_RATE).toFixed(4);
    setAmountMatic(matic);
  };

  const startPayment = async () => {
    if (!walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    if (!receiverAddress || !amountMatic) {
      alert('Please fill in all fields');
      return;
    }

    // Start validation
    setShowValidation(true);
    setValidationComplete(false);
  };

  const sendPayment = async () => {
    setError('');
    setStatus('pending');

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found');
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Check network
      const network = await provider.getNetwork();
      if (network.chainId !== 80002n) {
        throw new Error('Please switch to Polygon Amoy Testnet');
      }

      // Create contract instance
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Timeout: 100 blocks
      const timeoutBlocks = 100;
      const amount = parseEther(amountMatic);

      // Send transaction
      const tx = await contract.deposit(receiverAddress, timeoutBlocks, {
        value: amount
      });

      setTxHash(tx.hash);
      setStatus('submitted');

      // Wait for confirmation
      setStatus('confirming');
      const receipt = await tx.wait();

      // Extract txId from events
      let txId = null;
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog(log);
          if (parsedLog.name === 'FundsDeposited') {
            txId = parsedLog.args.txId;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      setStatus('settled');

      // Notify parent
      onTransactionSubmit({
        tx_hash: tx.hash,
        tx_id: txId,
        block_number: receipt.blockNumber,
        receiver: receiverAddress,
        amount: amountMatic
      });

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Transaction failed');
      setStatus('idle');
    }
  };

  // Auto-send when validation completes
  React.useEffect(() => {
    if (validationComplete && status === 'idle') {
      sendPayment();
    }
  }, [validationComplete]);

  const getStatusColor = () => {
    switch (status) {
      case 'pending': return 'bg-yellow-600';
      case 'submitted': return 'bg-blue-600';
      case 'confirming': return 'bg-purple-600';
      case 'settled': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending': return '⏳ Signing transaction...';
      case 'submitted': return '📡 Transaction submitted';
      case 'confirming': return '⚙️ Confirming on-chain...';
      case 'settled': return '✅ Deposit confirmed';
      default: return '';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-6">
        💸 Send Payment
      </h2>

      {selectedRoute && (
        <div className="mb-6 p-4 bg-blue-900 rounded-lg border border-blue-700">
          <p className="text-blue-200 text-sm">
            Selected: <span className="font-bold">{selectedRoute.rail}</span> • 
            Fee: ${selectedRoute.fee_usd.toFixed(2)} • 
            Time: {selectedRoute.estimated_time}
          </p>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-gray-300 mb-2 font-semibold">
            Receiver Wallet Address
          </label>
          <input
            type="text"
            value={receiverAddress}
            onChange={(e) => setReceiverAddress(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:border-blue-500 font-mono text-sm"
            placeholder="0x..."
            disabled={status !== 'idle'}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">
              Amount (USD)
            </label>
            <input
              type="number"
              step="0.01"
              onChange={(e) => handleAmountUsdChange(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="0.00"
              disabled={status !== 'idle'}
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 font-semibold">
              Amount (MATIC)
            </label>
            <input
              type="number"
              step="0.0001"
              value={amountMatic}
              onChange={(e) => setAmountMatic(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:border-blue-500 font-mono"
              placeholder="0.0000"
              disabled={status !== 'idle'}
            />
          </div>
        </div>

        <p className="text-gray-400 text-sm">
          Exchange rate: 1 MATIC = ${MATIC_USD_RATE}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900 border border-red-700 rounded-lg">
          <p className="text-red-200">❌ {error}</p>
        </div>
      )}

      {status !== 'idle' && (
        <div className={`mb-6 p-4 ${getStatusColor()} rounded-lg`}>
          <p className="text-white font-semibold text-center">
            {getStatusText()}
          </p>
          {status === 'confirming' && (
            <div className="mt-2 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
        </div>
      )}

      {txHash && (
        <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-600">
          <p className="text-gray-400 text-sm mb-1">Transaction Hash:</p>
          <a
            href={`https://amoy.polygonscan.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 font-mono text-sm break-all"
          >
            {txHash}
          </a>
        </div>
      )}

      <button
        onClick={startPayment}
        disabled={status !== 'idle' || !walletAddress || showValidation}
        className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
          status !== 'idle' || !walletAddress || showValidation
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg'
        }`}
      >
        {!walletAddress ? 'Connect Wallet First' : 'Send Payment'}
      </button>
    </div>
  );
}

export default PaymentForm;

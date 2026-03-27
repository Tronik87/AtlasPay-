import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

function SettlementPanel({ txId, transactionData }) {
  const [status, setStatus] = useState('pending'); // pending, confirming, settled
  const [settlementProof, setSettlementProof] = useState('');
  const [settlementTxHash, setSettlementTxHash] = useState('');
  const [error, setError] = useState('');

  const confirmSettlement = async () => {
    setStatus('confirming');
    setError('');

    try {
      const response = await axios.post(`${API_BASE}/confirm-settlement`, {
        tx_id: txId
      });

      setStatus('settled');
      setSettlementProof(response.data.settlement_proof);
      setSettlementTxHash(response.data.tx_hash);
    } catch (err) {
      console.error('Settlement error:', err);
      setError(err.response?.data?.detail || 'Settlement failed');
      setStatus('pending');
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">
        🎯 Settlement Control
      </h2>

      {status === 'pending' && (
        <div className="space-y-4">
          <div className="p-4 bg-yellow-900 border border-yellow-700 rounded-lg">
            <p className="text-yellow-200">
              ⏳ Funds are in escrow. Click below to release to receiver.
            </p>
          </div>

          <button
            onClick={confirmSettlement}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-4 rounded-lg font-bold text-lg transition-all shadow-lg"
          >
            Confirm Settlement & Release Funds
          </button>

          {transactionData && (
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-600 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Receiver:</span>
                  <span className="text-white font-mono text-xs">
                    {transactionData.receiver.slice(0, 10)}...{transactionData.receiver.slice(-8)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white font-bold">{transactionData.amount} MATIC</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {status === 'confirming' && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">
            Processing settlement on-chain...
          </p>
          <p className="text-gray-400 text-sm mt-2">
            This may take a few seconds
          </p>
        </div>
      )}

      {status === 'settled' && (
        <div className="space-y-4">
          <div className="p-6 bg-green-900 border-2 border-green-500 rounded-lg text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-green-200 mb-2">
              Funds Delivered!
            </h3>
            <p className="text-green-300">
              Settlement completed successfully
            </p>
          </div>

          {settlementProof && (
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-600">
              <p className="text-gray-400 text-xs mb-2">Settlement Proof:</p>
              <p className="text-white text-sm break-words">{settlementProof}</p>
            </div>
          )}

          {settlementTxHash && (
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-600">
              <p className="text-gray-400 text-xs mb-2">Settlement Transaction:</p>
              <a
                href={`https://amoy.polygonscan.com/tx/${settlementTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-mono text-sm break-all"
              >
                {settlementTxHash}
              </a>
            </div>
          )}

          {transactionData && (
            <div className="p-4 bg-gray-900 rounded-lg border border-green-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Delivered to:</p>
                  <p className="text-white font-mono text-xs">
                    {transactionData.receiver}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold text-2xl">
                    {transactionData.amount}
                  </p>
                  <p className="text-gray-400 text-sm">MATIC</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900 border border-red-700 rounded-lg">
          <p className="text-red-200">❌ {error}</p>
        </div>
      )}
    </div>
  );
}

export default SettlementPanel;

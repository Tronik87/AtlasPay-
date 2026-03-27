import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

function TransactionDetail({ txId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTransaction = async () => {
    try {
      const response = await axios.get(`${API_BASE}/transaction/${txId}`);
      setData(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching transaction:', err);
      setError(err.response?.data?.detail || 'Failed to fetch transaction');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (txId) {
      fetchTransaction();
      
      // Auto-refresh every 10 seconds
      const interval = setInterval(fetchTransaction, 10000);
      return () => clearInterval(interval);
    }
  }, [txId]);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
        <div className="p-4 bg-red-900 border border-red-700 rounded-lg">
          <p className="text-red-200">❌ {error}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.exists) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
        <p className="text-gray-400">Transaction not found</p>
      </div>
    );
  }

  const progressPercent = data.timeout_block > 0 
    ? Math.min(100, ((data.current_block - (data.timeout_block - 100)) / 100) * 100)
    : 0;

  const getStatusBadge = () => {
    const badges = {
      'settled': { bg: 'bg-green-600', text: '✅ Settled' },
      'refunded': { bg: 'bg-yellow-600', text: '🔄 Refunded' },
      'expired': { bg: 'bg-red-600', text: '⏰ Expired' },
      'pending': { bg: 'bg-blue-600', text: '⏳ Pending' }
    };
    
    const badge = badges[data.status] || badges.pending;
    return (
      <span className={`${badge.bg} text-white px-3 py-1 rounded-full text-sm font-bold`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          📊 Transaction Details
        </h2>
        {getStatusBadge()}
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-600">
          <p className="text-gray-400 text-xs mb-1">Transaction ID</p>
          <p className="text-white font-mono text-sm break-all">{data.tx_id}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-600">
            <p className="text-gray-400 text-xs mb-1">Sender</p>
            <p className="text-white font-mono text-xs break-all">{data.sender}</p>
          </div>

          <div className="p-4 bg-gray-900 rounded-lg border border-gray-600">
            <p className="text-gray-400 text-xs mb-1">Receiver</p>
            <p className="text-white font-mono text-xs break-all">{data.receiver}</p>
          </div>
        </div>

        <div className="p-4 bg-gray-900 rounded-lg border border-gray-600">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Amount</span>
            <span className="text-green-400 font-bold text-xl">
              {data.amount_matic.toFixed(4)} MATIC
            </span>
          </div>
        </div>

        <div className="p-4 bg-gray-900 rounded-lg border border-gray-600">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-gray-400">Block Progress</span>
            <span className="text-white font-mono">
              {data.current_block} / {data.timeout_block}
            </span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-3 transition-all duration-500 ${
                data.status === 'expired' ? 'bg-red-500' : 
                data.status === 'settled' ? 'bg-green-500' : 
                'bg-blue-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          
          {data.blocks_remaining > 0 && (
            <p className="text-gray-400 text-xs mt-2">
              {data.blocks_remaining} blocks remaining
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-gray-900 rounded-lg border border-gray-600 text-center">
            <p className="text-gray-400 mb-1">Confirmed</p>
            <p className="text-white font-bold text-lg">
              {data.confirmed ? '✅' : '❌'}
            </p>
          </div>

          <div className="p-3 bg-gray-900 rounded-lg border border-gray-600 text-center">
            <p className="text-gray-400 mb-1">Refunded</p>
            <p className="text-white font-bold text-lg">
              {data.refunded ? '✅' : '❌'}
            </p>
          </div>
        </div>

        <div className="text-center text-gray-500 text-xs mt-4">
          Auto-refreshes every 10 seconds
        </div>
      </div>
    </div>
  );
}

export default TransactionDetail;
